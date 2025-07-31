import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerEmail = searchParams.get('customerEmail');
    
    const where: any = {};
    if (status) where.status = status;
    if (customerEmail) where.customerEmail = customerEmail;

    const orders = await prisma.order.findMany({
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
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ orders });
  } catch (err) {
    console.error('[GET /orders]', err);
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
      await prisma.inventory.update({
        where: { productId: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });

      // Record stock history
      await prisma.stockHistory.create({
        data: {
          productId: item.productId,
          change: -item.quantity,
          reason: `Order ${order.id}`
        }
      });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    console.error('[POST /orders]', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
} 