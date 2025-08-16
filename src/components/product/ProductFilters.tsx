'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Price from '@/components/ui/Price';

interface CategoryWithChildren {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  path?: string;
  parentId?: string;
  children?: CategoryWithChildren[];
}

interface FilterState {
  category: string;
  subcategory: string;
  subsubcategory: string; // Level 3 category
  priceRange: [number, number];
  inStock: boolean | null;
  rating: number | null;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: CategoryWithChildren[];
  minPrice: number;
  maxPrice: number;
  onClearFilters: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  minPrice,
  maxPrice,
  onClearFilters,
}) => {
  const { t, language } = useLanguage();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Get main categories (those without parentId)
  const mainCategories = categories.filter(cat => !cat.parentId);

  // Get subcategories for the selected main category
  const selectedMainCategory = mainCategories.find(cat => {
    const categoryName = language === 'ar' ? cat.name_ar : cat.name_en;
    return categoryName === filters.category;
  });

  const subcategories = selectedMainCategory?.children || [];

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const updatePriceRange = (min: number, max: number) => {
    updateFilters({ priceRange: [min, max] });
  };

  const toggleCategoryExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryChange = (categoryName: string) => {
    updateFilters({ 
      category: categoryName, 
      subcategory: '' // Clear subcategory when main category changes
    });
  };

  // Auto-expand the selected category
  useEffect(() => {
    if (selectedMainCategory && !expandedCategories.has(selectedMainCategory.id)) {
      setExpandedCategories(prev => new Set(prev).add(selectedMainCategory.id));
    }
  }, [selectedMainCategory, expandedCategories]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{t('search.filters')}</h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          {t('search.clearAll')}
        </button>
      </div>

      {/* Hierarchical Category Filter */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">{t('search.category')}</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {/* All Categories Option */}
          <label className="flex items-center">
            <input
              type="radio"
              name="category"
              value=""
              checked={filters.category === ''}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="text-purple-600 focus:ring-purple-500"
            />
            <span className="ml-2 text-sm text-gray-700 font-medium">{t('search.allCategories')}</span>
          </label>

          {/* Main Categories */}
          {mainCategories.map(category => {
            const categoryName = language === 'ar' ? category.name_ar : category.name_en;
            const isSelected = filters.category === categoryName;
            const hasChildren = category.children && category.children.length > 0;
            const isExpanded = expandedCategories.has(category.id);

            return (
              <div key={category.id} className="space-y-1">
                {/* Main Category */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center flex-1">
                    <input
                      type="radio"
                      name="category"
                      value={categoryName}
                      checked={isSelected}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className={`ml-2 text-sm ${isSelected ? 'text-purple-600 font-medium' : 'text-gray-600'}`}>
                      {categoryName}
                    </span>
                  </label>
                  
                  {/* Expand/Collapse Button */}
                  {hasChildren && (
                    <button
                      onClick={() => toggleCategoryExpanded(category.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Recursive function to render category levels */}
                {hasChildren && (isExpanded || isSelected) && (
                  <div className="ml-6 space-y-1 border-l-2 border-gray-100 pl-3">
                    {category.children?.map(subcategory => {
                      const subcategoryName = language === 'ar' ? subcategory.name_ar : subcategory.name_en;
                      const isSubSelected = filters.subcategory === subcategoryName;
                      const hasSubChildren = subcategory.children && subcategory.children.length > 0;
                      
                      return (
                        <div key={subcategory.id} className="space-y-1">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="subcategory"
                              value={subcategoryName}
                              checked={isSubSelected}
                              onChange={(e) => {
                                updateFilters({ subcategory: e.target.value });
                              }}
                              className="text-purple-600 focus:ring-purple-500"
                              disabled={!isSelected} // Only enable if parent category is selected
                            />
                            <span className={`ml-2 text-sm ${
                              isSubSelected ? 'text-purple-600 font-medium' : 
                              !isSelected ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {subcategoryName}
                            </span>
                          </label>
                          
                          {/* Level 3 categories */}
                          {hasSubChildren && isSubSelected && (
                            <div className="ml-6 space-y-1 border-l border-gray-200 pl-2">
                              {subcategory.children?.slice(0, 5).map(level3Category => {
                                const level3Name = language === 'ar' ? level3Category.name_ar : level3Category.name_en;
                                const isLevel3Selected = filters.subsubcategory === level3Name;
                                return (
                                  <label key={level3Category.id} className="flex items-center">
                                    <input
                                      type="radio"
                                      name="subsubcategory"
                                      value={level3Name}
                                      checked={isLevel3Selected}
                                      onChange={(e) => {
                                        updateFilters({ subsubcategory: e.target.value });
                                      }}
                                      className="text-purple-600 focus:ring-purple-500 mr-1 w-3 h-3"
                                      disabled={!isSubSelected} // Only enable if parent subcategory is selected
                                    />
                                    <span className={`text-xs ${
                                      isLevel3Selected ? 'text-purple-600 font-medium' : 
                                      !isSubSelected ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                      {level3Name}
                                    </span>
                                    {level3Category.children && level3Category.children.length > 0 && (
                                      <span className="ml-1 text-xs text-gray-400">({level3Category.children.length})</span>
                                    )}
                                  </label>
                                );
                              })}
                              {subcategory.children && subcategory.children.length > 5 && (
                                <div className="text-xs text-purple-600 italic">
                                  +{subcategory.children.length - 5} more categories
                                </div>
                              )}
                              
                              {/* Clear Level 3 category option */}
                              {isSubSelected && filters.subsubcategory && (
                                <button
                                  onClick={() => updateFilters({ subsubcategory: '' })}
                                  className="text-xs text-purple-600 hover:text-purple-700 ml-4"
                                >
                                  Clear level 3 filter
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Clear subcategory option */}
                    {isSelected && filters.subcategory && (
                      <button
                        onClick={() => updateFilters({ subcategory: '' })}
                        className="text-xs text-purple-600 hover:text-purple-700 ml-5"
                      >
                        Clear subcategory
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">{t('search.priceRange')}</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={filters.priceRange[0]}
              onChange={(e) => updatePriceRange(Number(e.target.value), filters.priceRange[1])}
              placeholder="Min"
              min={minPrice}
              max={maxPrice}
              className="px-3 py-2 border text-gray-700 border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="number"
              value={filters.priceRange[1]}
              onChange={(e) => updatePriceRange(filters.priceRange[0], Number(e.target.value))}
              placeholder="Max"
              min={minPrice}
              max={maxPrice}
              className="px-3 py-2 border text-gray-700 border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="text-xs text-gray-500 flex items-center justify-between">
            <Price amount={filters.priceRange[0]} />
            <span>-</span>
            <Price amount={filters.priceRange[1]} />
          </div>
          
          {/* Price Range Slider
          <div className="relative">
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={filters.priceRange[0]}
              onChange={(e) => updatePriceRange(Number(e.target.value), Math.max(Number(e.target.value), filters.priceRange[1]))}
              className="w-[100px] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={filters.priceRange[1]}
              onChange={(e) => updatePriceRange(Math.min(filters.priceRange[0], Number(e.target.value)), Number(e.target.value))}
              className="w-[100px] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider absolute top-0"
            />
          </div> */}
        </div>
      </div>

      {/* Stock Filter */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">{t('search.availability')}</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="stock"
              checked={filters.inStock === null}
              onChange={() => updateFilters({ inStock: null })}
              className="text-purple-600 focus:ring-purple-500"
            />
            <span className="ml-2 text-sm text-gray-700">{t('search.all')}</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="stock"
              checked={filters.inStock === true}
              onChange={() => updateFilters({ inStock: true })}
              className="text-purple-600 focus:ring-purple-500"
            />
            <span className="ml-2 text-sm text-gray-700">{t('product.inStock')}</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="stock"
              checked={filters.inStock === false}
              onChange={() => updateFilters({ inStock: false })}
              className="text-purple-600 focus:ring-purple-500"
            />
            <span className="ml-2 text-sm text-gray-700">{t('product.outOfStock')}</span>
          </label>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">{t('search.rating')}</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="rating"
              checked={filters.rating === null}
              onChange={() => updateFilters({ rating: null })}
              className="text-purple-600 focus:ring-purple-500"
            />
            <span className="ml-2 text-sm text-gray-700">{t('search.all')}</span>
          </label>
          {[4, 3, 2, 1].map(rating => (
            <label key={rating} className="flex items-center">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => updateFilters({ rating })}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                {[...Array(rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
                <span className="ml-1">& up</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.category || filters.subcategory || filters.inStock !== null || filters.rating !== null) && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Active Filters</h4>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {filters.category}
                <button
                  onClick={() => handleCategoryChange('')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.subcategory && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filters.subcategory}
                <button
                  onClick={() => updateFilters({ subcategory: '' })}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.inStock !== null && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {filters.inStock ? 'In Stock' : 'Out of Stock'}
                <button
                  onClick={() => updateFilters({ inStock: null })}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.rating !== null && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {filters.rating}+ Stars
                <button
                  onClick={() => updateFilters({ rating: null })}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};
