'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { CategoryWithChildren } from '@/lib/categoryUtils';

interface CategoryMegaMenuProps {
  categories: CategoryWithChildren[];
  className?: string;
}

export const CategoryMegaMenu: React.FC<CategoryMegaMenuProps> = ({ 
  categories, 
  className = '' 
}) => {
  const { language, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryWithChildren | null>(null);

  // Debug log to see what categories data we receive
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveCategory(null);
    }, 200);
  };

  const handleCategoryHover = (category: CategoryWithChildren) => {
    setActiveCategory(category);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!categories.length) return null;

  return (
    <div 
      className={`relative ${className}`}
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        className={`w-[140px] px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300 ease-in-out flex items-center justify-between whitespace-nowrap font-medium shadow-sm hover:shadow-md rounded-l-lg ${isRTL ? 'space-x-reverse' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
          <span>Categories</span>
        </div>
        <svg 
          className={`w-4 h-4 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          } flex-shrink-0`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} w-screen max-w-4xl bg-white shadow-lg border border-gray-200 rounded-lg mt-1 z-50`}>
          <div className="flex">
            
            {/* Main Categories List */}
            <div className="w-1/3 bg-gray-50 rounded-l-lg">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">All Categories</h3>
                <ul className="space-y-1">
                  {categories.map(category => {
                    const categoryName = language === 'ar' ? category.name_ar : category.name_en;
                    const isActive = activeCategory?.id === category.id;
                    
                    return (
                      <li key={category.id}>
                        <Link
                          href={`/category/${category.path || category.slug}`}
                          className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                            isActive 
                              ? 'bg-purple-50 text-purple-600 font-medium' 
                              : 'text-gray-700 hover:bg-white hover:text-purple-600'
                          }`}
                          onMouseEnter={() => handleCategoryHover(category)}
                        >
                          {category.icon && (
                            <span className={`${isRTL ? 'ml-2' : 'mr-2'}`}>
                              {category.icon}
                            </span>
                          )}
                          {categoryName}
                          {category.children && category.children.length > 0 && (
                            <svg 
                              className={`w-3 h-3 text-gray-400 ${isRTL ? 'mr-auto' : 'ml-auto'}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Subcategories Display */}
            <div className="flex-1 p-6">
              {activeCategory ? (
                <div>
                  {/* Active Category Header */}
                  <div className="mb-6">
                    <Link 
                      href={`/category/${activeCategory.path || activeCategory.slug}`}
                      className="inline-flex items-center text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                    >
                      {activeCategory.icon && (
                        <span className={`text-xl ${isRTL ? 'ml-2' : 'mr-2'}`}>
                          {activeCategory.icon}
                        </span>
                      )}
                      {language === 'ar' ? activeCategory.name_ar : activeCategory.name_en}
                    </Link>
                    {activeCategory.description_en && (
                      <p className="text-sm text-gray-600 mt-1">
                        {language === 'ar' ? activeCategory.description_ar : activeCategory.description_en}
                      </p>
                    )}
                  </div>

                  {/* Subcategories Grid */}
                  {activeCategory.children && activeCategory.children.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {activeCategory.children.slice(0, 8).map(subcategory => {
                        const subcategoryName = language === 'ar' ? subcategory.name_ar : subcategory.name_en;
                        
                        return (
                          <div key={subcategory.id}>
                            <Link
                              href={`/category/${subcategory.path || subcategory.slug}`}
                              className="block group"
                            >
                              <div className="flex items-center p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all duration-200">
                                {subcategory.icon && (
                                  <span className={`text-lg ${isRTL ? 'ml-3' : 'mr-3'}`}>
                                    {subcategory.icon}
                                  </span>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                                    {subcategoryName}
                                  </h4>
                                  {subcategory.productCount !== undefined && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {subcategory.productCount} items
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Link>
                            
                            {/* Sub-subcategories and deeper levels */}
                            {subcategory.children && subcategory.children.length > 0 && (
                              <div className={`${isRTL ? 'mr-6' : 'ml-6'} mt-2 space-y-1`}>
                                {subcategory.children.slice(0, 6).map(subSubcategory => (
                                  <div key={subSubcategory.id}>
                                    <Link
                                      href={`/category/${subSubcategory.path || subSubcategory.slug}`}
                                      className="block text-xs text-gray-600 hover:text-purple-600 transition-colors py-1 font-medium"
                                    >
                                      {language === 'ar' ? subSubcategory.name_ar : subSubcategory.name_en}
                                    </Link>
                                    {/* Level 4 categories */}
                                    {subSubcategory.children && subSubcategory.children.length > 0 && (
                                      <div className={`${isRTL ? 'mr-4' : 'ml-4'} mt-1 space-y-0.5`}>
                                        {subSubcategory.children.slice(0, 3).map(level4Category => (
                                          <Link
                                            key={level4Category.id}
                                            href={`/category/${level4Category.path || level4Category.slug}`}
                                            className="block text-xs text-gray-500 hover:text-purple-500 transition-colors py-0.5"
                                          >
                                            • {language === 'ar' ? level4Category.name_ar : level4Category.name_en}
                                          </Link>
                                        ))}
                                        {/* Show more indicator for deeper levels */}
                                        {subSubcategory.children.length > 3 && (
                                          <Link
                                            href={`/category/${subSubcategory.path || subSubcategory.slug}`}
                                            className="block text-xs text-purple-600 hover:text-purple-700 transition-colors py-0.5 italic"
                                          >
                                            +{subSubcategory.children.length - 3} more...
                                          </Link>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No subcategories available</p>
                  )}

                  {/* View All Link */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link
                      href={`/category/${activeCategory.path || activeCategory.slug}`}
                      className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      View All {language === 'ar' ? activeCategory.name_ar : activeCategory.name_en}
                      <svg 
                        className={`w-3 h-3 ${isRTL ? 'mr-1' : 'ml-1'}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Browse Categories</h3>
                  <p className="text-sm text-gray-600">
                    Hover over a category to see subcategories and featured products
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
