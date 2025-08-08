'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { OrderHistory } from '@/components/profile/OrderHistory';
import { redirect } from 'next/navigation';

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  // Wait for auth state to hydrate
  if (isAuthenticated === false) {
    redirect('/');
  }

if (isAuthenticated === null || !user) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading your orders...</p>
    </div>
  );
}


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
