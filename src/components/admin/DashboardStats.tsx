'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Price from '@/components/ui/Price';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface DashboardStatsProps {}

interface StatsData {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  salesGrowth: number;
  ordersGrowth: number;
  productsGrowth: number;
  customersGrowth: number;
}

export function DashboardStats({}: DashboardStatsProps) {
  const { t, isRTL } = useLanguage();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all stats in parallel with error handling for each request
      const [ordersRes, customersRes, productsRes] = await Promise.allSettled([
        fetch('/api/orders'),
        fetch('/api/admin/customers'),
        fetch('/api/admin/products')
      ]);

      // Check if responses are ok and parse JSON safely
      let ordersData = { orders: [] };
      let customersData = { customers: [], pagination: { total: 0 } };
      let productsData = { products: [], pagination: { total: 0 } };

      if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
        try {
          ordersData = await ordersRes.value.json();
        } catch (e) {
          console.warn('Failed to parse orders data:', e);
        }
      }

      if (customersRes.status === 'fulfilled' && customersRes.value.ok) {
        try {
          customersData = await customersRes.value.json();
        } catch (e) {
          console.warn('Failed to parse customers data:', e);
        }
      }

      if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
        try {
          productsData = await productsRes.value.json();
        } catch (e) {
          console.warn('Failed to parse products data:', e);
        }
      }

      // Calculate stats
      const orders = ordersData.orders || [];
      const totalSales = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
      const totalOrders = orders.length;
      const totalCustomers = customersData.pagination?.total || customersData.customers?.length || 0;
      const totalProducts = productsData.pagination?.total || productsData.products?.length || 0;

      // Calculate growth (simplified - comparing this month vs last month)
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const thisMonthOrders = orders.filter((order: any) => new Date(order.createdAt) >= thisMonth);
      const lastMonthOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= lastMonth && orderDate < thisMonth;
      });
      
      const thisMonthSales = thisMonthOrders.reduce((sum: number, order: any) => sum + order.total, 0);
      const lastMonthSales = lastMonthOrders.reduce((sum: number, order: any) => sum + order.total, 0);
      
      const salesGrowth = lastMonthSales > 0 ? ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100 : 0;
      const ordersGrowth = lastMonthOrders.length > 0 ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100 : 0;

      setStats({
        totalSales,
        totalOrders,
        totalProducts,
        totalCustomers,
        salesGrowth,
        ordersGrowth,
        productsGrowth: 5.2, // Mock data for now
        customersGrowth: 8.7 // Mock data for now
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center h-24">
              <LoadingSpinner size="sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: t('admin.dashboard.totalSales'),
      value: <Price amount={stats.totalSales} className="text-3xl font-bold text-gray-900 dark:text-white" />,
      growth: stats.salesGrowth,
      icon: '💰',
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      title: t('admin.dashboard.orders'),
      value: stats.totalOrders.toLocaleString(),
      growth: stats.ordersGrowth,
      icon: '📦',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      title: t('admin.dashboard.products'),
      value: stats.totalProducts.toLocaleString(),
      growth: stats.productsGrowth,
      icon: '🛍️',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    {
      title: t('admin.dashboard.customers'),
      value: stats.totalCustomers.toLocaleString(),
      growth: stats.customersGrowth,
      icon: '👥',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    }
  ];

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    const icon = isPositive ? '↗️' : '↘️';
    const textColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    return (
      <span className={`text-sm font-semibold ${textColor} flex items-center gap-1`}>
        <span>{icon}</span>
        <span>{Math.abs(growth).toFixed(1)}%</span>
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} ${stat.borderColor} border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center shadow-sm`}>
              <span className="text-xl text-white">{stat.icon}</span>
            </div>
            {formatGrowth(stat.growth)}
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {stat.title}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

