// import { PrismaClient } from '@prisma/client';
// import { NextResponse } from 'next/server';

// const prisma = new PrismaClient();

// export async function GET() {
//   try {
//     const products = await prisma.product.findMany({
//       orderBy: { createdAt: 'desc' },
//       include: { 
//         category: true, 
//         variants: true, 
//         attributes: {
//           include: {
//             values: true
//           }
//         } 
//       },
//     });
//     return NextResponse.json({ products });
//   } catch (err) {
//     
//     return NextResponse.json({ error: 'Server Error' }, { status: 500 });
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { name_en, name_ar, slug, image, price, categoryId, description_en, description_ar, inStock, rating, reviews, variants, attributes } = body;
//     if (!name_en || !name_ar || !slug || !image || !price || !categoryId) {
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//     }
    
//     // Check if slug already exists and generate a unique one if needed
//     let uniqueSlug = slug;
//     let counter = 1;
//     while (true) {
//       const existingProduct = await prisma.product.findFirst({
//         where: { slug: uniqueSlug }
//       });
//       if (!existingProduct) break;
//       uniqueSlug = `${slug}-${counter}`;
//       counter++;
//     }
    
//     const product = await prisma.product.create({
//       data: {
//         name_en,
//         name_ar,
//         slug: uniqueSlug,
//         image,
//         price,
//         categoryId,
//         description_en,
//         description_ar,
//         inStock,
//         rating,
//         reviews,
//         attributes: {
//           create: attributes?.map((attr: any) => ({
//             name: attr.name,
//             type: attr.type,
//             values: {
//               create: attr.values?.map((val: any) => ({
//                 value: val.value,
//                 label: val.label,
//                 hexColor: val.hexColor,
//                 priceModifier: val.priceModifier,
//                 inStock: val.inStock,
//                 imageUrl: val.imageUrl,
//               })) || []
//             }
//           })) || []
//         },
//         variants: {
//           create: variants?.map((variant: any) => {
//             
//             // Ensure attributeValues is properly serialized
//             let attributeValuesJson = null;
//             if (variant.attributeValues && typeof variant.attributeValues === 'object') {
//               attributeValuesJson = variant.attributeValues;
//             }
            
//             const variantData = {
//               sku: variant.sku || '',
//               price: variant.price || null,
//               image: variant.image || '',
//               inStock: variant.inStock !== false,
//               stockQuantity: variant.stockQuantity || 0,
//               attributeValues: attributeValuesJson,
//             };
            
//             
//             return variantData;
//           }) || []
//         }
//       },
//       include: {
//         category: true,
//         variants: true,
//         attributes: {
//           include: {
//             values: true
//           }
//         },
//       }
//     });
//     return NextResponse.json({ product }, { status: 201 });
//   } catch (err) {
//     
//     return NextResponse.json({ error: 'Server Error' }, { status: 500 });
//   }
// } 


import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/** GET /api/products  – optional ?includeRelations=true, ?includeInactiveCategories=true, ?limit=number, ?onSale=true, ?newArrivals=true */
export async function GET(req: NextRequest) {
  const include = req.nextUrl.searchParams.get('includeRelations') === 'true';
  const includeInactiveCategories = req.nextUrl.searchParams.get('includeInactiveCategories') === 'true';
  const limitParam = req.nextUrl.searchParams.get('limit');
  const onSale = req.nextUrl.searchParams.get('onSale') === 'true';
  const newArrivals = req.nextUrl.searchParams.get('newArrivals') === 'true';
  
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  // Build the where clause to filter by active categories unless explicitly requested
  const whereClause: any = {};
  if (!includeInactiveCategories) {
    whereClause.category = {
      isActive: true
    };
  }
  
  // Filter for sale products
  if (onSale) {
    whereClause.onSale = true;
  }
  
  // Filter for new arrivals (last 30 days)
  if (newArrivals) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    whereClause.createdAt = {
      gte: thirtyDaysAgo
    };
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: newArrivals 
      ? { createdAt: 'desc' } 
      : onSale 
      ? { saleStartDate: 'desc' }
      : { createdAt: 'desc' },
    ...(limit && { take: limit }),
    select: {
      id: true,
      slug: true,
      name_en: true,
      name_ar: true,
      description_en: true,
      description_ar: true,
      image: true,
      price: true,
      // Include discount fields
      salePrice: true,
      discountPercent: true,
      onSale: true,
      saleStartDate: true,
      saleEndDate: true,
      inStock: true,
      rating: true,
      reviews: true,
      categoryId: true,
      createdAt: true,
      // Include relations if requested
      ...(include && {
        category: {
          select: {
            id: true,
            slug: true,
            name_en: true,
            name_ar: true,
            icon: true
          }
        },
        inventory: true,
        attributes: { include: { values: true } },
        variants: {
          include: {
            attributeValues: {
              include: { attributeValue: { include: { attribute: true } } }
            }
          }
        }
      })
    }
  });

  return NextResponse.json(products);
}

/** POST /api/products  – create a brand-new product */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    /* ---------- 1. pull out top-level product props ---------- */
    const {
      slug, name_en, name_ar, description_en, description_ar,
      image, price, categoryId, inStock = true, rating = 0, reviews = 0,
      // Discount fields
      salePrice, discountPercent, onSale = false, saleStartDate, saleEndDate,
      attributes = [],                    // [{ name,type, values:[{…}] }]
      variants   = []                     // [{ sku, price, stockQuantity, attrs:{[attrId]:valueId} }]
    } = body as any;

    /* ---------- 2. assemble nested create objects ---------- */
    const attributeCreates: Prisma.ProductAttributeCreateWithoutProductInput[] =
      attributes.map((attr: any) => ({
        id: attr.id,                      // (optional) allow predefined id
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
      }));

    /*  We'll create the product first (with attributes) so we know every
        AttributeValue.id that was generated / reused.  */
    const created = await prisma.product.create({
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
        saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
        attributes: { create: attributeCreates }
      },
      include: { attributes: { include: { values: true } } }
    });

    /* ---------- 3. index attribute-values for quick lookup ---------- */
    const valueMap: Record<string, string> = {}; // key = attrId|value , val = valueId
    created.attributes.forEach(attr => {
      attr.values.forEach(v => {
        valueMap[`${attr.id}|${v.id}`] = v.id;                // existing id
        valueMap[`${attr.id}|${v.value}`] = v.id;             // by raw value
      });
    });

    /* ---------- 4. build Variant + join-table rows ---------- */
    for (const variant of variants) {
      const pv = await prisma.productVariant.create({
        data: {
          id: variant.id,
          productId: created.id,
          sku: variant.sku,
          price: variant.price ?? null,
          image: variant.image ?? '',
          inStock: variant.inStock !== false,
          stockQuantity: variant.stockQuantity ?? 0
        }
      });

      /* join each AttributeValue */
      const joins = Object.entries(variant.attributeValues as Record<string,string>)
        .map(([attrId, rawValId]) => ({
          variantId: pv.id,
          attributeValueId: valueMap[`${attrId}|${rawValId}`]   // resolve -> real id
        }));

      if (joins.length) {
        await prisma.variantAttributeValue.createMany({ data: joins });
      }
    }

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
