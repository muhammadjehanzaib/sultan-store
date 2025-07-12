'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BillingAddress, ShippingAddress } from '@/types';

interface CheckoutFormProps {
  billingAddress: BillingAddress | null;
  shippingAddress: ShippingAddress | null;
  onBillingAddressChange: (address: BillingAddress) => void;
  onShippingAddressChange: (address: ShippingAddress) => void;
  onNext: () => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  billingAddress,
  shippingAddress,
  onBillingAddressChange,
  onShippingAddressChange,
  onNext
}) => {
  const { t, isRTL } = useLanguage();
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [formData, setFormData] = useState<BillingAddress>({
    firstName: billingAddress?.firstName || '',
    lastName: billingAddress?.lastName || '',
    email: billingAddress?.email || '',
    phone: billingAddress?.phone || '',
    address: billingAddress?.address || '',
    city: billingAddress?.city || '',
    state: billingAddress?.state || '',
    zipCode: billingAddress?.zipCode || '',
    country: billingAddress?.country || ''
  });

  const [shippingData, setShippingData] = useState<ShippingAddress>({
    firstName: shippingAddress?.firstName || '',
    lastName: shippingAddress?.lastName || '',
    email: shippingAddress?.email || '',
    phone: shippingAddress?.phone || '',
    address: shippingAddress?.address || '',
    city: shippingAddress?.city || '',
    state: shippingAddress?.state || '',
    zipCode: shippingAddress?.zipCode || '',
    country: shippingAddress?.country || ''
  });

  const handleInputChange = (field: keyof BillingAddress, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleShippingInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields: (keyof BillingAddress)[] = [
      'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'country'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    onBillingAddressChange(formData);
    
    if (sameAsBilling) {
      onShippingAddressChange({ ...formData });
    } else {
      const shippingMissingFields = requiredFields.filter(field => !shippingData[field]);
      if (shippingMissingFields.length > 0) {
        alert(`Please fill in all shipping fields: ${shippingMissingFields.join(', ')}`);
        return;
      }
      onShippingAddressChange(shippingData);
    }
    
    onNext();
  };

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'EG', name: 'Egypt' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-black">{t('checkout.shipping')}</h2>
      
      {/* Billing Address */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-black">{t('checkout.billingAddress')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('checkout.firstName')} *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black" 
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('checkout.lastName')} *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('checkout.email')} *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('checkout.phone')} *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('checkout.address')} *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('checkout.city')} *
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('checkout.state')} *
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('checkout.zipCode')} *
            </label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('checkout.country')} *
            </label>
            <select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
              required
            >
              <option value="">{t('checkout.selectCountry')}</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="sameAsBilling"
            checked={sameAsBilling}
            onChange={(e) => setSameAsBilling(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="sameAsBilling" className="text-sm font-medium text-gray-700">
            {t('checkout.sameAsBilling')}
          </label>
        </div>

        {!sameAsBilling && (
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('checkout.shippingAddress')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('checkout.firstName')} *
                </label>
                <input
                  type="text"
                  value={shippingData.firstName}
                  onChange={(e) => handleShippingInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                  required={!sameAsBilling}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('checkout.lastName')} *
                </label>
                <input
                  type="text"
                  value={shippingData.lastName}
                  onChange={(e) => handleShippingInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                  required={!sameAsBilling}
                />
              </div>
              
              {/* Add other shipping fields similar to billing */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('checkout.address')} *
                </label>
                <input
                  type="text"
                  value={shippingData.address}
                  onChange={(e) => handleShippingInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                  required={!sameAsBilling}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {t('checkout.continueToPayment')}
        </button>
      </div>
    </form>
  );
};
