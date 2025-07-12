'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { mockOrders } from '@/data/mockOrders';

export function RecentOrders() {
  const { t, isRTL } = useLanguage();
  
  // Get last 5 orders
  const recentOrders = mockOrders.slice(0, 5);

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
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t('admin.orders.title')}
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order.id} className={`flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-300 font-medium">
                    #{order.id.slice(-3)}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.billingAddress.firstName} {order.billingAddress.lastName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ${order.total.toFixed(2)}
                  </div>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                {t(`admin.orders.${order.status}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
