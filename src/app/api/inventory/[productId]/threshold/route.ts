import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Update stock threshold for a product
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const body = await request.json();
    const { stockThreshold } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (typeof stockThreshold !== 'number' || stockThreshold < 0) {
      return NextResponse.json(
        { error: 'Valid stock threshold is required (must be >= 0)' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update or create inventory record with new threshold
    const inventory = await prisma.inventory.upsert({
      where: { productId },
      update: { 
        stockThreshold,
        updatedAt: new Date()
      },
      create: {
        productId,
        stock: 0,
        stockThreshold
      }
    });

    // Get updated product data
    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        inventory: true,
        category: {
          select: {
            name_en: true,
            name_ar: true,
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Stock threshold updated successfully',
      inventory,
      product: updatedProduct,
      isLowStock: (inventory.stock <= stockThreshold)
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update stock threshold' },
      { status: 500 }
    );
  }
}
