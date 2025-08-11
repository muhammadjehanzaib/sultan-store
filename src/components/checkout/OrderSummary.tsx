'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CartItem } from '@/types';
import { formatPrice } from '@/lib/utils';
import Price from '@/components/ui/Price';
import { getLocalizedString, ensureLocalizedContent } from '@/lib/multilingualUtils';
import { useSettingsValues } from '@/hooks/useSettings';

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
  selectedPaymentMethod?: { type: string; codFee?: number } | null;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ items, total, selectedPaymentMethod }) => {
  const { t, isRTL, language } = useLanguage();
  const { taxRate, freeShippingThreshold, shippingRate } = useSettingsValues();

  const subtotal = total;
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingRate;
  const tax = subtotal * taxRate;
  const codFee = selectedPaymentMethod?.type === 'cod' && selectedPaymentMethod?.codFee ? selectedPaymentMethod.codFee : 0;
  const grandTotal = subtotal + shipping + tax + codFee;
  
  // Debug logging (remove in production)
  console.log('OrderSummary Debug:', {
    subtotal,
    freeShippingThreshold,
    shippingRate,
    comparison: subtotal >= freeShippingThreshold,
    shipping,
    tax,
    grandTotal
  });

  // Helper function to format selected attributes
  const formatSelectedAttributes = (selectedAttributes: { [key: string]: string } | undefined, product: any) => {
    if (!selectedAttributes || Object.keys(selectedAttributes).length === 0) {
      return null;
    }
    
    return Object.entries(selectedAttributes).map(([attrId, valueId]) => {
      // Find the attribute and value details from the product
      const attribute = product.attributes?.find((attr: any) => attr.id === attrId);
      const value = attribute?.values?.find((val: any) => val.id === valueId);
      
      const attributeName = attribute?.name || attrId;
      const valueLabel = value?.label || value?.value || valueId;
      
      return `${attributeName}: ${valueLabel}`;
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
          const attributesText = formatSelectedAttributes(item.selectedAttributes, item.product);
          
          return (
            <div key={uniqueKey} className={`flex items-start ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
              <div className="relative">
                <img
                  src={item.product.image}
                  alt={getLocalizedString(ensureLocalizedContent(item.product.name), language)}
                  className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                />
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-800 truncate">{getLocalizedString(ensureLocalizedContent(item.product.name), language)}</h4>
                
                {/* Display selected attributes (size, color, etc.) */}
                {attributesText && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {attributesText}
                  </p>
                )}
                
                <Price amount={(item.variantPrice || item.product.price) * item.quantity} taxLabelType="excluded" locale={isRTL ? 'ar' : 'en'} className="text-purple-600 font-semibold text-sm mt-1 pl-2" />
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
          <span className="font-medium text-purple-600">
            <Price amount={subtotal} locale={isRTL ? 'ar' : 'en'} taxLabelType="excluded" className="font-medium text-purple-600" />
          </span>
        </div>
        
        <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-gray-600">{t('cart.shipping')}</span>
          {shipping === 0 ? (
            <span className="font-medium text-green-600">{t('hero.features.freeShipping')}</span>
          ) : (
            <span className="font-medium text-gray-600">
              <Price amount={shipping} locale={isRTL ? 'ar' : 'en'} className="font-medium text-gray-600" />
            </span>
          )}
        </div>
        
        <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-gray-600">{t('cart.tax')} 
            
          </span>
          <span className="font-medium text-gray-600">
            <Price amount={tax} locale={isRTL ? 'ar' : 'en'} className="font-medium text-gray-600" />
          </span>
        </div>
        
        {codFee > 0 && (
          <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-gray-600">{t('payment.codFee')}</span>
            <span className="font-medium text-orange-600">
              <Price amount={codFee} locale={isRTL ? 'ar' : 'en'} className="font-medium text-orange-600" />
            </span>
          </div>
        )}
        
        <hr className="my-2" />
        
        <div className={`flex justify-between text-lg font-semibold text-purple-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span>{t('cart.total')}</span>
          <span className="text-purple-600">
            <Price amount={grandTotal} locale={isRTL ? 'ar' : 'en'} taxLabelType="included" className="font-semibold text-lg text-purple-600" />
          </span>
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