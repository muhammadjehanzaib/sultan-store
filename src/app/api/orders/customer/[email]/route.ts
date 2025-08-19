import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ email: string }> }) {
  const { email } = await context.params;
  const decodedEmail = decodeURIComponent(email);

  try {
    const orders = await prisma.order.findMany({
      where: { customerEmail: decodedEmail },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                attributes: {
                  include: { values: true }
                },
                variants: true
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
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
