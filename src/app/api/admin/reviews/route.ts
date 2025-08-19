import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Fetch all reviews for admin panel
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['admin', 'manager', 'support'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null // Only show non-deleted reviews
    };
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (productId) {
      where.productId = productId;
    }

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where })
    ]);

    // Transform reviews to match admin interface expectations
    const transformedReviews = reviews.map(review => ({
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
      status: review.status || 'approved', // Default to approved for existing reviews
      createdAt: review.createdAt,
      updatedAt: review.updatedAt || review.createdAt,
      helpful: 0, // Default value
      verified: true, // Since reviews are only from verified orders
      product: review.product,
      // Admin reply fields
      adminReply: review.adminReply,
      adminReplyBy: review.adminReplyBy,
      adminReplyAt: review.adminReplyAt,
    }));

    return NextResponse.json({
      reviews: transformedReviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}

// POST - Create admin response to a review or handle bulk operations
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['admin', 'manager', 'support'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Handle admin response
    if (body.reviewId && body.response) {
      const { reviewId, response } = body;

      // Check if review exists
      const review = await prisma.review.findUnique({
        where: { id: reviewId }
      });

      if (!review) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }

      return NextResponse.json({
        message: 'Admin response saved successfully',
        response: {
          id: `resp-${Date.now()}`,
          reviewId,
          adminId: session.user.id,
          adminName: session.user.name || 'Admin',
          message: response,
          createdAt: new Date(),
        }
      });
    }

    // Handle bulk operations
    if (body.action && body.reviewIds) {
      const { action, reviewIds } = body;

      if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
        return NextResponse.json({ error: 'Review IDs array is required' }, { status: 400 });
      }

      // Check authorization for delete operations
      if (action === 'delete' && !['admin', 'manager'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Insufficient permissions for delete operation' }, { status: 403 });
      }

      if (action === 'delete') {
        // Bulk soft delete
        await prisma.review.updateMany({
          where: {
            id: { in: reviewIds },
            deletedAt: null
          },
          data: {
            deletedAt: new Date(),
            updatedAt: new Date()
          }
        });

        return NextResponse.json({
          message: `${reviewIds.length} reviews deleted successfully`
        });
      } else if (['approve', 'reject'].includes(action)) {
        // Bulk status update
        const status = action === 'approve' ? 'approved' : 'rejected';
        
        await prisma.review.updateMany({
          where: {
            id: { in: reviewIds },
            deletedAt: null
          },
          data: {
            status,
            updatedAt: new Date()
          }
        });

        return NextResponse.json({
          message: `${reviewIds.length} reviews ${action}d successfully`
        });
      } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  } catch (error) {
    console.error('Error in POST /api/admin/reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
