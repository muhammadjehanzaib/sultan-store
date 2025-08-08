import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request, context: any) {
  const email = decodeURIComponent(context.params.email);

  try {
    const orders = await prisma.order.findMany({
      where: { customerEmail: email },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                attributes: {
                  include: { values: true }
                }
              }
            }
          }
        }
      }
    });

    const mappedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => {
        if (!item.selectedAttributes || !item.product?.attributes) {
          return item;
        }

        const readable: Record<string, string> = {};
        for (const [attrId, valueId] of Object.entries(
          item.selectedAttributes as Record<string, string>
        )) {
          const attr = item.product.attributes.find(a => a.id === attrId);
          const val = attr?.values.find(v => v.id === valueId);
          if (attr && val) {
            readable[attr.name] = val.label || val.value;
          }
        }

        return {
          ...item,
          selectedAttributes: readable
        };
      })
    }));

    return NextResponse.json({ orders: mappedOrders });
  } catch (err) {
    console.error('[GET /orders/customer/[email]]', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
