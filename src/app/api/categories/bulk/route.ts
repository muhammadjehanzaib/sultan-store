import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { categoryIds, action, data } = body;

    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid category IDs' }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    let updateData: any = {};

    switch (action) {
      case 'activate':
        updateData.isActive = true;
        break;
      case 'deactivate':
        updateData.isActive = false;
        break;
      case 'update':
        if (!data) {
          return NextResponse.json({ error: 'Missing update data' }, { status: 400 });
        }
        updateData = data;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updatedCategories = await prisma.category.updateMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      data: updateData,
    });

    // Fetch the updated categories to return them
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
    });

    return NextResponse.json({ 
      message: `Successfully updated ${updatedCategories.count} categories`,
      categories,
      count: updatedCategories.count 
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { categoryIds } = body;

    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid category IDs' }, { status: 400 });
    }

    // Check if any categories have products
    const categoriesWithProducts = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const categoriesWithProductsList = categoriesWithProducts.filter(cat => cat._count.products > 0);
    
    if (categoriesWithProductsList.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete categories that contain products',
        categoriesWithProducts: categoriesWithProductsList.map(cat => ({
          id: cat.id,
          name_en: cat.name_en,
          name_ar: cat.name_ar,
          productCount: cat._count.products
        }))
      }, { status: 400 });
    }

    const deletedCategories = await prisma.category.deleteMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
    });

    return NextResponse.json({ 
      message: `Successfully deleted ${deletedCategories.count} categories`,
      count: deletedCategories.count 
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
