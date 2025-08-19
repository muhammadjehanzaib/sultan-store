import { NextResponse } from 'next/server';
import { getAllCategoryIds, getAllCategoriesWithHierarchy } from '@/lib/categoryUtils';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to comply with Next.js 15
    const { id } = await context.params;
    
    const { searchParams } = new URL(req.url);
    const includeSubcategories = searchParams.get('includeSubcategories') !== 'false';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const skip = (page - 1) * limit;
    
    // Get category IDs to search in
    let categoryIds = [id];
    
    if (includeSubcategories) {
      // Get all categories to build the tree
      const allCategories = await getAllCategoriesWithHierarchy(false);
      categoryIds = getAllCategoryIds(id, allCategories);
    }
    
    // Build where clause for products
    const whereClause: any = {
      categoryId: { in: categoryIds },
      // Only include active products
    };
    
    // Get products
    const products = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        slug: true,
        name_en: true,
        name_ar: true,
        description_en: true,
        description_ar: true,
        price: true,
        salePrice: true,
        discountPercent: true,
        onSale: true,
        saleStartDate: true,
        saleEndDate: true,
        image: true,
        inStock: true,
        rating: true,
        reviews: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name_en: true,
            name_ar: true,
            slug: true
          }
        },
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder as 'asc' | 'desc'
      }
    });
    
    // Get total count for pagination
    const totalProducts = await prisma.product.count({
      where: whereClause
    });
    
    // Process products to match frontend format
    const frontendProducts = products.map((apiProduct: any) => ({
      id: apiProduct.id,
      name: { en: apiProduct.name_en || '', ar: apiProduct.name_ar || '' },
      slug: apiProduct.slug,
      price: apiProduct.price,
      image: apiProduct.image,
      category: apiProduct.category
        ? { en: apiProduct.category.name_en || '', ar: apiProduct.category.name_ar || '' }
        : { en: '', ar: '' },
      description: { en: apiProduct.description_en || '', ar: apiProduct.description_ar || '' },
      inStock: apiProduct.inStock,
      rating: apiProduct.rating,
      reviews: apiProduct.reviews,
      attributes: apiProduct.attributes || [],
      variants: apiProduct.variants || [],
      salePrice: apiProduct.salePrice,
      discountPercent: apiProduct.discountPercent,
      onSale: apiProduct.onSale || false,
      saleStartDate: apiProduct.saleStartDate,
      saleEndDate: apiProduct.saleEndDate,
    }));
    
    return NextResponse.json({
      products: frontendProducts,
      pagination: {
        page,
        limit,
        total: totalProducts,
        totalPages: Math.ceil(totalProducts / limit)
      },
      categoryIds
    });
    
  } catch (err) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
