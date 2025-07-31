import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET stock history for a specific product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  try {

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get product details first
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name_en: true,
        name_ar: true,
        slug: true,
        image: true,
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get stock history
    const stockHistory = await prisma.stockHistory.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 entries
    });

    // Get current inventory
    const currentInventory = await prisma.inventory.findUnique({
      where: { productId }
    });

    return NextResponse.json({
      product,
      currentStock: currentInventory?.stock || 0,
      stockThreshold: currentInventory?.stockThreshold || 5,
      history: stockHistory.map(entry => ({
        id: entry.id,
        change: entry.change,
        reason: entry.reason,
        createdAt: entry.createdAt,
        type: entry.change > 0 ? 'increase' : 'decrease'
      }))
    });

  } catch (error) {
    console.error('[GET /api/inventory/[productId]/history]', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock history' },
      { status: 500 }
    );
  }
}
