'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { categories } from '@/data/products';
import { scrollToElement } from '@/lib/utils';

export const Footer: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const currentYear = new Date().getFullYear();

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

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-8 ${isRTL ? 'rtl' : 'ltr'}`}>
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('site.title')}</h3>
            <p className="text-gray-400 mb-4">
              {t('footer.aboutDesc')}
            </p>
            <div className={`flex ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                📘
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                🐦
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                📷
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={handleHomeNavigation}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('nav.home')}
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <button 
                    onClick={() => handleCategoryNavigation(category.slug)}
                    className="hover:text-white transition-colors text-left"
                  >
                    {t(`categories.${category.id}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-sm font-semibold mb-4">{t('footer.customerService')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={() => router.push('/contact')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('nav.contactUs')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push('/faq')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('footer.faq')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push('/shipping')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('footer.shipping')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push('/returns')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('footer.returns')}
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={() => router.push('/about')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('nav.aboutUs')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push('/privacy')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('footer.privacyPolicy')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push('/terms')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('footer.terms')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push('/careers')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('footer.careers')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>{t('footer.copyright').replace('2024', currentYear.toString())}</p>
        </div>
      </div>
    </footer>
  );
};
