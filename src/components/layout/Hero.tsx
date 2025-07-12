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
    <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
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
          <Button
            variant="secondary"
            size="lg"
            onClick={onButtonClick}
            className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            {t('hero.cta')}
          </Button>
        </div>
        
        {/* Features */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl mb-2">🚚</div>
            <h3 className="font-semibold mb-1">{t('hero.features.freeShipping')}</h3>
            <p className="text-sm opacity-80">{t('hero.features.freeShippingDesc')}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold mb-1">{t('hero.features.securePayment')}</h3>
            <p className="text-sm opacity-80">{t('hero.features.securePaymentDesc')}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold mb-1">{t('hero.features.fastDelivery')}</h3>
            <p className="text-sm opacity-80">{t('hero.features.fastDeliveryDesc')}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📞</div>
            <h3 className="font-semibold mb-1">{t('hero.features.support')}</h3>
            <p className="text-sm opacity-80">{t('hero.features.supportDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
