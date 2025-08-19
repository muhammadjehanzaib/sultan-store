const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkNotifications() {
  try {
    console.log('🔍 Checking notifications in database...\n');
    
    // Get all notifications
    const notifications = await prisma.notification.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Total notifications found: ${notifications.length}\n`);

    if (notifications.length > 0) {
      console.log('📋 Notification details:');
      notifications.forEach((notification, index) => {
        console.log(`\n${index + 1}. ID: ${notification.id}`);
        console.log(`   Title: ${notification.title}`);
        console.log(`   Message: ${notification.message}`);
        console.log(`   Type: ${notification.type}`);
        console.log(`   Send In-App: ${notification.sendInApp}`);
        console.log(`   Read: ${notification.read}`);
        console.log(`   User ID: ${notification.userId}`);
        if (notification.user) {
          console.log(`   User: ${notification.user.name} (${notification.user.email}) [${notification.user.role}]`);
        } else {
          console.log(`   User: null/system notification`);
        }
        console.log(`   Created: ${notification.createdAt}`);
      });
    } else {
      console.log('❌ No notifications found in database');
    }

    // Get all users for reference
    console.log('\n👥 All users in database:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - ID: ${user.id}`);
    });

  } catch (error) {
    console.error('❌ Error checking notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotifications();
