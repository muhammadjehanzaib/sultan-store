'use client';

import React, { useState } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface PersonalInfoProps {
  user: User;
}

interface PersonalInfoForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({ user }) => {
  const { t, isRTL } = useLanguage();
  const { updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Debug user data
  console.log('PersonalInfo user data:', {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    name: user.name,
    id: user.id
  });
  
  const [formData, setFormData] = useState<PersonalInfoForm>({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email,
    phone: user.phone || '',
    avatar: user.avatar || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatar || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('profile.errors.firstNameRequired');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('profile.errors.lastNameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('profile.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('profile.errors.emailInvalid');
    }

    if (formData.phone && !/^[+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = t('profile.errors.phoneInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: t('profile.errors.fileTooLarge') }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, avatar: t('profile.errors.invalidFileType') }));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatarPreview(result);
      setFormData(prev => ({ ...prev, avatar: result }));
    };
    reader.readAsDataURL(file);

    // Clear avatar error
    if (errors.avatar) {
      setErrors(prev => ({ ...prev, avatar: '' }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you would call your API to update user info
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          avatar: formData.avatar,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
        setIsEditing(false);
        // Show success message
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating user info:', error);
      setErrors({ general: t('profile.errors.updateFailed') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || '',
    });
    setAvatarPreview(user.avatar || '');
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('profile.personalInfo')}</h2>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
          >
            {t('common.edit')}
          </Button>
        )}
      </div>

      {/* General Error Message */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{errors.general}</p>
        </div>
      )}

      {/* Profile Avatar Section */}
      <div className="flex flex-col items-center space-y-4 py-6 bg-gray-50 rounded-lg">
        <div className="relative">
          <Image
            src={avatarPreview || '/default-avatar.svg'}
            alt={`${user.firstName || 'User'} Avatar`}
            width={120}
            height={120}
            className="rounded-full object-cover border-4 border-white shadow-lg"
          />
          {isEditing && (
            <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </label>
          )}
        </div>
        {isEditing && (
          <p className="text-sm text-gray-600 text-center">
            {t('profile.avatarHelpText')}
          </p>
        )}
        {errors.avatar && (
          <p className="text-red-600 text-sm">{errors.avatar}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            {t('profile.firstName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 text-gray-700 ${
              errors.firstName ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.firstName && (
            <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            {t('profile.lastName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 text-gray-700 ${
              errors.lastName ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.lastName && (
            <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {t('profile.emailAddress')} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 text-gray-700 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            {t('profile.phoneNumber')}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="+966 50 123 4567"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 text-gray-700 ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      {isEditing && (
        <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? t('profile.saving') : t('profile.saveChanges')}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
        </div>
      )}

      {!isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-blue-700 text-sm">
              {t('profile.personalInfoHelpText')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
