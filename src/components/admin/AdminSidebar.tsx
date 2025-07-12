'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter, usePathname } from 'next/navigation';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const navigation = [
    {
      name: t('admin.nav.dashboard'),
      href: '/admin',
      icon: '📊',
      current: pathname === '/admin'
    },
    {
      name: t('admin.nav.products'),
      href: '/admin/products',
      icon: '📦',
      current: pathname === '/admin/products'
    },
    {
      name: t('admin.nav.categories'),
      href: '/admin/categories',
      icon: '🏷️',
      current: pathname === '/admin/categories'
    },
    {
      name: t('admin.nav.orders'),
      href: '/admin/orders',
      icon: '📋',
      current: pathname === '/admin/orders'
    },
    {
      name: t('admin.nav.customers'),
      href: '/admin/customers',
      icon: '👥',
      current: pathname === '/admin/customers'
    },
    {
      name: t('admin.reviews.title'),
      href: '/admin/reviews',
      icon: '⭐',
      current: pathname === '/admin/reviews'
    },
    {
      name: t('admin.inventory.title'),
      href: '/admin/inventory',
      icon: '📦',
      current: pathname === '/admin/inventory'
    },
    {
      name: t('admin.nav.analytics'),
      href: '/admin/analytics',
      icon: '📈',
      current: pathname === '/admin/analytics'
    },
    {
      name: t('admin.nav.settings'),
      href: '/admin/settings',
      icon: '⚙️',
      current: pathname === '/admin/settings'
    },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        {/* Logo */}
        <div className="flex items-center justify-center h-16 bg-blue-600 dark:bg-blue-700">
          <h1 className="text-white text-xl font-bold">
            {t('admin.title')}
          </h1>
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  item.current
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                } ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <span className={`text-lg ${isRTL ? 'ml-3' : 'mr-3'}`}>
                  {item.icon}
                </span>
                {item.name}
              </button>
            ))}
          </div>
        </nav>

        {/* Language Switcher */}
        <div className="absolute  bottom-4 left-4 right-4">
          <LanguageSwitcher variant='button'/>
        </div>
        

        {/* Back to Store */}
        <div className="absolute bottom-16 left-4 right-4">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <span className={`${isRTL ? 'ml-2' : 'mr-2'}`}>🏪</span>
            {t('admin.backToStore')}
          </button>
        </div>
      </div>
    </>
  );
}
