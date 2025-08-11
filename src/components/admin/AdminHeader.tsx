'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useRouter } from 'next/navigation';
import { NotificationBell } from '@/components/layout/NotificationBell';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { t, isRTL } = useLanguage();
  const { user, logout } = useAdminAuth();
  const router = useRouter();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="sr-only">{t('admin.openMenu')}</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Breadcrumb */}
          <div className={`${isRTL ? 'mr-4' : 'ml-4'} lg:ml-0 lg:mr-0`}>
            <nav className="flex" aria-label="Breadcrumb">
              <ol className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                <li>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('admin.breadcrumb.admin')}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* User info */}
        <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
          {/* Notifications */}
          <NotificationBell className="text-gray-500 hover:text-gray-700" />

          {/* User profile */}
          <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {user?.name || t('admin.defaultAdmin')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('admin.adminRole')}
              </div>
            </div>
          </div>
          {/* Logout button */}
          {user && (
            <button
              onClick={() => { logout(); router.replace('/admin/login'); }}
              className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              {t('admin.logout') || 'Logout'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
