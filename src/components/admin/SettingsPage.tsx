'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Price from '@/components/ui/Price';
import { useSettings } from '@/hooks/useSettings';

interface Settings {
  id: string;
  taxRate: number;
  shippingRate: number;
  freeShippingThreshold: number;
  codFee: number;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  updatedAt: string;
}

export const SettingsPage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state with proper default values to prevent uncontrolled input issues
  const [formData, setFormData] = useState({
    taxRate: 15, // Default 15% VAT
    shippingRate: 15.0, // Default 15 SAR shipping
    freeShippingThreshold: 50.0, // Default 50 SAR free shipping threshold
    codFee: 25.0, // Default 25 SAR COD fee
    businessName: 'SaudiSafety',
    businessEmail: 'support@saudisafety.com',
    businessPhone: '+966 XXX XXXX',
    businessAddress: 'Riyadh, Saudi Arabia'
  });

  // Fetch current settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      
      const data = await response.json();
      setSettings(data.settings);
      
      // Update form data
      setFormData({
        taxRate: data.settings.taxRate * 100 || 15, // Convert to percentage for display
        shippingRate: data.settings.shippingRate || 15.0,
        freeShippingThreshold: data.settings.freeShippingThreshold || 50.0,
        codFee: data.settings.codFee || 25.0,
        businessName: data.settings.businessName || 'SaudiSafety',
        businessEmail: data.settings.businessEmail || 'support@saudisafety.com',
        businessPhone: data.settings.businessPhone || '+966 XXX XXXX',
        businessAddress: data.settings.businessAddress || 'Riyadh, Saudi Arabia'
      });
      
    } catch (error) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear messages when user starts typing
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          taxRate: formData.taxRate / 100 // Convert percentage back to decimal
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update settings');
      }

      const data = await response.json();
      setSettings(data.settings);
      setSuccess('Settings updated successfully!');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      setError(error.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.settings.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('admin.settings.subtitle')}
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Tax & Shipping Settings */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tax & Shipping Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tax Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tax Rate (VAT %)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.taxRate}
                onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Current: {formData.taxRate}%</p>
            </div>
            
            {/* Shipping Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shipping Rate
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.shippingRate}
                onChange={(e) => handleInputChange('shippingRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Standard delivery cost: <Price amount={formData.shippingRate} locale={isRTL ? 'ar' : 'en'} className="text-xs" /></p>
            </div>
            
            {/* Free Shipping Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Free Shipping Threshold
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.freeShippingThreshold}
                onChange={(e) => handleInputChange('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Orders above <Price amount={formData.freeShippingThreshold} locale={isRTL ? 'ar' : 'en'} className="text-xs" /> get free shipping</p>
            </div>
            
            {/* COD Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                COD Fee
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.codFee}
                onChange={(e) => handleInputChange('codFee', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Fee charged for Cash on Delivery orders: <Price amount={formData.codFee} locale={isRTL ? 'ar' : 'en'} className="text-xs" /></p>
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Business Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            
            {/* Business Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Email
              </label>
              <input
                type="email"
                value={formData.businessEmail}
                onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            
            {/* Business Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Phone
              </label>
              <input
                type="text"
                value={formData.businessPhone}
                onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            
            {/* Business Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Address
              </label>
              <textarea
                value={formData.businessAddress}
                onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={saving}
            className="min-w-32"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </form>

      {/* Current Settings Summary */}
      {settings && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Current Settings Summary</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>• Tax Rate: {Math.round(settings.taxRate * 100)}% VAT</p>
            <p>• Shipping: {settings.shippingRate} SAR (Free over {settings.freeShippingThreshold} SAR)</p>
            <p>• COD Fee: {settings.codFee} SAR</p>
            <p>• Last Updated: {new Date(settings.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};
