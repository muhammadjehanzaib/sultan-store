'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Customer } from '@/types';
import { Button } from '@/components/ui/Button';
import Price from '@/components/ui/Price';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface EnhancedCustomersTableProps {
  customers: Customer[];
  loading?: boolean;
  onView: (customer: Customer) => void;
  onEdit?: (customer: Customer) => void;
  onUpdateStatus: (customerId: string, status: Customer['status']) => void;
  onDelete?: (customerId: string) => void;
  onBulkUpdateStatus?: (customerIds: string[], status: Customer['status']) => void;
  onExportSelected?: (customerIds: string[]) => void;
  selectedCustomers: string[];
  onSelectCustomer: (customerId: string) => void;
  onSelectAll: () => void;
}

interface FilterState {
  search: string;
  status: Customer['status'] | 'all';
  joinedDateRange: 'all' | '7d' | '30d' | '3m' | '6m' | '1y';
  spentRange: 'all' | '0-100' | '100-500' | '500-1000' | '1000+';
  orderCount: 'all' | '0' | '1-5' | '6-10' | '10+';
  lastLogin: 'all' | '7d' | '30d' | '60d' | 'never';
}

type SortField = 'name' | 'email' | 'totalSpent' | 'totalOrders' | 'createdAt' | 'lastLoginAt';
type SortDirection = 'asc' | 'desc';

