'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { SearchBar } from './SearchBar';
import { getLocalizedString, ensureLocalizedContent } from '@/lib/multilingualUtils';

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
}

export function ProductsTable({ products, onEdit, onDelete }: ProductsTableProps) {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((product) => {
    const name = ensureLocalizedContent(product.name);
    return name.en.toLowerCase().includes(searchQuery.toLowerCase()) || 
           name.ar.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
      <div className="p-4">
        <SearchBar onSearch={setSearchQuery} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['name', 'category', 'price', 'stock', 'actions'].map((key) => (
                <th
                  key={key}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                >
                  {t(`admin.products.${key}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {/* Name + Image */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center rtl:flex-row-reverse">
                    <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden rtl:ml-4 ltr:mr-4">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-gray-400">📦</span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {getLocalizedString(product.name, 'en')} / {getLocalizedString(product.name, 'ar')}
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
                    {getLocalizedString(product.category, 'en')} / {getLocalizedString(product.category, 'ar')}
                  </div>
                </td>

                {/* Price */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    ${product.price.toFixed(2)}
                  </div>
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
                      onClick={() => onDelete(product.id)}
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
    </div>
  );
}
