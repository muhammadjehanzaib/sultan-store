'use client';

import React, { useState } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { PasswordChangeForm } from './PasswordChangeForm';

interface SecuritySettingsProps {
  user: User;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ user }) => {
  const { t } = useLanguage();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('profile.securitySettings')}</h2>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{t('profile.password')}</h3>
              <p className="text-gray-600">{t('profile.changePasswordDesc')}</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Secured with strong password
                </span>
              </div>
            </div>
            {!showPasswordForm && (
              <Button onClick={() => setShowPasswordForm(true)} variant="outline">
                {t('profile.changePassword')}
              </Button>
            )}
          </div>

          {showPasswordForm && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <PasswordChangeForm
                user={user}
                onSuccess={() => setShowPasswordForm(false)}
                onCancel={() => setShowPasswordForm(false)}
              />
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Two-Factor Authentication</h3>
              <p className="text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline">
              Enable 2FA
            </Button>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Login Sessions</h3>
              <p className="text-gray-600">Manage your active login sessions</p>
            </div>
            <Button variant="outline">
              View Sessions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
