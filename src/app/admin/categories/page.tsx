'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CategoriesTable } from '@/components/admin/CategoriesTable';
import { CategoryTreeManager } from '@/components/admin/CategoryTreeManager';
import { MultilingualCategoryModal } from '@/components/admin/MultilingualCategoryModal';
import { Button } from '@/components/ui/Button';
import { Category, MultilingualCategory } from '@/types';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

// Extended category type for tree view
interface CategoryWithChildren {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  path?: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  sortOrder?: number;
  level: number;
  parentId?: string;
  children?: CategoryWithChildren[];
  productCount?: number;
}

export default function AdminCategories() {
  const { t, isRTL } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MultilingualCategory | null>(null);
  const [parentCategory, setParentCategory] = useState<CategoryWithChildren | null>(null);
  const [categoriesData, setCategoriesData] = useState<MultilingualCategory[]>([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState<CategoryWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('tree');

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const response = await fetch('/api/categories?includeInactive=true');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        // Transform each category to have name: { en, ar }
        const categories = data.categories.map((cat: any) => ({
          ...cat,
          name: { en: cat.name_en, ar: cat.name_ar }
        }));
        setCategoriesData(categories);
        
        // Create hierarchical structure for tree view
        const hierarchical = buildHierarchy(data.categories);
        setHierarchicalCategories(hierarchical);
      } catch (error) {
        alert('Error loading categories: ' + (error as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // Helper function to build hierarchical category structure
  const buildHierarchy = (categories: any[]): CategoryWithChildren[] => {
    const categoryMap = new Map();
    const roots: CategoryWithChildren[] = [];
    
    // First pass: create all categories
    categories.forEach(cat => {
      const category: CategoryWithChildren = {
        id: cat.id,
        name_en: cat.name_en,
        name_ar: cat.name_ar,
        slug: cat.slug,
        icon: cat.icon,
        image: cat.image,
        isActive: cat.isActive,
        sortOrder: cat.sortOrder || 0,
        level: 0,
        parentId: cat.parentId,
        children: [],
        productCount: cat.productCount || 0
      };
      categoryMap.set(cat.id, category);
    });
    
    // Second pass: build hierarchy
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id);
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        const parent = categoryMap.get(cat.parentId);
        parent.children!.push(category);
        category.level = parent.level + 1;
      } else {
        roots.push(category);
      }
    });
    
    // Sort categories by sortOrder
    const sortCategories = (cats: CategoryWithChildren[]) => {
      cats.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      cats.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
          sortCategories(cat.children);
        }
      });
    };
    
    sortCategories(roots);
    return roots;
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setParentCategory(null);
    setIsModalOpen(true);
  };

  const handleAddSubcategory = (parent: CategoryWithChildren) => {
    setSelectedCategory(null);
    setParentCategory(parent);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: MultilingualCategory) => {
    setSelectedCategory(category);
    setParentCategory(null); // Clear parent category when editing existing
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (category: MultilingualCategory) => {
    if (selectedCategory) {
      // Edit existing category via API
      try {
        const response = await fetch(`/api/categories/${category.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name_en: category.name.en,
            name_ar: category.name.ar,
            slug: category.slug,
            icon: category.icon,
            isActive: category.isActive,
            parentId: category.parentId,
            sortOrder: category.sortOrder,
          })
        });
        if (!response.ok) throw new Error('Failed to update category');
        const data = await response.json();
        const updatedCategory = {
          ...data.category,
          name: { en: data.category.name_en, ar: data.category.name_ar }
        };
        setCategoriesData(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
        // Rebuild hierarchy
        const hierarchical = buildHierarchy(categoriesData.map(c => ({
          ...c,
          name_en: c.name.en,
          name_ar: c.name.ar
        })));
        setHierarchicalCategories(hierarchical);
      } catch (error) {
        alert('Error updating category: ' + (error as Error).message);
      }
    } else {
      // Add new category via API
      try {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name_en: category.name.en,
            name_ar: category.name.ar,
            slug: category.slug,
            icon: category.icon,
            parentId: category.parentId || null,
            isActive: category.isActive ?? true,
            sortOrder: category.sortOrder || 1,
          })
        });
        if (!response.ok) throw new Error('Failed to create category');
        const data = await response.json();
        const newCategory = {
          ...data.category,
          name: { en: data.category.name_en, ar: data.category.name_ar }
        };
        setCategoriesData(prev => [...prev, newCategory]);
        // Rebuild hierarchy
        const allCategories = [...categoriesData, newCategory].map(c => ({
          ...c,
          name_en: c.name.en,
          name_ar: c.name.ar
        }));
        const hierarchical = buildHierarchy(allCategories);
        setHierarchicalCategories(hierarchical);
      } catch (error) {
        alert('Error creating category: ' + (error as Error).message);
      }
    }
    setIsModalOpen(false);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedCategories.length} categories?`)) return;
    try {
      const response = await fetch('/api/categories/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryIds: selectedCategories,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        if (error.categoriesWithProducts) {
          alert(`Cannot delete categories that contain products:\n${error.categoriesWithProducts.map((cat: any) => `- ${cat.name_en} (${cat.productCount} products)`).join('\n')}`);
        } else {
          throw new Error(error.error || 'Failed to delete categories');
        }
        return;
      }
      
      const data = await response.json();
      const remainingCategories = categoriesData.filter(c => !selectedCategories.includes(c.id));
      setCategoriesData(remainingCategories);
      // Rebuild hierarchy
      const hierarchical = buildHierarchy(remainingCategories.map(c => ({
        ...c,
        name_en: c.name.en,
        name_ar: c.name.ar
      })));
      setHierarchicalCategories(hierarchical);
      setSelectedCategories([]);
      setShowBulkActions(false);
      alert(`Successfully deleted ${data.count} categories`);
    } catch (error) {
      alert('Error deleting categories: ' + (error as Error).message);
    }
  };

  const handleBulkActivate = async () => {
    try {
      const response = await fetch('/api/categories/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryIds: selectedCategories,
          action: 'activate',
        }),
      });
      
      if (!response.ok) throw new Error('Failed to activate categories');
      
      const data = await response.json();
      setCategoriesData(prev => 
        prev.map(c => 
          selectedCategories.includes(c.id) 
            ? { ...c, isActive: true }
            : c
        )
      );
      setSelectedCategories([]);
      setShowBulkActions(false);
      alert(`Successfully activated ${data.count} categories`);
    } catch (error) {
      alert('Error activating categories: ' + (error as Error).message);
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      const response = await fetch('/api/categories/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryIds: selectedCategories,
          action: 'deactivate',
        }),
      });
      
      if (!response.ok) throw new Error('Failed to deactivate categories');
      
      const data = await response.json();
      setCategoriesData(prev => 
        prev.map(c => 
          selectedCategories.includes(c.id) 
            ? { ...c, isActive: false }
            : c
        )
      );
      setSelectedCategories([]);
      setShowBulkActions(false);
      alert(`Successfully deactivated ${data.count} categories`);
    } catch (error) {
      alert('Error deactivating categories: ' + (error as Error).message);
    }
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categoriesData.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categoriesData.map(c => c.id));
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete category');
      const remainingCategories = categoriesData.filter(c => c.id !== categoryId);
      setCategoriesData(remainingCategories);
      // Rebuild hierarchy
      const hierarchical = buildHierarchy(remainingCategories.map(c => ({
        ...c,
        name_en: c.name.en,
        name_ar: c.name.ar
      })));
      setHierarchicalCategories(hierarchical);
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    } catch (error) {
      alert('Error deleting category: ' + (error as Error).message);
    }
  };

  const handleToggleActive = async (categoryId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive,
        }),
      });
      
      if (!response.ok) throw new Error(`Failed to ${isActive ? 'activate' : 'deactivate'} category`);
      
      const data = await response.json();
      const updatedCategory = {
        ...data.category,
        name: { en: data.category.name_en, ar: data.category.name_ar }
      };
      
      setCategoriesData(prev => 
        prev.map(c => 
          c.id === categoryId 
            ? updatedCategory
            : c
        )
      );
      // Rebuild hierarchy
      const allCategories = categoriesData.map(c => 
        c.id === categoryId ? updatedCategory : c
      ).map(c => ({
        ...c,
        name_en: c.name.en,
        name_ar: c.name.ar
      }));
      const hierarchical = buildHierarchy(allCategories);
      setHierarchicalCategories(hierarchical);
      
      // Optional: Show success message
      // alert(`Category ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      alert(`Error ${isActive ? 'activating' : 'deactivating'} category: ` + (error as Error).message);
    }
  };

  const activeCategories = categoriesData.filter(c => c.isActive).length;
  const inactiveCategories = categoriesData.filter(c => !c.isActive).length;

  return (
    <AdminAuthGuard requiredRole={["admin", "manager", "support"]}>
      <AdminLayout>
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-10 text-lg text-gray-500 dark:text-gray-400">Loading categories...</div>
          ) : (
            <>
              <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('admin.categories.title')}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('admin.categories.subtitle')}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {/* View Mode Toggle */}
                  <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('tree')}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                        viewMode === 'tree'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                          : 'text-gray-500 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      🌳 Tree View
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                        viewMode === 'table'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      📋 Table View
                    </button>
                  </div>
                  <Button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700">
                    {t('admin.categories.addCategory')}
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Categories</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{categoriesData.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCategories}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <span className="text-2xl">❌</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Inactive</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{inactiveCategories}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedCategories.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        {selectedCategories.length} categories selected
                      </span>
                      <Button
                        onClick={handleSelectAll}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {selectedCategories.length === categoriesData.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    <div className={`flex space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                      <Button
                        onClick={handleBulkActivate}
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                      >
                        Activate
                      </Button>
                      <Button
                        onClick={handleBulkDeactivate}
                        variant="outline"
                        size="sm"
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        Deactivate
                      </Button>
                      <Button
                        onClick={handleBulkDelete}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional rendering based on view mode */}
              {viewMode === 'table' ? (
                <CategoriesTable
                  categories={categoriesData}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                  onToggleActive={handleToggleActive}
                  selectedCategories={selectedCategories}
                  onSelectCategory={handleSelectCategory}
                  onSelectAll={handleSelectAll}
                />
              ) : (
                <CategoryTreeManager
                  categories={hierarchicalCategories}
                  onEdit={(category) => {
                    // Convert to MultilingualCategory format
                    const multilingualCategory: MultilingualCategory = {
                      id: category.id,
                      name: { en: category.name_en, ar: category.name_ar },
                      slug: category.slug,
                      icon: category.icon,
                      isActive: category.isActive,
                      parentId: category.parentId,
                      sortOrder: category.sortOrder
                    };
                    handleEditCategory(multilingualCategory);
                  }}
                  onDelete={handleDeleteCategory}
                  onToggleActive={handleToggleActive}
                  onMove={async (categoryId, newParentId, newSortOrder) => {
                    try {
                      const response = await fetch(`/api/categories/${categoryId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          parentId: newParentId,
                          sortOrder: newSortOrder
                        })
                      });
                      if (!response.ok) throw new Error('Failed to move category');
                      
                      // Refresh categories
                      const categoriesResponse = await fetch('/api/categories?includeInactive=true');
                      const data = await categoriesResponse.json();
                      const categories = data.categories.map((cat: any) => ({
                        ...cat,
                        name: { en: cat.name_en, ar: cat.name_ar }
                      }));
                      setCategoriesData(categories);
                      const hierarchical = buildHierarchy(data.categories);
                      setHierarchicalCategories(hierarchical);
                    } catch (error) {
                      alert('Error moving category: ' + (error as Error).message);
                    }
                  }}
                  onAddSubcategory={handleAddSubcategory}
                  selectedCategories={selectedCategories}
                  onSelectCategory={handleSelectCategory}
                />
              )}
            </>
          )}
          <MultilingualCategoryModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setParentCategory(null);
            }}
            onSave={handleSaveCategory}
            category={selectedCategory}
            parentCategory={parentCategory ? {
              id: parentCategory.id,
              name: { en: parentCategory.name_en, ar: parentCategory.name_ar },
              slug: parentCategory.slug
            } : undefined}
            allCategories={categoriesData}
          />
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
