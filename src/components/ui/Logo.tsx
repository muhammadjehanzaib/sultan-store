'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

export interface LogoProps {
  variant?: 'default' | 'white' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  onClick
}) => {
  const { language } = useLanguage();
  const [imageError, setImageError] = useState(false);
  
  const sizeMap = {
    sm: { width: 120, height: 60 },
    md: { width: 180, height: 90 },
    lg: { width: 240, height: 120 },
    xl: { width: 320, height: 160 }
  };

  const { width, height } = sizeMap[size];

  // Icon-only variant - just the cross
  if (variant === 'icon-only') {
    return (
      <div 
        className={`inline-flex items-center justify-center cursor-pointer ${className}`}
        onClick={onClick}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">+</span>
        </div>
      </div>
    );
  }

  // Text fallback if image fails to load
  const TextFallback = () => {
    const textSizes = {
      sm: 'text-lg',
      md: 'text-2xl', 
      lg: 'text-3xl',
      xl: 'text-4xl'
    };

    const crossSizes = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-10 h-10', 
      xl: 'w-12 h-12'
    };

    const colors = variant === 'white' 
      ? { primary: 'text-white', secondary: 'text-white/90', cross: 'bg-white text-gray-800' }
      : { primary: 'text-green-700', secondary: 'text-orange-600', cross: 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' };

    if (language === 'ar') {
      return (
        <div className={`inline-flex items-center gap-3 font-bold ${textSizes[size]} leading-tight`} dir="rtl">
          <div className="flex flex-col items-end">
            <span className={colors.primary}>سعودي</span>
            <div className="flex items-center gap-2">
              <span className={colors.secondary}>السلامة</span>
              <div className={`${crossSizes[size]} ${colors.cross} rounded-lg flex items-center justify-center font-bold shadow-lg`}>
                <span>+</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`inline-flex items-center gap-3 font-bold ${textSizes[size]} leading-tight`}>
        <div className={`${crossSizes[size]} ${colors.cross} rounded-lg flex items-center justify-center font-bold shadow-lg`}>
          <span>+</span>
        </div>
        <div className="flex flex-col">
          <span className={colors.primary}>SAUDI</span>
          <span className={colors.secondary}>SAFETY</span>
        </div>
      </div>
    );
  };

  // Logo source based on language
  const logoSrc = language === 'ar' ? '/logos/logo-arabic.png' : '/logos/logo-english.png';
  
  return (
    <div 
      className={`inline-flex cursor-pointer transition-all duration-300 hover:scale-105 ${className}`}
      onClick={onClick}
    >
      {imageError ? (
        <TextFallback />
      ) : (
        <div 
          className="relative overflow-hidden"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          <Image
            src={logoSrc}
            alt={language === 'ar' ? 'سعودي السلامة' : 'Saudi Safety'}
            width={500}
            height={500}
            style={{
              width: `${width * 1.4}px`,
              height: `${width * 1.4}px`,
              objectFit: 'contain',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              filter: variant === 'white' ? 'brightness(0) invert(1)' : 'none',
              opacity: variant === 'white' ? 0.9 : 1
            }}
            priority
            onError={() => setImageError(true)}
          />
        </div>
      )}
    </div>
  );
};

export default Logo;
