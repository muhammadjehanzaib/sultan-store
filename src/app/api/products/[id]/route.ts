import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** PATCH /api/products/:id  – full-replace update */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const body = await req.json();
    // ────────────────────────────────────────────────────────────
    // 0. pull same fields as POST handler
    const {
      slug, name_en, name_ar, description_en, description_ar,
      image, price, categoryId, inStock = true, rating = 0, reviews = 0,
      // Discount fields
      salePrice, discountPercent, onSale = false, saleStartDate, saleEndDate,
      attributes = [], variants = []
    } = body as any;

    // update happens in a transaction to keep referential integrity
    await prisma.$transaction(async (tx) => {
      /* 1)  wipe old variants + join rows + attributes */
      await tx.variantAttributeValue.deleteMany({
        where: { variant: { productId: id } }
      });
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.attributeValue.deleteMany({
        where: { attribute: { productId: id } }
      });
      await tx.productAttribute.deleteMany({ where: { productId: id } });

      /* 2) update basic product columns */
      await tx.product.update({
        where: { id },
        data: {
          slug, name_en, name_ar,
          description_en, description_ar,
          image, price, categoryId,
          inStock, rating, reviews,
          // Include discount fields
          salePrice: salePrice || null,
          discountPercent: discountPercent || null,
          onSale,
          saleStartDate: saleStartDate ? new Date(saleStartDate) : null,
          saleEndDate: saleEndDate ? new Date(saleEndDate) : null
        }
      });

      /* 3) re-create attributes (+ values) */
      for (const attr of attributes) {
        await tx.productAttribute.create({
          data: {
            id: attr.id,
            productId: id,
            name: attr.name,
            type: attr.type,
            values: {
              create: attr.values.map((v: any) => ({
                id: v.id,
                value: v.value,
                label: v.label,
                hexColor: v.hexColor,
                priceModifier: v.priceModifier,
                inStock: v.inStock,
                imageUrl: v.imageUrl
              }))
            }
          }
        });
      }

      /* 4) look up all AttributeValues again */
      const allValues = await tx.attributeValue.findMany({
        where: { attribute: { productId: id } },
        select: { id: true, attributeId: true, value: true }
      });
      const valMap: Record<string,string> = {};
      allValues.forEach(v => {
        valMap[`${v.attributeId}|${v.id}`] = v.id;
        valMap[`${v.attributeId}|${v.value}`] = v.id;
      });

      /* 5) re-create variants & joins */
      for (const variant of variants) {
        const pv = await tx.productVariant.create({
          data: {
            id: variant.id,
            productId: id,
            sku: variant.sku,
            price: variant.price ?? null,
            image: variant.image ?? '',
            inStock: variant.inStock !== false,
            stockQuantity: variant.stockQuantity ?? 0
          }
        });

        const joins = Object.entries(
          variant.attributeValues as Record<string,string>
        ).map(([attrId, rawVal]) => ({
          variantId: pv.id,
          attributeValueId: valMap[`${attrId}|${rawVal}`]
        })).filter(join => join.attributeValueId !== undefined);

        if (joins.length) await tx.variantAttributeValue.createMany({ data: joins });
      }
    });

    return NextResponse.json({ message: 'Updated' });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/products/:id */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
