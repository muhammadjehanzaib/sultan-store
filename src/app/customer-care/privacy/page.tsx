'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { Footer } from '@/components';

// Sidebar navigation items
const sidebarItems = [
  { id: 'contact', label: 'Contact Us', path: '/customer-care', isActive: false },
  { id: 'faq', label: 'Frequently Asked Questions', path: '/customer-care/faq', isActive: false },
  { id: 'returns', label: 'Return and Exchange', path: '/customer-care/returns', isActive: false },
  { id: 'privacy', label: 'Privacy Policy', path: '/customer-care/privacy', isActive: true },
];

export default function PrivacyPage() {
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
            <span className="text-gray-900">Privacy Policy</span>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
              
              <div className="space-y-8">
                {/* Last Updated */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    <strong>Last Updated:</strong> December 15, 2024
                  </p>
                  <p className="text-blue-700 mt-2 text-sm">
                    This Privacy Policy explains how SaudiSafety collects, uses, and protects your personal information when you use our website and services.
                  </p>
                </div>

                {/* Information We Collect */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      1
                    </span>
                    Information We Collect
                  </h2>
                  
                  <div className="space-y-6 text-gray-700">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
                      <p className="mb-3">We collect personal information that you voluntarily provide to us when you:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Create an account or register for our services</li>
                        <li>Make a purchase or place an order</li>
                        <li>Contact us for customer support</li>
                        <li>Subscribe to our newsletter or marketing communications</li>
                        <li>Participate in surveys, contests, or promotions</li>
                      </ul>
                      
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">This may include:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <ul className="space-y-1">
                            <li>• Full name</li>
                            <li>• Email address</li>
                            <li>• Phone number</li>
                            <li>• Billing address</li>
                          </ul>
                          <ul className="space-y-1">
                            <li>• Shipping address</li>
                            <li>• Payment information</li>
                            <li>• Order history</li>
                            <li>• Customer preferences</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Automatic Information</h3>
                      <p className="mb-3">We automatically collect certain information when you visit our website:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>IP address and location data</li>
                        <li>Browser type and version</li>
                        <li>Device information (mobile, desktop, tablet)</li>
                        <li>Pages visited and time spent on our site</li>
                        <li>Referring website information</li>
                        <li>Cookies and similar tracking technologies</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* How We Use Your Information */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      2
                    </span>
                    How We Use Your Information
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>We use the collected information for various purposes, including:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-medium text-green-900 mb-3">🛒 Service Provision</h3>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Processing and fulfilling orders</li>
                          <li>• Managing your account</li>
                          <li>• Providing customer support</li>
                          <li>• Sending order confirmations and updates</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-900 mb-3">📧 Communication</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Responding to inquiries and requests</li>
                          <li>• Sending promotional emails (with consent)</li>
                          <li>• Providing important service updates</li>
                          <li>• Conducting surveys and feedback collection</li>
                        </ul>
                      </div>
                      
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h3 className="font-medium text-purple-900 mb-3">🔍 Improvement</h3>
                        <ul className="text-sm text-purple-800 space-y-1">
                          <li>• Analyzing website usage and performance</li>
                          <li>• Personalizing your shopping experience</li>
                          <li>• Developing new features and services</li>
                          <li>• Improving our products and services</li>
                        </ul>
                      </div>
                      
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="font-medium text-red-900 mb-3">🛡️ Security & Legal</h3>
                        <ul className="text-sm text-red-800 space-y-1">
                          <li>• Preventing fraud and abuse</li>
                          <li>• Ensuring website security</li>
                          <li>• Complying with legal obligations</li>
                          <li>• Protecting our rights and interests</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Information Sharing */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      3
                    </span>
                    Information Sharing and Disclosure
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>We do not sell, trade, or rent your personal information to third parties. However, we may share your information in the following circumstances:</p>
                    
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-medium text-gray-900">Service Providers</h3>
                        <p className="text-sm">We may share information with trusted third-party service providers who assist us in operating our website, conducting business, or serving you (e.g., payment processors, shipping companies, email services).</p>
                      </div>
                      
                      <div className="border-l-4 border-yellow-500 pl-4">
                        <h3 className="font-medium text-gray-900">Legal Requirements</h3>
                        <p className="text-sm">We may disclose your information if required by law, court order, or governmental request, or to protect our rights, property, or safety.</p>
                      </div>
                      
                      <div className="border-l-4 border-green-500 pl-4">
                        <h3 className="font-medium text-gray-900">Business Transfers</h3>
                        <p className="text-sm">In the event of a merger, acquisition, or sale of all or part of our business, your information may be transferred to the acquiring entity.</p>
                      </div>
                      
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h3 className="font-medium text-gray-900">With Your Consent</h3>
                        <p className="text-sm">We may share your information for any other purpose with your explicit consent.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Security */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      4
                    </span>
                    Data Security
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-medium text-gray-900 mb-4">Our security measures include:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2 mt-1">🔒</span>
                            <span>SSL encryption for data transmission</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2 mt-1">🛡️</span>
                            <span>Secure servers and firewalls</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2 mt-1">🔐</span>
                            <span>Access controls and authentication</span>
                          </li>
                        </ul>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2 mt-1">📊</span>
                            <span>Regular security audits and updates</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2 mt-1">🎯</span>
                            <span>Employee training on data protection</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2 mt-1">💾</span>
                            <span>Secure data backup and recovery</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm">
                        <strong>Important:</strong> While we strive to protect your personal information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security, but we continuously work to improve our security measures.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Your Rights */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      5
                    </span>
                    Your Rights and Choices
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>You have certain rights regarding your personal information:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">🔍 Access and Review</h3>
                        <p className="text-sm">You can access and review your personal information through your account settings or by contacting us.</p>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">✏️ Update and Correct</h3>
                        <p className="text-sm">You can update or correct your personal information at any time through your account or by contacting customer service.</p>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">🗑️ Delete</h3>
                        <p className="text-sm">You can request deletion of your personal information, subject to certain legal and business requirements.</p>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">📧 Opt-out</h3>
                        <p className="text-sm">You can unsubscribe from marketing communications at any time by clicking the unsubscribe link in emails or contacting us.</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm">
                        To exercise any of these rights, please contact us at <a href="mailto:privacy@saudisafety.com" className="font-medium underline">privacy@saudisafety.com</a> or use our <Link href="/customer-care" className="font-medium underline">contact form</Link>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cookies and Tracking */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      6
                    </span>
                    Cookies and Tracking Technologies
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content.</p>
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-medium text-gray-900 mb-4">Types of cookies we use:</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start">
                          <span className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <div>
                            <strong>Essential Cookies:</strong> Required for basic website functionality, such as shopping cart and account login.
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <div>
                            <strong>Performance Cookies:</strong> Help us understand how visitors interact with our website by collecting anonymous information.
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="w-3 h-3 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <div>
                            <strong>Functional Cookies:</strong> Remember your preferences and choices to provide a more personalized experience.
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="w-3 h-3 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <div>
                            <strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and track the effectiveness of our marketing campaigns.
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm">You can manage your cookie preferences through your browser settings. Note that disabling certain cookies may affect website functionality.</p>
                  </div>
                </div>

                {/* Changes to Privacy Policy */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      7
                    </span>
                    Changes to This Privacy Policy
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.</p>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h3 className="font-medium text-orange-900 mb-2">📅 When we update our policy:</h3>
                      <ul className="text-sm text-orange-800 space-y-1">
                        <li>• We will post the updated policy on this page</li>
                        <li>• We will update the "Last Updated" date at the top</li>
                        <li>• For significant changes, we will notify you via email or website notice</li>
                        <li>• Continued use of our services constitutes acceptance of the updated policy</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">
                    Questions About This Privacy Policy?
                  </h3>
                  <p className="text-purple-800 mb-4">
                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-purple-900">📧 Email</div>
                      <div className="text-purple-800">privacy@saudisafety.com</div>
                      <div className="text-purple-800">care@saudisafety.com</div>
                    </div>
                    <div>
                      <div className="font-medium text-purple-900">📞 Phone</div>
                      <div className="text-purple-800">800-331-4444</div>
                      <div className="text-purple-600">Sun-Thu: 8AM-10PM</div>
                    </div>
                    <div>
                      <div className="font-medium text-purple-900">📮 Mail</div>
                      <div className="text-purple-800">SaudiSafety Privacy Office</div>
                      <div className="text-purple-800">P.O. Box 3196, Riyadh 11471</div>
                    </div>
                    <div>
                      <div className="font-medium text-purple-900">💬 Online</div>
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
              <h3 className="font-medium text-gray-900 mb-2">Saudisafety</h3>
              <p><strong>P.O. Box:</strong> 3196, Riyadh 11471</p>
              <p><strong>Unified Number:</strong> 920000089</p>
            </div>
            <div>
              <p><strong>For after sales service requests follow up:</strong> 8003314444</p>
              <p><strong>Fax:</strong> 011-4656363</p>
              <p><strong>Email:</strong> <a href="mailto:care@Saudisafety.com" className="text-purple-600 hover:underline">care@Saudisafety.com</a></p>
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
