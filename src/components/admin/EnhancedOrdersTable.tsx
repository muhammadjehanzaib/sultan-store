'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';
import { SearchBar } from './SearchBar';
import Price from '@/components/ui/Price';

interface EnhancedOrdersTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onBulkUpdateStatus?: (orderIds: string[], status: Order['status']) => void;
  onExportSelected?: (orderIds: string[]) => void;
  selectedOrders?: string[];
  onSelectOrder?: (orderId: string) => void;
  onSelectAll?: () => void;
}

interface FilterState {
  search: string;
  status: Order['status'] | 'all';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  customDateFrom: string;
  customDateTo: string;
  paymentMethod: string;
  minAmount: number;
  maxAmount: number;
  sortBy: 'createdAt' | 'total' | 'customer' | 'status';
  sortOrder: 'asc' | 'desc';
}

export const EnhancedOrdersTable: React.FC<EnhancedOrdersTableProps> = ({
  orders,
  onView,
  onUpdateStatus,
  onBulkUpdateStatus,
  onExportSelected,
  selectedOrders = [],
  onSelectOrder,
  onSelectAll,
}) => {
  const { t, isRTL } = useLanguage();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    dateRange: 'all',
    customDateFrom: '',
    customDateTo: '',
    paymentMethod: 'all',
    minAmount: 0,
    maxAmount: 100000000,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [bulkAction, setBulkAction] = useState<'status' | 'export' | ''>('');

  // Get unique payment methods
  const paymentMethods = useMemo(() => {
    const methods = new Set(
      orders
        .map(order => {
          const pm: any = (order as any).paymentMethod;
          if (!pm) return 'Unknown';
          return typeof pm === 'string' ? pm : pm.name || pm.type || 'Unknown';
        })
        .filter((method: string) => method && method.trim() !== '')
    );
    return Array.from(methods).sort();
  }, [orders]);

  // Filter and sort orders
  const processedOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const customerName = `${order.billingAddress.firstName} ${order.billingAddress.lastName}`.toLowerCase();
        const customerEmail = order.billingAddress.email.toLowerCase();
        const orderId = order.id.toLowerCase();

        if (!customerName.includes(searchLower) &&
          !customerEmail.includes(searchLower) &&
          !orderId.includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== 'all' && order.status !== filters.status) {
        return false;
      }

      // Date range filter
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (filters.dateRange) {
        case 'today':
          if (orderDate < today) return false;
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (orderDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (orderDate < monthAgo) return false;
          break;
        case 'custom':
          if (filters.customDateFrom && orderDate < new Date(filters.customDateFrom)) return false;
          if (filters.customDateTo && orderDate > new Date(filters.customDateTo + 'T23:59:59')) return false;
          break;
      }

      // Payment method filter
      if (filters.paymentMethod !== 'all') {
        const pm: any = (order as any).paymentMethod;
        const orderPaymentMethod = typeof pm === 'string' ? pm : (pm?.name || pm?.type || '');
        if (orderPaymentMethod !== filters.paymentMethod) return false;
      }

      // Amount filter
      if (order.total < filters.minAmount || order.total > filters.maxAmount) {
        return false;
      }

      return true;
    });

    // Sort orders
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'customer':
          aValue = `${a.billingAddress.firstName} ${a.billingAddress.lastName}`.toLowerCase();
          bValue = `${b.billingAddress.firstName} ${b.billingAddress.lastName}`.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (filters.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [orders, filters]);

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
    return new Intl.DateTimeFormat(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  const handleSort = (column: FilterState['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      dateRange: 'all',
      customDateFrom: '',
      customDateTo: '',
      paymentMethod: 'all',
      minAmount: 0,
      maxAmount: 100000000,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const handleBulkAction = (action: 'status' | 'export', value?: any) => {
    if (!selectedOrders.length) return;

    if (action === 'status' && onBulkUpdateStatus && value) {
      onBulkUpdateStatus(selectedOrders, value);
    } else if (action === 'export' && onExportSelected) {
      onExportSelected(selectedOrders);
    }

    setBulkAction('');
  };

  const getPriorityColor = (order: Order) => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

    // if (order.status === "pending" && hoursDiff > 24) {
    //   // Soft gray-blue for overdue pending
    //   return "border-l-4 border-blue-300 bg-blue-50 dark:bg-blue-900/20";
    // } else if (order.status === "processing" && hoursDiff > 48) {
    //   // Gentle amber for slow processing
    //   return "border-l-4 border-amber-300 bg-amber-50 dark:bg-amber-900/20";
    // } else if (order.total > 1000) {
    //   // Soft teal for big orders
    //   return "border-l-4 border-teal-300 bg-teal-50 dark:bg-teal-900/20";
    // }
    return "";

  };

  const isAllSelected = selectedOrders.length === processedOrders.length && processedOrders.length > 0;
  const isIndeterminate = selectedOrders.length > 0 && selectedOrders.length < processedOrders.length;

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="text-6xl mb-4">📋</div>
        <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">No orders found</p>
        <p className="text-gray-400 dark:text-gray-500">Orders will appear here when customers make purchases</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      {/* Header with Controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search and Filters */}
          <div className="flex-1 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex-1 max-w-md">
              <SearchBar
                onSearch={(query) => setFilters(prev => ({ ...prev, search: query }))}
                placeholder="Search orders by ID, customer, or email..."
                value={filters.search}
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className={`${showFilters ? 'bg-blue-50 text-blue-600' : ''} whitespace-nowrap`}
            >
              🔍 Filters {showFilters ? '▲' : '▼'}
            </Button>
          </div>

          {/* Results and Stats */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {processedOrders.length} of {orders.length} orders
            </div>
            <div className="text-sm font-medium text-green-600">
              Total: <Price amount={processedOrders.reduce((sum, order) => sum + order.total, 0)} locale={isRTL ? 'ar' : 'en'} />
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                >
                  <option value="all">All Methods</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              {/* Amount Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, minAmount: Number(e.target.value) || 0 }))}
                    className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: Number(e.target.value) || 100000000 }))}
                    className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  size="sm"
                  className="w-full text-gray-500 dark:text-white hover:text-gray-700"
                >
                  🔄 Reset
                </Button>
              </div>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <div className="mt-4 grid grid-cols-2 gap-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.customDateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, customDateFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.customDateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, customDateTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {selectedOrders.length} orders selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value=""
                onChange={(e) => e.target.value && handleBulkAction('status', e.target.value)}
                className="px-3 py-1 text-gray-700 border border-blue-300 rounded text-sm bg-white"
              >
                <option value="">Update Status</option>
                <option value="processing">Mark as Processing</option>
                <option value="shipped">Mark as Shipped</option>
                <option value="delivered">Mark as Delivered</option>
                <option value="cancelled">Mark as Cancelled</option>
              </select>
              {onExportSelected && (
                <Button
                  onClick={() => handleBulkAction('export')}
                  variant="outline"
                  size="sm"
                  className="text-green-600 hover:text-green-700"
                >
                  📤 Export Selected
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {onSelectOrder && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={onSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('createdAt')}
              >
                Order ID & Date {filters.sortBy === 'createdAt' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('customer')}
              >
                Customer {filters.sortBy === 'customer' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('status')}
              >
                Status {filters.sortBy === 'status' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('total')}
              >
                Total {filters.sortBy === 'total' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {processedOrders.map((order) => (
              <tr key={order.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${getPriorityColor(order)}`}>
                {onSelectOrder && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => onSelectOrder(order.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}

                {/* Order ID & Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      #{order.id.slice(-8)}
                    </div>
                    <div className="text-xs text-gray-700 dark:text-gray-100">
                      {formatDate(order.createdAt)}
                    </div>
                    {order.trackingNumber && (
                      <div className="text-xs text-blue-600">
                        Track: {order.trackingNumber}
                      </div>
                    )}
                  </div>
                </td>

                {/* Customer */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.billingAddress.firstName} {order.billingAddress.lastName}
                    </div>
                    <div className="text-xs text-black dark:text-gray-100">
                      {order.billingAddress.email}
                    </div>
                    <div className="text-xs text-black">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
                      className="text-xs border border-gray-300 rounded px-1 py-1 bg-white dark:bg-gray-700"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </td>

                {/* Total */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <Price
                      amount={order.total}
                      locale={isRTL ? 'ar' : 'en'}
                      className="text-sm font-semibold text-gray-900 dark:text-white"
                    />
                    <div className="text-xs text-black dark:text-gray-100">
                      Subtotal: <Price amount={order.subtotal} locale={isRTL ? 'ar' : 'en'} />
                    </div>
                  </div>
                </td>

                {/* Payment */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {typeof (order as any).paymentMethod === 'string'
                        ? (order as any).paymentMethod
                        : ((order as any).paymentMethod?.name || (order as any).paymentMethod?.type || 'Unknown')
                      }
                    </div>
                    {((typeof (order as any).paymentMethod === 'string' && (order as any).paymentMethod === 'cod') ||
                      ((order as any).paymentMethod && (order as any).paymentMethod.type === 'cod')) && (
                      <span className="text-orange-600">Cash on Delivery</span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => onView(order)}
                      variant="outline"
                      size="sm"
                      className=" test-black dark:text-white hover:text-blue-700"
                    >
                      View
                    </Button>
                    <Button
                      onClick={() => {
                        if (order.status !== 'shipped' && order.status !== 'delivered') return;
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
                      disabled={order.status !== 'shipped' && order.status !== 'delivered'}
                      className={`text-purple-600 hover:text-purple-700 ${!(order.status === 'shipped' || order.status === 'delivered') ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      🏷️ Shipping Label
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Results */}
      {processedOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">No orders found</p>
          <p className="text-gray-400 dark:text-gray-500 mb-4">
            Try adjusting your filters or search terms
          </p>
          <Button onClick={resetFilters} variant="outline">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};
