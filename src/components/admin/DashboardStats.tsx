'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardStatsProps {}

export function DashboardStats({}: DashboardStatsProps) {
  const { t } = useLanguage();

  // Dummy stats data
  const stats = [
    { title: t('admin.dashboard.totalSales'), value: '$12000' },
    { title: t('admin.dashboard.orders'), value: '150' },
    { title: t('admin.dashboard.products'), value: '45' },
    { title: t('admin.dashboard.customers'), value: '300' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="flex items-center justify-between px-4 py-6 bg-white dark:bg-gray-800 shadow rounded-lg"
        >
          <dl>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {stat.title}
            </dt>
            <dd className="flex items-center justify-center text-2xl font-semibold text-gray-900 dark:text-white">
              {stat.value}
            </dd>
          </dl>
        </div>
      ))}
    </div>
  );
}

