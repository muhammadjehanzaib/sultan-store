'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';
import Price from '@/components/ui/Price';

interface OrdersTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

export function OrdersTable({ orders, onView, onUpdateStatus }: OrdersTableProps) {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Filter orders based on search and filters
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        const orderId = order.id?.toLowerCase() || '';
        const customerName = order.billingAddress ? 
          `${order.billingAddress.firstName || ''} ${order.billingAddress.lastName || ''}`.toLowerCase() : '';
        const customerEmail = order.billingAddress?.email?.toLowerCase() || '';
        
        return orderId.includes(searchLower) ||
               customerName.includes(searchLower) ||
               customerEmail.includes(searchLower);
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        switch (dateFilter) {
          case 'today':
            return orderDate >= today;
          case 'week':
            return orderDate >= weekAgo;
          case 'month':
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const getStatusColor = (status: Order['status']) => {
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
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('common.search')}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('admin.orders.searchPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.orders.status')}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Order['status'] | 'all')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">{t('common.all')}</option>
              <option value="pending">{t('admin.orders.pending')}</option>
              <option value="processing">{t('admin.orders.processing')}</option>
              <option value="shipped">{t('admin.orders.shipped')}</option>
              <option value="delivered">{t('admin.orders.delivered')}</option>
              <option value="cancelled">{t('admin.orders.cancelled')}</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.orders.date')}
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">{t('common.all')}</option>
              <option value="today">{t('admin.orders.today')}</option>
              <option value="week">{t('admin.orders.thisWeek')}</option>
              <option value="month">{t('admin.orders.thisMonth')}</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('admin.orders.showing')} {filteredOrders.length} {t('admin.orders.of')} {orders.length} {t('admin.orders.orders')}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('admin.orders.orderNumber')}
              </th>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('admin.orders.customer')}
              </th>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('admin.orders.date')}
              </th>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('admin.orders.status')}
              </th>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('admin.orders.total')}
              </th>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('admin.orders.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  {t('admin.orders.noOrdersFound')}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.id}
                    </div>
                    {order.trackingNumber && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {order.trackingNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {order.billingAddress ? `${order.billingAddress.firstName || ''} ${order.billingAddress.lastName || ''}` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {order.billingAddress?.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {t(`admin.orders.${order.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      <Price amount={order.total} locale={isRTL ? 'ar' : 'en'} className="text-sm font-medium text-gray-900 dark:text-white" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className={`flex space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                      <Button
                        onClick={() => onView(order)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {t('admin.orders.view')}
                      </Button>
                      <Button
                        onClick={() => {
                          if (!(order.status === 'shipped' || order.status === 'delivered')) return;
                          const w = window.open(`/admin/orders/${order.id}/label`, '_blank');
                          if (!w) return;
                          // Send immediate snapshot so the label can render instantly
                          const payload = { type: 'ORDER_SNAPSHOT', order };
                          const send = () => {
                            try { w.postMessage(payload, window.location.origin); } catch (e) {}
                          };
                          setTimeout(send, 300);
                          // The label page will fetch the fast, normalized order itself if needed.
                        }}
                        variant="outline"
                        size="sm"
                        disabled={!(order.status === 'shipped' || order.status === 'delivered')}
                        className={`text-purple-600 hover:text-purple-700 ${!(order.status === 'shipped' || order.status === 'delivered') ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        🏷️ Shipping Label
                      </Button>
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="pending">{t('admin.orders.pending')}</option>
                        <option value="processing">{t('admin.orders.processing')}</option>
                        <option value="shipped">{t('admin.orders.shipped')}</option>
                        <option value="delivered">{t('admin.orders.delivered')}</option>
                        <option value="cancelled">{t('admin.orders.cancelled')}</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
