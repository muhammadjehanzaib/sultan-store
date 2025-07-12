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
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  title,
  subtitle,
  onAddToCart,
  onViewProduct,
}) => {
  const { t, isRTL } = useLanguage();
  
  const displayTitle = title || t('products.featured');
  const displaySubtitle = subtitle || t('products.viewAll');
  
  if (products.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`text-center ${isRTL ? 'rtl' : 'ltr'}`}>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{displayTitle}</h2>
          <p className="text-gray-600 mb-8">{displaySubtitle}</p>
          <div className="text-gray-500">{t('products.noProducts')}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className={`text-center mb-12 ${isRTL ? 'rtl' : 'ltr'}`}>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{displayTitle}</h2>
        <p className="text-gray-600">{displaySubtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onViewProduct={onViewProduct}
          />
        ))}
      </div>
    </section>
  );
};
