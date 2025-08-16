'use client';

import React from 'react';
import { DiscountInfo, formatPrice } from '@/lib/discounts';
import Price from './Price';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPercentage } from '@/lib/numberFormatter';

interface PriceDisplayProps {
  discountInfo: DiscountInfo;
  currency?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSavings?: boolean;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  discountInfo,
  currency = 'SAR',
  className = '',
  size = 'md',
  showSavings = false
}) => {
  const { t, isRTL } = useLanguage();
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const originalPriceSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const savingsSizeClasses = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base'
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Current/Discounted Price */}
        <div className={`font-bold text-gray-900 ${sizeClasses[size]}`}>
          <Price 
            amount={discountInfo.discountedPrice} 
            locale={isRTL ? 'ar' : 'en'}
            className={`font-bold text-gray-900 ${sizeClasses[size]}`}
          />
        </div>

        {/* Original Price (crossed out if discounted) */}
        {discountInfo.hasDiscount && (
          <div className={`text-gray-500 line-through ${originalPriceSizeClasses[size]}`}>
            <Price 
              amount={discountInfo.originalPrice} 
              locale={isRTL ? 'ar' : 'en'}
              className={`text-gray-500 line-through ${originalPriceSizeClasses[size]}`}
            />
          </div>
        )}
      </div>

      {/* Savings Amount */}
      {discountInfo.hasDiscount && showSavings && (
        <div className={`text-green-600 font-medium ${savingsSizeClasses[size]}`}>
          {t('discount.youSave')} <Price 
            amount={discountInfo.discountAmount} 
            locale={isRTL ? 'ar' : 'en'}
            className={`text-green-600 font-medium ${savingsSizeClasses[size]}`}
          /> ({formatPercentage(Math.round(discountInfo.discountPercent), isRTL ? 'ar' : 'en')})
        </div>
      )}
    </div>
  );
};
