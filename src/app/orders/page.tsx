'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { OrderHistory } from '@/components/profile/OrderHistory';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { redirect } from 'next/navigation';

export default function OrdersPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();

  // Handle authentication redirects only after loading is complete
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect('/');
    }
  }, [isLoading, isAuthenticated]);

  // Show loading spinner while authentication state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't render anything if redirecting
  if (!isAuthenticated || !user) {
    return null;
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-ecommerce py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('profile.orders')}
          </h1>
          <p className="text-gray-600 mt-2">
            {user.isGuest
              ? t('orders.guestOrdersSubtitle') || 'View your recent order history'
              : t('orders.ordersSubtitle') || 'Manage and track your orders'
            }
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <OrderHistory user={user} />
        </div>
      </div>
    </div>
  );
}
