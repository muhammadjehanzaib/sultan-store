'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import Price from '@/components/ui/Price';
import { useRouter } from 'next/navigation';
import { getLocalizedString, ensureLocalizedContent } from '@/lib/multilingualUtils';
// Import discount utilities
import { calculateProductPrice, ProductWithDiscount } from '@/lib/discounts';
import { DiscountBadge } from '@/components/ui/DiscountBadge';
import { PriceDisplay } from '@/components/ui/PriceDisplay';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, selectedAttributes?: { [attributeId: string]: string }, variantPrice?: number) => void;
  onViewProduct?: (product: Product) => void;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewProduct,
  viewMode = 'grid',
}) => {
  const { t, isRTL, language } = useLanguage();
  const router = useRouter();

  // Calculate discount information
  const productWithDiscount: ProductWithDiscount = {
    id: product.id,
    price: product.price,
    salePrice: product.salePrice,
    discountPercent: product.discountPercent,
    onSale: product.onSale || false,
    saleStartDate: product.saleStartDate ? new Date(product.saleStartDate) : null,
    saleEndDate: product.saleEndDate ? new Date(product.saleEndDate) : null
  };
  
  const discountInfo = calculateProductPrice(productWithDiscount);
  
  // The discount calculation now handles all validation internally
  const shouldShowDiscountBadge = discountInfo.hasDiscount;
  const discountDisplayValue = discountInfo.discountPercent;
  

  const handleViewProduct = () => {
    if (onViewProduct) {
      onViewProduct(product);
    }
    router.push(`/product/${product.slug}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.inStock || !onAddToCart) return;
    
    // Get default variant if product has variants
    let selectedAttributes: { [attributeId: string]: string } = {};
    
    if (product.variants && product.variants.length > 0) {
      // Find the first available variant or the first variant as default
      const defaultVariant = product.variants.find(v => v.inStock && (v.stockQuantity || 0) > 0) || product.variants[0];
      if (defaultVariant && product.attributes) {
        // Map variant attributes to selectedAttributes format
        product.attributes.forEach(attr => {
          if (defaultVariant.attributeValues && typeof defaultVariant.attributeValues === 'object' && !Array.isArray(defaultVariant.attributeValues)) {
            const attrValues = defaultVariant.attributeValues as { [attributeId: string]: string };
            if (attrValues[attr.id]) {
              selectedAttributes[attr.id] = attrValues[attr.id];
            } else if (attr.values && attr.values.length > 0) {
              selectedAttributes[attr.id] = attr.values[0].id;
            }
          } else if (attr.values && attr.values.length > 0) {
            // Fallback to first value if variant doesn't specify
            selectedAttributes[attr.id] = attr.values[0].id;
          }
        });
      }
    }
    
    onAddToCart(product, selectedAttributes, discountInfo.discountedPrice);
  };

  // Render different layouts based on viewMode
  if (viewMode === 'list') {
    return (
      <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex items-center p-4 border border-gray-200 hover:border-purple-200">
        {/* Product Image */}
        <div className="relative w-24 h-24 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={getLocalizedString(ensureLocalizedContent(product.name), language)}
            fill
            sizes="96px"
            className={`object-cover p-2 transition-all duration-300 ${
              product.inStock 
                ? 'filter group-hover:brightness-105' 
                : 'filter grayscale brightness-75'
            }`}
          />
          
          {/* Discount Badge - Only show if discount is meaningful */}
          {shouldShowDiscountBadge && discountDisplayValue > 0 && discountDisplayValue >= 1 && (
            <div className="absolute -top-1 -right-1 z-20">
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                -{discountDisplayValue}%
              </span>
            </div>
          )}
          
          {/* Out of Stock Badge */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <span className="text-white text-xs font-bold">{t('product.outOfStock')}</span>
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className={`flex-1 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          {/* Category */}
          <span className="inline-block text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full mb-1">
            {getLocalizedString(ensureLocalizedContent(product.category), language)}
          </span>
          
          {/* Title */}
          <Link href={`/product/${product.slug}`} onClick={handleViewProduct}>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300 line-clamp-1 mb-1">
              {getLocalizedString(ensureLocalizedContent(product.name), language)}
            </h3>
          </Link>
          
          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-1 mb-2">
            {getLocalizedString(ensureLocalizedContent(product.description), language)}
          </p>
          
          {/* Rating */}
          {product.rating !== null && product.rating !== undefined && product.rating > 0 ? (
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${i < Math.floor(product.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">{product.rating.toFixed(1)}</span>
              {product.reviews && product.reviews > 0 ? (
                <span className="text-xs text-gray-500">({product.reviews} reviews)</span>
              ) : (
                <span className="text-xs text-gray-400">(No reviews)</span>
              )}
            </div>
          ) : (
            <div className="mb-2">
              <span className="text-sm text-gray-400">No reviews yet</span>
            </div>
          )}
        </div>
        
        {/* Price and Actions */}
        <div className={`flex-shrink-0 ${isRTL ? 'text-left' : 'text-right'}`}>
          <div className="mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Current Price */}
              <div className="text-base font-bold text-gray-900">
                <Price 
                  amount={discountInfo.discountedPrice} 
                  locale={isRTL ? 'ar' : 'en'}
                  className="text-base font-bold text-gray-900"
                />
              </div>

              {/* Original Price (if discounted) */}
              {discountInfo.hasDiscount && (
                <div className="text-sm text-gray-500 line-through">
                  <Price 
                    amount={discountInfo.originalPrice} 
                    locale={isRTL ? 'ar' : 'en'}
                    className="text-sm text-gray-500 line-through"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={handleViewProduct}
              className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
            >
              {t('product.viewDetails')}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || !onAddToCart}
              className={`w-10 h-10 rounded-lg transition-all duration-300 flex items-center justify-center ${
                product.inStock && onAddToCart
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title={product.inStock ? t('product.addToCart') : t('product.outOfStock')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5-5M7 13l-2.5 5M16 16a1 1 0 100 2 1 1 0 000-2zm-6 0a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="group relative bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 flex flex-col h-full overflow-hidden w-full">
      {/* Product Image */}
      <Link
        href={`/product/${product.slug}`}
        className="block relative h-48 bg-gray-50 cursor-pointer overflow-hidden rounded-t-lg"
        onClick={handleViewProduct}
      >
        <Image
          src={product.image}
          alt={getLocalizedString(ensureLocalizedContent(product.name), language)}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover p-4 group-hover:scale-110 transition-all duration-700 ease-out ${
            product.inStock 
              ? 'filter group-hover:brightness-105' 
              : 'filter grayscale brightness-75'
          }`}
          priority={false}
        />
        
          {/* Clean Discount Badge - Only show if discount is meaningful */}
        {shouldShowDiscountBadge && discountDisplayValue > 0 && discountDisplayValue >= 1 && (
          <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} z-20`}>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
              -{discountDisplayValue}%
            </span>
          </div>
        )}
        
        {/* Premium Badge for high-rated products */}
        {product.rating && product.rating >= 4.5 && (
          <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-20`}>
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1 shadow-lg">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span>TOP</span>
            </div>
          </div>
        )}
        
        {/* Out of Stock Badge - Top Corner */}
        {!product.inStock && (
          <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-30`}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg blur opacity-75"></div>
              <span className="relative bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>{t('product.outOfStock')}</span>
              </span>
            </div>
          </div>
        )}
        
        {/* Action Buttons Overlay */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          {/* Wishlist */}
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-pink-50 hover:text-pink-600 transition-all duration-200 hover:scale-110">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          {/* Quick View */}
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 hover:scale-110">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </Link>
      {/* Product Info - Modern and engaging */}
      <div className="relative p-4 flex flex-col flex-1 z-10">
        {/* Category Tag */}
        <div className="mb-2">
          <span className="inline-block text-xs font-semibold text-purple-600 bg-purple-100 px-2.5 py-1 rounded-full">
            {getLocalizedString(ensureLocalizedContent(product.category), language)}
          </span>
        </div>
        
        {/* Product Title */}
        <Link
          href={`/product/${product.slug}`}
          className="block mb-2"
          onClick={handleViewProduct}
        >
          <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300 line-clamp-2 min-h-[2.5rem] leading-tight">
            {getLocalizedString(ensureLocalizedContent(product.name), language)}
          </h3>
        </Link>

          {/* Rating & Reviews */}
        {product.rating !== null && product.rating !== undefined && product.rating > 0 ? (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.floor(product.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">{product.rating.toFixed(1)}</span>
            </div>
            {product.reviews && product.reviews >= 1 ? (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {product.reviews} reviews
              </span>
            ) : (
              <span className="text-xs text-gray-400">
                No reviews
              </span>
            )}
          </div>
        ) : (
          <div className="mb-2 h-5 flex items-center">
            <span className="text-sm text-gray-400">No reviews yet</span>
          </div>
        )}

        {/* Description */}
        {product.description ? (
          <div className="mb-2 h-10 overflow-hidden">
            <p className="text-sm text-gray-600 line-clamp-2 leading-5 overflow-hidden" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxHeight: '2.5rem'
            }}>
              {getLocalizedString(ensureLocalizedContent(product.description), language)}
            </p>
          </div>
        ) : null}

        {/* Spacer */}
        <div className="flex-1"></div>

        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Current Price */}
            <div className="text-lg font-bold text-gray-900">
              <Price 
                amount={discountInfo.discountedPrice} 
                locale={isRTL ? 'ar' : 'en'}
                className="text-lg font-bold text-gray-900"
              />
            </div>

            {/* Original Price (if discounted) */}
            {discountInfo.hasDiscount && (
              <div className="text-sm text-gray-500 line-through">
                <Price 
                  amount={discountInfo.originalPrice} 
                  locale={isRTL ? 'ar' : 'en'}
                  className="text-sm text-gray-500 line-through"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {/* View Details Button */}
          <button
            onClick={handleViewProduct}
            disabled={!product.inStock}
            className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
              product.inStock
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 hover:border-slate-300'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }`}
          >
            {product.inStock ? t('product.viewDetails') : t('product.outOfStock')}
          </button>
          
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || !onAddToCart}
            className={`px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
              product.inStock && onAddToCart
                ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-sm hover:shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title={product.inStock ? t('product.addToCart') : t('product.outOfStock')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5-5M7 13l-2.5 5M16 16a1 1 0 100 2 1 1 0 000-2zm-6 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
            <span>{t('product.add')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
