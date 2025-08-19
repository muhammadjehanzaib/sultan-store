import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT - Update review status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['admin', 'manager', 'support'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    const { id: reviewId } = await params;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be pending, approved, or rejected' 
      }, { status: 400 });
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

    // Update review status
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { 
        status,
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
      message: 'Review status updated successfully',
      review: transformedReview
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Soft delete a review
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

    // Check if review exists and is not already soft deleted
    const existingReview = await prisma.review.findFirst({
      where: { 
        id: reviewId, 
        deletedAt: null 
      }
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Soft delete the review
    await prisma.review.update({
      where: { id: reviewId },
      data: { 
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get individual review details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['admin', 'manager', 'support'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: reviewId } = await params;

    const review = await prisma.review.findFirst({
      where: { 
        id: reviewId, 
        deletedAt: null 
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

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Transform review to match frontend expectations
    const transformedReview = {
      id: review.id,
      productId: review.productId,
      customerId: review.userId,
      customerName: review.user.firstName && review.user.lastName 
        ? `${review.user.firstName} ${review.user.lastName}`
        : review.user.name || 'Anonymous',
      customerEmail: review.user.email,
      rating: review.rating,
      title: `Review for ${review.product?.name_en || 'Product'}`,
      comment: review.comment,
      status: review.status || 'approved',
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      helpful: 0, // Default value
      verified: true, // Since reviews are only from verified orders
      product: review.product,
      // Admin reply fields
      adminReply: review.adminReply,
      adminReplyBy: review.adminReplyBy,
      adminReplyAt: review.adminReplyAt,
    };

    return NextResponse.json({
      review: transformedReview
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
