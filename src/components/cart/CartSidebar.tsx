'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import Price from '@/components/ui/Price';
import { getLocalizedString, ensureLocalizedContent } from '@/lib/multilingualUtils';

export const CartSidebar: React.FC = () => {
  const { state, dispatch } = useCart();
  const { t, isRTL, language } = useLanguage();
  const router = useRouter();

  const updateQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, variantId, quantity } });
  };

  const removeItem = (productId: string, variantId: string | undefined) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, variantId } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  if (!state.isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-opacity-60 z-40 backdrop-blur-sm"
        onClick={closeCart}
      />
      
      {/* Cart Sidebar */}
      <div className={`fixed ${isRTL ? 'left-0' : 'right-0'} top-0 h-full w-105 bg-gradient-to-b from-gray-50 to-white shadow-2xl z-50 flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 bg-white border-b border-gray-200 shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-xl font-bold text-gray-800">{t('cart.title')}</h2>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-red-500 transition-all duration-200 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {state.items.length === 0 ? (
            <div className="text-center mt-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                <div className="text-3xl">🛍</div>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('cart.empty')}</h3>
              <p className="text-gray-500 text-sm">{t('cart.startShopping')}</p>
              <button
                onClick={closeCart}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {t('cart.continueShopping')}
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {state.items.map((item, index) => (
                  <div key={`${item.product.id}-${item.variantId || 'default'}-${index}`} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className={`flex items-start ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                      {/* Product Image */}
                      <div className="relative">
                        <img
                          src={item.product.image}
                          alt={getLocalizedString(ensureLocalizedContent(item.product.name), language)}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">{getLocalizedString(ensureLocalizedContent(item.product.name), language)}</h3>
                        
                        {/* Selected Attributes */}
                        {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                          <div className="mt-1 space-y-1">
                            {Object.entries(item.selectedAttributes).map(([attributeId, valueId]) => {
                              const attribute = item.product.attributes?.find(attr => attr.id === attributeId);
                              const value = attribute?.values.find(val => val.id === valueId);
                              if (!attribute || !value) return null;
                              
                              return (
                                <div key={attributeId} className="flex items-center space-x-2 text-xs text-gray-600">
                                  <span className="font-medium">{attribute.name}:</span>
                                  {attribute.type === 'color' && value.hexColor ? (
                                    <div className="flex items-center space-x-1">
                                      <div 
                                        className="w-3 h-3 rounded-full border border-gray-300"
                                        style={{ backgroundColor: value.hexColor }}
                                      ></div>
                                      <span>{value.value}</span>
                                    </div>
                                  ) : (
                                    <span>{value.value}</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        <Price amount={item.variantPrice || item.product.price} locale={isRTL ? 'ar' : 'en'} taxLabelType="excluded" className="text-purple-600 font-bold text-lg mt-1" />
                        
                        {/* Quantity Controls */}
                        <div className={`flex items-center mt-3 ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.variantId, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-purple-100 hover:border-purple-300 transition-colors font-semibold text-gray-600"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-700">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.variantId, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-purple-100 hover:border-purple-300 transition-colors font-semibold text-gray-600"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.product.id, item.variantId)}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors flex items-center justify-center font-bold"
                        title="Remove item"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                fullWidth
                variant="outline"
                className="mt-6 mb-2"
                onClick={() => {
                  dispatch({ type: 'TOGGLE_CART' });
                }}
              >
                {t('cart.continueShopping') || 'Continue Shopping'}
              </Button>
            </>
          )}
        </div>

        {/* Cart Summary & Actions */}
        {state.items.length > 0 && (
          <div className="border-t p-6 space-y-4">
            {/* Summary */}
            <div className="space-y-2 text-black">
              <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{t('cart.subtotal')} ({state.itemCount === 1 ? t('cart.itemCountSingular').replace('{{count}}', state.itemCount.toString()) : t('cart.itemCount').replace('{{count}}', state.itemCount.toString())})</span>
                <span>
                  <Price amount={state.total} locale={isRTL ? 'ar' : 'en'} taxLabelType="excluded" className="font-medium" />
                </span>
              </div>
              <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{t('cart.shipping')}</span>
                <span className="text-green-600">{t('hero.features.freeShipping')}</span>
              </div>
              <div className={`flex justify-between font-semibold text-lg border-t pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{t('cart.total')}</span>
                <span>
                  <Price amount={state.total} locale={isRTL ? 'ar' : 'en'} taxLabelType="excluded" className="font-medium" />
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <a href="/checkout">
                <Button fullWidth size="lg">
                  {t('cart.checkout')}
                </Button>
              </a>
              <button
                onClick={clearCart}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                {t('cart.remove')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
