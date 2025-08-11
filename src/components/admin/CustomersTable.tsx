'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Customer } from '@/types';
import { Button } from '@/components/ui/Button';
import Price from '@/components/ui/Price';
import { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface CustomersTableProps {
  customers: Customer[];
  loading?: boolean;
  onView: (customer: Customer) => void;
  onUpdateStatus: (customerId: string, status: Customer['status']) => void;
  onDelete?: (customerId: string) => void;
  onEdit?: (customer: Customer) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange?: (page: number) => void;
}

export function CustomersTable({
  customers,
  loading = false,
  onView,
  onUpdateStatus,
  onDelete,
  onEdit,
  searchQuery = '',
  onSearchChange,
  pagination,
  onPageChange,
}: CustomersTableProps) {
  const { t, isRTL } = useLanguage();
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

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

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  };

  const handleStatusUpdate = async (customerId: string, newStatus: Customer['status']) => {
    setUpdatingStatus(customerId);
    try {
      await onUpdateStatus(customerId, newStatus);
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? t('admin.customers.noCustomersFound') : t('admin.customers.noCustomers')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      {/* Search Bar */}
      {onSearchChange && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:text-white sm:text-sm"
              placeholder={t('admin.customers.searchPlaceholder')}
            />
          </div>
        </div>
      )}
      
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
                    <Price amount={customer.totalSpent} locale={isRTL ? 'ar' : 'en'} />
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={customer.status}
                    onChange={(e) =>
                      handleStatusUpdate(customer.id, e.target.value as Customer['status'])
                    }
                    disabled={updatingStatus === customer.id}
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(
                      customer.status
                    )} border-none disabled:opacity-50`}
                  >
                    <option value="active">{t('admin.customers.active')}</option>
                    <option value="inactive">{t('admin.customers.inactive')}</option>
                    <option value="blocked">{t('admin.customers.blocked')}</option>
                  </select>
                  {updatingStatus === customer.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
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
                    {onEdit && (
                      <Button
                        onClick={() => onEdit(customer)}
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                      >
                        {t('common.edit')}
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        onClick={() => onDelete(customer.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        {t('common.delete')}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && onPageChange && pagination.pages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              onClick={() => onPageChange(Math.max(pagination.page - 1, 1))}
              disabled={pagination.page <= 1}
              variant="outline"
              size="sm"
            >
              {t('common.previous')}
            </Button>
            <Button
              onClick={() => onPageChange(Math.min(pagination.page + 1, pagination.pages))}
              disabled={pagination.page >= pagination.pages}
              variant="outline"
              size="sm"
            >
              {t('common.next')}
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('admin.customers.showing')} {((pagination.page - 1) * pagination.limit) + 1} {t('admin.customers.to')} {Math.min(pagination.page * pagination.limit, pagination.total)} {t('admin.customers.of')} {pagination.total} {t('admin.customers.results')}
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  onClick={() => onPageChange(Math.max(pagination.page - 1, 1))}
                  disabled={pagination.page <= 1}
                  variant="outline"
                  size="sm"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md"
                >
                  <span className="sr-only">{t('common.previous')}</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
                
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      variant={pageNum === pagination.page ? 'primary' : 'outline'}
                      size="sm"
                      className="relative inline-flex items-center px-4 py-2"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  onClick={() => onPageChange(Math.min(pagination.page + 1, pagination.pages))}
                  disabled={pagination.page >= pagination.pages}
                  variant="outline"
                  size="sm"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md"
                >
                  <span className="sr-only">{t('common.next')}</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
