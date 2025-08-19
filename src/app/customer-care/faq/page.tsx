'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { Footer } from '@/components';

// Sidebar navigation items
const sidebarItems = [
  { id: 'contact', label: 'Contact Us', path: '/customer-care', isActive: false },
  { id: 'faq', label: 'Frequently Asked Questions', path: '/customer-care/faq', isActive: true },
  { id: 'returns', label: 'Return and Exchange', path: '/customer-care/returns', isActive: false },
  { id: 'privacy', label: 'Privacy Policy', path: '/customer-care/privacy', isActive: false },
];

// FAQ Categories and Questions
const faqCategories = [
  {
    title: "Orders & Payment",
    questions: [
      {
        question: "How can I track my order?",
        answer: "You can track your order by logging into your account and visiting the 'My Orders' section. You'll receive an email with tracking information once your order ships. You can also use the tracking number provided to check the status on our shipping partner's website."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept various payment methods including Visa, Mastercard, Mada, STC Pay, bank transfer, and cash on delivery (COD). All online payments are secured with SSL encryption to protect your financial information."
      },
      {
        question: "Can I cancel my order?",
        answer: "Yes, you can cancel your order within 24 hours of placing it, provided it hasn't been shipped yet. To cancel an order, please contact our customer service team immediately at 8003314444 or visit your account's order history."
      },
      {
        question: "Why was my payment declined?",
        answer: "Payment can be declined for various reasons including insufficient funds, incorrect card details, expired card, or security restrictions by your bank. Please verify your payment information and try again, or contact your bank for assistance."
      }
    ]
  },
  {
    title: "Shipping & Delivery",
    questions: [
      {
        question: "How long does shipping take?",
        answer: "Standard shipping takes 2-5 business days within Saudi Arabia. Express shipping is available in major cities (Riyadh, Jeddah, Dammam) and takes 1-2 business days. Remote areas may take additional 1-2 days."
      },
      {
        question: "Do you ship internationally?",
        answer: "Currently, we only ship within Saudi Arabia. We're working on expanding our shipping coverage to other GCC countries. Please check back for updates on international shipping availability."
      },
      {
        question: "What are the shipping costs?",
        answer: "Shipping is free for orders over 200 SAR. For orders below 200 SAR, standard shipping costs 25 SAR and express shipping costs 35 SAR. Cash on delivery orders have an additional 15 SAR handling fee."
      },
      {
        question: "Can I change my delivery address?",
        answer: "You can change your delivery address before your order ships. Once shipped, the address cannot be modified. Please contact customer service immediately if you need to change the address after placing your order."
      }
    ]
  },
  {
    title: "Returns & Exchanges",
    questions: [
      {
        question: "What is your return policy?",
        answer: "We offer a 14-day return policy for most items. Items must be in original condition with tags attached and original packaging. Electronics and personal care items have specific return conditions. Some items like software and gift cards are non-returnable."
      },
      {
        question: "How do I return an item?",
        answer: "To return an item, log into your account, go to 'My Orders', select the item you want to return, and follow the return process. You can also contact our customer service team for assistance. We'll provide you with a return shipping label."
      },
      {
        question: "When will I receive my refund?",
        answer: "Refunds are processed within 5-7 business days after we receive and inspect your returned item. The refund will be credited to your original payment method. For COD orders, refunds are processed as bank transfers or store credit."
      },
      {
        question: "Can I exchange an item instead of returning it?",
        answer: "Yes, exchanges are available for size, color, or similar variations of the same product, subject to availability. The exchange process is similar to returns, and we'll send the replacement item once we receive the original."
      }
    ]
  },
  {
    title: "Account & Technical",
    questions: [
      {
        question: "How do I create an account?",
        answer: "Click 'Sign Up' on the top right of any page, enter your email address and create a password. You'll receive a verification email to activate your account. You can also create an account during checkout."
      },
      {
        question: "I forgot my password. How can I reset it?",
        answer: "Click 'Forgot Password' on the login page, enter your email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password."
      },
      {
        question: "Why can't I access my account?",
        answer: "This could be due to incorrect login credentials, account suspension, or technical issues. Try resetting your password first. If the problem persists, contact our technical support team for assistance."
      },
      {
        question: "How do I update my account information?",
        answer: "Log into your account and go to 'My Profile' or 'Account Settings'. Here you can update your personal information, addresses, phone number, and email preferences. Remember to save your changes."
      }
    ]
  }
];

export default function FAQPage() {
  const { t, isRTL, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);

  const toggleQuestion = (questionId: string) => {
    setOpenQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

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
            <span className="text-gray-900">Frequently Asked Questions</span>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>
              
              {/* Search */}
              <div className="mb-8">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search FAQs
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type your question or keyword..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* FAQ Categories */}
              <div className="space-y-8">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="border-b border-gray-200 pb-8 last:border-b-0">
                      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                        <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {categoryIndex + 1}
                        </span>
                        {category.title}
                      </h2>
                      
                      <div className="space-y-4">
                        {category.questions.map((faq, questionIndex) => {
                          const questionId = `${categoryIndex}-${questionIndex}`;
                          const isOpen = openQuestions.includes(questionId);
                          
                          return (
                            <div key={questionIndex} className="border border-gray-200 rounded-lg">
                              <button
                                onClick={() => toggleQuestion(questionId)}
                                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                              >
                                <span className="font-medium text-gray-900 pr-4">
                                  {faq.question}
                                </span>
                                <span className={`text-purple-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </span>
                              </button>
                              
                              {isOpen && (
                                <div className="px-6 pb-4">
                                  <div className="text-gray-600 leading-relaxed">
                                    {faq.answer}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.084-2.33l-.853.212A7.995 7.995 0 002 16.598V19a2 2 0 002 2h16a2 2 0 002-2v-2.402a7.995 7.995 0 00-3.063-2.116l-.853-.212A7.955 7.955 0 0112 15z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
                    <p className="text-gray-600 mb-4">
                      We couldn't find any questions matching your search. Try different keywords or{' '}
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-purple-600 hover:underline"
                      >
                        clear your search
                      </button>
                      .
                    </p>
                  </div>
                )}
              </div>

              {/* Contact CTA */}
              <div className="mt-12 p-6 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Still have questions?
                </h3>
                <p className="text-gray-600 mb-4">
                  Can't find the answer you're looking for? Our customer support team is here to help.
                </p>
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

      {/* Footer Section - Company Information */}
      <div className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">saudi safety</h3>
              <p><strong>P.O. Box:</strong> 3196, Riyadh 11471</p>
              <p><strong>Unified Number:</strong> 920000089</p>
            </div>
            <div>
              <p><strong>For after sales service requests follow up:</strong> 8003314444</p>
              <p><strong>Fax:</strong> 011-4656363</p>
              <p><strong>Email:</strong> <a href="mailto:care@saudisafety.com" className="text-purple-600 hover:underline">care@saudisafety.com</a></p>
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
