'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { SearchBar } from './SearchBar';
import { getLocalizedString, ensureLocalizedContent } from '@/lib/multilingualUtils';
import Price from '@/components/ui/Price';

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  selectedProducts?: string[];
  onSelectProduct?: (productId: string) => void;
  onSelectAll?: () => void;
}

export function ProductsTable({ 
  products, 
  onEdit, 
  onDelete, 
  selectedProducts = [], 
  onSelectProduct, 
  onSelectAll 
}: ProductsTableProps) {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedProducts = products
    .filter((product) => {
    const name = ensureLocalizedContent(product.name);
      const category = ensureLocalizedContent(product.category);
      const searchLower = searchQuery.toLowerCase();
      return name.en.toLowerCase().includes(searchLower) || 
             name.ar.toLowerCase().includes(searchLower) ||
             category.en.toLowerCase().includes(searchLower) ||
             category.ar.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = getLocalizedString(ensureLocalizedContent(a.name), 'en').toLowerCase();
          bValue = getLocalizedString(ensureLocalizedContent(b.name), 'en').toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'category':
        default:
          aValue = getLocalizedString(ensureLocalizedContent(a.category), 'en').toLowerCase();
          bValue = getLocalizedString(ensureLocalizedContent(b.category), 'en').toLowerCase();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (column: 'name' | 'price' | 'category') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleDelete = (productId: string) => {
    if (confirm(t('admin.products.deleteConfirm'))) {
      onDelete(productId);
    }
  };

  const isAllSelected = selectedProducts.length === filteredAndSortedProducts.length && filteredAndSortedProducts.length > 0;
  const isIndeterminate = selectedProducts.length > 0 && selectedProducts.length < filteredAndSortedProducts.length;

  if (products.length === 0) {
    return (
      <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400">
          {t('admin.products.noProducts')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar onSearch={setSearchQuery} placeholder={t('admin.products.searchPlaceholder')} />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredAndSortedProducts.length} of {products.length} products
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {onSelectProduct && (
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={onSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.products.name')}
              </th>
              <th 
                className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center">
                  {t('admin.products.category')}
                  <span className="ml-1">
                    {sortBy === 'category' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </div>
              </th>
              <th 
                className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center">
                  {t('admin.products.price')}
                  <span className="ml-1">
                    {sortBy === 'price' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </div>
              </th>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('admin.products.stock')}
              </th>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('admin.products.actions')}
                </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {onSelectProduct && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => onSelectProduct(product.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}
                {/* Name + Image */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center rtl:flex-row-reverse">
                    <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden rtl:ml-4 ltr:mr-4">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={getLocalizedString(ensureLocalizedContent(product.name), 'en')}
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-gray-400">📦</span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {getLocalizedString(ensureLocalizedContent(product.name), 'en')} / {getLocalizedString(ensureLocalizedContent(product.name), 'ar')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {product.id}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {getLocalizedString(ensureLocalizedContent(product.category), 'en')} / {getLocalizedString(ensureLocalizedContent(product.category), 'ar')}
                  </div>
                </td>

                {/* Price */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Price amount={product.price} locale={isRTL ? 'ar' : 'en'} className="font-semibold text-purple-700 dark:text-purple-400" />
                </td>

                {/* Stock */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.inStock
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {product.inStock ? t('product.stock') : t('product.outOfStock')}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className={`flex space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                    <Button
                      onClick={() => onEdit(product)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      onClick={() => handleDelete(product.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedProducts.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No products found matching "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}
