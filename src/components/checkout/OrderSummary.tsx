'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CartItem } from '@/types';
import { formatPrice } from '@/lib/utils';

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ items, total }) => {
  const { t, isRTL } = useLanguage();

  const subtotal = total;
  const shipping = 0; // Free shipping
  const tax = total * 0.1; // 10% tax
  const grandTotal = subtotal + shipping + tax;

  // Helper function to format selected attributes
  const formatSelectedAttributes = (selectedAttributes: { [key: string]: string } | undefined) => {
    if (!selectedAttributes || Object.keys(selectedAttributes).length === 0) {
      return null;
    }
    
    return Object.entries(selectedAttributes).map(([key, value]) => {
      // Capitalize the key for display
      const displayKey = key.charAt(0).toUpperCase() + key.slice(1);
      return `${displayKey}: ${value}`;
    }).join(', ');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
      <h3 className="text-lg font-semibold mb-4 text-black">{t('checkout.orderSummary')}</h3>
      
      {/* Order Items */}
      <div className="space-y-3 mb-4">
        {items.map((item, index) => {
          // Create a unique key for each cart item
          const uniqueKey = item.variantId || `${item.product.id}-${index}-${JSON.stringify(item.selectedAttributes || {})}`;
          const attributesText = formatSelectedAttributes(item.selectedAttributes);
          
          return (
            <div key={uniqueKey} className={`flex items-start ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
              <div className="relative">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                />
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-800 truncate">{item.product.name}</h4>
                
                {/* Display selected attributes (size, color, etc.) */}
                {attributesText && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {attributesText}
                  </p>
                )}
                
                <p className="text-purple-600 font-semibold text-sm mt-1">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <hr className="my-4" />

      {/* Order Totals */}
      <div className="space-y-2">
        <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-gray-600">{t('cart.subtotal')}</span>
          <span className="font-medium text-purple-600">{formatPrice(subtotal)}</span>
        </div>
        
        <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-gray-600">{t('cart.shipping')}</span>
          <span className="font-medium text-green-600">{t('hero.features.freeShipping')}</span>
        </div>
        
        <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-gray-600">{t('cart.tax')}</span>
          <span className="font-medium text-gray-600">{formatPrice(tax)}</span>
        </div>
        
        <hr className="my-2" />
        
        <div className={`flex justify-between text-lg font-semibold text-purple-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span>{t('cart.total')}</span>
          <span className="text-purple-600">{formatPrice(grandTotal)}</span>
        </div>
      </div>

      {/* Security Icons */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <span>🔒</span>
            <span>{t('hero.features.securePayment')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>📦</span>
            <span>{t('hero.features.freeShipping')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};