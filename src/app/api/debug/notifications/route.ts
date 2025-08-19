import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/debug/notifications - Debug notifications and users
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Get all users with notification counts
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isGuest: true,
        _count: {
          select: {
            notifications: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get recent notifications
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        title_en: true,
        sendInApp: true,
        sendEmail: true,
        isRead: true,
        emailSent: true,
        createdAt: true,
        userId: true,
        user: {
          select: { email: true, role: true }
        }
      }
    });

    return NextResponse.json({
      currentUser: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role
      } : null,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        isGuest: user.isGuest,
        notificationCount: user._count.notifications
      })),
      notifications: notifications.map(notif => ({
        id: notif.id.substring(0, 8) + '...',
        type: notif.type,
        title: notif.title_en,
        sendInApp: notif.sendInApp,
        sendEmail: notif.sendEmail,
        isRead: notif.isRead,
        emailSent: notif.emailSent,
        userId: notif.userId,
        userEmail: notif.user?.email,
        createdAt: notif.createdAt
      }))
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: 'Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
