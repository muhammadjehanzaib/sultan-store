'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PaymentMethod } from '@/types';

interface PaymentGatewayProps {
  selectedPaymentMethod: PaymentMethod | null;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onNext: () => void;
  onPrevious: () => void;
  total: number;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  selectedPaymentMethod,
  onPaymentMethodChange,
  onNext,
  onPrevious,
  total,
}) => {
  const { t } = useLanguage();

  const paymentMethods: PaymentMethod[] = [
    { id: 'stripe', type: 'stripe', name: 'Stripe' },
    { id: 'paypal', type: 'paypal', name: 'PayPal' },
    // Add more payment methods as needed
  ];

  const handleMethodChange = (method: PaymentMethod) => {
    onPaymentMethodChange(method);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-black">{t('checkout.payment')}</h2>

      <div className="space-y-2">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="flex items-center"
          >
            <input
              type="radio"
              id={method.id}
              name="paymentMethod"
              checked={selectedPaymentMethod?.id === method.id}
              onChange={() => handleMethodChange(method)}
              className="mr-2"
            />
            <label htmlFor={method.id} className="text-sm font-medium text-gray-700">
              {method.name}
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onPrevious}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          {t('common.previous')}
        </button>
        <button
          onClick={onNext}
          disabled={!selectedPaymentMethod}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {t('checkout.proceedToReview')}
        </button>
      </div>
    </div>
  );
};

