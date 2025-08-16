'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeroProps {
  onButtonClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onButtonClick,
}) => {
  const { t, isRTL } = useLanguage();
  return (
    <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black bg-opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
        <div className={`text-center ${isRTL ? 'rtl' : 'ltr'}`}>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-6 opacity-90">
            {t('hero.subtitle')}
          </p>
          <p className="text-base md:text-lg mb-8 opacity-80 max-w-3xl mx-auto">
            {t('hero.description')}
          </p>
          
          {/* Enhanced CTA Section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              variant="secondary"
              size="lg"
              onClick={onButtonClick}
              className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {t('hero.cta')}
            </Button>
            <div className="text-sm opacity-90 flex items-center gap-2">
              <span className="text-yellow-300">⭐</span>
              <span>Over 50K+ Happy Customers</span>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-12 opacity-90">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span>Authentic Products</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span>Warranty Included</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span>Easy Returns</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
        
        {/* Enhanced Features Grid */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
            <div className="text-4xl mb-3">🚚</div>
            <h3 className="font-semibold mb-2 text-lg">{t('hero.features.freeShipping')}</h3>
            <p className="text-sm opacity-80">{t('hero.features.freeShippingDesc')}</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-semibold mb-2 text-lg">{t('hero.features.securePayment')}</h3>
            <p className="text-sm opacity-80">{t('hero.features.securePaymentDesc')}</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2 text-lg">{t('hero.features.fastDelivery')}</h3>
            <p className="text-sm opacity-80">{t('hero.features.fastDeliveryDesc')}</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
            <div className="text-4xl mb-3">📞</div>
            <h3 className="font-semibold mb-2 text-lg">{t('hero.features.support')}</h3>
            <p className="text-sm opacity-80">{t('hero.features.supportDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
