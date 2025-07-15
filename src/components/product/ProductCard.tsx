'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import Price from '@/components/ui/Price';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, selectedAttributes?: { [attributeId: string]: string }) => void;
  onViewProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewProduct,
}) => {
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const handleViewProduct = () => {
    if (onViewProduct) {
      onViewProduct(product);
    }
    router.push(`/product/${product.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <Link 
        href={`/product/${product.id}`}
        className="block relative h-48 bg-gray-200 cursor-pointer overflow-hidden"
        onClick={handleViewProduct}
      >
        <Image 
          src={product.image} 
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover hover:scale-105 transition-transform duration-300"
          priority={false}
        />
        {!product.inStock && (
          <div className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} bg-red-500 text-white px-2 py-1 rounded text-xs`}>
            {t('product.outOfStock')}
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <Link 
            href={`/product/${product.id}`}
            className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors"
            onClick={handleViewProduct}
          >
            {product.name}
          </Link>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {product.category}
          </span>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`text-sm ${i < Math.floor(product.rating!) ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ⭐
                </span>
              ))}
            </div>
            <span className={`text-sm text-gray-500 ${isRTL ? 'mr-2' : 'ml-2'}`}>
              {product.rating} ({product.reviews} {t('product.reviews')})
            </span>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <Price amount={product.price} locale={isRTL ? 'ar' : 'en'} className="text-2xl font-bold text-purple-600 mb-4" />

        {/* Add to Cart Button */}
        <Button
          fullWidth
          onClick={handleViewProduct}
          disabled={!product.inStock}
        >
          {product.inStock ? t('product.viewDetails') : t('product.outOfStock')}
        </Button>
      </div>
    </div>
  );
};
