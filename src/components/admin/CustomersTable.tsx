'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Customer } from '@/types';
import { Button } from '@/components/ui/Button';
import Price from '@/components/ui/Price';

interface CustomersTableProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onUpdateStatus: (customerId: string, status: Customer['status']) => void;
  onDelete: (customerId: string) => void;
}

export function CustomersTable({
  customers,
  onView,
  onUpdateStatus,
  onDelete,
}: CustomersTableProps) {
  const { t, isRTL } = useLanguage();

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (customers.length === 0) {
    return (
      <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400">
          {t('admin.customers.noCustomers')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {[
                'customer',
                'email',
                'orders',
                'totalSpent',
                'status',
                'joined',
                'actions',
              ].map((key) => (
                <th
                  key={key}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                >
                  {t(`admin.customers.${key}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap" dir={isRTL ? 'rtl' : 'ltr'}>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden rtl:ml-4 ltr:mr-4">
                      {customer.avatar ? (
                        <img
                          src={customer.avatar}
                          alt={customer.firstName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          {customer.firstName.charAt(0)}
                          {customer.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {customer.id}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{customer.email}</div>
                  {customer.phone && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {customer.phone}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {customer.totalOrders}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    <Price amount={customer.totalSpent} locale={isRTL ? 'ar' : 'en'} className="text-sm font-medium text-gray-900 dark:text-white" />
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={customer.status}
                    onChange={(e) =>
                      onUpdateStatus(customer.id, e.target.value as Customer['status'])
                    }
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(
                      customer.status
                    )} border-none`}
                  >
                    <option value="active">{t('admin.customers.active')}</option>
                    <option value="inactive">{t('admin.customers.inactive')}</option>
                    <option value="blocked">{t('admin.customers.blocked')}</option>
                  </select>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formatDate(customer.createdAt)}
                  </div>
                  {customer.lastLoginAt && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t('admin.customers.lastLogin')}: {formatDate(customer.lastLoginAt)}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Button
                      onClick={() => onView(customer)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {t('admin.customers.view')}
                    </Button>
                    <Button
                      onClick={() => onDelete(customer.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
