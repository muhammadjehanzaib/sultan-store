'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CategoriesTable } from '@/components/admin/CategoriesTable';
import { MultilingualCategoryModal } from '@/components/admin/MultilingualCategoryModal';
import { Button } from '@/components/ui/Button';
import { Category, MultilingualCategory } from '@/types';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

export default function AdminCategories() {
  const { t, isRTL } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MultilingualCategory | null>(null);
  const [categoriesData, setCategoriesData] = useState<MultilingualCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const response = await fetch('/api/catrgories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        // Transform each category to have name: { en, ar }
        const categories = data.categories.map((cat: any) => ({
          ...cat,
          name: { en: cat.name_en, ar: cat.name_ar }
        }));
        setCategoriesData(categories);
      } catch (error) {
        alert('Error loading categories: ' + (error as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: MultilingualCategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (category: MultilingualCategory) => {
    if (selectedCategory) {
      // Edit existing category via API
      try {
        const response = await fetch(`/api/catrgories/${category.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name_en: category.name.en,
            name_ar: category.name.ar,
            slug: category.slug,
            icon: category.icon,
            // Add other fields if needed
          })
        });
        if (!response.ok) throw new Error('Failed to update category');
        const data = await response.json();
        const updatedCategory = {
          ...data.category,
          name: { en: data.category.name_en, ar: data.category.name_ar }
        };
        setCategoriesData(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
      } catch (error) {
        alert('Error updating category: ' + (error as Error).message);
      }
    } else {
      // Add new category via API
      try {
        const response = await fetch('/api/catrgories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name_en: category.name.en,
            name_ar: category.name.ar,
            slug: category.slug,
            icon: category.icon,
            // Add other fields if needed
          })
        });
        if (!response.ok) throw new Error('Failed to create category');
        const data = await response.json();
        const newCategory = {
          ...data.category,
          name: { en: data.category.name_en, ar: data.category.name_ar }
        };
        setCategoriesData(prev => [...prev, newCategory]);
      } catch (error) {
        alert('Error creating category: ' + (error as Error).message);
      }
    }
    setIsModalOpen(false);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedCategories.length} categories?`)) {
      setCategoriesData(prev => prev.filter(c => !selectedCategories.includes(c.id)));
      setSelectedCategories([]);
      setShowBulkActions(false);
    }
  };

  const handleBulkActivate = () => {
    setCategoriesData(prev => 
      prev.map(c => 
        selectedCategories.includes(c.id) 
          ? { ...c, isActive: true }
          : c
      )
    );
    setSelectedCategories([]);
    setShowBulkActions(false);
  };

  const handleBulkDeactivate = () => {
    setCategoriesData(prev => 
      prev.map(c => 
        selectedCategories.includes(c.id) 
          ? { ...c, isActive: false }
          : c
      )
    );
    setSelectedCategories([]);
    setShowBulkActions(false);
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
      const response = await fetch(`/api/catrgories/${categoryId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete category');
      setCategoriesData(prev => prev.filter(c => c.id !== categoryId));
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    } catch (error) {
      alert('Error deleting category: ' + (error as Error).message);
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
                <Button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700">
                  {t('admin.categories.addCategory')}
                </Button>
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

              <CategoriesTable
                categories={categoriesData}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                selectedCategories={selectedCategories}
                onSelectCategory={handleSelectCategory}
                onSelectAll={handleSelectAll}
              />
            </>
          )}
          <MultilingualCategoryModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveCategory}
            category={selectedCategory}
          />
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
