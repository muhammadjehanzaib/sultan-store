import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/debug/fix-duplicate-users - Check for duplicate users
export async function GET() {
  try {
    // Find users with duplicate emails
    const duplicateEmails = await prisma.user.groupBy({
      by: ['email'],
      having: {
        email: {
          _count: {
            gt: 1
          }
        }
      },
      _count: {
        email: true
      }
    });

    const duplicateUserDetails = [];

    for (const duplicate of duplicateEmails) {
      const users = await prisma.user.findMany({
        where: { email: duplicate.email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              notifications: true,
              accounts: true
            }
          }
        },
        orderBy: { createdAt: 'asc' } // Oldest first
      });

      duplicateUserDetails.push({
        email: duplicate.email,
        count: duplicate._count.email,
        users: users
      });
    }

    return NextResponse.json({
      message: `Found ${duplicateEmails.length} emails with duplicate accounts`,
      duplicates: duplicateUserDetails,
      recommendation: duplicateUserDetails.length > 0 ? 
        "Consider merging notifications from newer accounts to the oldest account and removing duplicates" : 
        "No duplicates found"
    });

  } catch (error) {
    console.error('Fix duplicate users error:', error);
    return NextResponse.json({ error: 'Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// POST /api/debug/fix-duplicate-users - Fix duplicate users by merging notifications
export async function POST() {
  try {
    const duplicateEmails = await prisma.user.groupBy({
      by: ['email'],
      having: {
        email: {
          _count: {
            gt: 1
          }
        }
      }
    });

    let fixedCount = 0;

    for (const duplicate of duplicateEmails) {
      const users = await prisma.user.findMany({
        where: { email: duplicate.email },
        orderBy: { createdAt: 'asc' } // Keep the oldest
      });

      if (users.length > 1) {
        const primaryUser = users[0]; // Keep the oldest
        const duplicateUsers = users.slice(1); // Remove these

        console.log(`Merging users for ${duplicate.email}:`);
        console.log(`Primary (keep): ${primaryUser.id}`);
        console.log(`Duplicates (remove): ${duplicateUsers.map(u => u.id).join(', ')}`);

        // Move notifications from duplicate users to primary user
        for (const dupUser of duplicateUsers) {
          await prisma.notification.updateMany({
            where: { userId: dupUser.id },
            data: { userId: primaryUser.id }
          });

          // Move notification preferences
          const prefs = await prisma.notificationPreferences.findUnique({
            where: { userId: dupUser.id }
          });

          if (prefs) {
            await prisma.notificationPreferences.upsert({
              where: { userId: primaryUser.id },
              update: {}, // Keep existing if primary has preferences
              create: {
                userId: primaryUser.id,
                emailOrders: prefs.emailOrders,
                emailPromotions: prefs.emailPromotions,
                emailSystem: prefs.emailSystem,
                inAppOrders: prefs.inAppOrders,
                inAppPromotions: prefs.inAppPromotions,
                inAppSystem: prefs.inAppSystem,
              }
            });

            // Delete old preferences
            await prisma.notificationPreferences.delete({
              where: { userId: dupUser.id }
            });
          }

          // Delete the duplicate user (this will cascade delete accounts/sessions)
          await prisma.user.delete({
            where: { id: dupUser.id }
          });

          fixedCount++;
        }
      }
    }

    return NextResponse.json({
      message: `Successfully merged ${fixedCount} duplicate users`,
      fixed: fixedCount,
      recommendation: "Please logout and login again to refresh your session"
    });

  } catch (error) {
    console.error('Fix duplicate users error:', error);
    return NextResponse.json({ error: 'Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
