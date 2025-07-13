'use client';

import React, { useState } from 'react';
import { products, categories } from '@/data/products';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Product } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';

interface CategoryPageClientProps {
  slug: string;
}

export default function CategoryPageClient({ slug }: CategoryPageClientProps) {
  const { t, isRTL } = useLanguage();
  const { dispatch } = useCart();
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'name' | 'rating'>('name');

  // Find the category
  const category = categories.find(cat => cat.slug === slug);
  
  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`text-center ${isRTL ? 'rtl' : 'ltr'}`}>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('category.notFound')}
          </h1>
          <p className="text-gray-600">
            {t('category.notFoundDescription')}
          </p>
        </div>
      </div>
    );
  }

  // Filter products by category
  const categoryProducts = products.filter(product => {
    const categoryName = typeof category.name === 'string' ? category.name : category.name.en;
    return product.category.toLowerCase() === categoryName.toLowerCase();
  });

  // Sort products
  const sortedProducts = [...categoryProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const handleAddToCart = (product: Product, selectedAttributes?: { [attributeId: string]: string }) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, selectedAttributes } });
  };

  const handleViewProduct = (product: Product) => {
    // Navigation is handled by the Link component in ProductCard
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={`${isRTL ? 'rtl' : 'ltr'}`}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {typeof category.name === 'string' ? category.name : category.name.en}
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
        products={sortedProducts}
        title=""
        subtitle=""
        onAddToCart={handleAddToCart}
        onViewProduct={handleViewProduct}
      />
    </div>
  );
}
