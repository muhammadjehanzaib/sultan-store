'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CategoriesTable } from '@/components/admin/CategoriesTable';
import { MultilingualCategoryModal } from '@/components/admin/MultilingualCategoryModal';
import { Button } from '@/components/ui/Button';
import { categories } from '@/data/products';
import { Category, MultilingualCategory } from '@/types';

export default function AdminCategories() {
  const { t, isRTL } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MultilingualCategory | null>(null);
  const [categoriesData, setCategoriesData] = useState<MultilingualCategory[]>(categories);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: MultilingualCategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategoriesData(prev => prev.filter(c => c.id !== categoryId));
  };

  const handleSaveCategory = (category: MultilingualCategory) => {
    if (selectedCategory) {
      // Edit existing category
      setCategoriesData(prev => 
        prev.map(c => c.id === category.id ? category : c)
      );
    } else {
      // Add new category
      setCategoriesData(prev => [...prev, category]);
    }
    setIsModalOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
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

        <CategoriesTable
          categories={categoriesData}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
        />
        <MultilingualCategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCategory}
          category={selectedCategory}
        />
      </div>
    </AdminLayout>
  );
}
