'use client';

import React from 'react';
import Image from 'next/image';
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

  const getPaymentLogo = (methodType: string) => {
    const logoMap: { [key: string]: string } = {
      'mada': '/logos/payment/mada.png',
      'stripe': '/logos/payment/stripe2.png'
    };
    return logoMap[methodType];
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mada',
      type: 'mada',
      name: 'Mada',
      icon: getPaymentLogo('mada'),
      isLogo: true,
      description: 'Pay securely with your mada card - Saudi Arabia\'s national payment network'
    },
    {
      id: 'stripe',
      type: 'stripe',
      name: 'Stripe',
      icon: getPaymentLogo('stripe'),
      isLogo: true,
      description: 'Pay securely with credit/debit cards via Stripe'
    },
    {
      id: 'bank_transfer',
      type: 'bank_transfer',
      name: 'Bank Transfer',
      icon: '🏦',
      isLogo: false,
      description: 'Transfer payment directly to our bank account'
    },
    {
      id: 'cod',
      type: 'cod',
      name: t('payment.cod'),
      icon: '💵',
      isLogo: false,
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
                <div className="flex items-center space-x-3">
                  {method.icon && (
                    method.isLogo ? (
                      <div className={`relative flex-shrink-0 ${
                        method.type === 'mada' ? 'w-15 h-14' : 'w-10 h-10'
                      }`}>
                        <Image
                          src={method.icon}
                          alt={`${method.name} logo`}
                          width={method.type === 'mada' ? 64 : 40}
                          height={method.type === 'mada' ? 48 : 40}
                          className="object-contain rounded"
                        />
                      </div>
                    ) : (
                      <span className="text-2xl">{method.icon}</span>
                    )
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
                {method.type === 'bank_transfer' && selectedPaymentMethod?.id === method.id && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <div className="font-semibold text-blue-900 mb-2">Bank Transfer Details:</div>
                    <div className="space-y-1 text-blue-800">
                      <div><strong>Bank:</strong> Saudi National Bank</div>
                      <div><strong>Account Name:</strong> Saudi Safety Plus</div>
                      <div><strong>Account Number:</strong> 12345678901234</div>
                      <div><strong>IBAN:</strong> SA1234567890123456789012</div>
                      <div><strong>Swift Code:</strong> SNBLSARI</div>
                    </div>
                    <div className="mt-2 text-xs text-blue-700">
                      <span>⚠️</span> Please include your order number in the transfer reference
                    </div>
                  </div>
                )}
                {method.type === 'mada' && (
                  <div className="mt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <span>🔒</span>
                      <span>Secure and fast processing</span>
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

