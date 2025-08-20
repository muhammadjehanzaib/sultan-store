'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSearchParams } from 'next/navigation';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { ProfileOverview } from '@/components/profile/ProfileOverview';
import { PersonalInfo } from '@/components/profile/PersonalInfo';
import { AddressBook } from '@/components/profile/AddressBook';
import { OrderHistory } from '@/components/profile/OrderHistory';
import { SecuritySettings } from '@/components/profile/SecuritySettings';
import { NotificationSettings } from '@/components/profile/NotificationSettings';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { redirect } from 'next/navigation';

type ProfileSection = 'overview' | 'personal' | 'addresses' | 'orders' | 'security' | 'notifications';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, isRTL } = useLanguage();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<ProfileSection>('overview');

  // Handle URL section parameter
  useEffect(() => {
    const section = searchParams.get('section') as ProfileSection;
    if (section && ['overview', 'personal', 'addresses', 'orders', 'security', 'notifications'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

  // Handle authentication redirects only after loading is complete
  useEffect(() => {
    if (!isLoading) {
      // Redirect if not authenticated
      if (!isAuthenticated) {
        redirect('/');
        return;
      }
      
      // Redirect guest users to home page since they don't have a full profile
      if (user?.isGuest) {
        redirect('/');
        return;
      }
    }
  }, [isLoading, isAuthenticated, user]);

  // Show loading spinner while authentication state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't render anything if redirecting
  if (!isAuthenticated || user?.isGuest || !user) {
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <ProfileOverview user={user} />;
      case 'personal':
        return <PersonalInfo user={user} />;
      case 'addresses':
        return <AddressBook user={user} />;
      case 'orders':
        return <OrderHistory user={user} />;
      case 'security':
        return <SecuritySettings user={user} />;
      case 'notifications':
        return <NotificationSettings user={user} />;
      default:
        return <ProfileOverview user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('profile.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('profile.subtitle')}
          </p>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-4 gap-8 ${isRTL ? 'rtl' : 'ltr'}`}>
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProfileSidebar
              user={user}
              activeSection={activeSection}
              onSectionChange={(section) => setActiveSection(section)}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
