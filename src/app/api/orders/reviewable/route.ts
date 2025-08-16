import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Fetch orders with items that can be reviewed (delivered orders)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Find delivered orders for the user
    const deliveredOrders = await prisma.order.findMany({
      where: {
        customerEmail: session.user.email,
        status: 'delivered'
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name_en: true,
                name_ar: true,
                image: true,
                slug: true
              }
            }
          }
        },
        orderReviews: {
          where: {
            userId: session.user.id
          },
          select: {
            productId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter orders to show only items that haven't been reviewed yet
    const reviewableOrders = deliveredOrders.map(order => {
      const reviewedProductIds = new Set(order.orderReviews.map(r => r.productId));
      
      const reviewableItems = order.items.filter(item => 
        !reviewedProductIds.has(item.productId)
      );

      return {
        ...order,
        items: reviewableItems
      };
    }).filter(order => order.items.length > 0); // Only return orders with reviewable items

    return NextResponse.json({ orders: reviewableOrders });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
