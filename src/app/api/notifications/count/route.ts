import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notificationService } from '@/lib/notificationService';

// GET /api/notifications/count - Get unread notification count
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const count = await notificationService.getUnreadCount(session.user.id);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('[GET /api/notifications/count]', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// POST /api/notifications/count - Mark all notifications as read
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await notificationService.markAllAsRead(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/notifications/count]', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
