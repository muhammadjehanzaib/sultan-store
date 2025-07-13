'use client';

import { useRouter } from 'next/navigation';
import { useState, memo, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductAttributeSelector } from '@/components/product/ProductAttributeSelector';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { formatPrice, generateStarRating } from '@/lib/utils';
import { Product } from '@/types';
import { products } from '@/data/products';

interface ProductDetailClientProps {
  product: Product;
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
    // Show success message or notification here
  };

  const updateQuantity = (newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back & Home Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
            <button
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
            { label: t(`categories.${product.category.toLowerCase()}`), href: '/' },
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
            
            {/* Additional Images Placeholder - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden opacity-50">
                  <img
                    src={product.image}
                    alt={`${product.name} view ${index}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4 md:space-y-6">
            {/* Category Badge */}
            <div>
              <span className="inline-block px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 rounded-full">
                {product.category}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating */}
            {product.rating && (
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
                {formatPrice(product.price)}
              </div>
              <p className="text-sm text-green-600 font-medium">
                ✓ Free shipping on orders over $50
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

              {/* Additional product details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-gray-900">{t('product.description')}:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('hero.features.securePaymentDesc')}</li>
                  <li>• {t('hero.features.fastDeliveryDesc')}</li>
                  <li>• {t('footer.returns')}</li>
                  <li>• {t('hero.features.support')}</li>
                </ul>
              </div>
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
                    {t('product.addToCart')} {quantity > 1 ? `${quantity} ` : ''}- {formatPrice(product.price * quantity)}
                  </Button>
                  <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    ❤️
                  </button>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="border-t pt-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-2xl">🚚</div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Free Shipping</div>
                    <div>Orders over $50</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl">🔄</div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Easy Returns</div>
                    <div>30-day policy</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl">🛡️</div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Warranty</div>
                    <div>1-year coverage</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
            Customer Reviews ({product.reviews || 0})
          </h2>
          
          {/* Review Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold text-purple-600">
                  {product.rating || 0}
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`text-lg ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    Based on {product.reviews || 0} reviews
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const percentage = Math.random() * 100; // Mock data
                return (
                  <div key={stars} className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 w-8">{stars}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12">{Math.round(percentage)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-6">
            {mockReviews.map((review) => (
              <div key={review.id} className="border-b pb-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">
                        {review.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{review.author}</div>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{review.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                {review.verified && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      ✓ Verified Purchase
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Write Review Button */}
          <div className="mt-6 text-center">
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Write a Review
            </button>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {getRelatedProducts(product).map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                onAddToCart={(product, selectedAttributes) => dispatch({ type: 'ADD_ITEM', payload: { product, selectedAttributes } })}
                onViewProduct={(product) => router.push(`/product/${product.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// Mock reviews data
const mockReviews = [
  {
    id: 1,
    author: "John Smith",
    rating: 5,
    date: "2 weeks ago",
    comment: "Excellent product! The quality exceeded my expectations and delivery was super fast. Highly recommended!",
    verified: true
  },
  {
    id: 2,
    author: "Sarah Johnson",
    rating: 4,
    date: "1 month ago",
    comment: "Great value for money. Works exactly as described. Only minor issue was packaging could be better.",
    verified: true
  },
  {
    id: 3,
    author: "Mike Chen",
    rating: 5,
    date: "3 weeks ago",
    comment: "Amazing product! Been using it daily and it's held up perfectly. Customer service was also excellent.",
    verified: false
  }
];

// Helper function to get related products
function getRelatedProducts(currentProduct: Product): Product[] {
  return products
    .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category)
    .slice(0, 4);
}

export default ProductDetailClient;
