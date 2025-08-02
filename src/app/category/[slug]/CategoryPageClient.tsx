'use client';

import React, { useState, useEffect } from 'react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Product } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { getLocalizedString, ensureLocalizedContent } from '@/lib/multilingualUtils';

interface CategoryPageClientProps {
  slug: string;
  products: Product[];
}

export default function CategoryPageClient({ slug, products }: CategoryPageClientProps) {
  const { t, isRTL, language } = useLanguage();
  const { dispatch } = useCart();
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'name' | 'rating'>('name');
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    async function fetchCategories() {
      setCategoriesLoading(true);
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // Find the category by slug
  const category = categories.find(cat => cat.slug === slug);
  
  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`text-center ${isRTL ? 'rtl' : 'ltr'}`}>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {categoriesLoading ? 'Loading...' : t('category.notFound')}
          </h1>
          <p className="text-gray-600">
            {categoriesLoading ? 'Loading categories...' : t('category.notFoundDescription')}
          </p>
        </div>
      </div>
    );
  }

  // Filter products by category
  const categoryProducts = products.filter(product => {
    if (product.category && typeof product.category === 'object' && 'slug' in product.category) {
      return product.category.slug === slug;
    }
    return product.categoryId === category?.id;
  });

  // Sort products
  const sortedProducts = [...categoryProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name': {
        const getName = (p: Product) =>
          p.name_en && p.name_ar
            ? language === 'ar' ? p.name_ar : p.name_en
            : getLocalizedString(ensureLocalizedContent(p.name), language);

        return getName(a).localeCompare(getName(b));
      }
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  // ✅ Normalize names/descriptions for ProductGrid
  const normalizedProducts = sortedProducts.map(product => ({
    ...product,
    name: {
      en: product.name_en || '',
      ar: product.name_ar || '',
    },
    description: {
      en: product.description_en || '',
      ar: product.description_ar || '',
    },
  }));

  const handleAddToCart = (product: Product, selectedAttributes?: { [attributeId: string]: string }) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, selectedAttributes } });
  };

  const handleViewProduct = (product: Product) => {
    // No-op: handled via Link
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={`${isRTL ? 'rtl' : 'ltr'}`}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'ar' ? category.name_ar : category.name_en}
            </h1>
            <p className="text-gray-600 mb-4">
              {t('category.productsCount').replace('{{count}}', categoryProducts.length.toString())}
            </p>

            {/* Sort Controls */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                {t('category.sortBy')}:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-gray-700 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="name">{t('category.sortByName')}</option>
                <option value="price-low">{t('category.sortByPriceLow')}</option>
                <option value="price-high">{t('category.sortByPriceHigh')}</option>
                <option value="rating">{t('category.sortByRating')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <ProductGrid
        products={normalizedProducts}
        title=""
        subtitle=""
        onAddToCart={handleAddToCart}
        onViewProduct={handleViewProduct}
      />
    </div>
  );
}
