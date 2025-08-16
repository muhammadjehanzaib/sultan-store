'use client';

import React from 'react';
import { DiscountInfo, formatDiscountPercent } from '@/lib/discounts';
import { useLanguage } from '@/contexts/LanguageContext';
import Price from './Price';

interface DiscountBadgeProps {
  discountInfo: DiscountInfo;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'corner';
}

export const DiscountBadge: React.FC<DiscountBadgeProps> = ({
  discountInfo,
  className = '',
  size = 'md',
  variant = 'default'
}) => {
  const { t, isRTL } = useLanguage();
  
  if (!discountInfo.hasDiscount) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const variantClasses = {
    default: 'bg-red-600 text-white rounded-lg font-semibold shadow-md',
    minimal: 'bg-red-100 text-red-800 rounded border border-red-200',
    corner: 'bg-red-600 text-white rounded-tr-lg rounded-bl-lg font-bold'
  };

  const renderBadgeContent = () => {
    if (discountInfo.discountType === 'percentage') {
      return (
        <span className="flex items-center gap-1">
          {formatDiscountPercent(discountInfo.discountPercent, isRTL ? 'ar' : 'en')} {t('discount.off')}
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1">
          {t('discount.save')} <Price amount={discountInfo.discountAmount} locale={isRTL ? 'ar' : 'en'} />
        </span>
      );
    }
  };

  return (
    <span className={`
      inline-flex items-center justify-center
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      ${className}
    `}>
      {renderBadgeContent()}
    </span>
  );
};
