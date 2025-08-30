'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { Footer } from '@/components';

// Sidebar navigation items
const sidebarItems = [
  { id: 'contact', label: 'Contact Us', path: '/customer-care', isActive: false },
  { id: 'faq', label: 'Frequently Asked Questions', path: '/customer-care/faq', isActive: false },
  { id: 'shopping-guide', label: 'Shopping Guide', path: '/customer-care/shopping-guide', isActive: true },
  { id: 'returns', label: 'Return and Exchange', path: '/customer-care/returns', isActive: false },
  { id: 'privacy', label: 'Privacy Policy', path: '/customer-care/privacy', isActive: false },
];

export default function ShoppingGuidePage() {
  const { t, isRTL, language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm text-gray-500">
            <Link href="/" className="hover:text-purple-600">Home</Link>
            <span className="mx-2">&gt;</span>
            <Link href="/customer-care" className="hover:text-purple-600">Customer Care</Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-900">Shopping Guide</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <nav className="p-4">
                <ul className="space-y-1">
                  {sidebarItems.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.path}
                        className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                          item.isActive
                            ? 'bg-purple-100 text-purple-700 font-medium border-r-4 border-purple-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
                        }`}
                      >
                        <span className="mr-2">
                          {item.isActive && <span className="text-purple-600">▶</span>}
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Guide</h1>

              {/* Quick Start */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-blue-900 mb-3 flex items-center">
                  <span className="text-2xl mr-3">ℹ️</span>
                  Quick Start
                </h2>
                <p className="text-blue-800">Follow these simple steps to place your order smoothly.</p>
              </div>

              {/* Steps to Shop */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      1
                    </span>
                    How to Shop on SaudiSafety
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gray-50 rounded-lg border">
                      <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">1</div>
                      <h3 className="font-medium text-gray-900 mb-2">Browse & Discover</h3>
                      <p className="text-sm text-gray-600">Explore categories or use search to find products. Check images, details, and reviews.</p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-lg border">
                      <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">2</div>
                      <h3 className="font-medium text-gray-900 mb-2">Add to Cart</h3>
                      <p className="text-sm text-gray-600">Choose quantity, size, or color (if available), then add items to your cart.</p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-lg border">
                      <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">3</div>
                      <h3 className="font-medium text-gray-900 mb-2">Checkout Securely</h3>
                      <p className="text-sm text-gray-600">Sign in or continue as guest, fill in shipping details, and choose payment method.</p>
                    </div>
                  </div>
                </div>

                {/* Payments */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      2
                    </span>
                    Payment Methods
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-medium text-green-900 mb-2">Online Payments</h3>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Visa, Mastercard, Mada</li>
                        <li>• STC Pay</li>
                        <li>• Stripe (secured)</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-medium text-yellow-900 mb-2">Cash on Delivery</h3>
                      <p className="text-sm text-yellow-800">Available for eligible areas. Additional handling fee may apply.</p>
                    </div>
                  </div>
                </div>

                {/* Delivery */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      3
                    </span>
                    Delivery & Shipping
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Standard: 2-5 business days within KSA</li>
                    <li>Express: 1-2 business days in major cities</li>
                    <li>Remote areas may take extra 1-2 days</li>
                    <li>Free shipping for orders over 200 SAR</li>
                  </ul>
                </div>

                {/* Sizing & Fit */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      4
                    </span>
                    Sizing & Measurements
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700">
                    <p className="mb-2">Always refer to the size guide on the product page. If between sizes, consider checking customer reviews or contacting support for advice.</p>
                    <p className="text-sm">Tip: Measure a similar item you own and compare with the size chart for best results.</p>
                  </div>
                </div>

                {/* Promotions */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      5
                    </span>
                    Promotions & Coupons
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Applying Coupons</h3>
                      <p className="text-sm text-gray-600">Enter your coupon code at checkout. Valid codes will be applied immediately to your order total.</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Best Deals</h3>
                      <p className="text-sm text-gray-600">Subscribe to our newsletter and follow us on social media to be the first to know about exclusive offers.</p>
                    </div>
                  </div>
                </div>

                {/* Troubleshooting */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      6
                    </span>
                    Troubleshooting & Help
                  </h2>
                  <div className="space-y-3 text-gray-700">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-medium text-gray-900">Payment Declined</h3>
                      <p className="text-sm">Check card details, available balance, and 3D Secure prompts. Try another method or contact your bank.</p>
                    </div>
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h3 className="font-medium text-gray-900">Order Not Placed</h3>
                      <p className="text-sm">If you didn't receive an order confirmation email, check your spam folder or contact support with any charges shown.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-medium text-gray-900">Change or Cancel Order</h3>
                      <p className="text-sm">Orders can be modified before shipping. Visit My Orders or contact support promptly.</p>
                    </div>
                  </div>
                </div>

                {/* Contact CTA */}
                <div className="mt-4 p-6 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Need personalized help?</h3>
                  <p className="text-gray-600 mb-4">Our customer support team is happy to guide you through product selection and checkout.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/customer-care"
                      className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Contact Support
                    </Link>
                    <a
                      href="tel:8003314444"
                      className="inline-flex items-center justify-center px-4 py-2 border border-purple-300 text-purple-700 rounded-md hover:bg-purple-100 transition-colors"
                    >
                      Call: 800-331-4444
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section - Company Information */}
      <div className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Saudi Safety</h3>
              <p><strong>P.O. Box:</strong> 3196, Riyadh 11471</p>
              <p><strong>Unified Number:</strong> 920000089</p>
            </div>
            <div>
              <p><strong>For after sales service requests follow up:</strong> 8003314444</p>
              <p><strong>Fax:</strong> 011-4656363</p>
              <p><strong>Email:</strong> <a href="mailto:support@saudisafety.com" className="text-purple-600 hover:underline">support@saudisafety.com</a></p>
            </div>
            <div>
              <p><strong>Call Center Working Hours:</strong> Friday – Thursday: 8:00 AM – 10:00 PM</p>
              <p><strong>Friday:</strong> 4:00 PM – 10:00 PM</p>
              <p>For showroom locations & Working hours Please click <a href="/store-locations" className="text-purple-600 hover:underline">Store locations</a></p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

