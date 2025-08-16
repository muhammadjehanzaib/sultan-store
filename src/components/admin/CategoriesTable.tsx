'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Category, MultilingualCategory } from '@/types';
import { getLocalizedString, ensureLocalizedContent } from '@/lib/multilingualUtils';
import { Button } from '@/components/ui/Button';
import { SearchBar } from './SearchBar';

interface CategoriesTableProps {
  categories: MultilingualCategory[];
  onEdit: (category: MultilingualCategory) => void;
  onDelete: (categoryId: string) => void;
  onToggleActive?: (categoryId: string, isActive: boolean) => void;
  selectedCategories?: string[];
  onSelectCategory?: (categoryId: string) => void;
  onSelectAll?: () => void;
}

export function CategoriesTable({ 
  categories, 
  onEdit, 
  onDelete, 
  onToggleActive,
  selectedCategories = [], 
  onSelectCategory, 
  onSelectAll 
}: CategoriesTableProps) {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'id' | 'sortOrder'>('sortOrder');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Helper function to get category icons
  const getCategoryIcon = (categoryId: string): string => {
    switch (categoryId.toLowerCase()) {
      case 'electronics':
        return '📱';
      case 'fashion':
        return '👕';
      case 'home':
        return '🏠';
      case 'sports':
        return '⚽';
      case 'books':
        return '📚';
      case 'beauty':
        return '💄';
      case 'toys':
        return '🧸';
      case 'automotive':
        return '🚗';
      case 'food':
        return '🍽️';
      case 'health':
        return '🏥';
      case 'arts':
        return '🎨';
      case 'gaming':
        return '🎮';
      case 'technology':
        return '📱';
      case 'baby':
        return '👶';
      case 'pets':
        return '🐕';
      case 'fitness':
        return '🏃';
      case 'music':
        return '🎵';
      case 'movies':
        return '🎬';
      case 'tools':
        return '🛠️';
      case 'garden':
        return '🌱';
      default:
        return '🏷️';
    }
  };

  // Filter and sort categories
  const filteredAndSortedCategories = categories
    .filter((category) => {
      const nameEn = getLocalizedString(category.name, 'en').toLowerCase();
      const nameAr = getLocalizedString(category.name, 'ar').toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      return nameEn.includes(searchLower) || nameAr.includes(searchLower) || category.id.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = getLocalizedString(a.name, 'en').toLowerCase();
          bValue = getLocalizedString(b.name, 'en').toLowerCase();
          break;
        case 'id':
          aValue = a.id.toLowerCase();
          bValue = b.id.toLowerCase();
          break;
        case 'sortOrder':
        default:
          aValue = a.sortOrder || 0;
          bValue = b.sortOrder || 0;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (column: 'name' | 'id' | 'sortOrder') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleDelete = (categoryId: string) => {
    if (confirm(t('admin.categories.deleteConfirm'))) {
      onDelete(categoryId);
    }
  };

  const isAllSelected = selectedCategories.length === filteredAndSortedCategories.length && filteredAndSortedCategories.length > 0;
  const isIndeterminate = selectedCategories.length > 0 && selectedCategories.length < filteredAndSortedCategories.length;

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400">
          {t('admin.categories.noCategories')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar onSearch={setSearchQuery} placeholder={t('admin.categories.searchPlaceholder')} />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredAndSortedCategories.length} of {categories.length} categories
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {onSelectCategory && (
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
                {t('admin.categories.icon')}
              </th>
              <th 
                className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                {t('admin.categories.name')}
                  <span className="ml-1">
                    {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </div>
              </th>
              <th 
                className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center">
                  {t('admin.categories.id')}
                  <span className="ml-1">
                    {sortBy === 'id' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </div>
              </th>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('admin.categories.slug')}
              </th>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                Status
              </th>
              <th 
                className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
                onClick={() => handleSort('sortOrder')}
              >
                <div className="flex items-center">
                  Sort Order
                  <span className="ml-1">
                    {sortBy === 'sortOrder' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </div>
              </th>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('admin.categories.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedCategories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {onSelectCategory && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => onSelectCategory(category.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-2xl">
                    {category.icon || getCategoryIcon(category.id)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {getLocalizedString(category.name, 'en')} / {getLocalizedString(category.name, 'ar')}
                  </div>
                  {category.description && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {getLocalizedString(category.description, 'en')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white font-mono">
                    {category.id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    /{category.slug}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      category.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {category.sortOrder || 0}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className={`flex space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                    <Button
                      onClick={() => onEdit(category)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {t('common.edit')}
                    </Button>
                    {onToggleActive && (
                      <Button
                        onClick={() => onToggleActive(category.id, !category.isActive)}
                        variant="outline"
                        size="sm"
                        className={category.isActive 
                          ? "text-yellow-600 hover:text-yellow-700" 
                          : "text-green-600 hover:text-green-700"
                        }
                      >
                        {category.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(category.id)}
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

      {filteredAndSortedCategories.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No categories found matching "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}
