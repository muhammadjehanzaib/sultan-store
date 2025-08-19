import { prisma } from '@/lib/prisma';

export interface CategoryWithChildren {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  parentId?: string;
  level: number;
  path?: string;
  metaTitle_en?: string;
  metaTitle_ar?: string;
  metaDesc_en?: string;
  metaDesc_ar?: string;
  createdAt: Date;
  updatedAt: Date;
  children?: CategoryWithChildren[];
  parent?: CategoryWithChildren;
  productCount?: number;
}

/**
 * Build category path from parent hierarchy
 */
export function buildCategoryPath(category: { slug: string; parent?: { path?: string; slug: string } }): string {
  if (category.parent?.path) {
    return `${category.parent.path}/${category.slug}`;
  }
  if (category.parent?.slug) {
    return `${category.parent.slug}/${category.slug}`;
  }
  return category.slug;
}

/**
 * Calculate category level based on parent
 */
export function calculateCategoryLevel(parent?: { level: number }): number {
  return parent ? parent.level + 1 : 0;
}

/**
 * Build a tree structure from flat category array
 */
export function buildCategoryTree(categories: CategoryWithChildren[]): CategoryWithChildren[] {
  const categoryMap = new Map<string, CategoryWithChildren>();
  const rootCategories: CategoryWithChildren[] = [];

  // First pass: create map and initialize children arrays
  categories.forEach(category => {
    category.children = [];
    categoryMap.set(category.id, category);
  });

  // Second pass: build tree structure
  categories.forEach(category => {
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children!.push(category);
      }
    } else {
      rootCategories.push(category);
    }
  });

  // Sort categories by sortOrder
  const sortByOrder = (a: CategoryWithChildren, b: CategoryWithChildren) => a.sortOrder - b.sortOrder;
  
  rootCategories.sort(sortByOrder);
  rootCategories.forEach(category => {
    if (category.children) {
      category.children.sort(sortByOrder);
      // Recursively sort all levels
      const sortRecursive = (cats: CategoryWithChildren[]) => {
        cats.forEach(cat => {
          if (cat.children && cat.children.length > 0) {
            cat.children.sort(sortByOrder);
            sortRecursive(cat.children);
          }
        });
      };
      sortRecursive(category.children);
    }
  });

  return rootCategories;
}

/**
 * Get all category IDs including children (recursive)
 */
export function getAllCategoryIds(categoryId: string, categories: CategoryWithChildren[]): string[] {
  const categoryMap = new Map<string, CategoryWithChildren>();
  categories.forEach(cat => categoryMap.set(cat.id, cat));
  
  const result: string[] = [categoryId];
  
  const addChildren = (id: string) => {
    const category = categoryMap.get(id);
    if (category?.children) {
      category.children.forEach(child => {
        result.push(child.id);
        addChildren(child.id);
      });
    }
  };
  
  addChildren(categoryId);
  return result;
}

/**
 * Get category breadcrumbs from path
 */
export function getCategoryBreadcrumbs(path: string): string[] {
  return path.split('/').filter(Boolean);
}

/**
 * Find category by slug path (supports multi-level paths)
 */
export async function findCategoryByPath(slugs: string[]): Promise<CategoryWithChildren | null> {
  const path = slugs.join('/');
  
  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { path: path },
        { slug: slugs[slugs.length - 1] } // fallback to last slug
      ],
      isActive: true
    },
    include: {
      parent: true,
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }
    }
  });

  if (!category) return null;
  
  return {
    ...category,
    description_en: category.description_en ?? undefined,
    description_ar: category.description_ar ?? undefined,
    image: category.image ?? undefined,
    icon: category.icon ?? undefined,
    parentId: category.parentId ?? undefined,
    path: category.path ?? undefined,
    metaTitle_en: category.metaTitle_en ?? undefined,
    metaTitle_ar: category.metaTitle_ar ?? undefined,
    metaDesc_en: category.metaDesc_en ?? undefined,
    metaDesc_ar: category.metaDesc_ar ?? undefined,
    children: category.children?.map(child => ({
      ...child,
      description_en: child.description_en ?? undefined,
      description_ar: child.description_ar ?? undefined,
      image: child.image ?? undefined,
      icon: child.icon ?? undefined,
      parentId: child.parentId ?? undefined,
      path: child.path ?? undefined,
      metaTitle_en: child.metaTitle_en ?? undefined,
      metaTitle_ar: child.metaTitle_ar ?? undefined,
      metaDesc_en: child.metaDesc_en ?? undefined,
      metaDesc_ar: child.metaDesc_ar ?? undefined,
    })),
    parent: category.parent ? {
      ...category.parent,
      description_en: category.parent.description_en ?? undefined,
      description_ar: category.parent.description_ar ?? undefined,
      image: category.parent.image ?? undefined,
      icon: category.parent.icon ?? undefined,
      parentId: category.parent.parentId ?? undefined,
      path: category.parent.path ?? undefined,
      metaTitle_en: category.parent.metaTitle_en ?? undefined,
      metaTitle_ar: category.parent.metaTitle_ar ?? undefined,
      metaDesc_en: category.parent.metaDesc_en ?? undefined,
      metaDesc_ar: category.parent.metaDesc_ar ?? undefined,
    } : undefined
  };
}

