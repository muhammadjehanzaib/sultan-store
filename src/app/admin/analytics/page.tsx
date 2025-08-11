'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SalesChart } from '@/components/admin/SalesChart';
import { DashboardStats } from '@/components/admin/DashboardStats';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

export default function AnalyticsPage() {
  const { t } = useLanguage();

  return (
    <AdminAuthGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('admin.analytics.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Analyze your business performance and trends
            </p>
          </div>

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
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
