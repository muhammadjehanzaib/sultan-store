'use client';

import React, { useState, useEffect } from 'react';
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
  const [addressList, setAddressList] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Load addresses from API when component mounts
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await fetch('/api/user/addresses');
        const result = await response.json();
        
        if (response.ok) {
          setAddressList(result.addresses || []);
        } else {
          console.error('Failed to load addresses:', result.error);
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, []);

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
      if (activeAddress?.id) {
        // Update existing address
        const response = await fetch(`/api/user/addresses/${activeAddress.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(activeAddress),
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to update address');
        }

        setAddressList((prev) =>
          prev.map((addr) => (addr.id === activeAddress.id ? result.address : addr))
        );
      } else {
        // Create new address
        const response = await fetch('/api/user/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(activeAddress),
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to create address');
        }

        setAddressList((prev) => [...prev, result.address]);
      }

      cancelEditing();
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete address');
      }

      setAddressList((prev) => prev.filter((addr) => addr.id !== id));
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
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
          {isLoadingAddresses ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Loading addresses...</div>
            </div>
          ) : addressList.length > 0 ? (
            addressList.map((address) => (
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
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No addresses found.</p>
              <p className="text-sm mt-2">Click "Add Address" to create your first address.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