export function EnhancedCustomersTable({
  customers,
  loading = false,
  onView,
  onEdit,
  onUpdateStatus,
  onDelete,
  onBulkUpdateStatus,
  onExportSelected,
  selectedCustomers,
  onSelectCustomer,
  onSelectAll,
}: EnhancedCustomersTableProps) {
  const { t, isRTL } = useLanguage();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    joinedDateRange: 'all',
    spentRange: 'all',
    orderCount: 'all',
    lastLogin: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = [...customers];

    // Apply search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        customer =>
          customer.firstName.toLowerCase().includes(searchTerm) ||
          customer.lastName.toLowerCase().includes(searchTerm) ||
          customer.email.toLowerCase().includes(searchTerm) ||
          customer.id.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(customer => customer.status === filters.status);
    }

    // Apply joined date filter
    if (filters.joinedDateRange !== 'all') {
      const now = new Date();
      const ranges = {
        '7d': 7,
        '30d': 30,
        '3m': 90,
        '6m': 180,
        '1y': 365,
      };
      const days = ranges[filters.joinedDateRange];
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(customer => new Date(customer.createdAt) >= cutoffDate);
    }

    // Apply spent range filter
    if (filters.spentRange !== 'all') {
      const ranges = {
        '0-100': [0, 100],
        '100-500': [100, 500],
        '500-1000': [500, 1000],
        '1000+': [1000, Infinity],
      };
      const [min, max] = ranges[filters.spentRange];
      filtered = filtered.filter(customer => customer.totalSpent >= min && customer.totalSpent < max);
    }

    // Apply order count filter
    if (filters.orderCount !== 'all') {
      if (filters.orderCount === '0') {
        filtered = filtered.filter(customer => customer.totalOrders === 0);
      } else if (filters.orderCount === '1-5') {
        filtered = filtered.filter(customer => customer.totalOrders >= 1 && customer.totalOrders <= 5);
      } else if (filters.orderCount === '6-10') {
        filtered = filtered.filter(customer => customer.totalOrders >= 6 && customer.totalOrders <= 10);
      } else if (filters.orderCount === '10+') {
        filtered = filtered.filter(customer => customer.totalOrders > 10);
      }
    }

    // Apply last login filter
    if (filters.lastLogin !== 'all') {
      const now = new Date();
      if (filters.lastLogin === 'never') {
        filtered = filtered.filter(customer => !customer.lastLoginAt);
      } else {
        const ranges = {
          '7d': 7,
          '30d': 30,
          '60d': 60,
        };
        const days = ranges[filters.lastLogin];
        const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(customer => 
          customer.lastLoginAt && new Date(customer.lastLoginAt) >= cutoffDate
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'totalSpent':
          aValue = a.totalSpent;
          bValue = b.totalSpent;
          break;
        case 'totalOrders':
          aValue = a.totalOrders;
          bValue = b.totalOrders;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'lastLoginAt':
          aValue = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          bValue = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [customers, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      joinedDateRange: 'all',
      spentRange: 'all',
      orderCount: 'all',
      lastLogin: 'all',
    });
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

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  };

  const isAllSelected = selectedCustomers.length === filteredAndSortedCustomers.length && filteredAndSortedCustomers.length > 0;
  const isSomeSelected = selectedCustomers.length > 0 && selectedCustomers.length < filteredAndSortedCustomers.length;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      {/* Header with Search and Controls */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-4">
          {/* Top Row: Search and View Toggle */}
          <div className="flex justify-between items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:text-white text-sm"
                  placeholder="Search customers by name, email, or ID..."
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className={showFilters ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' : ''}
              >
                🔍 Filters {Object.values(filters).filter(v => v !== 'all' && v !== '').length > 0 && 
                  `(${Object.values(filters).filter(v => v !== 'all' && v !== '').length})`
                }
              </Button>
              
              <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  📋 Table
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  🔲 Grid
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedCustomers.length > 0 && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                {onBulkUpdateStatus && (
                  <>
                    <Button
                      onClick={() => onBulkUpdateStatus(selectedCustomers, 'active')}
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      ✅ Activate
                    </Button>
                    <Button
                      onClick={() => onBulkUpdateStatus(selectedCustomers, 'inactive')}
                      variant="outline"
                      size="sm"
                      className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                    >
                      ⏸️ Deactivate
                    </Button>
                    <Button
                      onClick={() => onBulkUpdateStatus(selectedCustomers, 'blocked')}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      🚫 Block
                    </Button>
                  </>
                )}
                {onExportSelected && (
                  <Button
                    onClick={() => onExportSelected(selectedCustomers)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    📤 Export
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 dark:text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Joined</label>
                <select
                  value={filters.joinedDateRange}
                  onChange={(e) => handleFilterChange('joinedDateRange', e.target.value)}
                  className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 dark:text-white"
                >
                  <option value="all">All Time</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="3m">Last 3 months</option>
                  <option value="6m">Last 6 months</option>
                  <option value="1y">Last year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Spent</label>
                <select
                  value={filters.spentRange}
                  onChange={(e) => handleFilterChange('spentRange', e.target.value)}
                  className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 dark:text-white"
                >
                  <option value="all">Any Amount</option>
                  <option value="0-100">$0 - $100</option>
                  <option value="100-500">$100 - $500</option>
                  <option value="500-1000">$500 - $1000</option>
                  <option value="1000+">$1000+</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Orders</label>
                <select
                  value={filters.orderCount}
                  onChange={(e) => handleFilterChange('orderCount', e.target.value)}
                  className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 dark:text-white"
                >
                  <option value="all">Any Count</option>
                  <option value="0">No orders</option>
                  <option value="1-5">1-5 orders</option>
                  <option value="6-10">6-10 orders</option>
                  <option value="10+">10+ orders</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Last Login</label>
                <select
                  value={filters.lastLogin}
                  onChange={(e) => handleFilterChange('lastLogin', e.target.value)}
                  className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 dark:text-white"
                >
                  <option value="all">Any Time</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="60d">Last 60 days</option>
                  <option value="never">Never</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 w-full"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="px-6 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing {filteredAndSortedCustomers.length} of {customers.length} customers
          </span>
          <span>
            Total Value: <Price 
              amount={filteredAndSortedCustomers.reduce((sum, c) => sum + c.totalSpent, 0)} 
              locale={isRTL ? 'ar' : 'en'} 
            />
          </span>
        </div>
      </div>

      {/* Content */}
      {filteredAndSortedCustomers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {filters.search || filters.status !== 'all' || filters.joinedDateRange !== 'all' 
              ? 'No customers match your filters' 
              : 'No customers found'
            }
          </p>
          {(filters.search || filters.status !== 'all' || filters.joinedDateRange !== 'all') && (
            <Button onClick={clearFilters} variant="outline" size="sm" className="mt-2">
              Clear Filters
            </Button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        // Table View
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isSomeSelected;
                    }}
                    onChange={onSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                {[
                  { key: 'name', label: 'Customer', sortable: true },
                  { key: 'email', label: 'Contact', sortable: true },
                  { key: 'totalOrders', label: 'Orders', sortable: true },
                  { key: 'totalSpent', label: 'Total Spent', sortable: true },
                  { key: 'status', label: 'Status', sortable: false },
                  { key: 'createdAt', label: 'Joined', sortable: true },
                  { key: 'lastLoginAt', label: 'Last Login', sortable: true },
                  { key: 'actions', label: 'Actions', sortable: false },
                ].map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                      isRTL ? 'text-right' : 'text-left'
                    } ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''}`}
                    onClick={column.sortable ? () => handleSort(column.key as SortField) : undefined}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.sortable && sortField === column.key && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => onSelectCustomer(customer.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden mr-4">
                        {customer.avatar ? (
                          <img
                            src={customer.avatar}
                            alt={customer.firstName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 font-medium">
                            {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
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
                      <div className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</div>
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
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(customer.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {customer.lastLoginAt ? formatDate(customer.lastLoginAt) : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => onView(customer)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View
                      </Button>
                      {onEdit && (
                        <Button
                          onClick={() => onEdit(customer)}
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                        >
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          onClick={() => onDelete(customer.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Grid View
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedCustomers.map((customer) => (
              <div key={customer.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => onSelectCustomer(customer.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                      {customer.avatar ? (
                        <img
                          src={customer.avatar}
                          alt={customer.firstName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                    {customer.status}
                  </span>
                </div>

                <div className="mb-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {customer.firstName} {customer.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                  {customer.phone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Orders:</span>
                    <span className="font-medium text-gray-900 dark:text-white ml-1">
                      {customer.totalOrders}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Spent:</span>
                    <span className="font-medium text-gray-900 dark:text-white ml-1">
                      <Price amount={customer.totalSpent} locale={isRTL ? 'ar' : 'en'} />
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Joined:</span>
                    <span className="font-medium text-gray-900 dark:text-white ml-1">
                      {formatDate(customer.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Login:</span>
                    <span className="font-medium text-gray-900 dark:text-white ml-1">
                      {customer.lastLoginAt ? formatDate(customer.lastLoginAt) : 'Never'}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => onView(customer)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-blue-600 hover:text-blue-700"
                  >
                    View
                  </Button>
                  {onEdit && (
                    <Button
                      onClick={() => onEdit(customer)}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-green-600 hover:text-green-700"
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
