'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Product } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { getLocalizedString, ensureLocalizedContent } from '@/lib/multilingualUtils';
import { CategoryWithChildren, buildCategoryTree } from '@/lib/categoryUtils';
import { 
  Bars3Icon, 
  Squares2X2Icon, 
  ListBulletIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  AdjustmentsHorizontalIcon,
  FolderIcon,
  FolderOpenIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

interface CategoryPageClientProps {
  slug: string;
  products?: Product[]; // Make products optional since we'll fetch them
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name' | 'rating' | 'popularity';
type ViewMode = 'grid' | 'list';

interface FilterState {
  priceRange: [number, number];
  rating: number;
  inStock: boolean | null;
  onSale: boolean | null;
}

export default function CategoryPageClient({ slug, products: initialProducts }: CategoryPageClientProps) {
  const { t, isRTL, language } = useLanguage();
  const { dispatch } = useCart();
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryWithChildren[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 10000],
    rating: 0,
    inStock: null,
    onSale: null
  });

  // Fetch categories from API
  useEffect(() => {
    async function fetchCategories() {
      setCategoriesLoading(true);
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data.categories);
        
        // Build category tree for navigation
        const tree = buildCategoryTree(data.categories);
        setCategoryTree(tree);
        
        // Auto-expand the path to current category
        const currentCategory = data.categories.find((cat: any) => cat.slug === slug);
        if (currentCategory) {
          const pathToExpand: {[key: string]: boolean} = {};
          let parent = currentCategory;
          while (parent) {
            pathToExpand[parent.id] = true;
            parent = data.categories.find((cat: any) => cat.id === parent.parentId);
          }
          setExpandedCategories(pathToExpand);
        }
      } catch (error) {
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, [slug]);

  // Find the category by slug
  const category = categories.find(cat => cat.slug === slug);

  // Fetch products using hierarchical API when category is found
  useEffect(() => {
    async function fetchProducts() {
      if (!category || initialProducts) return; // Skip if we already have products or no category
      
      setProductsLoading(true);
      try {
        const response = await fetch(`/api/categories/${category.id}/products?includeSubcategories=true`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        } else {
        }
      } catch (error) {
      } finally {
        setProductsLoading(false);
      }
    }
    
    fetchProducts();
  }, [category, initialProducts]);

  // Get subcategories for this category
  const subcategories = useMemo(() => {
    if (!category) return [];
    return categories.filter(cat => cat.parentId === category.id && cat.isActive);
  }, [categories, category]);

  // Since we're using the hierarchical API, products already include all subcategory products
  const categoryProducts = products;

  // Get price range for filter - always calculate
  const priceRange = useMemo(() => {
    if (categoryProducts.length === 0) return [0, 1000];
    const prices = categoryProducts.map(p => p.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [categoryProducts]);

  // Apply filters and sorting - always calculate
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...categoryProducts];

    // Apply price filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => (product.rating || 0) >= filters.rating);
    }

    // Apply stock filter
    if (filters.inStock !== null) {
      filtered = filtered.filter(product => product.inStock === filters.inStock);
    }

    // Apply sale filter
    if (filters.onSale !== null) {
      filtered = filtered.filter(product => {
        const isOnSale = product.onSale || (product.salePrice && product.salePrice < product.price);
        return filters.onSale ? isOnSale : !isOnSale;
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name': {
          const getName = (p: Product) =>
            p.name_en && p.name_ar
              ? language === 'ar' ? p.name_ar : p.name_en
              : getLocalizedString(ensureLocalizedContent(p.name), language);
          return getName(a).localeCompare(getName(b));
        }
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popularity':
          return (b.rating || 0) * (b.reviews || 0) - (a.rating || 0) * (a.reviews || 0);
        case 'newest':
          return b.id.localeCompare(a.id); // Fallback to ID sorting for newest
        default:
          return 0;
      }
    });

    return filtered;
  }, [categoryProducts, filters, sortBy, language]);

  // Pagination - always calculate
  const totalProducts = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  // ✅ Normalize all fields for ProductGrid (convert API format to frontend format) - always calculate
  const normalizedProducts = useMemo(() => {
    const normalized = paginatedProducts.map(product => ({
      ...product,
      // The API already provides the correct format, but we need to add flat fields for compatibility
      name_en: (typeof product.name === 'object' && product.name?.en) || product.name_en || '',
      name_ar: (typeof product.name === 'object' && product.name?.ar) || product.name_ar || '',
      name: (typeof product.name === 'object') ? product.name : {
        en: product.name_en || '',
        ar: product.name_ar || '',
      },
      description_en: (typeof product.description === 'object' && product.description?.en) || product.description_en || '',
      description_ar: (typeof product.description === 'object' && product.description?.ar) || product.description_ar || '',
      description: (typeof product.description === 'object') ? product.description : {
        en: product.description_en || '',
        ar: product.description_ar || '',
      },
      // Category is already in correct format from API
      category: product.category || {
        en: category?.name_en || 'Unknown',
        ar: category?.name_ar || 'غير معروف',
      },
      // Ensure inStock is properly converted to boolean
      inStock: Boolean(product.inStock),
      // Include discount fields if they exist
      salePrice: product.salePrice,
      discountPercent: product.discountPercent,
      onSale: product.onSale || false,
      saleStartDate: product.saleStartDate,
      saleEndDate: product.saleEndDate,
    }));
    return normalized;
  }, [paginatedProducts, category]);

  const handleAddToCart = (product: Product, selectedAttributes?: { [attributeId: string]: string }, variantPrice?: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, selectedAttributes, variantPrice } });
  };

  const handleViewProduct = (product: Product) => {
    // No-op: handled via Link
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [priceRange[0], priceRange[1]],
      rating: 0,
      inStock: null,
      onSale: null
    });
    setCurrentPage(1);
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Early return after all hooks are called
  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`text-center ${isRTL ? 'rtl' : 'ltr'}`}>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {categoriesLoading ? 'Loading...' : t('category.notFound')}
          </h1>
          <p className="text-gray-600">
            {categoriesLoading ? 'Loading categories...' : t('category.notFoundDescription')}
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} space-x-2 text-sm text-gray-500`}>
            <a href="/" className="hover:text-gray-900">{t('nav.home')}</a>
            <span>/</span>
            <a href="/" className="hover:text-gray-900">{t('nav.categories')}</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              {language === 'ar' ? category.name_ar : category.name_en}
            </span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className={`${isRTL ? 'rtl' : 'ltr'}`}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'ar' ? category.name_ar : category.name_en}
            </h1>
            {/* Category Description */}
            {(category.description_en || category.description_ar) && (
              <p className="text-lg text-gray-700 mb-4">
                {language === 'ar' ? category.description_ar : category.description_en}
              </p>
            )}
            <p className="text-gray-600 mb-6">
              {t('category.productsCount').replace('{{count}}', totalProducts.toString())}
            </p>

            {/* Toolbar */}
            <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} flex-wrap items-center justify-between gap-4`}>
              <div className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} items-center space-x-4`}>
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex text-gray-900 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm`}
                >
                  <FunnelIcon className="w-4 h-4" />
                  <span>{t('search.filters')}</span>
                </button>

                {/* View Mode */}
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <ListBulletIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} items-center space-x-4`}>
                {/* Sort */}
                <div className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} items-center space-x-2`}>
                  <label className="text-sm font-medium text-gray-700">
                    {t('category.sortBy')}:
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className={`text-gray-700 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? 'text-right' : ''}`}
                  >
                    <option value="popularity">{t('search.sortRelevance')}</option>
                    <option value="newest">{t('search.sortNewest')}</option>
                    <option value="name">{t('category.sortByName')}</option>
                    <option value="price-low">{t('category.sortByPriceLow')}</option>
                    <option value="price-high">{t('category.sortByPriceHigh')}</option>
                    <option value="rating">{t('category.sortByRating')}</option>
                  </select>
                </div>

                {/* Results Info */}
                <span className="text-sm text-gray-500">
                  {startIndex + 1}-{Math.min(endIndex, totalProducts)} of {totalProducts}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} gap-8`}>
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-sm space-y-6">
              {/* Category Tree Navigation */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Browse Categories</h3>
                <div className="max-h-64 overflow-y-auto">
                  <CategoryTreeNavigation
                    categories={categoryTree}
                    expandedCategories={expandedCategories}
                    currentCategorySlug={slug}
                    onToggleExpansion={toggleCategoryExpansion}
                    language={language}
                    isRTL={isRTL}
                    level={0}
                  />
                </div>
              </div>
              
              {/* Filters Section */}
              <div className="p-6">
                <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} items-center justify-between mb-6`}>
                  <h3 className="font-semibold text-gray-900">{t('search.filters')}</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {t('search.clearAll')}
                  </button>
                </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">{t('search.priceRange')}</h4>
                <div className="space-y-2 text-gray-900">
                  <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} items-center space-x-2`}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange[0]}
                      onChange={(e) => handleFilterChange('priceRange', [Number(e.target.value), filters.priceRange[1]])}
                      className={`w-20 px-2 py-1 border border-gray-300 rounded text-sm ${isRTL ? 'text-right' : ''}`}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange[1]}
                      onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                      className={`w-20 px-2 py-1 border border-gray-300 rounded text-sm ${isRTL ? 'text-right' : ''}`}
                    />
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">{t('search.rating')}</h4>
                <div className="space-y-2">
                  {[5,4, 3, 2, 1].map(rating => (
                    <label key={rating} className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} items-center space-x-2 cursor-pointer`}>
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.rating === rating}
                        onChange={() => handleFilterChange('rating', rating)}
                        className="rounded"
                      />
                      <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} items-center space-x-1`}>
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">& up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">{t('search.availability')}</h4>
                <div className="space-y-2 text-gray-700">
                  <label className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} items-center space-x-2 cursor-pointer`}>
                    <input
                      type="radio"
                      name="availability"
                      checked={filters.inStock === null}
                      onChange={() => handleFilterChange('inStock', null)}
                      className="rounded"
                    />
                    <span className="text-sm">{t('search.all')}</span>
                  </label>
                  <label className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} items-center space-x-2 cursor-pointer`}>
                    <input
                      type="radio"
                      name="availability"
                      checked={filters.inStock === true}
                      onChange={() => handleFilterChange('inStock', true)}
                      className="rounded"
                    />
                    <span className="text-sm">{t('common.inStock')}</span>
                  </label>
                  <label className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} items-center space-x-2 cursor-pointer`}>
                    <input
                      type="radio"
                      name="availability"
                      checked={filters.inStock === false}
                      onChange={() => handleFilterChange('inStock', false)}
                      className="rounded"
                    />
                    <span className="text-sm">{t('common.outOfStock')}</span>
                  </label>
                </div>
              </div>

              {/* On Sale */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Special Offers</h4>
                <div className="space-y-2 text-gray-700">
                  <label className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} items-center space-x-2 cursor-pointer`}>
                    <input
                      type="radio"
                      name="onSale"
                      checked={filters.onSale === null}
                      onChange={() => handleFilterChange('onSale', null)}
                      className="rounded"
                    />
                    <span className="text-sm">{t('search.all')}</span>
                  </label>
                  <label className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} items-center space-x-2 cursor-pointer`}>
                    <input
                      type="radio"
                      name="onSale"
                      checked={filters.onSale === true}
                      onChange={() => handleFilterChange('onSale', true)}
                      className="rounded"
                    />
                    <span className="text-sm">On Sale</span>
                  </label>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Subcategories Section */}
            {subcategories.length > 0 && (
              <div className="mb-12">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {language === 'ar' ? 'الفئات الفرعية' : 'Subcategories'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {subcategories.map(subcategory => (
                    <a
                      key={subcategory.id}
                      href={`/category/${subcategory.slug}`}
                      className="group p-4 bg-white rounded-lg border hover:border-purple-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="text-center">
                        {subcategory.image ? (
                          <img 
                            src={subcategory.image} 
                            alt={language === 'ar' ? subcategory.name_ar : subcategory.name_en}
                            className="w-16 h-16 mx-auto mb-3 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 mx-auto mb-3 text-3xl flex items-center justify-center">
                            {subcategory.icon || '📦'}
                          </div>
                        )}
                        <h4 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                          {language === 'ar' ? subcategory.name_ar : subcategory.name_en}
                        </h4>
                        {subcategory.productCount && (
                          <p className="text-sm text-gray-500 mt-1">
                            {subcategory.productCount} {language === 'ar' ? 'منتج' : 'products'}
                          </p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {totalProducts > 0 ? (
              <>
                <ProductGrid
                  products={normalizedProducts}
                  title=""
                  subtitle=""
                  onAddToCart={handleAddToCart}
                  onViewProduct={handleViewProduct}
                  viewMode={viewMode}
                  showHeader={false}
                  showViewAllButton={false}
                  className="w-full"
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center">
                    <nav className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} items-center space-x-2`}>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('common.previous')}
                      </button>

                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        if (page > totalPages) return null;
                        
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              currentPage === page
                                ? 'text-white bg-blue-600 border border-blue-600'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('common.next')}
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FunnelIcon className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('products.noProducts')}</h3>
                <p className="text-gray-500 mb-4">{t('search.noResultsDesc')}</p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {t('search.clearFilters')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-gray-600 bg-opacity-50">
          <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-0 h-full w-80 bg-white shadow-lg overflow-y-auto`}>
            <div className="p-4">
              <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} items-center justify-between mb-6`}>
                <h3 className="text-lg font-semibold">{t('search.filters')}</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              {/* Same filter content as desktop */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// CategoryTreeNavigation Component
interface CategoryTreeNavigationProps {
  categories: CategoryWithChildren[];
  expandedCategories: {[key: string]: boolean};
  currentCategorySlug: string;
  onToggleExpansion: (categoryId: string) => void;
  language: string;
  isRTL: boolean;
  level: number;
}

const CategoryTreeNavigation: React.FC<CategoryTreeNavigationProps> = ({
  categories,
  expandedCategories,
  currentCategorySlug,
  onToggleExpansion,
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
        const isCurrentCategory = category.slug === currentCategorySlug;
        
        return (
          <li key={category.id}>
            <div className="flex items-center">
              {/* Expand/Collapse Button */}
              {hasChildren ? (
                <button
                  onClick={() => onToggleExpansion(category.id)}
                  className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors mr-1"
                >
                  {isExpanded ? (
                    <ChevronDownIcon className="w-3 h-3 text-gray-500" />
                  ) : (
                    <ChevronRightIcon className="w-3 h-3 text-gray-500" />
                  )}
                </button>
              ) : (
                <div className="w-5 flex-shrink-0" />
              )}
              
              {/* Category Icon */}
              <div className={`flex-shrink-0 ${isRTL ? 'ml-2' : 'mr-2'}`}>
                {isExpanded && hasChildren ? (
                  <FolderOpenIcon className="w-4 h-4 text-purple-600" />
                ) : (
                  <FolderIcon className="w-4 h-4 text-gray-500" />
                )}
              </div>
              
              {/* Category Link */}
              <Link
                href={`/category/${category.slug}`}
                className={`flex-1 flex items-center py-1.5 px-2 text-sm rounded-md transition-all duration-200 ${
                  isCurrentCategory
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
                }`}
              >
                <span className="flex-1 truncate">{categoryName}</span>
                
                {/* Product Count */}
                {category.productCount !== undefined && category.productCount > 0 && (
                  <span className="flex-shrink-0 text-xs text-gray-400 ml-2">
                    ({category.productCount})
                  </span>
                )}
              </Link>
            </div>
            
            {/* Children */}
            {hasChildren && isExpanded && (
              <div className="mt-1">
                <CategoryTreeNavigation
                  categories={category.children || []}
                  expandedCategories={expandedCategories}
                  currentCategorySlug={currentCategorySlug}
                  onToggleExpansion={onToggleExpansion}
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
