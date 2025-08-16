'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product, Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { SearchBar } from './SearchBar';
import Price from '@/components/ui/Price';

interface EnhancedProductsTableProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onToggleStock: (productId: string, inStock: boolean) => void;
  onDuplicate?: (product: Product) => void;
  selectedProducts: string[];
  onSelectProduct: (productId: string) => void;
  onSelectAll: () => void;
}

interface FilterState {
  search: string;
  category: string;
  stockStatus: 'all' | 'inStock' | 'outOfStock' | 'lowStock';
  priceRange: { min: number; max: number };
  productType: 'all' | 'simple' | 'variable';
  sortBy: 'name' | 'price' | 'category' | 'stock' | 'variants';
  sortOrder: 'asc' | 'desc';
}

export const EnhancedProductsTable: React.FC<EnhancedProductsTableProps> = ({
  products,
  categories,
  onEdit,
  onDelete,
  onToggleStock,
  onDuplicate,
  selectedProducts,
  onSelectProduct,
  onSelectAll,
}) => {
  const { t, isRTL } = useLanguage();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    stockStatus: 'all',
    priceRange: { min: 0, max: 10000 },
    productType: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showFilters, setShowFilters] = useState(false);

  // Helper functions - defined before useMemo
  const getProductName = (product: Product): string => {
    if (typeof product.name === 'string') return product.name;
    return product.name?.en || product.name_en || 'Unnamed Product';
  };

  const getCategoryName = (product: Product): string => {
    if (typeof product.category === 'string') return product.category;
    if (product.category && typeof product.category === 'object') {
      // Handle { name_en: string; name_ar: string; slug: string } type
      if ('name_en' in product.category) {
        return product.category.name_en;
      }
      // Handle LocalizedContent type
      if ('en' in product.category) {
        return product.category.en;
      }
    }
    return 'Uncategorized';
  };

  const hasLowStock = (product: Product): boolean => {
    return product.variants?.some(v => (v.stockQuantity || 0) < 5) || false;
  };

  // Calculate price range from products
  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 };
    const prices = products.map(p => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  // Filtered and sorted products
  const processedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search filter
      const searchMatch = !filters.search || 
        getProductName(product).toLowerCase().includes(filters.search.toLowerCase()) ||
        getCategoryName(product).toLowerCase().includes(filters.search.toLowerCase()) ||
        product.id.toLowerCase().includes(filters.search.toLowerCase());

      // Category filter
      const categoryMatch = filters.category === 'all' || 
        getCategoryName(product) === filters.category;

      // Stock status filter
      let stockMatch = true;
      if (filters.stockStatus === 'inStock') stockMatch = product.inStock === true;
      else if (filters.stockStatus === 'outOfStock') stockMatch = product.inStock !== true;
      else if (filters.stockStatus === 'lowStock') {
        stockMatch = product.inStock === true && hasLowStock(product);
      }

      // Price range filter
      const priceMatch = product.price >= filters.priceRange.min && 
                        product.price <= filters.priceRange.max;

      // Product type filter
      let typeMatch = true;
      if (filters.productType === 'simple') {
        typeMatch = !product.variants || product.variants.length <= 1;
      } else if (filters.productType === 'variable') {
        typeMatch = Boolean(product.variants && product.variants.length > 1);
      }

      return searchMatch && categoryMatch && stockMatch && priceMatch && typeMatch;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = getProductName(a).toLowerCase();
          bValue = getProductName(b).toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'category':
          aValue = getCategoryName(a).toLowerCase();
          bValue = getCategoryName(b).toLowerCase();
          break;
        case 'stock':
          aValue = a.inStock ? 1 : 0;
          bValue = b.inStock ? 1 : 0;
          break;
        case 'variants':
          aValue = a.variants?.length || 0;
          bValue = b.variants?.length || 0;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (filters.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [products, filters]);

  const handleSort = (column: FilterState['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      stockStatus: 'all',
      priceRange: { min: priceRange.min, max: priceRange.max },
      productType: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      onDelete(productId);
    }
  };

  const isAllSelected = selectedProducts.length === processedProducts.length && processedProducts.length > 0;
  const isIndeterminate = selectedProducts.length > 0 && selectedProducts.length < processedProducts.length;

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="text-6xl mb-4">📦</div>
        <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">No products found</p>
        <p className="text-gray-400 dark:text-gray-500">Start by adding your first product!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      {/* Header with Controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search and Filters */}
          <div className="flex-1 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex-1 max-w-md">
              <SearchBar 
                onSearch={(query) => setFilters(prev => ({ ...prev, search: query }))}
                placeholder="Search products, categories, or IDs..."
                value={filters.search}
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className={`${showFilters ? 'bg-blue-50 text-blue-600' : ''} whitespace-nowrap`}
            >
              🔍 Filters {showFilters ? '▲' : '▼'}
            </Button>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center text-sm text-gray-500">
              {processedProducts.length} of {products.length} products
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                    : 'text-gray-500'
                }`}
              >
                📋 Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                    : 'text-gray-500'
                }`}
              >
                ⊞ Grid
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name_en || cat.name}>
                      {cat.name_en || cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock Status
                </label>
                <select
                  value={filters.stockStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, stockStatus: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                >
                  <option value="all">All Stock</option>
                  <option value="inStock">In Stock</option>
                  <option value="outOfStock">Out of Stock</option>
                  <option value="lowStock">Low Stock</option>
                </select>
              </div>

              {/* Product Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Type
                </label>
                <select
                  value={filters.productType}
                  onChange={(e) => setFilters(prev => ({ ...prev, productType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                >
                  <option value="all">All Types</option>
                  <option value="simple">Simple Products</option>
                  <option value="variable">Variable Products</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      priceRange: { ...prev.priceRange, min: Number(e.target.value) || 0 }
                    }))}
                    className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      priceRange: { ...prev.priceRange, max: Number(e.target.value) || 10000 }
                    }))}
                    className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  size="sm"
                  className="w-full text-gray-600 hover:text-gray-700"
                >
                  🔄 Reset
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
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
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('name')}
                >
                  Product {filters.sortBy === 'name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('category')}
                >
                  Category {filters.sortBy === 'category' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('price')}
                >
                  Price {filters.sortBy === 'price' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('stock')}
                >
                  Stock {filters.sortBy === 'stock' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('variants')}
                >
                  Type {filters.sortBy === 'variants' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {processedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => onSelectProduct(product.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  
                  {/* Product Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden mr-4">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={getProductName(product)}
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-gray-400">📦</span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white max-w-[200px] truncate">
                          {getProductName(product)}
                        </div>
                        <div className="text-xs text-gray-500">ID: {product.id}</div>
                        {hasLowStock(product) && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 mt-1">
                            Low Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {getCategoryName(product)}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Price 
                      amount={product.price} 
                      locale={isRTL ? 'ar' : 'en'} 
                      className="font-semibold text-purple-700 dark:text-purple-400" 
                    />
                  </td>

                  {/* Stock Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.inStock
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>

                  {/* Product Type */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {product.variants && product.variants.length > 1 
                        ? `Variable (${product.variants.length})`
                        : 'Simple'
                      }
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => onEdit(product)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => onToggleStock(product.id, !product.inStock)}
                        variant="outline"
                        size="sm"
                        className={product.inStock 
                          ? "text-yellow-600 hover:text-yellow-700" 
                          : "text-green-600 hover:text-green-700"
                        }
                      >
                        {product.inStock ? 'Disable' : 'Enable'}
                      </Button>
                      {onDuplicate && (
                        <Button
                          onClick={() => onDuplicate(product)}
                          variant="outline"
                          size="sm"
                          className="text-purple-600 hover:text-purple-700"
                        >
                          Duplicate
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDelete(product.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Grid View
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {processedProducts.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="relative">
                  <div className="h-48 w-full bg-gray-200 dark:bg-gray-600 rounded-t-lg flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={getProductName(product)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl text-gray-400">📦</span>
                    )}
                  </div>
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => onSelectProduct(product.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.inStock
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {getProductName(product)}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{getCategoryName(product)}</p>
                  <div className="mt-2">
                    <Price 
                      amount={product.price} 
                      locale={isRTL ? 'ar' : 'en'} 
                      className="text-lg font-bold text-purple-700 dark:text-purple-400" 
                    />
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">
                      {product.variants && product.variants.length > 1 
                        ? `${product.variants.length} variants`
                        : 'Simple product'
                      }
                    </span>
                    {hasLowStock(product) && (
                      <span className="text-xs text-yellow-600 font-medium">Low Stock</span>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-1 mt-3">
                    <Button
                      onClick={() => onEdit(product)}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-blue-600"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(product.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                    >
                      🗑
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {processedProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">No products found</p>
          <p className="text-gray-400 dark:text-gray-500 mb-4">
            Try adjusting your filters or search terms
          </p>
          <Button onClick={resetFilters} variant="outline">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};
