'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { CategoryWithChildren } from '@/lib/categoryUtils';
import { IoChevronDown, IoChevronForward, IoSearch, IoClose } from 'react-icons/io5';

interface CategoryMegaMenuProps {
  categories: CategoryWithChildren[];
  className?: string;
}

interface ExpandedState {
  [categoryId: string]: boolean;
}

export const CategoryMegaMenu: React.FC<CategoryMegaMenuProps> = ({ 
  categories, 
  className = '' 
}) => {
  const { language, isRTL, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryWithChildren | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<ExpandedState>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree');

  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    if (viewMode === 'grid') {
      setActiveCategory(category);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleCategoryClick = (category: CategoryWithChildren) => {
    if (category.children && category.children.length > 0) {
      toggleCategory(category.id);
    }
    setActiveCategory(category);
  };

  const filterCategories = (categories: CategoryWithChildren[], searchTerm: string): CategoryWithChildren[] => {
    if (!searchTerm.trim()) return categories;
    
    const filtered: CategoryWithChildren[] = [];
    
    const searchRecursive = (cats: CategoryWithChildren[]): CategoryWithChildren[] => {
      const results: CategoryWithChildren[] = [];
      
      for (const cat of cats) {
        const nameEn = cat.name_en?.toLowerCase() || '';
        const nameAr = cat.name_ar?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        
        const matches = nameEn.includes(search) || nameAr.includes(search);
        const childMatches = cat.children ? searchRecursive(cat.children) : [];
        
        if (matches || childMatches.length > 0) {
          results.push({
            ...cat,
            children: childMatches.length > 0 ? childMatches : cat.children
          });
        }
      }
      
      return results;
    };
    
    return searchRecursive(categories);
  };

  // Memoize filtered categories to prevent infinite re-renders
  const filteredCategories = useMemo(() => {
    return filterCategories(categories, searchTerm);
  }, [categories, searchTerm]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveCategory(null);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-expand categories when searching
  useEffect(() => {
    if (searchTerm.trim()) {
      const expandAll = (cats: CategoryWithChildren[]) => {
        const newExpanded: ExpandedState = {};
        const expand = (categories: CategoryWithChildren[]) => {
          categories.forEach(cat => {
            if (cat.children && cat.children.length > 0) {
              newExpanded[cat.id] = true;
              expand(cat.children);
            }
          });
        };
        expand(cats);
        return newExpanded;
      };
      setExpandedCategories(expandAll(filteredCategories));
    } else {
      // Reset expanded categories when search is cleared
      setExpandedCategories({});
    }
  }, [searchTerm]); // Remove filteredCategories from deps since it's now memoized

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

      {/* Enhanced Mega Menu Dropdown */}
      {isOpen && (
        <div className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} w-screen max-w-5xl lg:max-w-5xl md:max-w-4xl sm:max-w-full bg-white shadow-xl border border-gray-200 rounded-lg mt-1 z-50`}>
          {/* Header with controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-900">Browse Categories</h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    viewMode === 'tree' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tree View
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid View
                </button>
              </div>
              
              {/* Search Input */}
              <div className="relative flex-1 sm:flex-none">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search categories..."
                  className="pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <IoClose className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row" style={{ minHeight: '300px', maxHeight: '500px' }}>
            {viewMode === 'tree' ? (
              /* Tree View */
              <div className="w-full">
                <div className="flex flex-col lg:flex-row">
                  {/* Category Tree */}
                  <div className="w-full lg:w-2/3 lg:border-r border-gray-200 overflow-y-auto" style={{ maxHeight: '468px' }}>
                    <div className="p-4">
                      {filteredCategories.length > 0 ? (
                        <CategoryTreeRenderer 
                          categories={filteredCategories}
                          expandedCategories={expandedCategories}
                          onToggleCategory={toggleCategory}
                          onCategoryClick={handleCategoryClick}
                          activeCategory={activeCategory}
                          language={language}
                          isRTL={isRTL}
                          level={0}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No categories found matching "{searchTerm}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category Details */}
                  <div className="w-full lg:w-1/3 border-t lg:border-t-0 border-gray-200 overflow-y-auto" style={{ maxHeight: '468px' }}>
                    <div className="p-4">
                      {activeCategory ? (
                        <CategoryDetails 
                          category={activeCategory}
                          language={language}
                          isRTL={isRTL}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-3">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Category</h3>
                          <p className="text-sm text-gray-600">Click on a category in the tree to see its details and subcategories.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Grid View (Original) */
              <>
                {/* Main Categories List */}
                <div className="w-full lg:w-1/3 bg-gray-50">
                  <div className="p-4 overflow-y-auto" style={{ maxHeight: '468px' }}>
                    <ul className="space-y-1">
                      {filteredCategories.map(category => {
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
                                <IoChevronForward className={`w-3 h-3 text-gray-400 ${isRTL ? 'mr-auto' : 'ml-auto'}`} />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

            {/* Subcategories Display */}
            <div className="flex-1 p-6 border-t lg:border-t-0 lg:border-l border-gray-200">
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
          </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// CategoryTreeRenderer Component
interface CategoryTreeRendererProps {
  categories: CategoryWithChildren[];
  expandedCategories: ExpandedState;
  onToggleCategory: (categoryId: string) => void;
  onCategoryClick: (category: CategoryWithChildren) => void;
  activeCategory: CategoryWithChildren | null;
  language: string;
  isRTL: boolean;
  level: number;
}

const CategoryTreeRenderer: React.FC<CategoryTreeRendererProps> = ({
  categories,
  expandedCategories,
  onToggleCategory,
  onCategoryClick,
  activeCategory,
  language,
  isRTL,
  level
}) => {
  return (
    <ul className={`space-y-1 ${level > 0 ? (isRTL ? 'mr-4' : 'ml-4') : ''}`}>
      {categories.map(category => {
        const categoryName = language === 'ar' ? category.name_ar : category.name_en;
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedCategories[category.id];
        const isActive = activeCategory?.id === category.id;
        
        return (
          <li key={category.id}>
            <div className="flex items-center">
              {/* Expand/Collapse Button */}
              {hasChildren ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCategory(category.id);
                  }}
                  className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors mr-1"
                >
                  {isExpanded ? (
                    <IoChevronDown className="w-3 h-3 text-gray-500" />
                  ) : (
                    <IoChevronForward className="w-3 h-3 text-gray-500" />
                  )}
                </button>
              ) : (
                <div className="w-5 flex-shrink-0" />
              )}
              
              {/* Category Item */}
              <button
                onClick={() => onCategoryClick(category)}
                className={`flex-1 flex items-center px-2 py-1.5 text-sm rounded-md transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
                }`}
              >
                {/* Category Icon */}
                {category.icon && (
                  <span className={`flex-shrink-0 ${isRTL ? 'ml-2' : 'mr-2'}`}>
                    {category.icon}
                  </span>
                )}
                
                {/* Category Name */}
                <span className="flex-1 truncate">{categoryName}</span>
                
                {/* Product Count */}
                {category.productCount !== undefined && category.productCount > 0 && (
                  <span className="flex-shrink-0 text-xs text-gray-400 ml-2">
                    {category.productCount}
                  </span>
                )}
                
                {/* Link Icon */}
                <Link
                  href={`/category/${category.path || category.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-purple-600 rounded transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </button>
            </div>
            
            {/* Children */}
            {hasChildren && isExpanded && (
              <div className="mt-1">
                <CategoryTreeRenderer
                  categories={category.children || []}
                  expandedCategories={expandedCategories}
                  onToggleCategory={onToggleCategory}
                  onCategoryClick={onCategoryClick}
                  activeCategory={activeCategory}
                  language={language}
                  isRTL={isRTL}
                  level={level + 1}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

// CategoryDetails Component
interface CategoryDetailsProps {
  category: CategoryWithChildren;
  language: string;
  isRTL: boolean;
}

const CategoryDetails: React.FC<CategoryDetailsProps> = ({ category, language, isRTL }) => {
  const categoryName = language === 'ar' ? category.name_ar : category.name_en;
  const categoryDescription = language === 'ar' ? category.description_ar : category.description_en;
  
  return (
    <div>
      {/* Category Header */}
      <div className="mb-4">
        <Link
          href={`/category/${category.path || category.slug}`}
          className="inline-flex items-center group"
        >
          {category.icon && (
            <span className="text-2xl mr-3">{category.icon}</span>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
              {categoryName}
            </h2>
            {category.productCount !== undefined && (
              <p className="text-sm text-gray-500 mt-1">
                {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
              </p>
            )}
          </div>
        </Link>
        
        {categoryDescription && (
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            {categoryDescription}
          </p>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="mb-6">
        <Link
          href={`/category/${category.path || category.slug}`}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          View All Products
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
      
      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Subcategories</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {category.children.map(subcategory => {
              const subcategoryName = language === 'ar' ? subcategory.name_ar : subcategory.name_en;
              
              return (
                <Link
                  key={subcategory.id}
                  href={`/category/${subcategory.path || subcategory.slug}`}
                  className="flex items-center p-2 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
                >
                  {subcategory.icon && (
                    <span className="text-lg mr-3 flex-shrink-0">{subcategory.icon}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                      {subcategoryName}
                    </p>
                    {subcategory.productCount !== undefined && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {subcategory.productCount} items
                      </p>
                    )}
                  </div>
                  
                  <IoChevronForward className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
