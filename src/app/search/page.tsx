'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductCard } from '@/components/product/ProductCard';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { products, categories } from '@/data/products';
import { searchUtils } from '@/lib/utils';
import { Product } from '@/types';
import { getLocalizedString, ensureLocalizedContent } from '@/lib/multilingualUtils';

interface FilterState {
  category: string;
  priceRange: [number, number];
  inStock: boolean | null;
  rating: number | null;
}

interface SortOption {
  key: string;
  label: string;
  value: string;
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dispatch } = useCart();
  const { t, isRTL, language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    priceRange: [0, 1000],
    inStock: null,
    rating: null
  });

  // Get initial search query from URL params
  useEffect(() => {
    const query = searchParams?.get('q') || '';
    setSearchQuery(query);
    setShowSuggestions(false);
  }, [searchParams]);

  // Generate search suggestions
  useEffect(() => {
    if (searchQuery.trim() && searchQuery.length > 1) {
      const newSuggestions = searchUtils.generateSuggestions(searchQuery, products);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // Sort options
  const sortOptions: SortOption[] = [
    { key: 'relevance', label: t('search.sortRelevance'), value: 'relevance' },
    { key: 'priceLow', label: t('search.sortPriceLow'), value: 'price_asc' },
    { key: 'priceHigh', label: t('search.sortPriceHigh'), value: 'price_desc' },
    { key: 'rating', label: t('search.sortRating'), value: 'rating' },
    { key: 'newest', label: t('search.sortNewest'), value: 'newest' },
  ];

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Enhanced text search with fuzzy matching
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => {
        const name = getLocalizedString(ensureLocalizedContent(product.name), language).toLowerCase();
        let category = '';
        if (typeof product.category === 'object' && 'name_en' in product.category) {
          category = (language === 'ar' ? (product.category as any).name_ar : product.category.name_en).toLowerCase();
        } else {
          category = getLocalizedString(ensureLocalizedContent(product.category), language).toLowerCase();
        }
        const description = getLocalizedString(ensureLocalizedContent(product.description || ''), language).toLowerCase();
        
        // Exact matches get highest priority
        const exactNameMatch = name.includes(query);
        const exactCategoryMatch = category.includes(query);
        const exactDescMatch = description.includes(query);
        
        // Word-by-word matching for better results
        const words = query.split(' ').filter(word => word.length > 0);
        const wordMatches = words.some(word => 
          name.includes(word) || category.includes(word) || description.includes(word)
        );
        
        return exactNameMatch || exactCategoryMatch || exactDescMatch || wordMatches;
      });
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => {
        let categoryName = '';
        if (typeof product.category === 'object' && 'name_en' in product.category) {
          categoryName = (language === 'ar' ? (product.category as any).name_ar : product.category.name_en).toLowerCase();
        } else {
          categoryName = getLocalizedString(ensureLocalizedContent(product.category), language).toLowerCase();
        }
        return categoryName === filters.category.toLowerCase();
      });
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Stock filter
    if (filters.inStock !== null) {
      filtered = filtered.filter(product => 
        filters.inStock ? product.inStock !== false : product.inStock === false
      );
    }

    // Rating filter
    if (filters.rating !== null) {
      filtered = filtered.filter(product => 
        (product.rating || 0) >= filters.rating!
      );
    }

    // Sort products with enhanced relevance scoring
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          // Convert IDs to numbers for comparison, fallback to string comparison
          const aId = typeof a.id === 'number' ? a.id : parseInt(String(a.id));
          const bId = typeof b.id === 'number' ? b.id : parseInt(String(b.id));
          return isNaN(bId) || isNaN(aId) ? String(b.id).localeCompare(String(a.id)) : bId - aId;
        case 'relevance':
        default:
          // Enhanced relevance scoring when there's a search query
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const scoreA = calculateRelevanceScore(a, query);
            const scoreB = calculateRelevanceScore(b, query);
            return scoreB - scoreA;
          }
          return 0; // No search query - maintain original order
      }
    });

    return sorted;
  }, [searchQuery, filters, sortBy]);

  // Helper function to calculate relevance score
  const calculateRelevanceScore = (product: Product, query: string): number => {
    let score = 0;
    const name = getLocalizedString(ensureLocalizedContent(product.name), language).toLowerCase();
    let category = '';
    if (typeof product.category === 'object' && 'name_en' in product.category) {
      category = (language === 'ar' ? (product.category as any).name_ar : product.category.name_en).toLowerCase();
    } else {
      category = getLocalizedString(ensureLocalizedContent(product.category), language).toLowerCase();
    }
    const description = getLocalizedString(ensureLocalizedContent(product.description || ''), language).toLowerCase();
    
    // Exact name match gets highest score
    if (name === query) score += 100;
    else if (name.includes(query)) score += 50;
    
    // Category matches
    if (category === query) score += 30;
    else if (category.includes(query)) score += 15;
    
    // Description matches
    if (description.includes(query)) score += 10;
    
    // Boost score for products with higher ratings
    score += (product.rating || 0) * 2;
    
    // Boost score for in-stock products
    if (product.inStock) score += 5;
    
    // Word-based scoring
    const words = query.split(' ').filter(word => word.length > 1);
    words.forEach(word => {
      if (name.includes(word)) score += 20;
      if (category.includes(word)) score += 10;
      if (description.includes(word)) score += 5;
    });
    
    return score;
  };

  const handleAddToCart = (product: Product, selectedAttributes?: { [attributeId: string]: string }) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, selectedAttributes } });
  };

  const handleViewProduct = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const debouncedSearch = searchUtils.debounce((query: string) => {
    if (query.trim()) {
      const params = new URLSearchParams();
      params.set('q', query.trim());
      router.push(`/search?${params.toString()}`);
    }
  }, 500);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    if (query.trim()) {
      debouncedSearch(query);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    const params = new URLSearchParams();
    params.set('q', suggestion);
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 1000],
      inStock: null,
      rating: null
    });
  };

  const updatePriceRange = (min: number, max: number) => {
    setFilters(prev => ({ ...prev, priceRange: [min, max] }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb
            items={[
              { label: t('nav.home'), href: '/' },
              { 
                label: searchQuery ? t('search.resultsFor').replace('{{query}}', `"${searchQuery}"`) : t('search.title'), 
                isCurrentPage: true 
              }
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Input */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">🔍</span>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    handleSearch(e.target.value);
                    setShowSuggestions(e.target.value.length > 1);
                  }}
                  onFocus={() => setShowSuggestions(searchQuery.length > 1 && suggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder={t('search.placeholder')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                
                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <span 
                          dangerouslySetInnerHTML={{
                            __html: searchUtils.highlightSearchTerms(suggestion, searchQuery)
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Filter Toggle & Sort */}
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="mr-2">🔧</span>
                {t('search.filters')}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.key} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4">
            <p className="text-gray-600">
              {isLoading ? (
                <span className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  {t('common.loading')}
                </span>
              ) : (
                <>
                  {filteredAndSortedProducts.length} {t('search.resultsFound')}
                  {searchQuery && (
                    <span className="ml-2">
                      {t('search.for')} <strong>"{searchQuery}"</strong>
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{t('search.filters')}</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  {t('search.clearAll')}
                </button>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{t('search.category')}</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={filters.category === ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t('search.allCategories')}</span>
                  </label>
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={typeof category.name === 'string' ? category.name : category.name.en}
                          checked={filters.category === (typeof category.name === 'string' ? category.name : category.name.en)}
                          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {typeof category.name === 'string' ? category.name : category.name.en}
                        </span>
                    </label>
                  ))}
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
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={(e) => updatePriceRange(filters.priceRange[0], Number(e.target.value))}
                      placeholder="Max"
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  </div>
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
                      onChange={() => setFilters(prev => ({ ...prev, inStock: null }))}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t('search.all')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="stock"
                      checked={filters.inStock === true}
                      onChange={() => setFilters(prev => ({ ...prev, inStock: true }))}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t('product.stock')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="stock"
                      checked={filters.inStock === false}
                      onChange={() => setFilters(prev => ({ ...prev, inStock: false }))}
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
                      onChange={() => setFilters(prev => ({ ...prev, rating: null }))}
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
                        onChange={() => setFilters(prev => ({ ...prev, rating }))}
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
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3 mt-6 lg:mt-0">
            {filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {t('search.noResults')}
                </h3>
                <p className="text-gray-500 mb-4">
                  {t('search.noResultsDesc')}
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {t('search.clearFilters')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onViewProduct={handleViewProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SearchPageContent />
    </Suspense>
  );
}
