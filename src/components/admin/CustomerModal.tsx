'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Customer } from '@/types';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onUpdateStatus?: (customerId: string, status: Customer['status']) => void;
  onUpdate?: (customer: Customer) => void;
  mode?: 'view' | 'edit';
}

export function CustomerModal({
  isOpen,
  onClose,
  customer,
  onUpdateStatus,
  onUpdate,
  mode = 'view',
}: CustomerModalProps) {
  const { t, isRTL } = useLanguage();
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'active' as Customer['status'],
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone || '',
        status: customer.status,
      });
    }
  }, [customer]);

  useEffect(() => {
    setIsEditing(mode === 'edit');
  }, [mode]);

  if (!isOpen) return null;
  
  if (!customer) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={onClose}
          />
          <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-center align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              {t('common.loading')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!onUpdate) return;
    
    setIsLoading(true);
    try {
      await onUpdate({
        ...customer,
        ...formData,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update customer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Customer['status']) => {
    if (!onUpdateStatus) return;
    
    setIsLoading(true);
    try {
      await onUpdateStatus(customer.id, newStatus);
      setFormData(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            {isEditing ? t('admin.customers.editCustomer') : t('admin.customers.customerDetails')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0 h-20 w-20 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                  {customer.avatar ? (
                    <img
                      src={customer.avatar}
                      alt={customer.firstName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-medium text-gray-500 dark:text-gray-400">
                      {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="ml-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white sm:text-sm"
                          placeholder={t('checkout.firstName')}
                        />
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white sm:text-sm"
                          placeholder={t('checkout.lastName')}
                        />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white sm:text-sm"
                        placeholder={t('checkout.email')}
                      />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white sm:text-sm"
                        placeholder={t('checkout.phone')}
                      />
                    </div>
                  ) : (
                    <>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {customer.firstName} {customer.lastName}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">{customer.email}</p>
                      {customer.phone && (
                        <p className="text-gray-600 dark:text-gray-300">{customer.phone}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.customers.status')}
                  </label>
                  {onUpdateStatus ? (
                    <select
                      value={formData.status}
                      onChange={(e) => handleStatusChange(e.target.value as Customer['status'])}
                      disabled={isLoading}
                      className={`text-sm px-3 py-1 rounded-full font-semibold ${getStatusColor(formData.status)} border-none`}
                    >
                      <option value="active">{t('admin.customers.active')}</option>
                      <option value="inactive">{t('admin.customers.inactive')}</option>
                      <option value="blocked">{t('admin.customers.blocked')}</option>
                    </select>
                  ) : (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                      {t(`admin.customers.${customer.status}`)}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.customers.joined')}
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(customer.createdAt)}
                  </p>
                </div>
              </div>

              {customer.lastLoginAt && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.customers.lastLogin')}
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(customer.lastLoginAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                {t('admin.customers.totalOrders')}
              </h5>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {customer.totalOrders}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h5 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                {t('admin.customers.totalSpent')}
              </h5>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {customer.totalSpent} SAR
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h5 className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">
                {t('admin.customers.averageOrder')}
              </h5>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {customer.totalOrders > 0 ? (customer.totalSpent / customer.totalOrders).toFixed(2) : 0} SAR
              </p>
            </div>
          </div>
        </div>

        {customer.orders && customer.orders.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('admin.customers.recentOrders')}
            </h4>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.orders.orderNumber')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.orders.date')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.orders.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.orders.total')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {customer.orders.slice(0, 5).map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        #{order.id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {t(`admin.orders.${order.status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {order.total} SAR
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className={`flex justify-end space-x-3 mt-6 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                disabled={isLoading}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : t('common.save')}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={onClose}
                variant="outline"
              >
                {t('common.close')}
              </Button>
              {onUpdate && (
                <Button
                  onClick={() => setIsEditing(true)}
                >
                  {t('common.edit')}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
