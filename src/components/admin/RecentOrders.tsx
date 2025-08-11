'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Price from '@/components/ui/Price';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
  billingAddress: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function RecentOrders() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      // Get the 5 most recent orders
      const recentOrders = (data.orders || []).slice(0, 5);
      setOrders(recentOrders);
    } catch (err) {
      console.error('Error fetching recent orders:', err);
      setError('Failed to load recent orders');
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'processing':
        return '⚙️';
      case 'shipped':
        return '🚚';
      case 'delivered':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '📦';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.RelativeTimeFormat(isRTL ? 'ar' : 'en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  const handleViewAllOrders = () => {
    router.push('/admin/orders');
  };

  const handleViewOrder = (orderId: string) => {
    // This would open order details modal or navigate to order page
    console.log('View order:', orderId);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('admin.dashboard.recentOrders')}
          </h3>
        </div>
        <div className="p-6 flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('admin.dashboard.recentOrders')}
          </h3>
        </div>
        <div className="p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('admin.dashboard.recentOrders')}
        </h3>
        <button
          onClick={handleViewAllOrders}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
        >
          {t('admin.dashboard.viewAll')}
        </button>
      </div>
      
      <div className="p-6">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-gray-500 dark:text-gray-400">
              {t('admin.dashboard.noRecentOrders')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div
                key={order.id}
                className={`group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
                onClick={() => handleViewOrder(order.id)}
              >
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">
                          #{(index + 1).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {order.billingAddress ? 
                            `${order.billingAddress.firstName} ${order.billingAddress.lastName}` : 
                            order.customerName
                          }
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Price 
                          amount={order.total} 
                          locale={isRTL ? 'ar' : 'en'} 
                          className="text-sm font-medium text-gray-600 dark:text-gray-300" 
                        />
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          ID: {order.id.slice(-8)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      <span>{getStatusIcon(order.status)}</span>
                      {t(`admin.orders.${order.status}`)}
                    </span>
                    
                    <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {orders.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleViewAllOrders}
            className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            {t('admin.dashboard.viewAllOrders')}
          </button>
        </div>
      )}
    </div>
  );
}
