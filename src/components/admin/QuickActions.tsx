'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const actions = [
    {
      title: t('admin.products.addProduct'),
      description: 'Add new product to inventory',
      icon: '➕',
      action: () => router.push('/admin/products'),
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    },
    {
      title: t('admin.categories.addCategory'),
      description: 'Manage product categories',
      icon: '🏷️',
      action: () => router.push('/admin/categories'),
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    },
    {
      title: t('admin.orders.view'),
      description: 'View and manage orders',
      icon: '📋',
      action: () => router.push('/admin/orders'),
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    {
      title: t('admin.nav.customers'),
      description: 'Manage customer accounts',
      icon: '👥',
      action: () => router.push('/admin/customers'),
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    },
    {
      title: t('admin.nav.analytics'),
      description: 'View sales analytics',
      icon: '📈',
      action: () => router.push('/admin/analytics'),
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Quick Actions
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${isRTL ? 'text-right' : 'text-left'}`}
            >
              <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                  <span className="text-lg">{action.icon}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {action.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {action.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
