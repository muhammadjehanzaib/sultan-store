'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Customer } from '@/types';
import Price from '@/components/ui/Price';
import { Button } from '@/components/ui/Button';

interface CustomerDashboardProps {
  customers: Customer[];
  onViewCustomer: (customer: Customer) => void;
  onUpdateStatus: (customerId: string, status: Customer['status']) => void;
  onExportSegment?: (customers: Customer[]) => void;
}

interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  condition: (customer: Customer) => boolean;
  icon: string;
  color: string;
}

export function CustomerDashboard({
  customers,
  onViewCustomer,
  onUpdateStatus,
  onExportSegment,
}: CustomerDashboardProps) {
  const { t, isRTL } = useLanguage();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '3m' | '6m' | '1y'>('30d');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');

  // Define customer segments
  const segments: CustomerSegment[] = [
    {
      id: 'high-value',
      name: 'High Value Customers',
      description: 'Customers with total spent > $1000',
      condition: (customer) => customer.totalSpent > 1000,
      icon: '💎',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    },
    {
      id: 'frequent-buyers',
      name: 'Frequent Buyers',
      description: 'Customers with 10+ orders',
      condition: (customer) => customer.totalOrders >= 10,
      icon: '🛒',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    },
    {
      id: 'new-customers',
      name: 'New Customers',
      description: 'Customers who joined in the last 30 days',
      condition: (customer) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(customer.createdAt) > thirtyDaysAgo;
      },
      icon: '✨',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    {
      id: 'at-risk',
      name: 'At Risk Customers',
      description: 'Customers who haven\'t logged in for 60+ days',
      condition: (customer) => {
        if (!customer.lastLoginAt) return true;
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        return new Date(customer.lastLoginAt) < sixtyDaysAgo;
      },
      icon: '⚠️',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    },
    {
      id: 'inactive',
      name: 'Inactive Customers',
      description: 'Customers with inactive status',
      condition: (customer) => customer.status === 'inactive',
      icon: '😴',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    },
    {
      id: 'blocked',
      name: 'Blocked Customers',
      description: 'Customers with blocked status',
      condition: (customer) => customer.status === 'blocked',
      icon: '🚫',
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
  ];

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const averageCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    // Growth metrics (assuming recent data for demo)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomersThisMonth = customers.filter(c => 
      new Date(c.createdAt) > thirtyDaysAgo
    ).length;

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const newCustomersLastMonth = customers.filter(c => {
      const date = new Date(c.createdAt);
      return date > sixtyDaysAgo && date <= thirtyDaysAgo;
    }).length;

    const customerGrowthRate = newCustomersLastMonth > 0 
      ? ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth) * 100 
      : 0;

    // Segment counts
    const segmentCounts = segments.reduce((acc, segment) => {
      acc[segment.id] = customers.filter(segment.condition).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCustomers,
      activeCustomers,
      totalRevenue,
      totalOrders,
      averageOrderValue,
      averageCustomerValue,
      newCustomersThisMonth,
      customerGrowthRate,
      segmentCounts,
      retentionRate: totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0,
    };
  }, [customers, segments]);

  // Get top customers
  const topCustomers = useMemo(() => {
    return [...customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  }, [customers]);

  // Get recent customers
  const recentCustomers = useMemo(() => {
    return [...customers]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [customers]);

  // Get filtered customers based on segment
  const filteredCustomers = useMemo(() => {
    if (selectedSegment === 'all') return customers;
    const segment = segments.find(s => s.id === selectedSegment);
    return segment ? customers.filter(segment.condition) : customers;
  }, [customers, selectedSegment, segments]);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">👥</span>
            </div>
            <div className={`${isRTL ? 'mr-3' : 'ml-3'} flex-1`}>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Total Customers
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {metrics.totalCustomers.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                +{metrics.newCustomersThisMonth} this month
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">✅</span>
            </div>
            <div className={`${isRTL ? 'mr-3' : 'ml-3'} flex-1`}>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Active Customers
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {metrics.activeCustomers.toLocaleString()}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {metrics.retentionRate.toFixed(1)}% retention rate
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">💰</span>
            </div>
            <div className={`${isRTL ? 'mr-3' : 'ml-3'} flex-1`}>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Total Revenue
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                <Price amount={metrics.totalRevenue} locale={isRTL ? 'ar' : 'en'} />
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Avg: <Price amount={metrics.averageCustomerValue} locale={isRTL ? 'ar' : 'en'} /> per customer
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">📈</span>
            </div>
            <div className={`${isRTL ? 'mr-3' : 'ml-3'} flex-1`}>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Growth Rate
              </p>
              <p className={`text-2xl font-semibold ${
                metrics.customerGrowthRate >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {metrics.customerGrowthRate >= 0 ? '+' : ''}{metrics.customerGrowthRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last 30 days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Customer Segments</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Analyze customer behavior and target specific groups
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedSegment('all')}
              className={`p-4 rounded-lg border transition-colors ${
                selectedSegment === 'all'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">👥</span>
                    <h4 className="font-medium text-gray-900 dark:text-white">All Customers</h4>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Complete customer base
                  </p>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {customers.length}
                </div>
              </div>
            </button>

            {segments.map((segment) => (
              <button
                key={segment.id}
                onClick={() => setSelectedSegment(segment.id)}
                className={`p-4 rounded-lg border transition-colors ${
                  selectedSegment === segment.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{segment.icon}</span>
                      <h4 className="font-medium text-gray-900 dark:text-white">{segment.name}</h4>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {segment.description}
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics.segmentCounts[segment.id] || 0}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Customers and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Customers</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Highest spending customers
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                      {customer.avatar ? (
                        <img
                          src={customer.avatar}
                          alt={customer.firstName}
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {customer.totalOrders} orders
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      <Price amount={customer.totalSpent} locale={isRTL ? 'ar' : 'en'} />
                    </div>
                    <button
                      onClick={() => onViewCustomer(customer)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Customers</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Recently joined customers
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                      {customer.avatar ? (
                        <img
                          src={customer.avatar}
                          alt={customer.firstName}
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {customer.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(customer.createdAt)}
                    </div>
                    <button
                      onClick={() => onViewCustomer(customer)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Current Segment Summary */}
      {selectedSegment !== 'all' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {segments.find(s => s.id === selectedSegment)?.name} Analysis
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredCustomers.length} customers in this segment
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    if (onExportSegment) {
                      onExportSegment(filteredCustomers);
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  📤 Export Segment
                </Button>
                <Button
                  onClick={() => setSelectedSegment('all')}
                  variant="outline"
                  size="sm"
                >
                  View All
                </Button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <Price 
                    amount={filteredCustomers.reduce((sum, c) => sum + c.totalSpent, 0)} 
                    locale={isRTL ? 'ar' : 'en'} 
                  />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <Price 
                    amount={filteredCustomers.length > 0 
                      ? filteredCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / filteredCustomers.length 
                      : 0
                    } 
                    locale={isRTL ? 'ar' : 'en'} 
                  />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Customer Value</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredCustomers.reduce((sum, c) => sum + c.totalOrders, 0)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Orders</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
