import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET single contact query
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    // Check if user is admin/manager/support
    if (!session?.user?.role || !['admin', 'manager', 'support'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const contactQuery = await prisma.contactQuery.findUnique({
      where: { id },
    });

    if (!contactQuery) {
      return NextResponse.json(
        { error: 'Contact query not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ contactQuery });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch contact query' },
      { status: 500 }
    );
  }
}

// PUT update contact query (mainly for status updates)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    // Check if user is admin/manager/support
    if (!session?.user?.role || !['admin', 'manager', 'support'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status } = await request.json();

    // Validate status
    const validStatuses = ['new', 'in progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const contactQuery = await prisma.contactQuery.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Contact query updated successfully',
      contactQuery 
    });

  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Contact query not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update contact query' },
      { status: 500 }
    );
  }
}

// DELETE contact query
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    await prisma.contactQuery.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Contact query deleted successfully' 
    });

  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Contact query not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete contact query' },
      { status: 500 }
    );
  }
}
