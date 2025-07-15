'use client';

import React from 'react';
import { User, Order } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import Price from '@/components/ui/Price';

interface OrderHistoryProps {
  user: User;
}

// Mock data for order history
const mockOrders: Order[] = [
  {
    id: '1',
    items: [],
    subtotal: 120.0,
    tax: 10.0,
    shipping: 5.0,
    total: 135.0,
    billingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      address: '123 Elm Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
      country: 'USA',
    },
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      address: '123 Elm Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
      country: 'USA',
    },
    paymentMethod: {
      id: 'stripe',
      type: 'stripe',
      name: 'Stripe',
    },
    status: 'delivered',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Add more mock orders as needed
];

export const OrderHistory: React.FC<OrderHistoryProps> = ({ user }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('profile.orderHistory')}</h2>

      {mockOrders.length === 0 ? (
        <p className="text-gray-600">{t('profile.noOrders')}</p>
      ) : (
        <div className="space-y-4">
          {mockOrders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {t('profile.orderNumber').replace('{{number}}', order.id)} - {order.status}
              </h3>
              <p className="text-gray-600">
                {t('profile.placedOn')}: {order.createdAt.toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                {t('cart.total')}: <Price amount={order.total} locale={t('lang') === 'ar' ? 'ar' : 'en'} />
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

