'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettingsValues } from '@/hooks/useSettings';
import { PaymentMethod } from '@/types';
import Price from '../ui/Price';

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
  const { t, isRTL } = useLanguage();
  const { codFee } = useSettingsValues();

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      type: 'stripe',
      name: t('payment.creditCard'),
      icon: '💳',
      description: t('payment.creditCardDesc')
    },
    {
      id: 'paypal',
      type: 'paypal',
      name: 'PayPal',
      icon: '🅿️',
      description: t('payment.paypalDesc')
    },
    {
      id: 'cod',
      type: 'cod',
      name: t('payment.cod'),
      icon: '💵',
      description: t('payment.codDesc'),
      codFee: codFee // Dynamic COD fee from settings
    },
  ];

  const handleMethodChange = (method: PaymentMethod) => {
    onPaymentMethodChange(method);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-black">{t('checkout.payment')}</h2>

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${selectedPaymentMethod?.id === method.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
              }`}
            onClick={() => handleMethodChange(method)}
          >
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                id={method.id}
                name="paymentMethod"
                checked={selectedPaymentMethod?.id === method.id}
                onChange={() => handleMethodChange(method)}
                className="mt-1 text-purple-600 focus:ring-purple-500"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {method.icon && (
                    <span className="text-2xl">{method.icon}</span>
                  )}
                  <label
                    htmlFor={method.id}
                    className="text-lg font-medium text-gray-900 cursor-pointer"
                  >
                    {method.name}
                  </label>
                  {method.type === 'cod' && method.codFee && (
                    <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                     + <Price amount={method.codFee} locale={isRTL ? 'ar' : 'en'} /> {t('payment.codFee')}
                    </span>
                  )}
                </div>
                {method.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {method.description}
                  </p>
                )}
                {method.type === 'cod' && (
                  <div className="mt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <span>✅</span>
                      <span>{t('payment.codNoPaymentRequired')}</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <span>📞</span>
                      <span>{t('payment.codDeliveryCall')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
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

