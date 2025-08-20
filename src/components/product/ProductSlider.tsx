'use client';

import React, { useRef, useState } from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductSliderProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  onAddToCart?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
  onViewAllItems?: () => void;
  showHeader?: boolean;
  showErrorButton?: boolean;
  showViewAllButton?: boolean;
  className?: string;
}

export const ProductSlider: React.FC<ProductSliderProps> = ({
  products,
  title,
  subtitle,
  onAddToCart,
  onViewProduct,
  onViewAllItems,
  showHeader = true,
  showErrorButton = false,
  showViewAllButton = true,
  className = '',
}) => {
  const { t, isRTL } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  const displayTitle = title || t('products.featured');
  const displaySubtitle = subtitle || t('products.viewAll');

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };


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

  return (
    <section className={`bg-white py-12 ${className}`}>
        <div className="max-w-7xl rounded-xl bg-gray-50 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Header */}
        {showHeader && (
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 leading-tight ${isRTL ? 'mb-7' : 'mb-2'}`}>
                {displayTitle}
              </h2>
              <p className={`text-gray-600 ${isRTL ? 'mt-3' : 'mt-2'}`}>{displaySubtitle}</p>
            </div>
            
            {/* Action Buttons */}
            <div className={`flex gap-3 items-center ${isRTL ? 'sm:flex-row-reverse' : ''} justify-start sm:justify-end`}>
              {/* View All Items Button */}
              {showViewAllButton && (
                <button
                  onClick={onViewAllItems}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium inline-flex items-center"
                >
                  <svg className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  {t('products.viewAll')}
                </button>
              )}
              
            </div>
          </div>
        )}

        {/* Products Slider */}
        <div className="relative">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all duration-200"
              style={{ marginLeft: '-20px' }}
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all duration-200"
              style={{ marginRight: '-20px' }}
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Products Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-2"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-72">
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onViewProduct={onViewProduct}
                  viewMode="grid"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Count Info - Only show if we have products */}
        {products.length > 0 ? (
          <div className={`text-center mt-6 text-sm text-gray-500 ${isRTL ? 'rtl' : 'ltr'}`}>
            {t('search.showing')} {products.length} {products.length === 1 ? t('common.product') : t('common.products')}
          </div>
        ) : null}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};
