import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        error: 'Current password and new password are required' 
      }, { status: 400 });
    }

    // Validate new password strength
    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordStrengthRegex.test(newPassword)) {
      return NextResponse.json({ 
        error: 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
      }, { status: 400 });
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      return NextResponse.json({ 
        error: 'New password must be different from current password' 
      }, { status: 400 });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, password: true }
    });
    
    if (!user || !user.password) {
      return NextResponse.json({ error: 'User not found or no password set' }, { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ 
        error: 'Invalid current password' 
      }, { status: 400 });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    });

    // Log security event (optional - you can implement logging)

    return NextResponse.json({ 
      message: 'Password changed successfully' 
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