/**
 * Get all categories with their hierarchy
 */
export async function getAllCategoriesWithHierarchy(includeInactive = false): Promise<CategoryWithChildren[]> {
  const whereClause = includeInactive ? {} : { isActive: true };
  
  // Get all categories first
  const allCategories = await prisma.category.findMany({
    where: whereClause,
    include: {
      parent: true,
      _count: {
        select: { products: true }
      }
    },
    orderBy: [
      { level: 'asc' },
      { sortOrder: 'asc' }
    ]
  });

  // Build category map for efficient lookup
  const categoryMap = new Map<string, any>();
  allCategories.forEach(cat => {
    categoryMap.set(cat.id, {
      ...cat,
      children: []
    });
  });

  // Build hierarchy by connecting children to parents
  allCategories.forEach(cat => {
    if (cat.parentId && categoryMap.has(cat.parentId)) {
      const parent = categoryMap.get(cat.parentId);
      parent.children.push(categoryMap.get(cat.id));
    }
  });

  // Get only root categories (those without parents)
  const categories = allCategories.filter(cat => !cat.parentId).map(cat => categoryMap.get(cat.id));

  // Recursive function to transform categories with proper nesting
  const transformCategory = (cat: any): CategoryWithChildren => ({
    ...cat,
    description_en: cat.description_en ?? undefined,
    description_ar: cat.description_ar ?? undefined,
    image: cat.image ?? undefined,
    icon: cat.icon ?? undefined,
    parentId: cat.parentId ?? undefined,
    path: cat.path ?? undefined,
    metaTitle_en: cat.metaTitle_en ?? undefined,
    metaTitle_ar: cat.metaTitle_ar ?? undefined,
    metaDesc_en: cat.metaDesc_en ?? undefined,
    metaDesc_ar: cat.metaDesc_ar ?? undefined,
    productCount: cat._count ? cat._count.products : 0,
    children: cat.children?.map(transformCategory) || [],
    parent: cat.parent ? {
      ...cat.parent,
      description_en: cat.parent.description_en ?? undefined,
      description_ar: cat.parent.description_ar ?? undefined,
      image: cat.parent.image ?? undefined,
      icon: cat.parent.icon ?? undefined,
      parentId: cat.parent.parentId ?? undefined,
      path: cat.parent.path ?? undefined,
      metaTitle_en: cat.parent.metaTitle_en ?? undefined,
      metaTitle_ar: cat.parent.metaTitle_ar ?? undefined,
      metaDesc_en: cat.parent.metaDesc_en ?? undefined,
      metaDesc_ar: cat.parent.metaDesc_ar ?? undefined,
    } : undefined
  });

  return categories.map(transformCategory);
}

/**
 * Update category hierarchy (level and path) when parent changes
 */
export async function updateCategoryHierarchy(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { parent: true }
  });

  if (!category) throw new Error('Category not found');

  const level = calculateCategoryLevel(category.parent ?? undefined);
  const path = buildCategoryPath({
    ...category,
    parent: category.parent ? {
      ...category.parent,
      path: category.parent.path ?? undefined
    } : undefined
  });

  await prisma.category.update({
    where: { id: categoryId },
    data: { level, path }
  });

  // Update all children recursively
  const children = await prisma.category.findMany({
    where: { parentId: categoryId }
  });

  for (const child of children) {
    await updateCategoryHierarchy(child.id);
  }
}

/**
 * Get category suggestions for search
 */
export async function searchCategories(query: string, limit = 10): Promise<CategoryWithChildren[]> {
  const categories = await prisma.category.findMany({
    where: {
      AND: [
        { isActive: true },
        {
          OR: [
            { name_en: { contains: query, mode: 'insensitive' } },
            { name_ar: { contains: query, mode: 'insensitive' } }
          ]
        }
      ]
    },
    take: limit,
    orderBy: { sortOrder: 'asc' }
  });

  return categories.map(cat => ({
    ...cat,
    description_en: cat.description_en ?? undefined,
    description_ar: cat.description_ar ?? undefined,
    image: cat.image ?? undefined,
    icon: cat.icon ?? undefined,
    parentId: cat.parentId ?? undefined,
    path: cat.path ?? undefined,
    metaTitle_en: cat.metaTitle_en ?? undefined,
    metaTitle_ar: cat.metaTitle_ar ?? undefined,
    metaDesc_en: cat.metaDesc_en ?? undefined,
    metaDesc_ar: cat.metaDesc_ar ?? undefined,
  }));
}

/**
 * Validate category hierarchy (prevent circular references)
 */
export async function validateCategoryHierarchy(categoryId: string, newParentId?: string): Promise<boolean> {
  if (!newParentId) return true; // Root category is always valid
  
  // Check if new parent is the same as the category itself
  if (categoryId === newParentId) return false;
  
  // Check if new parent is a descendant of the category
  const descendants = await getAllDescendantIds(categoryId);
  return !descendants.includes(newParentId);
}

/**
 * Get all descendant category IDs
 */
async function getAllDescendantIds(categoryId: string): Promise<string[]> {
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true }
  });

  const descendants = children.map(child => child.id);
  
  for (const child of children) {
    const childDescendants = await getAllDescendantIds(child.id);
    descendants.push(...childDescendants);
  }
  
  return descendants;
}
