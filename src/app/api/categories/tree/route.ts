import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getAllCategoriesWithHierarchy, buildCategoryTree } from '@/lib/categoryUtils';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const maxLevel = searchParams.get('maxLevel') ? parseInt(searchParams.get('maxLevel')!) : undefined;
    
    // Get all categories with hierarchy - this already builds the tree structure
    const categoryTree = await getAllCategoriesWithHierarchy(includeInactive);
    
    // Filter by max level if specified (if we need this feature)
    const filteredTree = maxLevel 
      ? categoryTree.filter(cat => cat.level <= maxLevel)
      : categoryTree;
      
    
    return NextResponse.json({ 
      tree: filteredTree,
      totalCategories: categoryTree.length,
      rootCategories: filteredTree.length
    });
    
  } catch (err) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
