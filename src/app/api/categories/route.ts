import { NextResponse } from "next/server";
import { 
  buildCategoryPath, 
  calculateCategoryLevel, 
  updateCategoryHierarchy,
  validateCategoryHierarchy
} from '@/lib/categoryUtils';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { 
          name_en, 
          name_ar, 
          slug, 
          description_en,
          description_ar,
          icon, 
          image,
          parentId,
          sortOrder = 0,
          metaTitle_en,
          metaTitle_ar,
          metaDesc_en,
          metaDesc_ar,
          isActive = true 
        } = body;
        

        if (!name_en || !name_ar || !slug) {
            return NextResponse.json({ error: 'Missing required fields: name_en, name_ar, slug' }, { status: 400 });
        }

        // Validate hierarchy if parentId is provided
        if (parentId) {
          
          const parentExists = await prisma.category.findUnique({ where: { id: parentId } });
          if (!parentExists) {
            return NextResponse.json({ error: 'Parent category not found' }, { status: 400 });
          }
          
        }

        // Get parent to calculate level and path
        const parent = parentId ? await prisma.category.findUnique({ 
          where: { id: parentId },
          select: { level: true, path: true, slug: true }
        }) : null;

        const level = calculateCategoryLevel(parent || undefined);
        const path = buildCategoryPath({ 
          slug, 
          parent: parent ? {
            ...parent,
            path: parent.path || undefined
          } : undefined 
        });


        const category = await prisma.category.create({
            data: {
                name_en,
                name_ar,
                slug,
                description_en: description_en || null,
                description_ar: description_ar || null,
                icon: icon || null,
                image: image || null,
                parentId: parentId || null,
                level,
                path: path || null,
                sortOrder,
                metaTitle_en: metaTitle_en || null,
                metaTitle_ar: metaTitle_ar || null,
                metaDesc_en: metaDesc_en || null,
                metaDesc_ar: metaDesc_ar || null,
                isActive,
            },
            include: {
              parent: true,
              children: true
            }
        });

        return NextResponse.json({ category }, { status: 201 });

    } catch (err) {
        
        // Check if it's a Prisma foreign key constraint error
        if (err && typeof err === 'object' && 'code' in err && err.code === 'P2003') {
          return NextResponse.json({ error: 'Invalid parent category - it may have been deleted' }, { status: 400 });
        }
        
        return NextResponse.json({ 
          error: 'Server Error', 
          details: process.env.NODE_ENV === 'development' && err && typeof err === 'object' && 'message' in err ? (err as Error).message : undefined 
        }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const includeInactive = searchParams.get('includeInactive') === 'true';
        const treeFormat = searchParams.get('tree') === 'true';
        const parentId = searchParams.get('parentId');
        
        const whereClause: any = {};
        
        // Only include inactive categories if explicitly requested (for admin)
        if (!includeInactive) {
            whereClause.isActive = true;
        }

        // Filter by parent if specified
        if (parentId) {
          whereClause.parentId = parentId;
        }
        
        const categories = await prisma.category.findMany({
            where: whereClause,
            include: {
              parent: true,
              children: {
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' }
              },
              _count: {
                select: { products: true }
              }
            },
            orderBy: [
              { level: 'asc' },
              { sortOrder: 'asc' },
              { createdAt: 'desc' }
            ],
        });

        // Convert Prisma result to CategoryWithChildren format
        const convertCategory = (cat: any): any => ({
          ...cat,
          description_en: cat.description_en || undefined,
          description_ar: cat.description_ar || undefined,
          icon: cat.icon || undefined,
          image: cat.image || undefined,
          path: cat.path || undefined,
          parentId: cat.parentId || undefined,
          metaTitle_en: cat.metaTitle_en || undefined,
          metaTitle_ar: cat.metaTitle_ar || undefined,
          metaDesc_en: cat.metaDesc_en || undefined,
          metaDesc_ar: cat.metaDesc_ar || undefined,
          productCount: cat._count?.products || 0,
          parent: cat.parent ? convertCategory(cat.parent) : undefined,
          children: cat.children?.map((child: any) => convertCategory(child))
        });
        
        const categoriesWithCount = categories.map(convertCategory);

        if (treeFormat) {
          const { buildCategoryTree } = await import('@/lib/categoryUtils');
          const tree = buildCategoryTree(categoriesWithCount);
          return NextResponse.json({ categories: tree });
        }
        
        return NextResponse.json({ categories: categoriesWithCount });
    } catch (err) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
