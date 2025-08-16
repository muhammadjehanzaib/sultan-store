'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product, InventoryItem } from '@/types';
import Price from '@/components/ui/Price';
import { Button } from '@/components/ui/Button';

interface EnhancedInventoryDashboardProps {
  products: Product[];
  inventory: InventoryItem[];
  onAdjustStock: (productId: string) => void;
  onBulkAdjust: (productIds: string[]) => void;
  onReorderAlert: (productId: string) => void;
}

interface StockAlert {
  type: 'critical' | 'warning' | 'info';
  productId: string;
  message: string;
  count: number;
}

interface InventoryMetrics {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockItems: number;
  reorderAlerts: number;
  topMovingProducts: Array<{
    product: Product;
    velocity: number;
    daysOfStock: number;
  }>;
  stockDistribution: {
    healthy: number;
    warning: number;
    critical: number;
    overstock: number;
  };
}

export function EnhancedInventoryDashboard({
  products,
  inventory,
  onAdjustStock,
  onBulkAdjust,
  onReorderAlert,
}: EnhancedInventoryDashboardProps) {
  const { t, isRTL } = useLanguage();
  const [selectedView, setSelectedView] = useState<'overview' | 'alerts' | 'analytics' | 'forecast'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Calculate comprehensive inventory metrics
  const inventoryMetrics = useMemo((): InventoryMetrics => {
    const totalProducts = products.length;
    const totalValue = inventory.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.currentStock : 0);
    }, 0);

    const lowStockItems = inventory.filter(item => 
      item.currentStock <= item.reorderPoint && item.currentStock > 0
    ).length;

    const outOfStockItems = inventory.filter(item => item.currentStock === 0).length;

    const overstockItems = inventory.filter(item => 
      item.currentStock > item.maximumStock
    ).length;

    const reorderAlerts = inventory.filter(item => 
      item.currentStock <= item.minimumStock
    ).length;

    // Mock velocity data (in real app, this would come from sales history)
    const topMovingProducts = inventory.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return null;
      
      // Mock velocity calculation (units sold per day)
      const velocity = Math.random() * 10; // This would be real sales data
      const daysOfStock = velocity > 0 ? item.currentStock / velocity : 999;
      
      return {
        product,
        velocity,
        daysOfStock,
      };
    }).filter(Boolean).sort((a, b) => b!.velocity - a!.velocity).slice(0, 10) as Array<{
      product: Product;
      velocity: number;
      daysOfStock: number;
    }>;

    const stockDistribution = inventory.reduce((acc, item) => {
      if (item.currentStock === 0) {
        acc.critical++;
      } else if (item.currentStock <= item.reorderPoint) {
        acc.warning++;
      } else if (item.currentStock > item.maximumStock) {
        acc.overstock++;
      } else {
        acc.healthy++;
      }
      return acc;
    }, { healthy: 0, warning: 0, critical: 0, overstock: 0 });

    return {
      totalProducts,
      totalValue,
      lowStockItems,
      outOfStockItems,
      overstockItems,
      reorderAlerts,
      topMovingProducts,
      stockDistribution,
    };
  }, [products, inventory]);

  // Generate stock alerts
  const stockAlerts = useMemo((): StockAlert[] => {
    const alerts: StockAlert[] = [];

    // Critical alerts (out of stock)
    const outOfStock = inventory.filter(item => item.currentStock === 0);
    if (outOfStock.length > 0) {
      alerts.push({
        type: 'critical',
        productId: 'multiple',
        message: 'Products are out of stock',
        count: outOfStock.length,
      });
    }

    // Warning alerts (low stock)
    const lowStock = inventory.filter(item => 
      item.currentStock <= item.reorderPoint && item.currentStock > 0
    );
    if (lowStock.length > 0) {
      alerts.push({
        type: 'warning',
        productId: 'multiple',
        message: 'Products are running low on stock',
        count: lowStock.length,
      });
    }

    // Info alerts (overstock)
    const overstock = inventory.filter(item => item.currentStock > item.maximumStock);
    if (overstock.length > 0) {
      alerts.push({
        type: 'info',
        productId: 'multiple',
        message: 'Products are overstocked',
        count: overstock.length,
      });
    }

    return alerts;
  }, [inventory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(['all']);
    products.forEach(product => {
      if (typeof product.category === 'string') {
        cats.add(product.category);
      } else if (product.category && typeof product.category === 'object') {
        if ('name_en' in product.category) {
          cats.add(product.category.name_en);
        }
      }
    });
    return Array.from(cats);
  }, [products]);

  // Filter inventory by category
  const filteredInventory = useMemo(() => {
    if (selectedCategory === 'all') return inventory;
    
    return inventory.filter(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return false;
      
      if (typeof product.category === 'string') {
        return product.category === selectedCategory;
      } else if (product.category && typeof product.category === 'object' && 'name_en' in product.category) {
        return product.category.name_en === selectedCategory;
      }
      
      return false;
    });
  }, [inventory, products, selectedCategory]);

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) {
      return { status: 'Out of Stock', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', priority: 'critical' };
    } else if (item.currentStock <= item.reorderPoint) {
      return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', priority: 'warning' };
    } else if (item.currentStock > item.maximumStock) {
      return { status: 'Overstock', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', priority: 'info' };
    } else {
      return { status: 'In Stock', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', priority: 'normal' };
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 'Unknown Product';
    
    if (typeof product.name === 'string') {
      return product.name;
    } else {
      return product.name.en || product.name.ar || 'Unnamed Product';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Enhanced Inventory Management
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Real-time stock tracking, alerts, and analytics
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex">
            {(['overview', 'alerts', 'analytics', 'forecast'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-3 py-1 rounded text-sm transition-colors capitalize ${
                  selectedView === view
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Total Products
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {inventoryMetrics.totalProducts.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Inventory Value
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                <Price amount={inventoryMetrics.totalValue} locale={isRTL ? 'ar' : 'en'} />
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🚨</span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-red-500 dark:text-red-400 truncate">
                Out of Stock
              </p>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                {inventoryMetrics.outOfStockItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-yellow-500 dark:text-yellow-400 truncate">
                Low Stock
              </p>
              <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                {inventoryMetrics.lowStockItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-purple-500 dark:text-purple-400 truncate">
                Overstock
              </p>
              <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                {inventoryMetrics.overstockItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🔔</span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-500 dark:text-blue-400 truncate">
                Reorder Alerts
              </p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {inventoryMetrics.reorderAlerts}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* View-specific Content */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📊 Stock Distribution
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Healthy Stock', count: inventoryMetrics.stockDistribution.healthy, color: 'bg-green-500' },
                { label: 'Low Stock Warning', count: inventoryMetrics.stockDistribution.warning, color: 'bg-yellow-500' },
                { label: 'Out of Stock', count: inventoryMetrics.stockDistribution.critical, color: 'bg-red-500' },
                { label: 'Overstock', count: inventoryMetrics.stockDistribution.overstock, color: 'bg-purple-500' },
              ].map((item) => {
                const total = Object.values(inventoryMetrics.stockDistribution).reduce((sum, val) => sum + val, 0);
                const percentage = total > 0 ? (item.count / total) * 100 : 0;
                
                return (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded ${item.color} mr-3`}></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                        {item.count}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Moving Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🚀 Fast Moving Products
            </h3>
            <div className="space-y-3">
              {inventoryMetrics.topMovingProducts.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">#{index + 1}</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getProductName(item.product.id)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.daysOfStock.toFixed(0)} days of stock left
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.velocity.toFixed(1)} units/day
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedView === 'alerts' && (
        <div className="space-y-4">
          {/* Stock Alerts Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stockAlerts.map((alert, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 border ${
                  alert.type === 'critical' 
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                    : alert.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                    : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                }`}
              >
                <div className="flex items-center">
                  <span className={`text-2xl mr-3 ${
                    alert.type === 'critical' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'
                  }`}>
                    {alert.type === 'critical' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                  </span>
                  <div>
                    <p className={`font-semibold ${
                      alert.type === 'critical' 
                        ? 'text-red-800 dark:text-red-200' 
                        : alert.type === 'warning'
                        ? 'text-yellow-800 dark:text-yellow-200'
                        : 'text-blue-800 dark:text-blue-200'
                    }`}>
                      {alert.count} {alert.message}
                    </p>
                    <p className={`text-sm ${
                      alert.type === 'critical' 
                        ? 'text-red-600 dark:text-red-300' 
                        : alert.type === 'warning'
                        ? 'text-yellow-600 dark:text-yellow-300'
                        : 'text-blue-600 dark:text-blue-300'
                    }`}>
                      Requires immediate attention
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Alert List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🔍 Detailed Stock Alerts
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {filteredInventory
                  .filter(item => {
                    const status = getStockStatus(item);
                    return status.priority === 'critical' || status.priority === 'warning';
                  })
                  .sort((a, b) => {
                    const statusA = getStockStatus(a);
                    const statusB = getStockStatus(b);
                    if (statusA.priority === 'critical' && statusB.priority !== 'critical') return -1;
                    if (statusA.priority !== 'critical' && statusB.priority === 'critical') return 1;
                    return a.currentStock - b.currentStock;
                  })
                  .map((item) => {
                    const product = products.find(p => p.id === item.productId);
                    const status = getStockStatus(item);
                    
                    return (
                      <div key={item.productId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 w-3 h-3 rounded-full mr-3 ${
                            status.priority === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {getProductName(item.productId)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Current Stock: {item.currentStock} | Reorder Point: {item.reorderPoint}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                            {status.status}
                          </span>
                          <Button
                            onClick={() => onAdjustStock(item.productId)}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Adjust Stock
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inventory Turnover */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📊 Inventory Analytics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Average Stock Value</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  <Price amount={inventoryMetrics.totalValue / Math.max(inventoryMetrics.totalProducts, 1)} locale={isRTL ? 'ar' : 'en'} />
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Stock Coverage Ratio</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {((inventoryMetrics.stockDistribution.healthy / Math.max(inventoryMetrics.totalProducts, 1)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Products Needing Attention</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {inventoryMetrics.outOfStockItems + inventoryMetrics.lowStockItems}
                </span>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📦 Category Breakdown
            </h3>
            <div className="space-y-3">
              {categories.slice(1).map((category) => {
                const categoryProducts = products.filter(product => {
                  if (typeof product.category === 'string') {
                    return product.category === category;
                  } else if (product.category && typeof product.category === 'object' && 'name_en' in product.category) {
                    return product.category.name_en === category;
                  }
                  return false;
                });
                
                const categoryInventory = inventory.filter(item =>
                  categoryProducts.some(p => p.id === item.productId)
                );
                
                const categoryValue = categoryInventory.reduce((sum, item) => {
                  const product = categoryProducts.find(p => p.id === item.productId);
                  return sum + (product ? product.price * item.currentStock : 0);
                }, 0);
                
                const percentage = inventoryMetrics.totalValue > 0 ? (categoryValue / inventoryMetrics.totalValue) * 100 : 0;
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        ({categoryProducts.length} products)
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        <Price amount={categoryValue} locale={isRTL ? 'ar' : 'en'} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedView === 'forecast' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🔮 Inventory Forecasting & Recommendations
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Reorder Recommendations</h4>
              <div className="space-y-3">
                {filteredInventory
                  .filter(item => item.currentStock <= item.reorderPoint)
                  .slice(0, 5)
                  .map((item) => {
                    const product = products.find(p => p.id === item.productId);
                    const recommendedOrder = Math.max(item.maximumStock - item.currentStock, item.reorderPoint);
                    
                    return (
                      <div key={item.productId} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {getProductName(item.productId)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Current: {item.currentStock} | Recommended Order: {recommendedOrder}
                            </p>
                          </div>
                          <Button
                            onClick={() => onReorderAlert(item.productId)}
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                          >
                            Create Order
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Overstock Recommendations</h4>
              <div className="space-y-3">
                {filteredInventory
                  .filter(item => item.currentStock > item.maximumStock)
                  .slice(0, 5)
                  .map((item) => {
                    const overstock = item.currentStock - item.maximumStock;
                    
                    return (
                      <div key={item.productId} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {getProductName(item.productId)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Excess: {overstock} units | Consider promotional pricing
                            </p>
                          </div>
                          <Button
                            onClick={() => onAdjustStock(item.productId)}
                            variant="outline"
                            size="sm"
                            className="text-purple-600 hover:text-purple-700"
                          >
                            Adjust
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
