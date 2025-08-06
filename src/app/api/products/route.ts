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
//     console.error('[GET /products]', err);
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
//             console.log('API CREATE: Creating variant:', variant);
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
            
//             console.log('API CREATE: Final variant data:', variantData);
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
//     console.error('[POST /products]', err);
//     return NextResponse.json({ error: 'Server Error' }, { status: 500 });
//   }
// } 


import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/** GET /api/products  – optional ?includeRelations=true */
export async function GET(req: NextRequest) {
  const include = req.nextUrl.searchParams.get('includeRelations') === 'true';

  const products = await prisma.product.findMany({
    include: include ? {
      category: true,
      inventory: true, // Include inventory data
      attributes: { include: { values: true } },
      variants: {
        include: {
          attributeValues: {                     // 💡 follow the join
            include: { attributeValue: { include: { attribute: true } } }
          }
        }
      }
    } : undefined
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
    console.error('[POST /api/products]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
