'use client';

import React from 'react';
import { User } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProfileOverviewProps {
  user: User;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({ user }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">{t('profile.overview')}</h2>
      <p className="text-gray-700">{t('profile.welcomeBack').replace('{{name}}', user.firstName || user.name)}</p>
      <div className="space-y-2 text-gray-500">
        <h3 className="text-lg font-semibold text-gray-800">{t('profile.accountInfo')}</h3>
        <p><strong>{t('profile.email')}:</strong> {user.email}</p>
        <p><strong>{t('profile.name')}:</strong> {user.firstName} {user.lastName}</p>
        <p><strong>{t('profile.joined')}:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
      </div>
    </div>
  );
};

