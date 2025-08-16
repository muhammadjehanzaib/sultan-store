'use client';

import React, { useState, useEffect } from 'react';
import { CategoryTree, Breadcrumbs } from '@/components';
import { useLanguage } from '@/contexts/LanguageContext';
import { CategoryWithChildren } from '@/lib/categoryUtils';

export default function CategoriesPage() {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const response = await fetch('/api/categories/tree');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        setCategories(data.tree || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', isActive: true }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs items={breadcrumbItems} className="mb-8" />
          <div className="text-center py-16">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Failed to Load Categories</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} className="mb-8" />
        
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            All Categories
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Browse our complete catalog organized by categories. Click on any category to explore products or expand to see subcategories.
          </p>
        </div>

        {/* Categories Content */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {categories.map((category, index) => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    {category.icon && (
                      <span className="text-2xl mr-3">{category.icon}</span>
                    )}
                    <h2 className="text-xl font-semibold text-gray-900">
                      {language === 'ar' ? category.name_ar : category.name_en}
                    </h2>
                  </div>
                  {category.description_en && (
                    <p className="text-sm text-gray-600">
                      {language === 'ar' ? category.description_ar : category.description_en}
                    </p>
                  )}
                </div>
                
                <CategoryTree
                  categories={[category]}
                  maxLevel={3}
                  showProductCount={true}
                  className="max-h-96 overflow-y-auto"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Categories Found</h2>
            <p className="text-gray-600">
              It looks like there are no categories available at the moment.
            </p>
          </div>
        )}

        {/* Statistics */}
        {categories.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600">Main Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {categories.reduce((total, cat) => 
                    total + (cat.children ? cat.children.length : 0), 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Subcategories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {categories.reduce((total, cat) => 
                    total + (cat.productCount || 0) + 
                    (cat.children ? cat.children.reduce((subTotal, subCat) => 
                      subTotal + (subCat.productCount || 0), 0
                    ) : 0), 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
