'use client';

import React from 'react';
import { User } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProfileCompletionIndicatorProps {
  user: User;
}

export const ProfileCompletionIndicator: React.FC<ProfileCompletionIndicatorProps> = ({ user }) => {
  const { t } = useLanguage();

  const calculateCompletion = () => {
    const checks = [
      { field: 'firstName', weight: 15, label: t('profile.firstName') },
      { field: 'lastName', weight: 15, label: t('profile.lastName') },
      { field: 'phone', weight: 10, label: t('profile.phoneNumber') },
      { field: 'avatar', weight: 10, label: 'Profile Picture' },
      { field: 'addresses', weight: 20, label: t('profile.addresses'), custom: () => user.addresses && user.addresses.length > 0 },
      { field: 'email', weight: 20, label: t('profile.email') }, // Email is required but worth more
      { field: 'twoFactorEnabled', weight: 10, label: 'Two-Factor Authentication', custom: () => false }, // Assume not enabled by default
    ];

    let completedWeight = 0;
    const missingFields: string[] = [];

    checks.forEach(check => {
      const isCompleted = check.custom 
        ? check.custom() 
        : user[check.field as keyof User] && String(user[check.field as keyof User]).trim() !== '';

      if (isCompleted) {
        completedWeight += check.weight;
      } else {
        missingFields.push(check.label);
      }
    });

    return { percentage: Math.min(completedWeight, 100), missingFields };
  };

  const { percentage, missingFields } = calculateCompletion();

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTextColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-700';
    if (percentage >= 70) return 'text-yellow-700';
    if (percentage >= 50) return 'text-orange-700';
    return 'text-red-700';
  };

  if (percentage >= 100) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">✅</span>
          <div>
            <h3 className="font-medium text-green-800">Profile Complete!</h3>
            <p className="text-sm text-green-700">Your profile is fully set up and ready to go.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-blue-800">Profile Completion</h3>
        <span className={`text-sm font-medium ${getTextColor(percentage)}`}>
          {percentage}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {missingFields.length > 0 && (
        <div>
          <p className="text-sm text-blue-700 mb-2">
            Complete your profile by adding:
          </p>
          <ul className="text-sm text-blue-600">
            {missingFields.slice(0, 3).map((field, index) => (
              <li key={index} className="flex items-center">
                <span className="w-1 h-1 bg-blue-400 rounded-full mr-2"></span>
                {field}
              </li>
            ))}
            {missingFields.length > 3 && (
              <li className="flex items-center text-blue-500">
                <span className="w-1 h-1 bg-blue-400 rounded-full mr-2"></span>
                +{missingFields.length - 3} more items
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
