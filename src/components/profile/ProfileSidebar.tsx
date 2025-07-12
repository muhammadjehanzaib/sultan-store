'use client';

import React from 'react';
import { User } from '@/types';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

type ProfileSection = 'overview' | 'personal' | 'addresses' | 'orders' | 'security' | 'notifications';

interface ProfileSidebarProps {
  user: User;
  activeSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ user, activeSection, onSectionChange }) => {
  const { t, isRTL } = useLanguage();
  
  // Smart email truncation function
  const truncateEmail = (email: string, maxLength: number = 20) => {
    if (email.length <= maxLength) return email;
    
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    
    const maxLocalLength = maxLength - domain.length - 4; // -4 for '...@'
    if (maxLocalLength <= 3) {
      return `${localPart.slice(0, 2)}...@${domain}`;
    }
    
    return `${localPart.slice(0, maxLocalLength)}...@${domain}`;
  };
  
  const sections: { id: ProfileSection; label: string }[] = [
    { id: 'overview', label: t('profile.overview') },
    { id: 'personal', label: t('profile.personal') },
    { id: 'addresses', label: t('profile.addresses') },
    { id: 'orders', label: t('profile.orders') },
    { id: 'security', label: t('profile.security') },
    { id: 'notifications', label: t('profile.notifications') },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
        <Image
          src={user.avatar || '/default-avatar.svg'}
          alt={user.name}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 truncate">{user.firstName} {user.lastName}</h2>
          <p className="text-sm text-gray-600" title={user.email}>{truncateEmail(user.email)}</p>
        </div>
      </div>

      <nav className="space-y-2">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`w-full px-4 py-2 font-medium rounded-lg transition-colors ${
              activeSection === section.id ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'
            } ${isRTL ? 'text-right' : 'text-left'}`}
            onClick={() => onSectionChange(section.id)}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

