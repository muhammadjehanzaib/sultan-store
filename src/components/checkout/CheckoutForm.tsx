'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { BillingAddress, ShippingAddress, Address } from '@/types';

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
  const { isAuthenticated, user } = useAuth();
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [formData, setFormData] = useState<BillingAddress>({
    firstName: billingAddress?.firstName || '',
    lastName: billingAddress?.lastName || '',
    email: billingAddress?.email || '',
    phone: billingAddress?.phone || '',
    address: billingAddress?.address || '',
    city: billingAddress?.city || '',
    state: billingAddress?.state || '',
    zipCode: billingAddress?.zipCode || '',
    country: billingAddress?.country || 'SA' // Default to Saudi Arabia
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
    country: shippingAddress?.country || 'SA' // Default to Saudi Arabia
  });

  // Load saved addresses when component mounts
  useEffect(() => {
    const loadSavedAddresses = async () => {
      if (!isAuthenticated || user?.isGuest) return;
      
      setLoadingAddresses(true);
      try {
        const response = await fetch('/api/user/addresses');
        const result = await response.json();
        
        if (response.ok) {
          setSavedAddresses(result.addresses || []);
          
          // Auto-populate with default billing address if form is empty
          const defaultBilling = result.addresses?.find((addr: Address) => 
            addr.type === 'billing' && addr.isDefault
          );
          const defaultShipping = result.addresses?.find((addr: Address) => 
            addr.type === 'shipping' && addr.isDefault
          );
          
          if (defaultBilling && !billingAddress?.firstName) {
            const mappedAddress = {
              firstName: defaultBilling.firstName,
              lastName: defaultBilling.lastName,
              email: user?.email || '',
              phone: defaultBilling.phone || '',
              address: defaultBilling.address,
              city: defaultBilling.city,
              state: defaultBilling.state,
              zipCode: defaultBilling.zipCode,
              country: 'SA' // Always set to Saudi Arabia
            };
            setFormData(mappedAddress);
          }
          
          if (defaultShipping && !shippingAddress?.firstName) {
            const mappedAddress = {
              firstName: defaultShipping.firstName,
              lastName: defaultShipping.lastName,
              email: user?.email || '',
              phone: defaultShipping.phone || '',
              address: defaultShipping.address,
              city: defaultShipping.city,
              state: defaultShipping.state,
              zipCode: defaultShipping.zipCode,
              country: 'SA' // Always set to Saudi Arabia
            };
            setShippingData(mappedAddress);
          }
        }
      } catch (error) {
        console.error('Error loading saved addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadSavedAddresses();
  }, [isAuthenticated, user]);

  // Helper function to populate form with selected address
  const populateWithAddress = (address: Address, isBilling: boolean = true) => {
    const mappedAddress = {
      firstName: address.firstName,
      lastName: address.lastName,
      email: user?.email || '',
      phone: address.phone || '',
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: 'SA' // Always set to Saudi Arabia since we only ship there
    };
    
    if (isBilling) {
      setFormData(mappedAddress);
    } else {
      setShippingData(mappedAddress);
    }
  };

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
    { code: 'SA', name: 'Saudi Arabia' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-black">{t('checkout.shipping')}</h2>
      
      {/* Billing Address */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-black">{t('checkout.billingAddress')}</h3>
        
        {/* Saved Addresses Dropdown for Billing */}
        {isAuthenticated && !user?.isGuest && savedAddresses.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Use saved address
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  const selectedAddress = savedAddresses.find(addr => addr.id === e.target.value);
                  if (selectedAddress) {
                    populateWithAddress(selectedAddress, true);
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
            >
              <option value="">Enter address manually</option>
              {savedAddresses
                .filter(addr => addr.type === 'billing' || addr.type === 'shipping')
                .map(address => (
                  <option key={address.id} value={address.id}>
                    {address.firstName} {address.lastName} - {address.address}, {address.city}
                    {address.isDefault ? ' (Default)' : ''}
                  </option>
                ))
              }
            </select>
          </div>
        )}
        
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
            
            {/* Saved Addresses Dropdown for Shipping */}
            {isAuthenticated && !user?.isGuest && savedAddresses.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Use saved shipping address
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const selectedAddress = savedAddresses.find(addr => addr.id === e.target.value);
                      if (selectedAddress) {
                        populateWithAddress(selectedAddress, false);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                >
                  <option value="">Enter address manually</option>
                  {savedAddresses
                    .filter(addr => addr.type === 'shipping' || addr.type === 'billing')
                    .map(address => (
                      <option key={address.id} value={address.id}>
                        {address.firstName} {address.lastName} - {address.address}, {address.city}
                        {address.isDefault ? ' (Default)' : ''}
                      </option>
                    ))
                  }
                </select>
              </div>
            )}
            
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
