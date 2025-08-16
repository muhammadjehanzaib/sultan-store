'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { CategoryWithChildren } from '@/lib/categoryUtils';

interface CategoryTreeProps {
  categories: CategoryWithChildren[];
  maxLevel?: number;
  showProductCount?: boolean;
  onCategorySelect?: (category: CategoryWithChildren) => void;
  className?: string;
}

interface CategoryNodeProps {
  category: CategoryWithChildren;
  level: number;
  maxLevel: number;
  showProductCount: boolean;
  onCategorySelect?: (category: CategoryWithChildren) => void;
}

const CategoryNode: React.FC<CategoryNodeProps> = ({
  category,
  level,
  maxLevel,
  showProductCount,
  onCategorySelect
}) => {
  const { language, isRTL } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(level === 0); // Expand root categories by default
  
  const hasChildren = category.children && category.children.length > 0;
  const showChildren = hasChildren && isExpanded && level < maxLevel;
  const categoryName = language === 'ar' ? category.name_ar : category.name_en;
  const categoryPath = category.path || category.slug;
  
  const handleClick = () => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  const toggleExpanded = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full">
      <div className={`flex items-center py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 ${
        level === 0 ? 'font-semibold text-gray-900' : 'text-gray-700'
      }`}>
        
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={toggleExpanded}
            className={`flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors ${
              isRTL ? 'ml-2' : 'mr-2'
            }`}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`w-3 h-3 transform transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : (isRTL ? 'rotate-180' : '')
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Spacer for alignment when no children */}
        {!hasChildren && <div className={`w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />}
        
        {/* Category Icon */}
        {category.icon && (
          <span className={`text-lg ${isRTL ? 'ml-3' : 'mr-3'}`}>
            {category.icon}
          </span>
        )}
        
        {/* Category Link */}
        <Link
          href={`/category/${categoryPath}`}
          onClick={handleClick}
          className="flex-1 hover:text-purple-600 transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="truncate">{categoryName}</span>
            {showProductCount && category.productCount !== undefined && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {category.productCount}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Children */}
      {showChildren && (
        <div className={`${isRTL ? 'mr-6' : 'ml-6'} border-l-2 border-gray-100 ${isRTL ? 'border-r-2 border-l-0' : ''}`}>
          {category.children!.map(child => (
            <CategoryNode
              key={child.id}
              category={child}
              level={level + 1}
              maxLevel={maxLevel}
              showProductCount={showProductCount}
              onCategorySelect={onCategorySelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  maxLevel = 3,
  showProductCount = true,
  onCategorySelect,
  className = ''
}) => {
  if (!categories.length) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        No categories available
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {categories.map(category => (
        <CategoryNode
          key={category.id}
          category={category}
          level={0}
          maxLevel={maxLevel}
          showProductCount={showProductCount}
          onCategorySelect={onCategorySelect}
        />
      ))}
    </div>
  );
};
