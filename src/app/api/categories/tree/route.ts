import { NextResponse } from 'next/server';
import { getAllCategoriesWithHierarchy, buildCategoryTree } from '@/lib/categoryUtils';
import { prisma } from '@/lib/prisma';

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
    console.error('Categories tree API error:', err);
    return NextResponse.json({ 
      error: 'Server Error', 
      details: process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : undefined 
    }, { status: 500 });
  }
}
