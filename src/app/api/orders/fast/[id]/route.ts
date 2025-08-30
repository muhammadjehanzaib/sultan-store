import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';

// Build a lean, normalized order for fast consumption by admin label/invoice UIs.
function normalizeOrder(order: any) {
  if (!order) return null;

  const mapItem = (item: any) => {
    // Resolve selected attributes to readable labels
    let readableAttrs: Record<string, string> | null = null;
    if (item?.selectedAttributes && item?.product?.attributes) {
      readableAttrs = {};
      const attrsMeta = item.product.attributes || [];
      for (const [attrId, valueId] of Object.entries(item.selectedAttributes as Record<string, string>)) {
        const attr = attrsMeta.find((a: any) => a.id === attrId);
        const val = attr?.values?.find((v: any) => v.id === valueId);
        if (attr && val) {
          readableAttrs[attr.name] = val.label || val.value;
        } else {
          // Fallback to raw ids if meta is missing
          readableAttrs[attrId] = String(valueId);
        }
      }
    }

    return {
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      variantImage: item.variantImage ?? null,
      selectedAttributes: readableAttrs || item.selectedAttributes || null,
      product: {
        id: item.product?.id,
        name_en: item.product?.name_en ?? null,
        name_ar: item.product?.name_ar ?? null,
      },
    };
  };

  return {
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    subtotal: order.subtotal,
    tax: order.tax,
    shipping: order.shipping,
    codFee: order.codFee,
    total: order.total,
    trackingNumber: order.trackingNumber ?? null,
    trackingProvider: order.trackingProvider ?? null,
    customerName: order.customerName ?? null,
    customerEmail: order.customerEmail ?? null,
    billingAddress: order.billingAddress ?? null,
    shippingAddress: order.shippingAddress ?? null,
    paymentMethod: (order as any).paymentMethod ?? null,
    items: (order.items || []).map(mapItem),
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const orderId = decodeURIComponent(id);

  // Cache key per order
  const cacheKey = `order:fast:${orderId}`;

  try {
    const data = await cache.cached(
      cacheKey,
      async () => {
        try {
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
              id: true,
              status: true,
              createdAt: true,
              subtotal: true,
              tax: true,
              shipping: true,
              codFee: true,
              total: true,
              trackingNumber: true,
              trackingProvider: true,
              customerName: true,
              customerEmail: true,
              billingAddress: true,
              shippingAddress: true,
              paymentMethod: true,
              items: {
                select: {
                  id: true,
                  quantity: true,
                  price: true,
                  total: true,
                  selectedAttributes: true,
                  variantImage: true,
                  product: {
                    select: {
                      id: true,
                      name_en: true,
                      name_ar: true,
                      attributes: {
                        select: {
                          id: true,
                          name: true,
                          values: {
                            select: { id: true, label: true, value: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });
          if (!order) return null;
          return normalizeOrder(order);
        } catch (primaryErr) {
          console.error('[fast-order] primary query failed:', primaryErr);
          // Fallback: fetch without product.attributes to avoid heavy join issues
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
              id: true,
              status: true,
              createdAt: true,
              subtotal: true,
              tax: true,
              shipping: true,
              codFee: true,
              total: true,
              trackingNumber: true,
              trackingProvider: true,
              customerName: true,
              customerEmail: true,
              billingAddress: true,
              shippingAddress: true,
              paymentMethod: true,
              items: {
                select: {
                  id: true,
                  quantity: true,
                  price: true,
                  total: true,
                  selectedAttributes: true,
                  variantImage: true,
                  product: {
                    select: {
                      id: true,
                      name_en: true,
                      name_ar: true,
                    },
                  },
                },
              },
            },
          });
          if (!order) return null;
          return normalizeOrder(order);
        }
      },
      { ttl: 300 } // 5 minutes
    );

    if (!data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order: data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
