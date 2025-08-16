/**
 * Product Discount Utilities
 * Handles product-level discounts including percentage, fixed amount, and sale pricing
 */

import { formatPercentage } from './numberFormatter';

export interface ProductWithDiscount {
  id: string;
  price: number;
  salePrice?: number | null;
  discountPercent?: number | null;
  onSale: boolean;
  saleStartDate?: Date | null;
  saleEndDate?: Date | null;
}

export interface DiscountInfo {
  hasDiscount: boolean;
  originalPrice: number;
  discountedPrice: number;
  discountAmount: number;
  discountPercent: number;
  discountType: 'percentage' | 'sale_price' | 'none';
  isValidSaleDate: boolean;
}

/**
 * Calculate the final price after applying product-level discounts
 */
export function calculateProductPrice(product: ProductWithDiscount): DiscountInfo {
  const now = new Date();
  const originalPrice = product.price;
  
  // Check if sale dates are valid (if they exist)
  const isValidSaleDate = 
    !product.saleStartDate || 
    !product.saleEndDate || 
    (now >= product.saleStartDate && now <= product.saleEndDate);
  
  // If product is not on sale or sale dates are invalid, return original price
  if (!product.onSale || !isValidSaleDate) {
    return {
      hasDiscount: false,
      originalPrice,
      discountedPrice: originalPrice,
      discountAmount: 0,
      discountPercent: 0,
      discountType: 'none',
      isValidSaleDate
    };
  }
  
  let discountedPrice = originalPrice;
  let discountType: 'percentage' | 'sale_price' | 'none' = 'none';
  
  // Priority 1: Direct sale price override
  if (product.salePrice && product.salePrice > 0 && product.salePrice < originalPrice) {
    discountedPrice = product.salePrice;
    discountType = 'sale_price';
  }
  // Priority 2: Percentage discount
  else if (product.discountPercent && product.discountPercent > 0 && product.discountPercent <= 100) {
    discountedPrice = originalPrice * (1 - product.discountPercent / 100);
    discountType = 'percentage';
  }
  
  const discountAmount = originalPrice - discountedPrice;
  const discountPercent = (discountAmount / originalPrice) * 100;
  
  return {
    hasDiscount: discountAmount > 0,
    originalPrice,
    discountedPrice: Math.round(discountedPrice * 100) / 100, // Round to 2 decimal places
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountPercent: Math.round(discountPercent * 100) / 100,
    discountType,
    isValidSaleDate
  };
}

/**
 * Format discount percentage for display
 * @param percent - The percentage value
 * @param locale - 'ar' for Arabic, 'en' for English
 * @returns Formatted percentage string
 */
export function formatDiscountPercent(percent: number, locale: 'ar' | 'en' = 'en'): string {
  return formatPercentage(Math.round(percent), locale);
}

/**
 * Format price with currency
 */
export function formatPrice(price: number, currency: string = 'SAR'): string {
  return `${price.toFixed(2)} ${currency}`;
}

/**
 * Get discount badge text for UI display
 * Note: This function is deprecated. Use DiscountBadge component with translations instead.
 */
export function getDiscountBadge(discountInfo: DiscountInfo): string | null {
  if (!discountInfo.hasDiscount) return null;
  
  if (discountInfo.discountType === 'sale_price') {
    return `Save ${formatPrice(discountInfo.discountAmount)}`;
  } else if (discountInfo.discountType === 'percentage') {
    return `${formatDiscountPercent(discountInfo.discountPercent)} OFF`;
  }
  
  return null;
}

/**
 * Check if a product is currently eligible for discount
 */
export function isProductDiscountValid(product: ProductWithDiscount): boolean {
  const discountInfo = calculateProductPrice(product);
  return discountInfo.hasDiscount && discountInfo.isValidSaleDate;
}

/**
 * Get all products with active discounts from a list
 */
export function getDiscountedProducts(products: ProductWithDiscount[]): ProductWithDiscount[] {
  return products.filter(product => isProductDiscountValid(product));
}

/**
 * Sort products by discount percentage (highest first)
 */
export function sortByDiscountPercent(products: ProductWithDiscount[]): ProductWithDiscount[] {
  return products.sort((a, b) => {
    const discountA = calculateProductPrice(a);
    const discountB = calculateProductPrice(b);
    return discountB.discountPercent - discountA.discountPercent;
  });
}

/**
 * Calculate savings for bulk operations (for admin)
 */
export function calculateBulkSavings(products: ProductWithDiscount[]): {
  totalOriginalPrice: number;
  totalDiscountedPrice: number;
  totalSavings: number;
  averageDiscount: number;
} {
  let totalOriginalPrice = 0;
  let totalDiscountedPrice = 0;
  let totalSavings = 0;
  let discountCount = 0;
  let totalDiscountPercent = 0;
  
  products.forEach(product => {
    const discountInfo = calculateProductPrice(product);
    totalOriginalPrice += discountInfo.originalPrice;
    totalDiscountedPrice += discountInfo.discountedPrice;
    totalSavings += discountInfo.discountAmount;
    
    if (discountInfo.hasDiscount) {
      discountCount++;
      totalDiscountPercent += discountInfo.discountPercent;
    }
  });
  
  return {
    totalOriginalPrice: Math.round(totalOriginalPrice * 100) / 100,
    totalDiscountedPrice: Math.round(totalDiscountedPrice * 100) / 100,
    totalSavings: Math.round(totalSavings * 100) / 100,
    averageDiscount: discountCount > 0 ? Math.round((totalDiscountPercent / discountCount) * 100) / 100 : 0
  };
}
