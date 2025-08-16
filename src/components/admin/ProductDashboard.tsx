'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import Price from '@/components/ui/Price';
import { Product, Category } from '@/types';

interface ProductDashboard {
  products: Product[];
  categories: Category[];
  onAddProduct: () => void;
  onImportProducts: () => void;
  onExportProducts: () => void;
}

interface ProductAnalytics {
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalValue: number;
  averagePrice: number;
  topCategory: { name: string; count: number } | null;
  recentlyAdded: Product[];
  topPriced: Product[];
  categoryDistribution: { category: string; count: number; value: number }[];
  stockAlerts: Product[];
  variantProducts: number;
  simpleProducts: number;
}

export const ProductDashboard: React.FC<ProductDashboard> = ({
  products,
  categories,
  onAddProduct,
  onImportProducts,
  onExportProducts,
}) => {
  const { t, isRTL } = useLanguage();
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Calculate analytics
  useEffect(() => {
    if (!products.length) {
      setAnalytics(null);
      return;
    }

    const totalProducts = products.length;
    const inStockProducts = products.filter(p => p.inStock).length;
    const outOfStockProducts = totalProducts - inStockProducts;
    const lowStockProducts = products.filter(p => p.inStock && (p.variants?.some(v => (v.stockQuantity || 0) < 5) || false)).length;
    
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);
    const averagePrice = totalValue / totalProducts;

    // Category distribution
    const categoryMap = new Map();
    products.forEach(product => {
      let categoryName = 'Uncategorized';
      if (typeof product.category === 'string') {
        categoryName = product.category;
      } else if (product.category && typeof product.category === 'object') {
        if ('name_en' in product.category) {
          categoryName = product.category.name_en;
        } else if ('en' in product.category) {
          categoryName = product.category.en;
        }
      }
      
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, { count: 0, value: 0 });
      }
      const current = categoryMap.get(categoryName);
      current.count += 1;
      current.value += product.price;
    });

    const categoryDistribution = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.count - a.count);

    const topCategory = categoryDistribution.length > 0 
      ? { name: categoryDistribution[0].category, count: categoryDistribution[0].count }
      : null;

    // Recently added (mock - would need createdAt field)
    const recentlyAdded = products.slice(-5).reverse();

    // Top priced products
    const topPriced = [...products]
      .sort((a, b) => b.price - a.price)
      .slice(0, 5);

    // Stock alerts (products with low stock)
    const stockAlerts = products.filter(p => 
      p.inStock && p.variants?.some(v => (v.stockQuantity || 0) < 5)
    ).slice(0, 10);

    // Product types
    const variantProducts = products.filter(p => p.variants && p.variants.length > 1).length;
    const simpleProducts = totalProducts - variantProducts;

    setAnalytics({
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      lowStockProducts,
      totalValue,
      averagePrice,
      topCategory,
      recentlyAdded,
      topPriced,
      categoryDistribution,
      stockAlerts,
      variantProducts,
      simpleProducts,
    });
  }, [products]);

  if (!analytics) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-500 dark:text-gray-400">Loading product analytics...</p>
      </div>
    );
  }

  const getProductName = (product: Product): string => {
    if (typeof product.name === 'string') return product.name;
    return product.name.en || product.name_en || 'Unnamed Product';
  };

  const getCategoryName = (product: Product): string => {
    if (typeof product.category === 'string') return product.category;
    if (product.category && typeof product.category === 'object') {
      if ('name_en' in product.category) {
        return product.category.name_en;
      } else if ('en' in product.category) {
        return product.category.en;
      }
    }
    return 'Uncategorized';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📊 Product Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Comprehensive insights into your product catalog
          </p>
        </div>
        <div className={`flex flex-wrap gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button onClick={onImportProducts} variant="outline" className="text-blue-600">
            📥 Import Products
          </Button>
          <Button onClick={onExportProducts} variant="outline" className="text-green-600">
            📤 Export Products
          </Button>
          <Button onClick={onAddProduct} className="bg-blue-600 hover:bg-blue-700">
            ➕ Add New Product
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
          {['7d', '30d', '90d', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range as any)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedTimeRange === range
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : 
               range === '30d' ? 'Last 30 Days' :
               range === '90d' ? 'Last 90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-3xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalProducts}</p>
            </div>
          </div>
        </div>

        {/* In Stock */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-3xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Stock</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{analytics.inStockProducts}</p>
              <p className="text-sm text-gray-500">
                {((analytics.inStockProducts / analytics.totalProducts) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <span className="text-3xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{analytics.outOfStockProducts}</p>
              <p className="text-sm text-gray-500">
                {((analytics.outOfStockProducts / analytics.totalProducts) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Total Value */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span className="text-3xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                <Price amount={analytics.totalValue} locale={isRTL ? 'ar' : 'en'} />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Price */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">💵 Average Price</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            <Price amount={analytics.averagePrice} locale={isRTL ? 'ar' : 'en'} />
          </p>
        </div>

        {/* Product Types */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">🔧 Product Types</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Simple Products</span>
              <span className="font-semibold">{analytics.simpleProducts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Variable Products</span>
              <span className="font-semibold">{analytics.variantProducts}</span>
            </div>
          </div>
        </div>

        {/* Top Category */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">🏆 Top Category</h3>
          {analytics.topCategory ? (
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{analytics.topCategory.name}</p>
              <p className="text-gray-600 dark:text-gray-300">{analytics.topCategory.count} products</p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No data available</p>
          )}
        </div>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Category Distribution</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {analytics.categoryDistribution.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500" style={{
                    backgroundColor: `hsl(${(index * 137) % 360}, 70%, 50%)`
                  }}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.count} products
                  </div>
                  <div className="text-xs text-gray-500">
                    <Price amount={item.value} locale={isRTL ? 'ar' : 'en'} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Priced Products */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💎 Highest Priced Products</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {analytics.topPriced.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    {product.image ? (
                      <img src={product.image} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-gray-400">📦</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                      {getProductName(product)}
                    </p>
                    <p className="text-xs text-gray-500">{getCategoryName(product)}</p>
                  </div>
                </div>
                <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  <Price amount={product.price} locale={isRTL ? 'ar' : 'en'} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      {analytics.stockAlerts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⚠️ Stock Alerts</h3>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
              {analytics.stockAlerts.length} products have low stock levels
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {analytics.stockAlerts.map((product) => (
                <div key={product.id} className="flex justify-between items-center text-sm">
                  <span className="text-yellow-800 dark:text-yellow-200">{getProductName(product)}</span>
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                    Low Stock
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🚀 Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onAddProduct}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">➕</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Add Product</p>
                <p className="text-sm text-gray-500">Create a new product</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={onImportProducts}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📥</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Import Products</p>
                <p className="text-sm text-gray-500">Bulk import from CSV/Excel</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={onExportProducts}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📤</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Export Products</p>
                <p className="text-sm text-gray-500">Download product data</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
