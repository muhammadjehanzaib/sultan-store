import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notificationService } from '@/lib/notificationService';

// POST /api/debug/create-test-notification - Create a test notification for current user
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🧪 Creating test notification for user:', session.user.id, session.user.email);

    const notificationId = await notificationService.create({
      userId: session.user.id,
      type: 'system_alert',
      title: {
        en: 'Test Notification',
        ar: 'إشعار تجريبي'
      },
      message: {
        en: 'This is a test notification to verify the in-app notification system is working.',
        ar: 'هذا إشعار تجريبي للتحقق من أن نظام الإشعارات داخل التطبيق يعمل.'
      },
      sendEmail: false, // Don't send email for test
      sendInApp: true,
      priority: 'normal',
      metadata: { test: true, timestamp: new Date().toISOString() }
    });

    console.log('🧪 Test notification created:', notificationId);

    return NextResponse.json({ 
      success: true,
      notificationId,
      user: {
        id: session.user.id,
        email: session.user.email
      },
      message: 'Test notification created successfully. Check the notification bell icon!'
    });

  } catch (error) {
    console.error('🧪 Test notification error:', error);
    return NextResponse.json({ 
      error: 'Failed to create test notification', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
