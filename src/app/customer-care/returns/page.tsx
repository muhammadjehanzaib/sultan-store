'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { Footer } from '@/components';

// Sidebar navigation items
const sidebarItems = [
  { id: 'contact', label: 'Contact Us', path: '/customer-care', isActive: false },
  { id: 'faq', label: 'Frequently Asked Questions', path: '/customer-care/faq', isActive: false },
  { id: 'shopping-guide', label: 'Shopping Guide', path: '/customer-care/shopping-guide', isActive: false },
  { id: 'returns', label: 'Return and Exchange', path: '/customer-care/returns', isActive: true },
  { id: 'privacy', label: 'Privacy Policy', path: '/customer-care/privacy', isActive: false },
];

export default function ReturnsPage() {
  const { t, isRTL, language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm text-gray-500">
            <Link href="/" className="hover:text-purple-600">Home</Link>
            <span className="mx-2"></span>
            <Link href="/customer-care" className="hover:text-purple-600">Customer Care</Link>
            <span className="mx-2"></span>
            <span className="text-gray-900">Return and Exchange</span>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Return and Exchange Policy</h1>
              
              <div className="space-y-8">
                {/* Overview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-blue-900 mb-3 flex items-center">
                    <span className="text-2xl mr-3">ℹ️</span>
                    Quick Overview
                  </h2>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">•</span>
                      <span>14-day return period for most items</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">•</span>
                      <span>Items must be in original condition</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">•</span>
                      <span>Free return shipping for defective items</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">•</span>
                      <span>Exchanges available for size, color variations</span>
                    </li>
                  </ul>
                </div>

                {/* Return Policy */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      1
                    </span>
                    Return Policy
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <h3 className="text-lg font-medium text-gray-900">Return Period</h3>
                    <p>
                      You have <strong>14 days</strong> from the date of delivery to return most items. 
                      For electronics and technical products, the return period may be reduced to 7 days. 
                      Holiday purchases made between November 1st and December 31st can be returned until January 31st.
                    </p>

                    <h3 className="text-lg font-medium text-gray-900 mt-6">Condition Requirements</h3>
                    <p>Items must be returned in their original condition:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Unopened and unused (unless defective)</li>
                      <li>Original packaging and accessories included</li>
                      <li>All tags and labels attached</li>
                      <li>No damage or wear from use</li>
                    </ul>

                    <h3 className="text-lg font-medium text-gray-900 mt-6">Eligible Items</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-2">✅ Returnable Items</h4>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Clothing and accessories</li>
                          <li>• Electronics (within 7 days)</li>
                          <li>• Home and kitchen items</li>
                          <li>• Books and stationery</li>
                          <li>• Sports equipment</li>
                        </ul>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-900 mb-2">❌ Non-Returnable Items</h4>
                        <ul className="text-sm text-red-800 space-y-1">
                          <li>• Personal care items</li>
                          <li>• Software and digital products</li>
                          <li>• Gift cards</li>
                          <li>• Custom/personalized items</li>
                          <li>• Perishable goods</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How to Return */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      2
                    </span>
                    How to Return an Item
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                          1
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2">Start Return Request</h3>
                        <p className="text-sm text-gray-600">
                          Log into your account and go to "My Orders" or contact customer service
                        </p>
                      </div>
                      <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                          2
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2">Package the Item</h3>
                        <p className="text-sm text-gray-600">
                          Pack the item securely with all original packaging and accessories
                        </p>
                      </div>
                      <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                          3
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2">Ship the Item</h3>
                        <p className="text-sm text-gray-600">
                          Use our prepaid return label or drop off at any of our store locations
                        </p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-yellow-600 text-xl mr-3 mt-1">⚠️</span>
                        <div>
                          <h4 className="font-medium text-yellow-900 mb-1">Important Notes</h4>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Keep your return tracking number for reference</li>
                            <li>• Returns without prior authorization may be rejected</li>
                            <li>• Damaged or incomplete returns may be subject to restocking fees</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exchange Policy */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      3
                    </span>
                    Exchange Policy
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>
                      Exchanges are available for the same product in a different size, color, or similar variation, 
                      subject to availability. The exchange process follows the same timeline as returns.
                    </p>

                    <h3 className="text-lg font-medium text-gray-900">Exchange Process</h3>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      <li>Initiate an exchange request through your account or customer service</li>
                      <li>We'll send you a replacement item and return label</li>
                      <li>Send back the original item using the provided return label</li>
                      <li>If the replacement is unavailable, we'll process a full refund</li>
                    </ol>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <p className="text-blue-800">
                        <strong>Price Differences:</strong> If the replacement item costs more, you'll be charged the difference. 
                        If it costs less, we'll refund the difference to your original payment method.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Refund Information */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      4
                    </span>
                    Refund Information
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <h3 className="text-lg font-medium text-gray-900">Processing Time</h3>
                    <p>
                      Refunds are processed within <strong>5-7 business days</strong> after we receive and inspect your returned item. 
                      You'll receive an email confirmation once the refund is processed.
                    </p>

                    <h3 className="text-lg font-medium text-gray-900">Refund Methods</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">💳 Original Payment Method</h4>
                        <p className="text-sm text-gray-600">
                          For card payments, refunds are credited to the original card. 
                          Bank processing may take additional 3-5 business days.
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">💰 Cash on Delivery</h4>
                        <p className="text-sm text-gray-600">
                          COD refunds are processed as bank transfers to your provided account 
                          or as store credit for future purchases.
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Refund Deductions</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Original shipping costs are non-refundable (unless item is defective)</li>
                        <li>• Return shipping costs may be deducted for non-defective returns</li>
                        <li>• Restocking fees may apply for opened electronics or software</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">
                    Need Help with Returns?
                  </h3>
                  <p className="text-purple-800 mb-4">
                    Our customer service team is here to help you with any return or exchange questions.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-purple-900">📞 Phone Support</div>
                      <div className="text-purple-800">800-331-4444</div>
                      <div className="text-purple-600">Sun-Thu: 8AM-10PM</div>
                    </div>
                    <div>
                      <div className="font-medium text-purple-900">✉️ Email Support</div>
                      <div className="text-purple-800">support@saudisafety.com</div>
                      <div className="text-purple-600">24/7 Response</div>
                    </div>
                    <div>
                      <div className="font-medium text-purple-900">💬 Live Chat</div>
                      <Link href="/customer-care" className="text-purple-800 hover:underline">
                        Contact Form
                      </Link>
                      <div className="text-purple-600">Available 24/7</div>
                    </div>
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
              <p><strong>Email:</strong> <a href="mailto:support@saudisafety.com" className="text-purple-600 hover:underline">care@saudisafety.com</a></p>
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
