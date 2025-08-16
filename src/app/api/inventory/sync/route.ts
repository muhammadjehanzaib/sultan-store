import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// POST - Sync all product stocks with their variant totals
export async function POST(request: Request) {
  try {
    // Get all products with variants and inventory
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        inventory: true
      }
    });

    const syncResults = [];

    for (const product of products) {
      if (product.variants.length > 0) {
        // Calculate total variant stock
        const totalVariantStock = product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
        
        // Update or create inventory record to match variant total
        const inventory = await prisma.inventory.upsert({
          where: { productId: product.id },
          update: {
            stock: totalVariantStock
          },
          create: {
            productId: product.id,
            stock: totalVariantStock,
            stockThreshold: 5
          }
        });

        // Update product inStock status
        await prisma.product.update({
          where: { id: product.id },
          data: {
            inStock: totalVariantStock > 0
          }
        });

        syncResults.push({
          productId: product.id,
          previousStock: product.inventory?.stock || 0,
          newStock: totalVariantStock,
          variantCount: product.variants.length
        });
      }
    }

    return NextResponse.json({
      message: 'Product stocks synced with variant totals successfully',
      syncedProducts: syncResults.length,
      results: syncResults
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to sync product stocks' }, 
      { status: 500 }
    );
  }
}
