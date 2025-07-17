import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest, context: any) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { name_en, name_ar, slug, image, price, categoryId, description_en, description_ar, inStock, rating, reviews, variants, attributes } = body;
    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }
    
    // Check if slug already exists (excluding current product) and generate a unique one if needed
    let uniqueSlug = slug;
    let counter = 1;
    while (true) {
      const existingProduct = await prisma.product.findFirst({
        where: { 
          slug: uniqueSlug,
          id: { not: id }
        }
      });
      if (!existingProduct) break;
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    
    // First, delete existing variants and attributes
    await prisma.productVariant.deleteMany({
      where: { productId: id }
    });
    
    await prisma.attributeValue.deleteMany({
      where: {
        attribute: {
          productId: id
        }
      }
    });
    
    await prisma.productAttribute.deleteMany({
      where: { productId: id }
    });
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        name_en,
        name_ar,
        slug: uniqueSlug,
        image,
        price,
        categoryId,
        description_en,
        description_ar,
        inStock,
        rating,
        reviews,
        attributes: {
          create: attributes?.map((attr: any) => ({
            name: attr.name,
            type: attr.type,
            values: {
              create: attr.values?.map((val: any) => ({
                value: val.value,
                label: val.label,
                hexColor: val.hexColor,
                priceModifier: val.priceModifier,
                inStock: val.inStock,
                imageUrl: val.imageUrl,
              })) || []
            }
          })) || []
        },
        variants: {
          create: variants?.map((variant: any) => ({
            sku: variant.sku,
            price: variant.price,
            image: variant.image,
            inStock: variant.inStock,
            stockQuantity: variant.stockQuantity,
          })) || []
        }
      },
      include: {
        category: true,
        variants: true,
        attributes: {
          include: {
            values: true
          }
        },
      }
    });
    return NextResponse.json({ product }, { status: 200 });
  } catch (err) {
    console.error('[PATCH /products/:id]', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: 'Product deleted' }, { status: 200 });
  } catch (err) {
    console.error('[DELETE /products/:id]', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
} 