'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { products, categories } from '@/data/products';
import { formatPrice } from '@/lib/utils';
import Price from '@/components/ui/Price';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
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
      setFilteredProducts([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredProducts(filtered.slice(0, 8));
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const handleProductClick = (productId: number) => {
    router.push(`/product/${productId}`);
    onClose();
    setSearchQuery('');
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
          <form onSubmit={handleSearchSubmit} className="relative mb-6">
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

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {searchQuery.trim() === '' ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Start searching</h3>
                <p className="text-gray-500">Type something to search for products</p>
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
                    {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found
                  </p>
                  {filteredProducts.length === 8 && (
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
                    onClick={() => handleProductClick(product.id)}
                    className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base">{product.name}</h3>
                      <p className="text-xs md:text-sm text-gray-500 mb-1">{product.category}</p>
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