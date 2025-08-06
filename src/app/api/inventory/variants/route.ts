import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ProductVariant } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { variantId, action, stockChange } = await request.json();

    if (!variantId || !action) {
      return NextResponse.json(
        { error: 'variantId and action are required' },
        { status: 400 }
      );
    }

    let updatedVariant: ProductVariant | null = null;

    switch (action) {
      case 'adjustStock':
        if (typeof stockChange !== 'number') {
          return NextResponse.json(
            { error: 'stockChange is required for adjustStock action' },
            { status: 400 }
          );
        }

        // Get current variant
        const currentVariant = await prisma.productVariant.findUnique({
          where: { id: variantId }
        });

        if (!currentVariant) {
          return NextResponse.json(
            { error: 'Variant not found' },
            { status: 404 }
          );
        }

        // Update variant stock
        updatedVariant = await prisma.productVariant.update({
          where: { id: variantId },
          data: {
            stockQuantity: Math.max(0, currentVariant.stockQuantity + stockChange),
            inStock: Math.max(0, currentVariant.stockQuantity + stockChange) > 0
          }
        });

        // Update product's total stock based on all variants
        const allVariants = await prisma.productVariant.findMany({
          where: { productId: currentVariant.productId }
        });
        
        const totalVariantStock = allVariants.reduce((sum, variant) => 
          sum + (variant.id === variantId ? (updatedVariant?.stockQuantity ?? 0) : variant.stockQuantity), 0
        );

        // Update product inventory to reflect total variant stock
        await prisma.inventory.upsert({
          where: { productId: currentVariant.productId },
          update: {
            stock: totalVariantStock
          },
          create: {
            productId: currentVariant.productId,
            stock: totalVariantStock,
            stockThreshold: 5
          }
        });

        // Update product inStock status
        await prisma.product.update({
          where: { id: currentVariant.productId },
          data: {
            inStock: totalVariantStock > 0
          }
        });

        // TODO: Add variant stock history tracking if needed
        break;

      case 'toggleStatus':
        // Get current variant
        const variant = await prisma.productVariant.findUnique({
          where: { id: variantId }
        });

        if (!variant) {
          return NextResponse.json(
            { error: 'Variant not found' },
            { status: 404 }
          );
        }

        // Toggle inStock status
        updatedVariant = await prisma.productVariant.update({
          where: { id: variantId },
          data: {
            inStock: !variant.inStock
          }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "adjustStock" or "toggleStatus"' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: 'Variant updated successfully',
      variant: updatedVariant
    });

  } catch (error) {
    console.error('[POST /api/inventory/variants]', error);
    return NextResponse.json(
      { error: 'Failed to update variant' }, 
      { status: 500 }
    );
  }
}
