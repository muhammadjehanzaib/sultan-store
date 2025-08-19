'use client';

import React from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  onAddToCart?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
  viewMode?: 'grid' | 'list';
  showHeader?: boolean;
  showViewAllButton?: boolean;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  title,
  subtitle,
  onAddToCart,
  onViewProduct,
  viewMode = 'grid',
  showHeader = true,
  showViewAllButton = true,
  className = '',
}) => {
  const { t, isRTL } = useLanguage();
  
  const displayTitle = title || t('products.featured');
  const displaySubtitle = subtitle || t('products.viewAll');
  
  if (products.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        {showHeader && (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{displayTitle}</h2>
            <p className="text-gray-600 mb-8">{displaySubtitle}</p>
          </>
        )}
        <div className="text-gray-500">{t('products.noProducts')}</div>
      </div>
    );
  }

  // For category pages or when showHeader is false, use a simpler layout
  if (!showHeader) {
    return (
      <div className={className}>
        {/* Products Grid/List */}
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onViewProduct={onViewProduct}
              viewMode={viewMode}
            />
          ))}
        </div>
      </div>
    );
  }

  // Default homepage layout
  return (
    <section id="featured-products" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 ${isRTL ? 'rtl' : 'ltr'}`}>
          <div className="inline-block">
            <h2 className={`text-4xl md:text-5xl font-bold text-gray-900 relative leading-tight ${isRTL ? 'mb-8' : 'mb-6'}`}>
              {displayTitle}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-gray-800 to-gray-600 rounded-full"></div>
            </h2>
          </div>
          <p className={`text-lg text-gray-600 max-w-2xl mx-auto ${isRTL ? 'mt-6' : 'mt-4'}`}>{displaySubtitle}</p>
        </div>

        {/* Products Grid/List */}
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" 
          : "space-y-4"
        }>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onViewProduct={onViewProduct}
              viewMode={viewMode}
            />
          ))}
        </div>
        
        {/* View All Products Button */}
        {showViewAllButton && (
          <div className="text-center mt-16">
            <button className="inline-flex items-center px-8 py-4 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              {t('products.viewAll')}
              <svg className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
