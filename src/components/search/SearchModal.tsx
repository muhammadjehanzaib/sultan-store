'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import Price from '@/components/ui/Price';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@/types';
import { getLocalizedString, ensureLocalizedContent } from '@/lib/multilingualUtils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t, isRTL, language } = useLanguage();

  // Fetch products and categories from API
  useEffect(() => {
    // Fetch products
    fetch('/api/products?includeRelations=true')
      .then(res => res.json())
      .then((data: any[]) => {
        if (!Array.isArray(data)) {
          setProducts([]);
          return;
        }
        const frontendProducts = data.map(apiProduct => ({
          id: apiProduct.id,
          name: { en: apiProduct.name_en || '', ar: apiProduct.name_ar || '' },
          slug: apiProduct.slug,
          price: apiProduct.price,
          image: apiProduct.image,
          category: apiProduct.category
            ? { en: apiProduct.category.name_en || '', ar: apiProduct.category.name_ar || '' }
            : { en: '', ar: '' },
          description: { en: apiProduct.description_en || '', ar: apiProduct.description_ar || '' },
          inStock: Boolean(apiProduct.inStock),
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
        
        // Extract unique categories
        const uniqueCategories = data
          .map((product: any) => product.category)
          .filter((category: any) => category && category.id)
          .filter((value: any, index: number, self: any[]) => 
            index === self.findIndex((t: any) => t.id === value.id)
          );
        setCategories(uniqueCategories);
      })
      .catch(error => {
        setProducts([]);
      });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      // If no search query but a category is selected, show products from that category
      if (selectedCategory) {
        setIsLoading(true);
        const timer = setTimeout(() => {
          const filtered = products.filter(product => {
            const productCategory = getLocalizedString(ensureLocalizedContent(product.category), language);
            return productCategory.toLowerCase().includes(selectedCategory.toLowerCase());
          });
          setFilteredProducts(filtered);
          setIsLoading(false);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        setFilteredProducts([]);
        return;
      }
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      const queryLower = searchQuery.toLowerCase();
      
      const filtered = products.filter(product => {
        const name = getLocalizedString(ensureLocalizedContent(product.name), language).toLowerCase();
        const category = getLocalizedString(ensureLocalizedContent(product.category), language).toLowerCase();
        const description = getLocalizedString(ensureLocalizedContent(product.description || ''), language).toLowerCase();
        
        const matchesQuery = name.includes(queryLower) || 
                           category.includes(queryLower) || 
                           description.includes(queryLower);
        
        // Apply category filter if one is selected
        if (selectedCategory) {
          const productCategory = getLocalizedString(ensureLocalizedContent(product.category), language);
          return matchesQuery && productCategory.toLowerCase().includes(selectedCategory.toLowerCase());
        }
        
        return matchesQuery;
      });
      
      setFilteredProducts(filtered);
      setIsLoading(false);
    }, 150); // Reduced debounce time

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, products, language]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleProductClick = (productSlug: string) => {
    router.push(`/product/${productSlug}`);
    onClose();
    setSearchQuery('');
    setSelectedCategory(''); // Reset category filter
  };

  const addToRecentSearches = (query: string) => {
    if (!query.trim()) return;

    const trimmedQuery = query.trim();
    const updated = [trimmedQuery, ...recentSearches.filter(q => q !== trimmedQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  };

  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      addToRecentSearches(searchQuery);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
      setSearchQuery('');
    }
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    addToRecentSearches(query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToRecentSearches(searchQuery);
    }
    handleViewAllResults();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        // className="fixed inset-0 bg-white/10 backdrop-blur-md z-[60]"
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="fixed top-17 left-0 right-0 z-[61] bg-transparent">
        <div
          ref={modalRef}
          className="max-w-4xl mx-auto mt-6 p-4 md:p-6 bg-white shadow-2xl rounded-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t('search.title')}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-red-500 transition-all duration-200 text-xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-xl">🔍</span>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="text-gray-600 placeholder-gray-300 w-full pl-12 pr-4 py-3 md:py-4 text-base md:text-lg border border-gray-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <span className="text-xl">×</span>
              </button>
            )}
          </form>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Browse by Category</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === '' 
                      ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => {
                  const categoryName = language === 'ar' ? category.name_ar || category.name_en : category.name_en;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(categoryName)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedCategory === categoryName 
                          ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {categoryName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {searchQuery.trim() === '' && !selectedCategory ? (
              <div className="space-y-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Searches</h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearchClick(search)}
                          className="px-3 py-1 bg-gray-100 hover:bg-purple-100 hover:text-purple-600 rounded-full text-sm transition-colors duration-200"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Empty State */}
                {recentSearches.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Start searching</h3>
                    <p className="text-gray-500">Search for products or browse by category</p>
                  </div>
                )}
              </div>
            ) : isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Searching...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No results found</h3>
                <p className="text-gray-500">Try different keywords</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found{selectedCategory && ` in ${selectedCategory}`}
                  </p>
                  {searchQuery.trim() && (
                    <button
                      onClick={handleViewAllResults}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      View all results →
                    </button>
                  )}
                </div>

                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.slug)}
                    className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={product.image}
                        alt={getLocalizedString(ensureLocalizedContent(product.name), language)}
                        className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base">
                        {getLocalizedString(ensureLocalizedContent(product.name), language)}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 mb-1">
                        {getLocalizedString(ensureLocalizedContent(product.category), language)}
                      </p>
                      <p className="text-base md:text-lg font-bold text-purple-600">
                        <Price amount={product.price} locale={isRTL ? 'ar' : 'en'} className="text-base md:text-lg font-bold text-purple-600" />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};