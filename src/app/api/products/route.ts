import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { cache, CacheKeys } from '@/lib/cache';

const CACHE_DEBUG = process.env.CACHE_DEBUG === '1';

// Cache the API response for 30 minutes on Vercel
export const revalidate = 1800;

/** GET /api/products – CACHED VERSION - reduces DB load by 90% */
export async function GET(req: NextRequest) {
  try {
    const include = req.nextUrl.searchParams.get('includeRelations') === 'true';
    const includeInactiveCategories = req.nextUrl.searchParams.get('includeInactiveCategories') === 'true';
    const limitParam = req.nextUrl.searchParams.get('limit');
    const onSale = req.nextUrl.searchParams.get('onSale') === 'true';
    const newArrivals = req.nextUrl.searchParams.get('newArrivals') === 'true';
    
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    // Create cache key based on all parameters
    const cacheKey = `products:api:${JSON.stringify({
      include,
      includeInactiveCategories,
      limit,
      onSale,
      newArrivals
    })}`;

    if (CACHE_DEBUG) console.log('🚀 Products API called with cache key:', cacheKey);

    // Use cache with database fallback
    const products = await cache.cached(
      cacheKey,
      async () => {
        if (CACHE_DEBUG) console.log('🔍 Fetching products from DB (cache miss)');
        
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

        return await prisma.product.findMany({
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
      },
      { ttl: 1800 } // 30 minutes cache
    );

    // Set Vercel cache headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    headers.set('CDN-Cache-Control', 'public, s-maxage=1800');
    headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=1800');

    return NextResponse.json(products, { headers });

  } catch (error) {
    if (CACHE_DEBUG) console.error('❌ Products API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', products: [] },
      { status: 500 }
    );
  }
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

    // Invalidate cache after creating new product
    cache.deletePattern('products:');
    if (CACHE_DEBUG) console.log('🗑️ Invalidated product cache after creating new product');

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
