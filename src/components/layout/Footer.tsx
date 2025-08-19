'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { scrollToElement } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';
import Image from 'next/image';
import { 
  FaFacebook, 
  FaInstagram, 
  FaLinkedin, 
  FaYoutube, 
  FaSnapchatGhost,
  FaTiktok,
  FaShieldAlt,
  FaLock,
  FaUndo,
  FaTruck
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export const Footer: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    async function fetchCategories() {
      setCategoriesLoading(true);
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const handleCategoryNavigation = (categorySlug: string) => {
    router.push(`/category/${categorySlug}`);
  };

  const handleHomeNavigation = () => {
    if (window.location.pathname === '/') {
      scrollToElement('featured-products');
    } else {
      router.push('/');
    }
  };


  const socialLinks = [
    {
      name: 'Facebook',
      icon: FaFacebook,
      url: 'https://facebook.com/saudisafety',
      color: 'hover:text-blue-600'
    },
    {
      name: 'X',
      icon: FaXTwitter,
      url: 'https://x.com/saudisafety',
      color: 'hover:text-gray-200'
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      url: 'https://instagram.com/saudisafety',
      color: 'hover:text-pink-600'
    },
    {
      name: 'YouTube',
      icon: FaYoutube,
      url: 'https://youtube.com/@saudisafety',
      color: 'hover:text-red-600'
    },
    {
      name: 'Snapchat',
      icon: FaSnapchatGhost,
      url: 'https://snapchat.com/add/saudisafety',
      color: 'hover:text-yellow-400'
    },
    {
      name: 'TikTok',
      icon: FaTiktok,
      url: 'https://tiktok.com/@saudisafety',
      color: 'hover:text-white'
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      url: 'https://linkedin.com/company/saudisafety',
      color: 'hover:text-blue-500'
    }
  ];

  const trustBadges = [
    {
      icon: FaLock,
      title: 'Secured Shopping & Payment',
      description: 'Safe and secure transactions'
    },
    {
      icon: FaShieldAlt,
      title: 'Authentic & Warranted Products',
      description: 'Genuine products with warranty'
    },
    {
      icon: FaUndo,
      title: 'Convenient Returns & Support Services',
      description: 'Easy returns and customer support'
    },
    {
      icon: FaTruck,
      title: 'Fast Delivery',
      description: 'Quick and reliable shipping'
    }
  ];


  return (
    <footer className="bg-white text-gray-800">
      {/* Go back to top button */}
      <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 py-6 text-center border-b border-gray-200 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/30 to-transparent"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
        
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 text-gray-700 hover:text-gray-800 font-semibold text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 border border-gray-200 hover:border-gray-400"
        >
          {/* Icon with animation */}
          <div className="relative">
            <div className="absolute inset-0 bg-gray-600 rounded-full opacity-0 group-hover:opacity-20 group-hover:animate-ping"></div>
            <div className="relative w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:rotate-12">
              <svg 
                className="w-4 h-4 transform group-hover:-translate-y-0.5 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          </div>
          
          {/* Text with gradient effect */}
          <span className="relative">
            <span className="block group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-700 group-hover:to-gray-800 transition-all duration-300">
              Go back to the top
            </span>
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gray-600 to-gray-700 group-hover:w-full transition-all duration-500 ease-out"></div>
          </span>
          
          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute -top-2 -left-2 w-1 h-1 bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="absolute -top-1 -right-3 w-1.5 h-1.5 bg-gray-600 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce" style={{animationDelay: '0.3s'}}></div>
            <div className="absolute -bottom-2 -right-2 w-1 h-1 bg-gray-700 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce" style={{animationDelay: '0.5s'}}></div>
          </div>
        </button>
      </div>

      {/* Social Media Section */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex flex-col lg:flex-row items-start justify-between gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
            {/* Left side - Social media */}
            <div className="flex-1">
              <h3 className="text-gray-700 font-medium mb-4">
                Be the first to know about the latest technology and offers
              </h3>
              <div className={`flex flex-wrap gap-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                      style={{
                        backgroundColor: 
                          social.name === 'Facebook' ? '#1877F2' :
                          social.name === 'X' ? '#000000' :
                          social.name === 'Instagram' ? '#E4405F' :
                          social.name === 'YouTube' ? '#FF0000' :
                          social.name === 'Snapchat' ? '#FFFC00' :
                          social.name === 'TikTok' ? '#000000' :
                          social.name === 'LinkedIn' ? '#0A66C2' : '#1877F2'
                      }}
                      title={social.name}
                      aria-label={`Follow us on ${social.name}`}
                    >
                      <IconComponent className={`text-lg ${
                        social.name === 'Snapchat' ? 'text-black' : 'text-white'
                      }`} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Right side - Payment Methods */}
            <div className="flex-1 max-w-md">
              <h3 className="text-gray-700 font-medium mb-4">
                Payment Methods:
              </h3>
              <div className="flex gap-2">
                {/* Visa */}
                <div className="h-14 flex items-center">
                  <Image
                    src="/logos/payment/visa.png"
                    alt="Visa"
                    width={120}
                    height={40}
                    className="hover:scale-105 transition-transform duration-200 object-contain"
                  />
                </div>
                
                {/* Mada */}
                <div className="h-14 flex items-center">
                  <Image
                    src="/logos/payment/mada.png"
                    alt="Mada"
                    width={120}
                    height={40}
                    className="hover:scale-105 transition-transform duration-200 object-contain"
                  />
                </div>
                
                {/* STC Pay */}
                <div className="h-14 flex items-center">
                  <Image
                    src="/logos/payment/stcpay.png"
                    alt="STC Pay"
                    width={120}
                    height={40}
                    className="hover:scale-105 transition-transform duration-200 object-contain"
                  />
                </div>
                
                {/* Stripe */}
                <div className="h-14 flex items-center">
                  <Image
                    src="/logos/payment/strip.png"
                    alt="Stripe"
                    width={120}
                    height={40}
                    className="hover:scale-105 transition-transform duration-200 object-contain"
                  />
                </div>

                {/* Bank Transfer */}
                <div className="h-14 flex items-center">
                  <Image
                    src="/logos/payment/bank-transfer.png"
                    alt="Bank Transfer"
                    width={120}
                    height={50}
                    className="hover:scale-105 transition-transform duration-200 object-contain"
                  />
                </div>
                
                {/* COD */}
                <div className="h-14 flex items-center">
                  <Image
                    src="/logos/payment/cod.jpg"
                    alt="Cash on Delivery"
                    width={120}
                    height={50}
                    className="hover:scale-105 transition-transform duration-200 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustBadges.map((badge, index) => {
              const IconComponent = badge.icon;
              return (
                <div key={index} className="text-left group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-300 transition-colors duration-200">
                      <IconComponent className="text-xl text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm leading-tight">{badge.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{badge.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>


      {/* Footer Links Section */}
      <div className="bg-slate-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 ${isRTL ? 'rtl' : 'ltr'}`}>
            
            {/* Customer Care */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white border-b border-gray-600 pb-3">Customer Care</h4>
              <ul className="space-y-4">
                <li>
                  <button 
                    onClick={() => router.push('/contact')}
                    className="text-gray-300 hover:text-white transition-colors text-left block w-full text-sm"
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <a href="/faq" className="text-gray-300 hover:text-white transition-colors block text-sm">
                    Frequently Asked Questions
                  </a>
                </li>
                <li>
                  <a href="/returns-policy" className="text-gray-300 hover:text-white transition-colors block text-sm">
                    Return and Exchanges
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors block text-sm">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Discover SaudiSafety */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white border-b border-gray-600 pb-3">Discover SaudiSafety</h4>
              <ul className="space-y-4">
                <li>
                  <a href="/shopping-guide" className="text-gray-300 hover:text-white transition-colors block text-sm">
                    Shopping Guide
                  </a>
                </li>
              </ul>
            </div>

            {/* About SaudiSafety */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white border-b border-gray-600 pb-3">About SaudiSafety</h4>
              <ul className="space-y-4">
                <li>
                  <button 
                    onClick={() => router.push('/about')}
                    className="text-gray-300 hover:text-white transition-colors text-left block w-full text-sm"
                  >
                    Company Profile
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="bg-gray-900 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex flex-col md:flex-row justify-center items-center ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <div className="text-gray-400 text-sm text-center">
              <p>© {currentYear} SaudiSafety. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
