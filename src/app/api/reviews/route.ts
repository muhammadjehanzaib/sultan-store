import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Fetch reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { productId, orderId, rating, comment } = await request.json();

    // Validate required fields
    if (!productId || !orderId || !rating || !comment) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if order exists and is delivered
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.customerEmail !== session.user.email) {
      return NextResponse.json({ error: 'You can only review your own orders' }, { status: 403 });
    }

    if (order.status !== 'delivered') {
      return NextResponse.json({ error: 'You can only review delivered orders' }, { status: 400 });
    }

    // Check if product exists in the order
    const orderItem = order.items.find(item => item.productId === productId);
    if (!orderItem) {
      return NextResponse.json({ error: 'Product not found in this order' }, { status: 400 });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId_orderId: {
          productId,
          userId: session.user.id,
          orderId
        }
      }
    });

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        orderId,
        rating,
        comment
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            name: true,
          }
        }
      }
    });

    // Update product rating and review count
    const productReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    });

    const averageRating = productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length;
    const reviewCount = productReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
        reviews: reviewCount
      }
    });

    return NextResponse.json({ 
      message: 'Review created successfully',
      review 
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
