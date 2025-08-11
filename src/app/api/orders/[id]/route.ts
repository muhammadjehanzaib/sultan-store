import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

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
    console.error('[GET /orders/[id]]', err);
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

    return NextResponse.json({ order });
  } catch (err) {
    console.error('[PATCH /orders/[id]]', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
} 