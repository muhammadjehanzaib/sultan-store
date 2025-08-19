import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/debug/create-simple-notification - Create notification directly bypassing preferences
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🧪 Creating SIMPLE notification for admin user:', session.user.id, session.user.email);

    // Create notification directly in database, bypassing all preference logic
    const notification = await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'system_alert',
        title_en: 'Admin Test Notification',
        title_ar: 'إشعار إداري تجريبي',
        message_en: 'This is a test notification for admin users. If you see this in the bell icon, the system is working!',
        message_ar: 'هذا إشعار تجريبي للمستخدمين الإداريين. إذا رأيت هذا في أيقونة الجرس، فإن النظام يعمل!',
        sendEmail: false,
        sendInApp: true, // Force in-app to true
        isRead: false,
        emailSent: false,
        priority: 'high',
        metadata: { 
          test: true, 
          createdBy: 'debug-api',
          timestamp: new Date().toISOString(),
          userRole: session.user.role
        }
      }
    });

    console.log('🧪 SIMPLE notification created successfully:', notification.id);

    // Also create default preferences if they don't exist
    try {
      await prisma.notificationPreferences.upsert({
        where: { userId: session.user.id },
        update: {}, // Don't update if exists
        create: {
          userId: session.user.id,
          emailOrders: true,
          emailPromotions: false,
          emailSystem: true,
          inAppOrders: true,
          inAppPromotions: true,
          inAppSystem: true,
        }
      });
      console.log('🧪 Notification preferences ensured for user');
    } catch (prefError) {
      console.log('🧪 Preferences already exist or error:', prefError instanceof Error ? prefError.message : String(prefError));
    }

    return NextResponse.json({ 
      success: true,
      notification: {
        id: notification.id,
        title: notification.title_en,
        sendInApp: notification.sendInApp,
        isRead: notification.isRead,
        createdAt: notification.createdAt
      },
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role
      },
      message: 'Simple notification created! Check the notification bell now - you should see a red badge with count "1"'
    });

  } catch (error) {
    console.error('🧪 Simple notification creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create simple notification', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
