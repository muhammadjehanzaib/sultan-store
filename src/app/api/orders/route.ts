import { NextResponse } from 'next/server';
import { notificationService } from '@/lib/notificationService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerEmail = searchParams.get('customerEmail');
    
    const where: any = {};
    if (status) where.status = status;
    if (customerEmail) where.customerEmail = customerEmail;

    const ordersRaw = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

    // Transform the orders to match expected interface
    const orders = ordersRaw.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          name: {
            en: item.product.name_en,
            ar: item.product.name_ar
          },
          description: item.product.description_en || item.product.description_ar ? {
            en: item.product.description_en || '',
            ar: item.product.description_ar || ''
          } : undefined,
          category: item.product.category ? {
            en: item.product.category.name_en,
            ar: item.product.category.name_ar
          } : undefined
        }
      }))
    }));

    return NextResponse.json({ orders });
  } catch (err) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      customerEmail, 
      customerName, 
      items, 
      subtotal, 
      tax, 
      shipping, 
      codFee,
      total,
      billingAddress,
      shippingAddress,
      paymentMethod 
    } = body;

    if (!customerEmail || !items || !total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        customerEmail,
        customerName,
        subtotal,
        tax,
        shipping,
        codFee: codFee || 0,
        total,
        status: 'pending',
        billingAddress,
        shippingAddress,
        paymentMethod,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            selectedAttributes: item.selectedAttributes || null
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Update inventory for each item
    for (const item of items) {
      try {
        // First, try to find existing inventory record
        const existingInventory = await prisma.inventory.findUnique({
          where: { productId: item.productId }
        });

        if (existingInventory) {
          // Update existing inventory
          await prisma.inventory.update({
            where: { productId: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        } else {
          // Create new inventory record with initial stock of 0 (since we're decrementing)
          await prisma.inventory.create({
            data: {
              productId: item.productId,
              stock: Math.max(0, -item.quantity), // Ensure non-negative stock
              stockThreshold: 10 // Default threshold
            }
          });
        }

        // Record stock history
        await prisma.stockHistory.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: `Order ${order.id}`
          }
        });
      } catch (inventoryError) {
        // Continue with other items but log the error
      }
    }

    // Send order confirmation notification
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        await notificationService.notifyOrderCreated(
          session.user.id, 
          order.id, 
          total
        );
      }
    } catch (notificationError) {
      // Don't fail the order creation if notification fails
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
} 