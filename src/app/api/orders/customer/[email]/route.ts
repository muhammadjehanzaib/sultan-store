import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { email: string } }
) {
  try {
    const email = decodeURIComponent(params.email);
    
    const orders = await prisma.order.findMany({
      where: { customerEmail: email },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ orders });
  } catch (err) {
    console.error('[GET /orders/customer/[email]]', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
} 