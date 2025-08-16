'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Price from '@/components/ui/Price';
import { ProfileCompletionIndicator } from './ProfileCompletionIndicator';

interface ProfileOverviewProps {
  user: User;
}

interface ProfileStats {
  totalOrders: number;
  totalSpent: number;
  recentOrders: any[];
  savedAddresses: number;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({ user }) => {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const [stats, setStats] = useState<ProfileStats>({
    totalOrders: 0,
    totalSpent: 0,
    recentOrders: [],
    savedAddresses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        // Fetch user's order statistics
        const ordersResponse = await fetch(`/api/orders/customer/${user.email}`);
        if (ordersResponse.ok) {
          const orderData = await ordersResponse.json();
          
          // Handle different response formats
          let ordersArray = [];
          if (Array.isArray(orderData)) {
            ordersArray = orderData;
          } else if (orderData && Array.isArray(orderData.orders)) {
            ordersArray = orderData.orders;
          } else if (orderData && orderData.data && Array.isArray(orderData.data)) {
            ordersArray = orderData.data;
          }
          
          const totalSpent = ordersArray.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
          
          setStats({
            totalOrders: ordersArray.length,
            totalSpent,
            recentOrders: ordersArray.slice(0, 3), // Get last 3 orders
            savedAddresses: user.addresses?.length || 0
          });
        } else {
          // API not available, use default values
          setStats({
            totalOrders: 0,
            totalSpent: 0,
            recentOrders: [],
            savedAddresses: user.addresses?.length || 0
          });
        }
      } catch (error) {
        // Set default stats for development
        setStats({
          totalOrders: 0,
          totalSpent: 0,
          recentOrders: [],
          savedAddresses: user.addresses?.length || 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileStats();
  }, [user.email, user.addresses]);

  const quickActions = [
    {
      label: t('profile.viewOrders'),
      action: () => router.push('/orders'),
      icon: '📦'
    },
    {
      label: t('profile.editProfile'),
      action: () => router.push('/profile?section=personal'),
      icon: '✏️'
    },
    {
      label: t('profile.manageAddresses'),
      action: () => router.push('/profile?section=addresses'),
      icon: '📍'
    },
    {
      label: t('profile.securitySettings'),
      action: () => router.push('/profile?section=security'),
      icon: '🔒'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {t('profile.overview')}
        </h2>
        <p className="text-gray-700 mt-2">
          {t('profile.welcomeBack').replace('{{name}}', user.firstName || user.name || 'User')}
        </p>
      </div>

      {/* Profile Completion Indicator */}
      <ProfileCompletionIndicator user={user} />

      {/* Account Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">{t('profile.totalOrders')}</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
            <div className="text-3xl opacity-80">📦</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">{t('profile.totalSpent')}</p>
              <p className="text-2xl font-bold">
                <Price amount={stats.totalSpent} locale={isRTL ? 'ar' : 'en'} />
              </p>
            </div>
            <div className="text-3xl opacity-80">💰</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">{t('profile.savedAddresses')}</p>
              <p className="text-2xl font-bold">{stats.savedAddresses}</p>
            </div>
            <div className="text-3xl opacity-80">📍</div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {t('profile.accountInfo')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">{t('profile.email')}:</span>
            <span className="ml-2 text-gray-900">{user.email}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">{t('profile.name')}:</span>
            <span className="ml-2 text-gray-900">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.name || 'Not provided'
              }
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600">{t('profile.joined')}:</span>
            <span className="ml-2 text-gray-900">
              {user.createdAt 
                ? new Date(user.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'N/A'
              }
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600">{t('profile.accountStatus')}:</span>
            <span className="ml-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {t('profile.active')}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {t('profile.quickActions')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              variant="outline"
              className="h-20 flex-col space-y-2 text-sm"
            >
              <span className="text-2xl">{action.icon}</span>
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {stats.recentOrders.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {t('profile.recentActivity')}
          </h3>
          <div className="space-y-3">
            {stats.recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {t('profile.orderNumber').replace('{{number}}', order.id)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    <Price amount={order.total} locale={isRTL ? 'ar' : 'en'} />
                  </p>
                  <p className="text-sm text-gray-600 capitalize">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/orders')}
              className="w-full"
            >
              {t('profile.viewAllOrders')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

