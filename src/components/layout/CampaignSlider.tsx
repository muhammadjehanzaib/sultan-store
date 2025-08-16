'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';

interface SlideData {
  id: string;
  title: { en: string; ar: string };
  subtitle: { en: string; ar: string };
  description: { en: string; ar: string };
  image: string;
  ctaText: { en: string; ar: string };
  ctaLink: string;
  backgroundColor: string;
  textColor: string;
  discount?: string;
}

interface CampaignSliderProps {
  slides?: SlideData[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

// Default campaign slides
const defaultSlides: SlideData[] = [
  {
    id: '1',
    title: { en: 'Limited Time Offer!', ar: 'عرض محدود الوقت!' },
    subtitle: { en: 'Up to 50% OFF!', ar: 'خصم يصل إلى 50%!' },
    description: { en: 'Discover our latest collection with amazing discounts', ar: 'اكتشف مجموعتنا الأحدث مع خصومات رائعة' },
    image: '/images/products/tshirt.jpg',
    ctaText: { en: 'Shop Now', ar: 'تسوق الآن' },
    ctaLink: '#featured-products',
    backgroundColor: 'from-purple-600 to-pink-600',
    textColor: 'text-white',
    discount: '50%'
  },
  {
    id: '2',
    title: { en: 'New Arrivals', ar: 'وصل حديثاً' },
    subtitle: { en: 'Fashion Forward', ar: 'أزياء متقدمة' },
    description: { en: 'Stay ahead of trends with our newest collection', ar: 'ابق في المقدمة مع مجموعتنا الأحدث' },
    image: '/images/products/smartwatch.jpg',
    ctaText: { en: 'Explore', ar: 'استكشف' },
    ctaLink: '#featured-products',
    backgroundColor: 'from-blue-600 to-teal-600',
    textColor: 'text-white'
  },
  {
    id: '3',
    title: { en: 'Premium Quality', ar: 'جودة فائقة' },
    subtitle: { en: 'Best Sellers', ar: 'الأكثر مبيعاً' },
    description: { en: 'Top-rated products loved by thousands of customers', ar: 'منتجات عالية التقييم يحبها الآلاف من العملاء' },
    image: 'images/products/headphones.jpg',
    ctaText: { en: 'View Collection', ar: 'عرض المجموعة' },
    ctaLink: '#featured-products',
    backgroundColor: 'from-emerald-600 to-cyan-600',
    textColor: 'text-white'
  }
];

export const CampaignSlider: React.FC<CampaignSliderProps> = ({
  slides = defaultSlides,
  autoPlay = true,
  autoPlayInterval = 5000
}) => {
  const { t, isRTL, language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isPaused) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isPaused, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        isRTL ? nextSlide() : prevSlide();
      } else if (e.key === 'ArrowRight') {
        isRTL ? prevSlide() : nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, isRTL]);

  const currentSlideData = slides[currentSlide];

  return (
    <section className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="relative h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden rounded-2xl shadow-lg"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          role="banner"
          aria-label="Campaign slider"
        >
          {/* Main slider container */}
          <div className="relative w-full h-full">
            {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
              index === currentSlide 
                ? 'opacity-100 translate-x-0 scale-100' 
                : index < currentSlide 
                  ? 'opacity-0 -translate-x-full scale-95'
                  : 'opacity-0 translate-x-full scale-95'
            }`}
            style={{
              background: `linear-gradient(135deg, ${slide.backgroundColor.includes('from-') 
                ? slide.backgroundColor.replace('from-', '').replace(' to-', ', ').replace('-600', '') 
                : slide.backgroundColor})`
            }}
          >
            {/* Background Image */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20">
              {slide.image && (
                <Image
                  src={slide.image}
                  alt={slide.title[language]}
                  fill
                  className="object-cover mix-blend-overlay"
                  priority={index === 0}
                  sizes="100vw"
                />
              )}
            </div>

            {/* Content */}
            <div className={`relative z-10 h-full flex items-center ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  {/* Discount Badge */}
                  {slide.discount && (
                    <div className="inline-block mb-4">
                      <span className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold text-sm animate-pulse">
                        {t('common.upto')} {slide.discount} {t('common.off')}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-4 ${slide.textColor} leading-tight`}>
                    {slide.title[language]}
                  </h1>

                  {/* Subtitle */}
                  <h2 className={`text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 ${slide.textColor} opacity-90`}>
                    {slide.subtitle[language]}
                  </h2>

                  {/* Description */}
                  <p className={`text-lg md:text-xl mb-8 ${slide.textColor} opacity-80 max-w-xl`}>
                    {slide.description[language]}
                  </p>

                  {/* CTA Button */}
                  <a
                    href={slide.ctaLink}
                    className="inline-block bg-white text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                    aria-label={`${slide.ctaText[language]} - ${slide.title[language]}`}
                  >
                    {slide.ctaText[language]}
                  </a>
                </div>
              </div>
            </div>
          </div>
            ))}
          </div>

          {/* Navigation Arrows */}
      <button
        onClick={isRTL ? nextSlide : prevSlide}
        className={`absolute top-1/2 ${isRTL ? 'right-4' : 'left-4'} transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110`}
        aria-label={isRTL ? "Next slide" : "Previous slide"}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
        </svg>
      </button>

      <button
        onClick={isRTL ? prevSlide : nextSlide}
        className={`absolute top-1/2 ${isRTL ? 'left-4' : 'right-4'} transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110`}
        aria-label={isRTL ? "Previous slide" : "Next slide"}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
        </svg>
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      {autoPlay && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div 
            className={`h-full bg-white transition-all ease-linear ${isPaused ? 'pause' : ''}`}
            style={{
              width: isPaused ? 'var(--progress, 0%)' : '100%',
              animation: isPaused ? 'none' : `slideProgress ${autoPlayInterval}ms linear infinite`
            }}
          />
        </div>
      )}

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes slideProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
        </div>
      </div>
    </section>
  );
};
