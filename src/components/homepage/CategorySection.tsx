'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CategoryWithChildren } from '@/lib/categoryUtils';
import Link from 'next/link';
import Image from 'next/image';

interface CategoryData {
  id: string;
  name: { en: string; ar: string };
  slug: string;
  icon?: string;
  image?: string;
  productCount: number;
  isActive: boolean;
  children?: CategoryData[];
  path?: string;
}

interface CategorySectionProps {
  categories: CategoryData[];
}



export const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
}) => {
  const { t, isRTL, language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);

  // Filter active categories - memoized to prevent re-renders
  const activeCategories = useMemo(() => 
    categories.filter(cat => cat.isActive), 
    [categories]
  );

  // Check if scrolling is needed
  useEffect(() => {
    const checkScrollNeeded = () => {
      if (scrollRef.current) {
        const scrollWidth = scrollRef.current.scrollWidth;
        const clientWidth = scrollRef.current.clientWidth;
        setNeedsScroll(scrollWidth > clientWidth);
      }
    };

    checkScrollNeeded();
    window.addEventListener('resize', checkScrollNeeded);
    
    return () => window.removeEventListener('resize', checkScrollNeeded);
  }, [activeCategories.length]); // Use length instead of the whole array

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  if (activeCategories.length === 0) return null;

  return (
    <section className="bg-white py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {t('homepage.shopByCategory') || 'Shop by Category'}
          </h2>
          <p className="text-gray-600">
            {t('homepage.categoryDescription') || 'Browse our product categories'}
          </p>
        </div>

        {/* Categories Container */}
        <div className={`relative ${needsScroll ? 'group' : ''}`} style={{ overflow: 'visible' }}>
          {/* Left Arrow Button - Only show if scroll is needed */}
          {needsScroll && (
            <button
              onClick={isRTL ? scrollRight : scrollLeft}
              className="absolute text-gray-700 left-0 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/90 hover:bg-white shadow-lg rounded-full border border-gray-200 hover:border-purple-300 transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100 -ml-2"
              aria-label="Scroll left"
            >
              <svg className={`w-5 h-5 text-gray-600 hover:text-purple-600 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Right Arrow Button - Only show if scroll is needed */}
          {needsScroll && (
            <button
              onClick={isRTL ? scrollLeft : scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/90 hover:bg-white shadow-lg rounded-full border border-gray-200 hover:border-purple-300 transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100 -mr-2"
              aria-label="Scroll right"
            >
              <svg className={`w-5 h-5 text-gray-600 hover:text-purple-600 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Categories Container */}
          <div 
            ref={scrollRef}
            className={`flex gap-4 ${
              needsScroll 
                ? 'overflow-x-auto scrollbar-hide px-4 pb-2' 
                : 'justify-center overflow-visible pb-2'
            }`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {activeCategories.map((category) => {
              const categoryPath = category.path || category.slug;
              
              return (
              <div key={category.id} className="relative group">
                <Link
                  href={`/category/${categoryPath}`}
                  className="group flex-shrink-0 bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg w-32 h-40 flex flex-col items-center justify-center relative block"
                >
                {/* Background Gradient Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                
                <div className="relative z-10 text-center flex flex-col items-center justify-center h-full">
                  {/* Category Icon/Image */}
                  <div className="mb-3 flex items-center justify-center h-12">
                    {category.image ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                        <Image
                          src={category.image}
                          alt={category.name[language]}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 text-2xl group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                        {category.icon}
                      </div>
                    )}
                  </div>

                  {/* Category Name */}
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-300 mb-1 line-clamp-2 leading-tight text-center">
                    {category.name[language]}
                  </h3>
                </div>
              </Link>
              </div>
            );})}
          </div>
          
          {/* Fade effect on edges - Only show if scroll is needed */}
          {needsScroll && (
            <>
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
            </>
          )}
        </div>
      </div>

      {/* Hide scrollbar CSS */}
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

