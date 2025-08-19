import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST - Add admin reply to a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['admin', 'manager', 'support'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: reviewId } = await params;
    const { message } = await request.json();

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Reply message is required' }, { status: 400 });
    }

    // Check if review exists and is not soft deleted
    const existingReview = await prisma.review.findFirst({
      where: { 
        id: reviewId, 
        deletedAt: null 
      }
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Update review with admin reply
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { 
        adminReply: message.trim(),
        adminReplyBy: session.user.id,
        adminReplyAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            name: true,
            email: true,
          }
        },
        product: {
          select: {
            name_en: true,
            name_ar: true,
            slug: true,
          }
        }
      }
    });

    // Transform review to match frontend expectations
    const transformedReview = {
      id: updatedReview.id,
      productId: updatedReview.productId,
      customerId: updatedReview.userId,
      customerName: updatedReview.user.firstName && updatedReview.user.lastName 
        ? `${updatedReview.user.firstName} ${updatedReview.user.lastName}`
        : updatedReview.user.name || 'Anonymous',
      customerEmail: updatedReview.user.email,
      rating: updatedReview.rating,
      title: `Review for ${updatedReview.product?.name_en || 'Product'}`,
      comment: updatedReview.comment,
      status: updatedReview.status || 'pending',
      createdAt: updatedReview.createdAt,
      updatedAt: updatedReview.updatedAt,
      helpful: 0, // Default value
      verified: true, // Since reviews are only from verified orders
      product: updatedReview.product,
      // Admin reply fields
      adminReply: updatedReview.adminReply,
      adminReplyBy: updatedReview.adminReplyBy,
      adminReplyAt: updatedReview.adminReplyAt,
    };

    return NextResponse.json({
      message: 'Admin reply added successfully',
      review: transformedReview
    });
  } catch (error) {
    console.error('Error adding admin reply:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update existing admin reply
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['admin', 'manager', 'support'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: reviewId } = await params;
    const { message } = await request.json();

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Reply message is required' }, { status: 400 });
    }

    // Check if review exists and has an existing reply
    const existingReview = await prisma.review.findFirst({
      where: { 
        id: reviewId, 
        deletedAt: null,
        adminReply: { not: null }
      }
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found or no existing reply' }, { status: 404 });
    }

    // Update the admin reply
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { 
        adminReply: message.trim(),
        adminReplyBy: session.user.id,
        adminReplyAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            name: true,
            email: true,
          }
        },
        product: {
          select: {
            name_en: true,
            name_ar: true,
            slug: true,
          }
        }
      }
    });

    // Transform review to match frontend expectations
    const transformedReview = {
      id: updatedReview.id,
      productId: updatedReview.productId,
      customerId: updatedReview.userId,
      customerName: updatedReview.user.firstName && updatedReview.user.lastName 
        ? `${updatedReview.user.firstName} ${updatedReview.user.lastName}`
        : updatedReview.user.name || 'Anonymous',
      customerEmail: updatedReview.user.email,
      rating: updatedReview.rating,
      title: `Review for ${updatedReview.product?.name_en || 'Product'}`,
      comment: updatedReview.comment,
      status: updatedReview.status || 'pending',
      createdAt: updatedReview.createdAt,
      updatedAt: updatedReview.updatedAt,
      helpful: 0, // Default value
      verified: true, // Since reviews are only from verified orders
      product: updatedReview.product,
      // Admin reply fields
      adminReply: updatedReview.adminReply,
      adminReplyBy: updatedReview.adminReplyBy,
      adminReplyAt: updatedReview.adminReplyAt,
    };

    return NextResponse.json({
      message: 'Admin reply updated successfully',
      review: transformedReview
    });
  } catch (error) {
    console.error('Error updating admin reply:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove admin reply
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: reviewId } = await params;

    // Check if review exists and has an admin reply
    const existingReview = await prisma.review.findFirst({
      where: { 
        id: reviewId, 
        deletedAt: null,
        adminReply: { not: null }
      }
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found or no existing reply' }, { status: 404 });
    }

    // Remove the admin reply
    await prisma.review.update({
      where: { id: reviewId },
      data: { 
        adminReply: null,
        adminReplyBy: null,
        adminReplyAt: null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Admin reply removed successfully'
    });
  } catch (error) {
    console.error('Error removing admin reply:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
