'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { scrollToElement } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';

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
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
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
        console.error('Error fetching categories:', error);
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

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Here you would typically send the email to your backend
      console.log('Newsletter subscription:', email);
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const socialLinks = [
    {
      name: 'Facebook',
      icon: '📘',
      url: 'https://facebook.com/saudisafety'
    },
    {
      name: 'Twitter',
      icon: '🐦',
      url: 'https://twitter.com/saudisafety'
    },
    {
      name: 'Instagram',
      icon: '📷',
      url: 'https://instagram.com/saudisafety'
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      url: 'https://linkedin.com/company/saudisafety'
    }
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 ${isRTL ? 'rtl' : 'ltr'}`}>
          
          {/* Company Info - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="mb-4">
                <Logo
                  variant="white"
                  size="lg"
                  onClick={() => router.push('/')}
                  className="hover:scale-105 transition-transform duration-200"
                />
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
                {t('footer.aboutDesc')}
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="mb-6">
              <div className="flex items-center mb-3 text-gray-300">
                <span className="mr-3 text-lg">📧</span>
                <a href="mailto:support@saudisafety.com" className="hover:text-white transition-colors">
                  support@saudisafety.com
                </a>
              </div>
              <div className="flex items-center mb-3 text-gray-300">
                <span className="mr-3 text-lg">📞</span>
                <a href="tel:+966123456789" className="hover:text-white transition-colors">
                  +966 12 345 6789
                </a>
              </div>
              <div className="flex items-center text-gray-300">
                <span className="mr-3 text-lg">📍</span>
                <span>Riyadh, Saudi Arabia</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">{t('footer.followUs')}</h4>
              <div className={`flex ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                    title={social.name}
                  >
                    <span className="text-lg">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              {/* Home Link */}
              <li>
                <button 
                  onClick={handleHomeNavigation}
                  className="flex items-center text-gray-300 hover:text-white transition-all text-left w-full hover:translate-x-1 transform duration-200 group"
                >
                  <span className="mr-2 text-sm group-hover:scale-110 transition-transform duration-200">🏠</span>
                  {t('nav.home')}
                </button>
              </li>
              
              {/* All Products Link */}
              <li>
                <button 
                  onClick={() => router.push('/products')}
                  className="flex items-center text-gray-300 hover:text-white transition-all text-left w-full hover:translate-x-1 transform duration-200 group"
                >
                  <span className="mr-2 text-sm group-hover:scale-110 transition-transform duration-200">🛍️</span>
                  {t('nav.allProducts')}
                </button>
              </li>
              
              {/* Top Categories */}
              {!categoriesLoading && categories
                .filter(category => category.isActive !== false)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .slice(0, 4)
                .map((category) => (
                <li key={category.id}>
                  <button 
                    onClick={() => handleCategoryNavigation(category.slug)}
                    className="flex items-center text-gray-300 hover:text-white transition-all text-left w-full hover:translate-x-1 transform duration-200 group"
                  >
                    <span className="mr-2 text-sm group-hover:scale-110 transition-transform duration-200">
                      {category.icon || '📦'}
                    </span>
                    {language === 'ar' ? category.name_ar : category.name_en}
                  </button>
                </li>
              ))}
              
              {/* View All Categories
              <li className="pt-2 border-t border-gray-600">
                <button 
                  onClick={() => router.push('/categories')}
                  className="flex items-center text-gray-300 hover:text-blue-400 transition-all text-left w-full hover:translate-x-1 transform duration-200 group text-sm font-medium"
                >
                  <span className="mr-2 text-sm group-hover:scale-110 transition-transform duration-200">📂</span>
                  {t('search.allCategories')}
                  <span className="ml-auto text-xs opacity-75 group-hover:opacity-100">→</span>
                </button>
              </li> */}
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">{t('footer.customerService')}</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => router.push('/contact')}
                  className="text-gray-300 hover:text-white transition-colors text-left block w-full hover:translate-x-1 transform duration-200"
                >
                  {t('nav.contactUs')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push('/orders')}
                  className="text-gray-300 hover:text-white transition-colors text-left block w-full hover:translate-x-1 transform duration-200"
                >
                  {t('profile.trackOrder')}
                </button>
              </li>
              <li>
                <a 
                  href="/faq"
                  className="text-gray-300 hover:text-white transition-colors block hover:translate-x-1 transform duration-200"
                >
                  {t('footer.faq')}
                </a>
              </li>
              <li>
                <a 
                  href="/shipping-info"
                  className="text-gray-300 hover:text-white transition-colors block hover:translate-x-1 transform duration-200"
                >
                  {t('footer.shipping')}
                </a>
              </li>
              <li>
                <a 
                  href="/returns-policy"
                  className="text-gray-300 hover:text-white transition-colors block hover:translate-x-1 transform duration-200"
                >
                  {t('footer.returns')}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter & Legal */}
          <div>
            {/* Newsletter */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4 text-white">{t('footer.newsletter')}</h4>
              <p className="text-gray-300 mb-4 text-sm">
                {t('footer.newsletterDesc')}
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.email')}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubscribed}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  {isSubscribed ? '✓ Subscribed!' : t('footer.subscribe')}
                </button>
              </form>
            </div>
            
            {/* Legal Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">{t('footer.company')}</h4>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => router.push('/about')}
                    className="text-gray-300 hover:text-white transition-colors text-left block w-full hover:translate-x-1 transform duration-200"
                  >
                    {t('nav.aboutUs')}
                  </button>
                </li>
                <li>
                  <a 
                    href="/privacy-policy"
                    className="text-gray-300 hover:text-white transition-colors block hover:translate-x-1 transform duration-200"
                  >
                    {t('footer.privacyPolicy')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/terms-of-service"
                    className="text-gray-300 hover:text-white transition-colors block hover:translate-x-1 transform duration-200"
                  >
                    {t('footer.terms')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/careers"
                    className="text-gray-300 hover:text-white transition-colors block hover:translate-x-1 transform duration-200"
                  >
                    {t('footer.careers')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className={`flex flex-col md:flex-row justify-between items-center ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              <p>{t('footer.copyright').replace('2024', currentYear.toString())}</p>
            </div>
            
            {/* Payment Methods */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">{t('footer.paymentMethods') || 'Payment Methods'}:</span>
              <div className="flex space-x-2">
                <div className="w-8 h-5 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-300">💳</div>
                <div className="w-8 h-5 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-300">💰</div>
                <div className="w-8 h-5 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-300">📱</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
