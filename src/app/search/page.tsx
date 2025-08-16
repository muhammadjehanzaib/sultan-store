'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilters } from '@/components/product/ProductFilters';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { searchUtils } from '@/lib/utils';
import { Product } from '@/types';
import { getLocalizedString, ensureLocalizedContent } from '@/lib/multilingualUtils';
import Price from '@/components/ui/Price';

interface FilterState {
  category: string;
  subcategory: string;
  subsubcategory: string; // Level 3 category
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
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    subcategory: '',
    subsubcategory: '', // Level 3 category
    priceRange: [0, 1000],
    inStock: null,
    rating: null
  });

  // Fetch products and categories from API
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/products?includeRelations=true'),
      fetch('/api/categories/tree')
    ])
      .then(async ([productsRes, categoriesRes]) => {
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        
        const apiProducts = Array.isArray(productsData) ? productsData : [];
        
        // Convert API format to frontend format
        const frontendProducts = apiProducts.map((apiProduct: any) => ({
          id: apiProduct.id,
          name: { en: apiProduct.name_en || '', ar: apiProduct.name_ar || '' },
          slug: apiProduct.slug,
          price: apiProduct.price,
          image: apiProduct.image,
          categoryId: apiProduct.categoryId, // Include the categoryId for filtering
          category: apiProduct.category
            ? { 
                id: apiProduct.category.id,
                en: apiProduct.category.name_en || '', 
                ar: apiProduct.category.name_ar || '',
                slug: apiProduct.category.slug
              }
            : { en: '', ar: '' },
          description: { en: apiProduct.description_en || '', ar: apiProduct.description_ar || '' },
          inStock: Boolean(apiProduct.inStock), // Convert to proper boolean: null/undefined/false -> false, true -> true
          rating: apiProduct.rating,
          reviews: apiProduct.reviews,
          attributes: apiProduct.attributes || [],
          variants: apiProduct.variants || [],
          // Include discount fields
          salePrice: apiProduct.salePrice,
          discountPercent: apiProduct.discountPercent,
          onSale: apiProduct.onSale || false,
          saleStartDate: apiProduct.saleStartDate,
          saleEndDate: apiProduct.saleEndDate,
        }));
        
        setProducts(frontendProducts);
        
        // Process categories - tree endpoint returns { tree: [...] }
        const categoriesList = Array.isArray(categoriesData?.tree) ? categoriesData.tree : [];
        const processedCategories = categoriesList.map((apiCategory: any) => ({
          id: apiCategory.id,
          name_en: apiCategory.name_en || '',
          name_ar: apiCategory.name_ar || '',
          slug: apiCategory.slug,
          path: apiCategory.path,
          parentId: apiCategory.parentId,
          children: apiCategory.children ? apiCategory.children.map((child: any) => ({
            id: child.id,
            name_en: child.name_en || '',
            name_ar: child.name_ar || '',
            slug: child.slug,
            path: child.path,
            parentId: child.parentId,
            // Include nested children (grandchildren)
            children: child.children ? child.children.map((grandChild: any) => ({
              id: grandChild.id,
              name_en: grandChild.name_en || '',
              name_ar: grandChild.name_ar || '',
              slug: grandChild.slug,
              path: grandChild.path,
              parentId: grandChild.parentId,
            })) : [],
          })) : [],
        }));
        
        setCategories(processedCategories);
        
        // Set dynamic price range based on actual product prices
        if (frontendProducts.length > 0) {
          const prices = frontendProducts.map((p: any) => p.price);
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          setFilters(prev => ({
            ...prev,
            priceRange: [minPrice, maxPrice]
          }));
        }
        
        setIsLoading(false);
      })
      .catch(error => {
        setIsLoading(false);
      });
  }, []);

  // Get initial search query from URL params
  useEffect(() => {
    const query = searchParams?.get('q') || '';
    setSearchQuery(query);
    setShowSuggestions(false);
  }, [searchParams]);

  // Generate search suggestions
  useEffect(() => {
    if (searchQuery.trim() && searchQuery.length > 1 && products.length > 0) {
      const suggestions = new Set<string>();
      const queryLower = searchQuery.toLowerCase();
      
      products.forEach(product => {
        // Get localized strings
        const name = getLocalizedString(ensureLocalizedContent(product.name), language).toLowerCase();
        const category = getLocalizedString(ensureLocalizedContent(product.category), language).toLowerCase();
        const description = getLocalizedString(ensureLocalizedContent(product.description || ''), language).toLowerCase();
        
        // Add product name if it matches
        if (name.includes(queryLower)) {
          suggestions.add(getLocalizedString(ensureLocalizedContent(product.name), language));
        }
        
        // Add category if it matches
        if (category.includes(queryLower)) {
          suggestions.add(getLocalizedString(ensureLocalizedContent(product.category), language));
        }
        
        // Add description words if they match
        if (description) {
          const words = description.split(' ');
          words.forEach((word: string) => {
            if (word.length > 3 && word.includes(queryLower)) {
              suggestions.add(word);
            }
          });
        }
      });
      
      const suggestionArray = Array.from(suggestions).slice(0, 5);
      setSuggestions(suggestionArray);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, products, language]);

  // Sort options
  const sortOptions: SortOption[] = [
    { key: 'relevance', label: t('search.sortRelevance'), value: 'relevance' },
    { key: 'priceLow', label: t('search.sortPriceLow'), value: 'price_asc' },
    { key: 'priceHigh', label: t('search.sortPriceHigh'), value: 'price_desc' },
    { key: 'rating', label: t('search.sortRating'), value: 'rating' },
    { key: 'newest', label: t('search.sortNewest'), value: 'newest' },
  ];

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
        
        const match = exactNameMatch || exactCategoryMatch || exactDescMatch || wordMatches;
        return match;
      });
    }

    // Helper function to get all category IDs in a hierarchy (category + all its children/descendants)
    const getAllCategoryIds = (categoryId: string): string[] => {
      const allIds = [categoryId];
      
      // Find the category and get all its descendants
      const findChildrenRecursively = (categories: any[]): void => {
        categories.forEach(cat => {
          if (cat.parentId === categoryId || allIds.includes(cat.parentId)) {
            if (!allIds.includes(cat.id)) {
              allIds.push(cat.id);
            }
          }
          if (cat.children && cat.children.length > 0) {
            findChildrenRecursively(cat.children);
          }
        });
      };
      
      // Also check nested children in the main categories
      categories.forEach(mainCat => {
        if (mainCat.id === categoryId) {
          if (mainCat.children) {
            const addChildrenRecursively = (children: any[]) => {
              children.forEach(child => {
                if (!allIds.includes(child.id)) {
                  allIds.push(child.id);
                }
                if (child.children && child.children.length > 0) {
                  addChildrenRecursively(child.children);
                }
              });
            };
            addChildrenRecursively(mainCat.children);
          }
        } else if (mainCat.children) {
          const searchInChildren = (children: any[]): void => {
            children.forEach(child => {
              if (child.id === categoryId) {
                if (child.children && child.children.length > 0) {
                  const addChildrenRecursively = (nestedChildren: any[]) => {
                    nestedChildren.forEach(nestedChild => {
                      if (!allIds.includes(nestedChild.id)) {
                        allIds.push(nestedChild.id);
                      }
                      if (nestedChild.children && nestedChild.children.length > 0) {
                        addChildrenRecursively(nestedChild.children);
                      }
                    });
                  };
                  addChildrenRecursively(child.children);
                }
              } else if (child.children && child.children.length > 0) {
                searchInChildren(child.children);
              }
            });
          };
          searchInChildren(mainCat.children);
        }
      });
      
      return allIds;
    };

    // Category filter (main category - shows category + all subcategories)
    if (filters.category) {
      
      // Find the main category ID by name
      const mainCategory = categories.find(cat => {
        const categoryName = language === 'ar' ? cat.name_ar : cat.name_en;
        return categoryName.toLowerCase() === filters.category.toLowerCase();
      });
      
      if (mainCategory) {
        const allCategoryIds = getAllCategoryIds(mainCategory.id);
        
        filtered = filtered.filter(product => {
          const productCategoryId = typeof product.category === 'object' && 'id' in product.category 
            ? product.category.id 
            : product.categoryId;
          if (!productCategoryId) return false;
          const matches = allCategoryIds.includes(productCategoryId);
          return matches;
        });
      } else {
        filtered = [];
      }
      
    }

    // Subcategory filter (specific subcategory - shows only that subcategory + its children)
    if (filters.subcategory) {
      
      // Find the subcategory in the category hierarchy
      let subcategoryId = null;
      let subcategoryWithChildren = null;
      
      for (const mainCategory of categories) {
        if (mainCategory.children) {
          for (const subCategory of mainCategory.children) {
            const subCategoryName = language === 'ar' ? subCategory.name_ar : subCategory.name_en;
            if (subCategoryName === filters.subcategory) {
              subcategoryId = subCategory.id;
              subcategoryWithChildren = subCategory;
              break;
            }
          }
        }
        if (subcategoryId) break;
      }
      
      
      if (subcategoryId) {
        // Get all category IDs for this subcategory (subcategory + its children)
        const relevantCategoryIds = getAllCategoryIds(subcategoryId);
        
        filtered = filtered.filter(product => {
          const productCategoryId = typeof product.category === 'object' && 'id' in product.category 
            ? product.category.id 
            : product.categoryId;
          if (!productCategoryId) return false;
          const matches = relevantCategoryIds.includes(productCategoryId);
          return matches;
        });
      } else {
        filtered = [];
      }
      
    }

    // Level 3 category filter (specific level 3 category - shows only that category + its children)
    if (filters.subsubcategory) {
      
      // Find the level 3 category in the category hierarchy
      let level3CategoryId = null;
      
      for (const mainCategory of categories) {
        if (mainCategory.children) {
          for (const subCategory of mainCategory.children) {
            if (subCategory.children) {
              for (const level3Category of subCategory.children) {
                const level3CategoryName = language === 'ar' ? level3Category.name_ar : level3Category.name_en;
                if (level3CategoryName === filters.subsubcategory) {
                  level3CategoryId = level3Category.id;
                  break;
                }
              }
            }
            if (level3CategoryId) break;
          }
        }
        if (level3CategoryId) break;
      }
      
      
      if (level3CategoryId) {
        // Get all category IDs for this level 3 category (level 3 + its children if any)
        const relevantCategoryIds = getAllCategoryIds(level3CategoryId);
        
        filtered = filtered.filter(product => {
          const productCategoryId = typeof product.category === 'object' && 'id' in product.category 
            ? product.category.id 
            : product.categoryId;
          if (!productCategoryId) return false;
          const matches = relevantCategoryIds.includes(productCategoryId);
          return matches;
        });
      } else {
        filtered = [];
      }
      
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
  }, [searchQuery, filters, sortBy, products, language]);

  const handleAddToCart = (product: Product, selectedAttributes?: { [attributeId: string]: string }) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, selectedAttributes } });
  };

  const handleViewProduct = (product: Product) => {
    router.push(`/product/${product.slug}`);
  };

  const debouncedSearch = searchUtils.debounce((query: string) => {
    if (query.trim()) {
      const params = new URLSearchParams();
      params.set('q', query.trim());
      router.push(`/search?${params.toString()}`);
    }
  }, 300); // Reduced debounce time for better responsiveness

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
    // Get current price range from products
    const prices = products.map(p => p.price);
    const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices)) : 0;
    const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
    
    setFilters({
      category: '',
      subcategory: '',
      subsubcategory: '',
      priceRange: [minPrice, maxPrice],
      inStock: null,
      rating: null
    });
  };

  // Calculate min and max price from products
  const { minPrice, maxPrice } = useMemo(() => {
    if (products.length === 0) return { minPrice: 0, maxPrice: 1000 };
    const prices = products.map(p => p.price);
    return {
      minPrice: Math.floor(Math.min(...prices)),
      maxPrice: Math.ceil(Math.max(...prices))
    };
  }, [products]);


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
                  className="w-full pl-10 text-gray-700 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                
                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full text-gray-700 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
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
                className="flex text-gray-700 items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="mr-2">🔧</span>
                {t('search.filters')}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            {isLoading ? (
              <div className="flex items-center text-gray-600">
                <LoadingSpinner size="sm" className="mr-2" />
                <span>{t('common.loading')}</span>
              </div>
            ) : (
              <p className="text-gray-600">
                {filteredAndSortedProducts.length} {t('search.resultsFound')}
                {searchQuery && (
                  <span className="ml-2">
                    {t('search.for')} <strong>"{searchQuery}"</strong>
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <ProductFilters
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onClearFilters={clearFilters}
            />
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
              <ProductGrid
                products={filteredAndSortedProducts}
                title=""
                subtitle=""
                onAddToCart={handleAddToCart}
                onViewProduct={handleViewProduct}
                viewMode="grid"
                showHeader={false}
                showViewAllButton={false}
                className="w-full"
              />
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
