import { NextResponse } from 'next/server';
import { notificationService } from '@/lib/notificationService';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                attributes: {
                  include: {
                    values: true
                  }
                },
                variants: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, trackingNumber, trackingProvider } = body;

    // Get the current order to check for status changes
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      select: { 
        id: true, 
        status: true, 
        customerEmail: true, 
        total: true,
        trackingNumber: true
      }
    });

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (trackingProvider) updateData.trackingProvider = trackingProvider;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                attributes: {
                  include: {
                    values: true
                  }
                },
                variants: true
              }
            }
          }
        }
      }
    });

    // Send notifications if status changed
    if (status && status !== currentOrder.status) {
      
      try {
        // Find the customer user by email if they have an account
        const customerUser = await prisma.user.findUnique({ 
          where: { email: currentOrder.customerEmail } 
        });

        if (status === 'shipped') {
          if (customerUser) {
            await notificationService.notifyOrderShipped(
              customerUser.id, 
              order.id, 
              order.trackingNumber || undefined
            );
          }
        } else if (status === 'delivered') {
          if (customerUser) {
            await notificationService.create({
              userId: customerUser.id,
              type: 'order_delivered',
              title: {
                en: 'Order Delivered!',
                ar: 'تم توصيل الطلب!'
              },
              message: {
                en: `Your order #${order.id} has been delivered successfully!`,
                ar: `تم توصيل طلبك #${order.id} بنجاح!`
              },
              actionUrl: `/orders/${order.id}`,
              sendEmail: true,
              sendInApp: true,
              metadata: { orderId: order.id }
            });
            
            // Send review request after delivery
            
            // Get product names from order items
            const productNames = order.items.map(item => 
              item.product.name_en || item.product.name_ar || 'Product'
            );
            
            await notificationService.notifyReviewRequest(
              customerUser.id,
              order.id,
              order.total,
              productNames
            );
            
          }
        } else if (status === 'cancelled') {
          if (customerUser) {
            await notificationService.create({
              userId: customerUser.id,
              type: 'system_alert',
              title: {
                en: 'Order Cancelled',
                ar: 'تم إلغاء الطلب'
              },
              message: {
                en: `Your order #${order.id} has been cancelled.`,
                ar: `تم إلغاء طلبك #${order.id}.`
              },
              actionUrl: `/orders/${order.id}`,
              sendEmail: true,
              sendInApp: true,
              priority: 'high',
              metadata: { orderId: order.id, type: 'order_cancelled' }
            });
          }
        }
      } catch (notificationError) {
        // Don't fail the order update if notification fails
      }
    }

    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
