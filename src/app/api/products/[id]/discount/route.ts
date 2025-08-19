import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = id;
    const body = await req.json();

    const {
      salePrice,
      discountPercent,
      onSale,
      saleStartDate,
      saleEndDate
    } = body;

    // Update the product with discount information
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        salePrice: salePrice ? parseFloat(salePrice) : null,
        discountPercent: discountPercent ? parseFloat(discountPercent) : null,
        onSale: Boolean(onSale),
        saleStartDate: saleStartDate ? new Date(saleStartDate) : null,
        saleEndDate: saleEndDate ? new Date(saleEndDate) : null
      },
      select: {
        id: true,
        name_en: true,
        price: true,
        salePrice: true,
        discountPercent: true,
        onSale: true,
        saleStartDate: true,
        saleEndDate: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct 
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update product discount' }, 
      { status: 500 }
    );
  }
}
