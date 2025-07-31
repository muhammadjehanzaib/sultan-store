'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order } from '@/types';
import Price from '@/components/ui/Price';

interface OrderAnalyticsProps {
  orders: Order[];
}

export function OrderAnalytics({ orders }: OrderAnalyticsProps) {
  const { t, isRTL, language } = useLanguage();

  const analytics = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filter orders by date
    const todayOrders = orders.filter(order => new Date(order.createdAt) >= today);
    const weekOrders = orders.filter(order => new Date(order.createdAt) >= weekAgo);
    const monthOrders = orders.filter(order => new Date(order.createdAt) >= monthAgo);

    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const weekRevenue = weekOrders.reduce((sum, order) => sum + order.total, 0);
    const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0);

    // Status distribution
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Average order value
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Helper function to get product name based on language
    const getProductName = (product: any) => {
      if (language === 'ar' && product.name_ar) {
        return product.name_ar;
      }
      if (language === 'en' && product.name_en) {
        return product.name_en;
      }
      return product.name || product.name_en || 'Unknown Product';
    };

    // Top products
    const productSales = orders.reduce((acc, order) => {
      order.items.forEach(item => {
        const productName = getProductName(item.product);
        acc[productName] = (acc[productName] || 0) + item.quantity;
      });
      return acc;
    }, {} as Record<string, number>);

    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      weekOrders: weekOrders.length,
      monthOrders: monthOrders.length,
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      averageOrderValue,
      statusCounts,
      topProducts
    };
  }, [orders, language]);

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

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className={`ml-4 ${isRTL ? 'mr-4 ml-0' : ''}`}>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('admin.analytics.totalRevenue')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                <Price amount={analytics.totalRevenue} locale={isRTL ? 'ar' : 'en'} />
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className={`ml-4 ${isRTL ? 'mr-4 ml-0' : ''}`}>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('admin.analytics.totalOrders')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analytics.totalOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className={`ml-4 ${isRTL ? 'mr-4 ml-0' : ''}`}>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('admin.analytics.averageOrder')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                <Price amount={analytics.averageOrderValue} locale={isRTL ? 'ar' : 'en'} />
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className={`ml-4 ${isRTL ? 'mr-4 ml-0' : ''}`}>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('admin.analytics.todayOrders')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analytics.todayOrders}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('admin.analytics.orderStatus')}
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                    {t(`admin.orders.${status}`)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / analytics.totalOrders) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('admin.analytics.topProducts')}
          </h3>
          <div className="space-y-3">
            {analytics.topProducts.map(([product, quantity], index) => (
              <div key={product} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {index + 1}. {product}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {quantity} {t('admin.analytics.sold')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Period Comparison */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('admin.analytics.recentPeriods')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.analytics.today')}</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              <Price amount={analytics.todayRevenue} locale={isRTL ? 'ar' : 'en'} />
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {analytics.todayOrders} {t('admin.analytics.orders')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.analytics.thisWeek')}</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              <Price amount={analytics.weekRevenue} locale={isRTL ? 'ar' : 'en'} />
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {analytics.weekOrders} {t('admin.analytics.orders')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.analytics.thisMonth')}</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              <Price amount={analytics.monthRevenue} locale={isRTL ? 'ar' : 'en'} />
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {analytics.monthOrders} {t('admin.analytics.orders')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 