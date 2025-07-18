import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        category: true, 
        variants: true, 
        attributes: {
          include: {
            values: true
          }
        } 
      },
    });
    return NextResponse.json({ products });
  } catch (err) {
    console.error('[GET /products]', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name_en, name_ar, slug, image, price, categoryId, description_en, description_ar, inStock, rating, reviews, variants, attributes } = body;
    if (!name_en || !name_ar || !slug || !image || !price || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if slug already exists and generate a unique one if needed
    let uniqueSlug = slug;
    let counter = 1;
    while (true) {
      const existingProduct = await prisma.product.findFirst({
        where: { slug: uniqueSlug }
      });
      if (!existingProduct) break;
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    
    const product = await prisma.product.create({
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
            attributeValues: variant.attributeValues || null,
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
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error('[POST /products]', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
} 