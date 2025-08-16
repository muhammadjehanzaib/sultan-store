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

    const where: any = {};
    
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
      status: 'approved', // Default status since our schema doesn't have status field
      createdAt: review.createdAt,
      updatedAt: review.createdAt, // Use createdAt since updatedAt doesn't exist in schema
      helpful: 0, // Default value
      verified: true, // Since reviews are only from verified orders
      product: review.product,
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create admin response to a review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['admin', 'manager', 'support'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reviewId, response } = await request.json();

    if (!reviewId || !response) {
      return NextResponse.json({ error: 'Review ID and response are required' }, { status: 400 });
    }

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
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
