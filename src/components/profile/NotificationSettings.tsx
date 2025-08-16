'use client';

import React, { useState } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotificationSettingsProps {
  user: User;
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ user }) => {
  const { t } = useLanguage();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    sms: false,
    push: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPreferences(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('profile.notificationSettings')}</h2>
      <p className="text-gray-600">{t('profile.notificationPreferences')}</p>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="email"
            name="email"
            checked={preferences.email}
            onChange={handlePreferenceChange}
            className="mr-2"
          />
          <label htmlFor="email" className="text-gray-700">{t('profile.emailNotifications')}</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="sms"
            name="sms"
            checked={preferences.sms}
            onChange={handlePreferenceChange}
            className="mr-2"
          />
          <label htmlFor="sms" className="text-gray-700">{t('profile.smsNotifications')}</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="push"
            name="push"
            checked={preferences.push}
            onChange={handlePreferenceChange}
            className="mr-2"
          />
          <label htmlFor="push" className="text-gray-700">{t('profile.pushNotifications')}</label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? t('profile.saving') : t('profile.saveChanges')}
        </Button>
      </div>
    </div>
  );
};

