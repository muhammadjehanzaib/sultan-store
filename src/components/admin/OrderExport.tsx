'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';

interface OrderExportProps {
  orders: Order[];
}

export function OrderExport({ orders }: OrderExportProps) {
  const { t, isRTL } = useLanguage();
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');

  const exportToCSV = (data: Order[]) => {
    const headers = [
      'Order ID',
      'Customer Name',
      'Customer Email',
      'Order Date',
      'Status',
      'Subtotal',
      'Tax',
      'Shipping',
      'Total',
      'Payment Method',
      'Tracking Number',
      'Shipping Address',
      'Billing Address'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(order => [
        order.id,
        `${order.billingAddress.firstName} ${order.billingAddress.lastName}`,
        order.billingAddress.email,
        new Date(order.createdAt).toISOString(),
        order.status,
        order.subtotal,
        order.tax,
        order.shipping,
        order.total,
        (typeof (order as any).paymentMethod === 'string' ? (order as any).paymentMethod : (order as any).paymentMethod?.name || (order as any).paymentMethod?.type || ''),
        order.trackingNumber || '',
        `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}`,
        `${order.billingAddress.address}, ${order.billingAddress.city}, ${order.billingAddress.state} ${order.billingAddress.zipCode}, ${order.billingAddress.country}`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data: Order[]) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterOrders = () => {
    let filtered = orders;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        
        switch (dateRange) {
          case 'today':
            return orderDate >= today;
          case 'week':
            return orderDate >= weekAgo;
          case 'month':
            return orderDate >= monthAgo;
          case 'custom':
            if (startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999); // End of day
              return orderDate >= start && orderDate <= end;
            }
            return true;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const handleExport = () => {
    const filteredOrders = filterOrders();
    
    if (filteredOrders.length === 0) {
      alert(t('admin.export.noOrdersToExport'));
      return;
    }

    if (exportFormat === 'csv') {
      exportToCSV(filteredOrders);
    } else {
      exportToJSON(filteredOrders);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {t('admin.export.title')}
      </h3>
      
      <div className="space-y-4">
        {/* Export Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('admin.export.format')}
          </label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('admin.export.dateRange')}
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as 'all' | 'today' | 'week' | 'month' | 'custom')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">{t('admin.export.allTime')}</option>
            <option value="today">{t('admin.export.today')}</option>
            <option value="week">{t('admin.export.thisWeek')}</option>
            <option value="month">{t('admin.export.thisMonth')}</option>
            <option value="custom">{t('admin.export.customRange')}</option>
          </select>
        </div>

        {/* Custom Date Range */}
        {dateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.export.startDate')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.export.endDate')}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('admin.export.status')}
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Order['status'] | 'all')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">{t('admin.export.allStatuses')}</option>
            <option value="pending">{t('admin.orders.pending')}</option>
            <option value="processing">{t('admin.orders.processing')}</option>
            <option value="shipped">{t('admin.orders.shipped')}</option>
            <option value="delivered">{t('admin.orders.delivered')}</option>
            <option value="cancelled">{t('admin.orders.cancelled')}</option>
          </select>
        </div>

        {/* Export Button */}
        <div className="pt-4">
          <Button
            onClick={handleExport}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t('admin.export.exportOrders')} ({filterOrders().length})
          </Button>
        </div>

        {/* Export Info */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>{t('admin.export.info')}</p>
        </div>
      </div>
    </div>
  );
} 