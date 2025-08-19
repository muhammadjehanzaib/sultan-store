import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  
  try {
    const { variantId } = await params;

    if (!variantId) {
      return NextResponse.json({ 
        error: 'variantId is required' 
      }, { status: 400 });
    }


    // Fetch variant-specific stock history with explicit where clause
    const history = await prisma.stockHistory.findMany({
      where: {
        variantId: variantId as string
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        change: true,
        reason: true,
        createdAt: true,
        productId: true,
        variantId: true,
        product: {
          select: {
            name_en: true,
            name_ar: true
          }
        }
      }
    });

    // Get current variant info
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: {
        stockQuantity: true,
        inStock: true,
        productId: true
      }
    });

    return NextResponse.json({
      history: history,
      currentStock: variant?.stockQuantity || 0,
      inStock: variant?.inStock || false,
      variantId: variantId
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch variant history' }, 
      { status: 500 }
    );
  }
}
