"use client";

import { useRouter } from 'next/navigation';
import { useState, memo } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { ProductAttributeSelector } from '@/components/product/ProductAttributeSelector';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import Price from '@/components/ui/Price';
import { Product } from '@/types';
import { products as mockProducts } from '@/data/products';
import { mockReviews } from '@/data/mockCustomers';
import { ProductCard } from '@/components/product/ProductCard';
import { Fragment } from 'react';

interface ProductDetailClientProps {
  product: Product;
}

// Helper type guard for category
function isCategoryObject(category: unknown): category is { name_en: string } {
  return typeof category === 'object' && category !== null && 'name_en' in category && typeof (category as any).name_en === 'string';
}

const ProductDetailClient = memo(function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { dispatch } = useCart();
  const { t, isRTL } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<{ [attributeId: string]: string }>({});

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch({ 
        type: 'ADD_ITEM', 
        payload: { 
          product, 
          selectedAttributes: Object.keys(selectedAttributes).length > 0 ? selectedAttributes : undefined 
        } 
      });
    }
    dispatch({ type: 'TOGGLE_CART' });
  };

  const updateQuantity = (newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back & Home Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>            <button
              onClick={() => router.back()}
              className={`flex items-center text-purple-600 hover:text-purple-700 font-medium text-sm md:text-base ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {isRTL ? '→' : '←'} {t('common.back')}
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => router.push('/')}
              className={`flex items-center text-gray-600 hover:text-purple-700 font-medium text-sm md:text-base ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              🏠 {t('nav.home')}
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumb
          items={[
            { label: t('nav.home'), href: '/' },
            { label: isCategoryObject(product.category) ? product.category.name_en : (product.category || ''), href: '/' },
            { label: product.name, isCurrentPage: true }
          ]}
        />
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {/* Product Image */}
          <div className="space-y-3 md:space-y-4">
            <div className="aspect-square bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4 md:space-y-6">
            {/* Category Badge */}
            <div>
              <span className="inline-block px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 rounded-full">
                {isCategoryObject(product.category) ? product.category.name_en : (product.category || '')}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating */}
            {typeof product.rating === 'number' && (
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-lg ${i < Math.floor(product.rating!) ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating} ({product.reviews} {t('product.reviews')})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600">
                <Price amount={product.price} locale={isRTL ? 'ar' : 'en'} className="text-3xl font-bold text-purple-600" />
              </div>
              <p className="text-sm text-green-600 font-medium">
                ✓ Free shipping on orders over <Price amount={50} locale={isRTL ? 'ar' : 'en'} />
              </p>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('product.description')}</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description || t('site.description')}
              </p>
              
              {/* Product Attributes */}
              {product.attributes && product.attributes.length > 0 && (
                <ProductAttributeSelector
                  attributes={product.attributes}
                  selectedValues={selectedAttributes}
                  onAttributeChange={(attributeId, valueId) => {
                    setSelectedAttributes(prev => ({
                      ...prev,
                      [attributeId]: valueId
                    }));
                  }}
                />
              )}
            </div>

            {/* Stock Status */}
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <div className={`w-3 h-3 rounded-full ${product.inStock !== false ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className={`font-medium ${product.inStock !== false ? 'text-green-700' : 'text-red-700'}`}>
                {product.inStock !== false ? t('product.stock') : t('product.outOfStock')}
              </span>
            </div>

            {/* Quantity and Add to Cart */}
            {product.inStock !== false && (
              <div className="space-y-4">
                {/* Quantity Selector */}
                <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                  <span className="font-medium text-gray-700">{t('cart.quantity')}:</span>
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                    <button
                      onClick={() => updateQuantity(quantity - 1)}
                      className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-purple-100 hover:border-purple-300 transition-colors font-semibold text-gray-600"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-purple-100 hover:border-purple-300 transition-colors font-semibold text-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className={`flex ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                  <Button
                    onClick={handleAddToCart}
                    size="lg"
                    className="flex-1"
                  >
                    {t('product.addToCart')} {quantity > 1 ? `${quantity} ` : ''}- <Price amount={product.price * quantity} locale={isRTL ? 'ar' : 'en'} />
                  </Button>
                  <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    ❤️
                  </button>
                </div>

                {/* --- Restored: Badges/Icons for Shipping, Returns, Warranty --- */}
                <div className="grid grid-cols-3 gap-4 text-center mt-2">
                  <div className="space-y-2">
                    <div className="text-2xl">🚚</div>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">{t('product.freeShipping') || 'Free Shipping'}</div>
                      <div>{t('product.freeShippingSubtitle') || 'Orders over 50'}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl">🔄</div>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">{t('product.easyReturns') || 'Easy Returns'}</div>
                      <div>{t('product.easyReturnsSubtitle') || '30-day policy'}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl">🛡️</div>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">{t('product.warranty') || 'Warranty'}</div>
                      <div>{t('product.warrantySubtitle') || '1-year coverage'}</div>
                    </div>
                  </div>
                </div>
                {/* --- End Badges/Icons --- */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Restored: Customer Reviews Section --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-xl font-bold mb-4">{t('product.customerReviews') || 'Customer Reviews'}</h2>
        {(() => {
          const reviews = mockReviews.filter(r => r.productId === product.id);
          if (!reviews.length) return <p className="text-gray-500">{t('product.noReviews') || 'No reviews yet.'}</p>;
          const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
          const starCounts = [5,4,3,2,1].map(star => reviews.filter(r => r.rating === star).length);
          return (
            <Fragment>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-2xl text-yellow-400">{avgRating} ⭐</span>
                <span className="text-gray-600">({reviews.length} {t('product.reviews')})</span>
              </div>
              <div className="flex flex-col gap-1 mb-4">
                {starCounts.map((count, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-8 text-sm">{5-i}★</span>
                    <div className="flex-1 bg-gray-200 rounded h-2">
                      <div className="bg-yellow-400 h-2 rounded" style={{width: `${(count/reviews.length)*100}%`}}></div>
                    </div>
                    <span className="w-6 text-xs text-gray-500">{count}</span>
                  </div>
                ))}
              </div>
              <div className="divide-y divide-gray-200">
                {reviews.map(r => (
                  <div key={r.id} className="py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{r.customerName}</span>
                      {r.verified && <span className="text-green-600 text-xs bg-green-100 px-2 py-0.5 rounded">Verified</span>}
                      <span className="text-yellow-400">{'★'.repeat(r.rating)}</span>
                    </div>
                    <div className="text-gray-700 mb-1">{r.comment}</div>
                    <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </Fragment>
          );
        })()}
      </div>
      {/* --- End Customer Reviews Section --- */}

      {/* --- Restored: Related Products Section --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-xl font-bold mb-4">{t('product.relatedProducts') || 'Related Products'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0,4).map(related => (
            <ProductCard key={related.id} product={related} />
          ))}
        </div>
      </div>
      {/* --- End Related Products Section --- */}
    </div>
  );
});

export default ProductDetailClient; 