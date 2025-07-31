'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSearchParams } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const { dispatch } = useCart();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Clear the cart after successful payment
    dispatch({ type: 'CLEAR_CART' });
    
    // Get order ID from URL
    const orderIdParam = searchParams.get('orderId');
    setOrderId(orderIdParam);
  }, [dispatch, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-lg p-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <div className="text-4xl">✅</div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {t('checkout.success.title')}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {t('checkout.success.message')}
        </p>

        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Order ID:</p>
            <p className="font-mono text-lg font-semibold text-gray-800">{orderId}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <a
            href="/profile"
            className="block w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t('checkout.success.viewOrders')}
          </a>
          
          <a
            href="/"
            className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('cart.continueShopping')}
          </a>
        </div>
      </div>
    </div>
  );
}
