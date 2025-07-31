'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { PaymentGateway } from '@/components/payment/PaymentGateway';
import { AuthModal } from '@/components/auth/AuthModal';
import { BillingAddress, ShippingAddress, PaymentMethod } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const { state } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0); // Start with 0 for auth step
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setCurrentStep(1); // Move to shipping step if authenticated
    }
  }, [isAuthenticated]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setCurrentStep(1); // Move to shipping step after authentication
  };

  // Redirect to cart if no items
  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('cart.empty')}</h2>
          <p className="text-gray-600 mb-6">{t('cart.startShopping')}</p>
          <a 
            href="/"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t('cart.continueShopping')}
          </a>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, title: t('checkout.shipping'), completed: currentStep > 1 },
    { id: 2, title: t('checkout.payment'), completed: currentStep > 2 },
    { id: 3, title: t('checkout.review'), completed: false }
  ];

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      // Prepare order data
      const orderData = {
        customerEmail: user?.email || billingAddress?.email || '',
        customerName: `${billingAddress?.firstName || ''} ${billingAddress?.lastName || ''}`.trim(),
        items: state.items,
        subtotal: state.total,
        tax: 0, // TODO: Calculate tax based on location
        shipping: 0, // TODO: Calculate shipping based on address
        total: state.total,
        billingAddress,
        shippingAddress,
        paymentMethod: selectedPaymentMethod?.type || 'card'
      };

      // Call checkout API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Clear cart and redirect to success page
        // TODO: Add cart clearing functionality
        window.location.href = `/checkout/success?orderId=${result.order.id}`;
      } else {
        throw new Error(result.error || 'Order failed');
      }
    } catch (error) {
      console.error('Order failed:', error);
      alert('Order failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${step.completed 
                    ? 'bg-green-500 text-white' 
                    : currentStep === step.id 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {step.completed ? '✓' : step.id}
                </div>
                <span className={`ml-2 font-medium ${
                  currentStep === step.id ? 'text-purple-600' : 'text-gray-600'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-16 h-0.5 bg-gray-200 ml-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={`grid ${isRTL ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-3'} gap-8`}>
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {currentStep === 1 && (
                <CheckoutForm
                  billingAddress={billingAddress}
                  shippingAddress={shippingAddress}
                  onBillingAddressChange={setBillingAddress}
                  onShippingAddressChange={setShippingAddress}
                  onNext={nextStep}
                />
              )}
              
              {currentStep === 2 && (
                <PaymentGateway
                  total={state.total}
                  selectedPaymentMethod={selectedPaymentMethod}
                  onPaymentMethodChange={setSelectedPaymentMethod}
                  onNext={nextStep}
                  onPrevious={prevStep}
                />
              )}
              
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-bold mb-6 text-black">{t('checkout.review')}</h2>
                  
                  {/* Order Review */}
                  <div className="space-y-4 mb-6 text-gray-800">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">{t('checkout.shippingAddress')}</h3>
                      {shippingAddress && (
                        <div className="text-sm text-gray-600">
                          <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                          <p>{shippingAddress.address}</p>
                          <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                          <p>{shippingAddress.country}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">{t('checkout.paymentMethod')}</h3>
                      {selectedPaymentMethod && (
                        <div className="text-sm text-gray-600">
                          <p>{selectedPaymentMethod.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={prevStep}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      {t('common.previous')}
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {isProcessing ? t('common.loading') : t('checkout.placeOrder')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary items={state.items} total={state.total} />
          </div>
        </div>
      </div>
      
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        mode="login"
      />
    </div>
  );
}
