'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import Price from '@/components/ui/Price';
import { Order, Customer } from '@/types';

interface OrderDashboardProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onExportOrders: () => void;
}

interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  todayOrders: number;
  todayRevenue: number;
  weeklyOrders: number;
  weeklyRevenue: number;
  monthlyOrders: number;
  monthlyRevenue: number;
  topCustomers: { customer: string; email: string; orders: number; revenue: number }[];
  recentOrders: Order[];
  statusDistribution: { status: string; count: number; percentage: number }[];
  dailyStats: { date: string; orders: number; revenue: number }[];
  paymentMethods: { method: string; count: number; percentage: number }[];
  urgentOrders: Order[];
}

export const OrderDashboard: React.FC<OrderDashboardProps> = ({
  orders,
  onViewOrder,
  onUpdateStatus,
  onExportOrders,
}) => {
  const { t, isRTL } = useLanguage();
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [refreshKey, setRefreshKey] = useState(0);

  // Calculate analytics data
  useEffect(() => {
    if (!orders.length) {
      setAnalytics(null);
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filter orders by time range
    let filteredOrders = orders;
    if (selectedTimeRange !== 'all') {
      const cutoffDate = selectedTimeRange === '7d' ? weekAgo : 
                        selectedTimeRange === '30d' ? monthAgo :
                        new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      filteredOrders = orders.filter(order => new Date(order.createdAt) >= cutoffDate);
    }

    // Basic metrics
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalRevenue / totalOrders || 0;

    // Status counts
    const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;
    const processingOrders = filteredOrders.filter(o => o.status === 'processing').length;
    const shippedOrders = filteredOrders.filter(o => o.status === 'shipped').length;
    const deliveredOrders = filteredOrders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = filteredOrders.filter(o => o.status === 'cancelled').length;

    // Today's metrics
    const todayOrdersList = orders.filter(order => new Date(order.createdAt) >= today);
    const todayOrders = todayOrdersList.length;
    const todayRevenue = todayOrdersList.reduce((sum, order) => sum + order.total, 0);

    // Weekly metrics
    const weeklyOrdersList = orders.filter(order => new Date(order.createdAt) >= weekAgo);
    const weeklyOrders = weeklyOrdersList.length;
    const weeklyRevenue = weeklyOrdersList.reduce((sum, order) => sum + order.total, 0);

    // Monthly metrics
    const monthlyOrdersList = orders.filter(order => new Date(order.createdAt) >= monthAgo);
    const monthlyOrders = monthlyOrdersList.length;
    const monthlyRevenue = monthlyOrdersList.reduce((sum, order) => sum + order.total, 0);

    // Top customers
    const customerMap = new Map();
    filteredOrders.forEach(order => {
      const customerKey = order.billingAddress.email;
      const customerName = `${order.billingAddress.firstName} ${order.billingAddress.lastName}`;
      
      if (!customerMap.has(customerKey)) {
        customerMap.set(customerKey, {
          customer: customerName,
          email: customerKey,
          orders: 0,
          revenue: 0
        });
      }
      
      const customer = customerMap.get(customerKey);
      customer.orders += 1;
      customer.revenue += order.total;
    });

    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Recent orders
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // Status distribution
    const statusDistribution = [
      { status: 'pending', count: pendingOrders },
      { status: 'processing', count: processingOrders },
      { status: 'shipped', count: shippedOrders },
      { status: 'delivered', count: deliveredOrders },
      { status: 'cancelled', count: cancelledOrders },
    ].map(item => ({
      ...item,
      percentage: totalOrders > 0 ? (item.count / totalOrders) * 100 : 0
    }));

    // Daily stats (last 7 days)
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date);
      const dayEnd = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dayStart && orderDate < dayEnd;
      });
      
      dailyStats.push({
        date: date.toLocaleDateString(isRTL ? 'ar' : 'en', { month: 'short', day: 'numeric' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + order.total, 0)
      });
    }

    // Payment methods
    const paymentMap = new Map();
    filteredOrders.forEach(order => {
      const pm: any = (order as any).paymentMethod;
      const method = typeof pm === 'string' ? pm : (pm?.name || pm?.type || 'Unknown');
      paymentMap.set(method, (paymentMap.get(method) || 0) + 1);
    });

    const paymentMethods = Array.from(paymentMap.entries())
      .map(([method, count]) => ({
        method,
        count,
        percentage: (count / totalOrders) * 100
      }))
      .sort((a, b) => b.count - a.count);

    // Urgent orders (pending for more than 24 hours)
    const urgentOrders = orders.filter(order => {
      if (order.status !== 'pending') return false;
      const orderDate = new Date(order.createdAt);
      const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
      return hoursDiff > 24;
    }).slice(0, 5);

    setAnalytics({
      totalOrders,
      totalRevenue,
      averageOrderValue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      todayOrders,
      todayRevenue,
      weeklyOrders,
      weeklyRevenue,
      monthlyOrders,
      monthlyRevenue,
      topCustomers,
      recentOrders,
      statusDistribution,
      dailyStats,
      paymentMethods,
      urgentOrders,
    });
  }, [orders, selectedTimeRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(isRTL ? 'ar' : 'en', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!analytics) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-500 dark:text-gray-400">Loading order analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📈 Order Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Comprehensive overview of your order management
          </p>
        </div>
        <div className={`flex flex-wrap gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button onClick={onExportOrders} variant="outline" className="text-blue-600">
            📤 Export Orders
          </Button>
          <Button 
            onClick={() => setRefreshKey(prev => prev + 1)} 
            variant="outline" 
            className="text-green-600"
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Range:</span>
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
        {/* Total Orders */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-3xl">🛍️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalOrders}</p>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-3xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                <Price amount={analytics.totalRevenue} locale={isRTL ? 'ar' : 'en'} />
              </p>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span className="text-3xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Order Value</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                <Price amount={analytics.averageOrderValue} locale={isRTL ? 'ar' : 'en'} />
              </p>
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <span className="text-3xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Orders</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{analytics.pendingOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Period Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📅 Today</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Orders</span>
              <span className="font-semibold">{analytics.todayOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Revenue</span>
              <span className="font-semibold">
                <Price amount={analytics.todayRevenue} locale={isRTL ? 'ar' : 'en'} />
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📅 This Week</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Orders</span>
              <span className="font-semibold">{analytics.weeklyOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Revenue</span>
              <span className="font-semibold">
                <Price amount={analytics.weeklyRevenue} locale={isRTL ? 'ar' : 'en'} />
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📅 This Month</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Orders</span>
              <span className="font-semibold">{analytics.monthlyOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Revenue</span>
              <span className="font-semibold">
                <Price amount={analytics.monthlyRevenue} locale={isRTL ? 'ar' : 'en'} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📋 Order Status Distribution</h3>
          <div className="space-y-3">
            {analytics.statusDistribution.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.count} orders
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">👑 Top Customers</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {analytics.topCustomers.map((customer, index) => (
              <div key={customer.email} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {customer.customer}
                    </p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    <Price amount={customer.revenue} locale={isRTL ? 'ar' : 'en'} />
                  </div>
                  <div className="text-xs text-gray-500">
                    {customer.orders} orders
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Urgent Orders Alert */}
      {analytics.urgentOrders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🚨 Urgent Orders</h3>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
              {analytics.urgentOrders.length} orders have been pending for more than 24 hours
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {analytics.urgentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center text-sm">
                  <span className="text-red-800 dark:text-red-200">
                    Order #{order.id} - {order.billingAddress.firstName} {order.billingAddress.lastName}
                  </span>
                  <Button
                    onClick={() => onViewOrder(order)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🕒 Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 text-sm font-medium text-gray-500">Order ID</th>
                <th className="text-left py-2 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left py-2 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-2 text-sm font-medium text-gray-500">Total</th>
                <th className="text-left py-2 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left py-2 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 text-sm font-medium text-gray-900 dark:text-white">
                    #{order.id.slice(-8)}
                  </td>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-300">
                    {order.billingAddress.firstName} {order.billingAddress.lastName}
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm font-semibold">
                    <Price amount={order.total} locale={isRTL ? 'ar' : 'en'} />
                  </td>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="py-3">
                    <Button
                      onClick={() => onViewOrder(order)}
                      size="sm"
                      variant="outline"
                      className="text-blue-600"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
