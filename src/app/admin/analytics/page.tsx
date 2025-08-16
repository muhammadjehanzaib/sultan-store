'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SalesChart } from '@/components/admin/SalesChart';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { AdvancedAnalyticsDashboard } from '@/components/admin/AdvancedAnalyticsDashboard';
import { Order, Product, Customer } from '@/types';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'basic' | 'advanced'>('advanced');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all required data
        const [ordersRes, productsRes, customersRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/products'),
          fetch('/api/admin/customers')
        ]);
        
        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        const customersData = await customersRes.json();
        
        setOrders(ordersData.orders || []);
        setProducts(productsData.products || []);
        setCustomers(customersData.customers || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <AdminAuthGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('admin.analytics.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Analyze your business performance and trends
              </p>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex">
              <button
                onClick={() => setActiveView('advanced')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  activeView === 'advanced'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                📊 Advanced
              </button>
              <button
                onClick={() => setActiveView('basic')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  activeView === 'basic'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                📋 Basic
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Loading analytics data...</span>
            </div>
          ) : activeView === 'advanced' ? (
            <AdvancedAnalyticsDashboard
              orders={orders}
              products={products}
              customers={customers}
            />
          ) : (
            <>
              {/* Overview Stats */}
              <DashboardStats />

              {/* Sales Trend Chart */}
              <div className="mb-8">
                <SalesChart />
              </div>

              {/* Additional Analytics Components can be added here */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t('admin.analytics.topProducts')}
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      Top selling products analytics coming soon...
                    </p>
                  </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t('admin.analytics.orderStatus')}
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      Order status distribution coming soon...
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
