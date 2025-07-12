'use client';

import React, { useState } from 'react';
import { User, Address } from '@/types';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

interface AddressBookProps {
  user: User;
}

interface AddressForm {
  id?: string;
  type: 'billing' | 'shipping';
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export const AddressBook: React.FC<AddressBookProps> = ({ user }) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [activeAddress, setActiveAddress] = useState<AddressForm | null>(null);
  const [addressList, setAddressList] = useState<Address[]>(user.addresses || []);
  const [isLoading, setIsLoading] = useState(false);

  const startEditing = (address: Address | null) => {
    setActiveAddress(address ? {
      ...address,
      phone: address.phone || ''
    } : {
      type: 'shipping',
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      phone: ''
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setActiveAddress(null);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setActiveAddress((prev) => ({ ...prev!, [name]: value }));
  };

  const saveAddress = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (activeAddress?.id) {
        // Update existing address
        const updatedAddress: Address = {
          ...activeAddress,
          id: activeAddress.id,
          phone: activeAddress.phone || undefined
        };
        setAddressList((prev) =>
          prev.map((addr) => (addr.id === activeAddress.id ? updatedAddress : addr))
        );
      } else {
        // Create new address
        const newAddress: Address = { 
          ...activeAddress!,
          id: Date.now().toString(),
          phone: activeAddress!.phone || undefined
        };
        setAddressList((prev) => [...prev, newAddress]);
      }

      cancelEditing();
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAddress = (id: string) => {
    setAddressList((prev) => prev.filter((addr) => addr.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('profile.addressBook')}</h2>
        {!isEditing && (
          <Button onClick={() => startEditing(null)} variant="outline">
            {t('profile.addAddress')}
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.firstName')}
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={activeAddress?.firstName || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.lastName')}
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={activeAddress?.lastName || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.address')}
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={activeAddress?.address || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.city')}
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={activeAddress?.city || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.state')}
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={activeAddress?.state || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.zipCode')}
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={activeAddress?.zipCode || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={activeAddress?.country || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={activeAddress?.phone || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <Button onClick={saveAddress} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Address'}
            </Button>
            <Button onClick={cancelEditing} variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {addressList.map((address) => (
            <div key={address.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  {address.firstName} {address.lastName}
                </h3>
                <div className="flex space-x-2">
                  <Button onClick={() => startEditing(address)} variant="outline">
                    Edit
                  </Button>
                  <Button onClick={() => deleteAddress(address.id!)} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700">
                    Delete
                  </Button>
                </div>
              </div>
              <p className="text-gray-600">
                {address.address}, {address.city}, {address.state}, {address.zipCode}, {address.country}
              </p>
              <p className="text-gray-600">Phone: {address.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

