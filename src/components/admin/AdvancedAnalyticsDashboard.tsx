'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order, Product, Customer } from '@/types';
import Price from '@/components/ui/Price';
import { Button } from '@/components/ui/Button';

interface AdvancedAnalyticsDashboardProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
}

interface TimeRange {
  label: string;
  days: number;
  key: string;
}

interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
}

export function AdvancedAnalyticsDashboard({
  orders,
  products,
  customers,
}: AdvancedAnalyticsDashboardProps) {
  const { t, isRTL } = useLanguage();
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30d');
  const [selectedView, setSelectedView] = useState<'overview' | 'sales' | 'products' | 'customers'>('overview');

  const timeRanges: TimeRange[] = [
    { label: 'Last 7 days', days: 7, key: '7d' },
    { label: 'Last 30 days', days: 30, key: '30d' },
    { label: 'Last 3 months', days: 90, key: '3m' },
    { label: 'Last 6 months', days: 180, key: '6m' },
    { label: 'Last year', days: 365, key: '1y' },
  ];

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    const currentTimeRange = timeRanges.find(tr => tr.key === selectedTimeRange);
    if (!currentTimeRange) return { orders: [], customers: [] };

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - currentTimeRange.days);

    const filteredOrders = orders.filter(order => new Date(order.createdAt) >= cutoffDate);
    const filteredCustomers = customers.filter(customer => new Date(customer.createdAt) >= cutoffDate);

    return {
      orders: filteredOrders,
      customers: filteredCustomers,
    };
  }, [orders, customers, selectedTimeRange]);

  // Calculate comprehensive metrics
  const analytics = useMemo(() => {
    const { orders: periodOrders } = filteredData;
    
    // Basic metrics
    const totalRevenue = periodOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = periodOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalCustomers = customers.length;
    const newCustomers = filteredData.customers.length;

    // Advanced metrics
    const completedOrders = periodOrders.filter(o => o.status === 'delivered');
    const cancelledOrders = periodOrders.filter(o => o.status === 'cancelled');
    const conversionRate = totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0;
    const cancellationRate = totalOrders > 0 ? (cancelledOrders.length / totalOrders) * 100 : 0;

    // Revenue breakdown
    const productRevenue = periodOrders.reduce((acc, order) => {
      order.items.forEach(item => {
        const productId = item.product.id;
        if (!acc[productId]) {
          acc[productId] = { product: item.product, revenue: 0, quantity: 0, orders: 0 };
        }
        acc[productId].revenue += item.total;
        acc[productId].quantity += item.quantity;
        acc[productId].orders++;
      });
      return acc;
    }, {} as Record<string, { product: Product; revenue: number; quantity: number; orders: number }>);

    // Top products by revenue
    const topProductsByRevenue = Object.values(productRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Top products by quantity
    const topProductsByQuantity = Object.values(productRevenue)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Customer analytics
    const customerOrderFrequency = customers.reduce((acc, customer) => {
      const orders = customer.totalOrders;
      if (orders === 0) acc.noOrders++;
      else if (orders === 1) acc.oneOrder++;
      else if (orders <= 3) acc.twoToThree++;
      else if (orders <= 10) acc.fourToTen++;
      else acc.moreThanTen++;
      return acc;
    }, { noOrders: 0, oneOrder: 0, twoToThree: 0, fourToTen: 0, moreThanTen: 0 });

    // Order status distribution
    const orderStatusDistribution = periodOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Daily sales trend (last 30 days for trend)
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(order => 
        order.createdAt.toString().split('T')[0] === dateStr
      );
      
      last30Days.push({
        date: dateStr,
        revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
        orders: dayOrders.length,
        label: date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
      });
    }

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalCustomers,
      newCustomers,
      conversionRate,
      cancellationRate,
      completedOrders: completedOrders.length,
      topProductsByRevenue,
      topProductsByQuantity,
      customerOrderFrequency,
      orderStatusDistribution,
      last30Days,
    };
  }, [filteredData, customers, orders, isRTL]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Key metrics cards
  const metricCards: MetricCard[] = [
    {
      title: 'Total Revenue',
      value: analytics.totalRevenue,
      icon: '💰',
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: analytics.totalOrders.toLocaleString(),
      icon: '📋',
      color: 'bg-blue-500',
    },
    {
      title: 'Average Order Value',
      value: analytics.averageOrderValue,
      icon: '📊',
      color: 'bg-purple-500',
    },
    {
      title: 'New Customers',
      value: analytics.newCustomers.toLocaleString(),
      icon: '👥',
      color: 'bg-indigo-500',
    },
    {
      title: 'Conversion Rate',
      value: `${analytics.conversionRate.toFixed(1)}%`,
      icon: '📈',
      color: 'bg-emerald-500',
    },
    {
      title: 'Completed Orders',
      value: analytics.completedOrders.toLocaleString(),
      icon: '✅',
      color: 'bg-teal-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Advanced Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive business insights and performance metrics
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {timeRanges.map(range => (
              <option key={range.key} value={range.key}>{range.label}</option>
            ))}
          </select>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex">
            {(['overview', 'sales', 'products', 'customers'] as const).map((view) => (
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

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metricCards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {card.title}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {typeof card.value === 'number' && card.title.includes('Revenue') || card.title.includes('Value') ? (
                    <Price amount={card.value as number} locale={isRTL ? 'ar' : 'en'} />
                  ) : (
                    card.value
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View-specific Content */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend Chart Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📈 Sales Trend (Last 30 Days)
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <div className="text-gray-400 mb-2">📊</div>
                <p className="text-gray-500 dark:text-gray-400">Chart visualization</p>
                <p className="text-sm text-gray-400">Revenue: <Price amount={analytics.last30Days.reduce((sum, day) => sum + day.revenue, 0)} locale={isRTL ? 'ar' : 'en'} /></p>
              </div>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📋 Order Status Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.orderStatusDistribution).map(([status, count]) => {
                const percentage = analytics.totalOrders > 0 ? (count / analytics.totalOrders) * 100 : 0;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        status === 'shipped' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {status}
                      </span>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">{count}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            status === 'delivered' ? 'bg-green-500' :
                            status === 'processing' ? 'bg-blue-500' :
                            status === 'shipped' ? 'bg-yellow-500' :
                            status === 'cancelled' ? 'bg-red-500' :
                            'bg-gray-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedView === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products by Revenue */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💰 Top Products by Revenue
            </h3>
            <div className="space-y-3">
              {analytics.topProductsByRevenue.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">#{index + 1}</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {(() => {
                          const product = item.product;
                          if (!product) return 'Unknown Product';
                          
                          // Handle different name formats
                          if (typeof product.name === 'string') {
                            return product.name;
                          } else if (product.name && typeof product.name === 'object') {
                            return product.name.en || product.name.ar || 'Unknown Product';
                          } else if (product.name_en || product.name_ar) {
                            return product.name_en || product.name_ar;
                          }
                          
                          return 'Unknown Product';
                        })()
                        }
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.quantity} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      <Price amount={item.revenue} locale={isRTL ? 'ar' : 'en'} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products by Quantity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📦 Top Products by Quantity
            </h3>
            <div className="space-y-3">
              {analytics.topProductsByQuantity.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">#{index + 1}</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {(() => {
                          const product = item.product;
                          if (!product) return 'Unknown Product';
                          
                          // Handle different name formats
                          if (typeof product.name === 'string') {
                            return product.name;
                          } else if (product.name && typeof product.name === 'object') {
                            return product.name.en || product.name.ar || 'Unknown Product';
                          } else if (product.name_en || product.name_ar) {
                            return product.name_en || product.name_ar;
                          }
                          
                          return 'Unknown Product';
                        })()
                        }
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <Price amount={item.revenue} locale={isRTL ? 'ar' : 'en'} /> revenue
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.quantity} units
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedView === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Order Frequency */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              👥 Customer Order Frequency
            </h3>
            <div className="space-y-4">
              {[
                { label: 'No Orders', value: analytics.customerOrderFrequency.noOrders, color: 'bg-gray-500' },
                { label: '1 Order', value: analytics.customerOrderFrequency.oneOrder, color: 'bg-red-500' },
                { label: '2-3 Orders', value: analytics.customerOrderFrequency.twoToThree, color: 'bg-yellow-500' },
                { label: '4-10 Orders', value: analytics.customerOrderFrequency.fourToTen, color: 'bg-blue-500' },
                { label: '10+ Orders', value: analytics.customerOrderFrequency.moreThanTen, color: 'bg-green-500' },
              ].map((segment) => {
                const percentage = analytics.totalCustomers > 0 ? (segment.value / analytics.totalCustomers) * 100 : 0;
                return (
                  <div key={segment.label} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded ${segment.color} mr-3`}></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{segment.label}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                        {segment.value}
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

          {/* Customer Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📊 Customer Insights
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Total Customers</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {analytics.totalCustomers.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">New Customers (Period)</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {analytics.newCustomers.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Average Customer Value</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  <Price 
                    amount={customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0} 
                    locale={isRTL ? 'ar' : 'en'} 
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'sales' && (
        <div className="grid grid-cols-1 gap-6">
          {/* Daily Sales Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📈 Daily Sales Breakdown (Last 30 Days)
            </h3>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-15 gap-2 min-w-full">
                {analytics.last30Days.slice(-15).map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {day.label}
                    </div>
                    <div 
                      className="bg-blue-500 rounded-t mx-auto"
                      style={{
                        height: `${Math.max(20, (day.revenue / Math.max(...analytics.last30Days.map(d => d.revenue))) * 100)}px`,
                        width: '20px'
                      }}
                    ></div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      {day.orders}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <Price amount={day.revenue} locale={isRTL ? 'ar' : 'en'} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              Hover over bars to see detailed daily metrics
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
