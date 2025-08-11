"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, memo } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { ProductAttributeSelector } from '@/components/product/ProductAttributeSelector';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import Price from '@/components/ui/Price';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { Fragment } from 'react';
import { getLocalizedString, ensureLocalizedContent } from '@/lib/multilingualUtils';
import { useSettingsValues } from '@/hooks/useSettings';

// Types for reviews
interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    firstName?: string;
    lastName?: string;
    name?: string;
  };
}

interface ProductDetailClientProps {
  product: Product;
  allProducts: Product[];
}

// Helper type guard for category
function isCategoryObject(category: unknown): category is { name_en: string } {
  return typeof category === 'object' && category !== null && 'name_en' in category && typeof (category as any).name_en === 'string';
}

const ProductDetailClient = memo(function ProductDetailClient({ product, allProducts }: ProductDetailClientProps) {
  const router = useRouter();
  const { dispatch } = useCart();
  const { t, isRTL, language } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<{ [attributeId: string]: string }>({});
  const [currentPrice, setCurrentPrice] = useState(product.price);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  
  // Get dynamic settings
  const { freeShippingThreshold } = useSettingsValues();

  // Fetch reviews for this product
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const response = await fetch(`/api/reviews?productId=${product.id}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
        } else {
          console.error('Failed to fetch reviews');
          setReviews([]);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (product.id) {
      fetchReviews();
    }
  }, [product.id]);

  // Calculate current price based on selected attributes
  const calculateCurrentPrice = () => {
    let price = product.price;
    
    // Check for exact variant match first
    if (product.variants && Object.keys(selectedAttributes).length > 0) {
      const matchingVariant = product.variants.find(variant => {
        return Object.keys(selectedAttributes).every(attrId => 
          variant.attributeValues[attrId] === selectedAttributes[attrId]
        );
      });
      
      if (matchingVariant && matchingVariant.price !== undefined) {
        return matchingVariant.price;
      }
    }
    
    // If no exact variant match, calculate based on attribute price modifiers
    if (product.attributes) {
      for (const attribute of product.attributes) {
        const selectedValueId = selectedAttributes[attribute.id];
        if (selectedValueId) {
          const selectedValue = attribute.values.find(v => v.id === selectedValueId);
          if (selectedValue && selectedValue.priceModifier) {
            price += selectedValue.priceModifier;
          }
        }
      }
    }
    
    return price;
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch({ 
        type: 'ADD_ITEM', 
        payload: { 
          product, 
          selectedAttributes: Object.keys(selectedAttributes).length > 0 ? selectedAttributes : undefined,
          variantPrice: currentPrice
        } 
      });
    }
    dispatch({ type: 'TOGGLE_CART' });
  };

  const updateQuantity = (newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));
  };

  const name = getLocalizedString(ensureLocalizedContent(product.name), language);
  const description = getLocalizedString(ensureLocalizedContent(product.description || ''), language);
  let category: string;
  if (isCategoryObject(product.category)) {
    // Use getLocalizedString/ensureLocalizedContent for category object fields
    category = getLocalizedString(
      ensureLocalizedContent({
        en: product.category.name_en,
        ar: (product.category as any).name_ar || product.category.name_en
      }),
      language
    );
  } else {
    category = getLocalizedString(ensureLocalizedContent(product.category), language);
  }

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
            { label: category, href: '/' },
            { label: name, isCurrentPage: true }
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
                alt={name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4 md:space-y-6">
            {/* Category Badge */}
            <div>
              <span className="inline-block px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 rounded-full">
                {category}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{name}</h1>

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
                <Price amount={currentPrice} locale={isRTL ? 'ar' : 'en'} taxLabelType="excluded" className="text-3xl font-bold text-purple-600" />
              </div>
              <p className="text-sm text-green-600 font-medium">
                ✓ Free shipping on orders over <Price amount={freeShippingThreshold} locale={isRTL ? 'ar' : 'en'} />
              </p>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('product.description')}</h3>
              <p className="text-gray-700 leading-relaxed">
                {description || t('site.description')}
              </p>
              
              {/* Product Attributes */}
              {product.attributes && product.attributes.length > 0 && (
                <ProductAttributeSelector
                  attributes={product.attributes}
                  selectedValues={selectedAttributes}
                  variants={product.variants || []}
                  onAttributeChange={(attributeId, valueId) => {
                    const newAttributes = {
                      ...selectedAttributes,
                      [attributeId]: valueId
                    };
                    setSelectedAttributes(newAttributes);
                    
                    // Calculate and update current price
                    let price = product.price;
                    
                    // Check for exact variant match first (only active variants)
                    let matchingVariant = null;
                    if (product.variants && Object.keys(newAttributes).length > 0) {
                      matchingVariant = product.variants.find(variant => {
                        const attributesMatch = Object.keys(newAttributes).every(attrId => 
                          variant.attributeValues[attrId] === newAttributes[attrId]
                        );
                        return attributesMatch && variant.inStock !== false;
                      });
                      
                      if (matchingVariant && matchingVariant.price !== undefined) {
                        price = matchingVariant.price;
                      } else {
                        // If no exact variant match, calculate based on attribute price modifiers
                        if (product.attributes) {
                          for (const attribute of product.attributes) {
                            const selectedValueId = newAttributes[attribute.id];
                            if (selectedValueId) {
                              const selectedValue = attribute.values.find(v => v.id === selectedValueId);
                              if (selectedValue && selectedValue.priceModifier) {
                                price += selectedValue.priceModifier;
                              }
                            }
                          }
                        }
                      }
                    } else {
                      // If no variants but has attributes with price modifiers
                      if (product.attributes) {
                        for (const attribute of product.attributes) {
                          const selectedValueId = newAttributes[attribute.id];
                          if (selectedValueId) {
                            const selectedValue = attribute.values.find(v => v.id === selectedValueId);
                            if (selectedValue && selectedValue.priceModifier) {
                              price += selectedValue.priceModifier;
                            }
                          }
                        }
                      }
                    }
                    
                    // Update selected variant and price
                    setSelectedVariant(matchingVariant);
                    setCurrentPrice(price);
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
                    {t('product.addToCart')} {quantity > 1 ? `${quantity} ` : ''}- <Price amount={currentPrice * quantity} locale={isRTL ? 'ar' : 'en'} taxLabelType='excluded' />
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

      {/* --- Customer Reviews Section --- */}
      <div className="max-w-7xl text-gray-700 mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-xl font-bold mb-4">{t('product.customerReviews') || 'Customer Reviews'}</h2>
        {reviewsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Loading reviews...</span>
          </div>
        ) : !reviews.length ? (
          <p className="text-gray-500">{t('product.noReviews') || 'No reviews yet.'}</p>
        ) : (
          <Fragment>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-2xl text-yellow-400">
                {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} ⭐
              </span>
              <span className="text-gray-600">({reviews.length} {t('product.reviews')})</span>
            </div>
            <div className="flex flex-col gap-1 mb-4">
              {[5,4,3,2,1].map(star => {
                const count = reviews.filter(r => r.rating === star).length;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-8 text-sm">{star}★</span>
                    <div className="flex-1 bg-gray-200 rounded h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded" 
                        style={{width: `${reviews.length > 0 ? (count/reviews.length)*100 : 0}%`}}
                      ></div>
                    </div>
                    <span className="w-6 text-xs text-gray-500">{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="divide-y divide-gray-200">
              {reviews.map(review => {
                const userName = review.user.name || 
                  `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() || 
                  'Anonymous';
                return (
                  <div key={review.id} className="py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{userName}</span>
                      <span className="text-green-600 text-xs bg-green-100 px-2 py-0.5 rounded">Verified</span>
                      <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                    </div>
                    <div className="text-gray-700 mb-1">{review.comment}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </Fragment>
        )}
      </div>
      {/* --- End Customer Reviews Section --- */}

      {/* --- Restored: Related Products Section --- */}
      <div className="max-w-7xl text-gray-500 mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-xl font-bold mb-4">{t('product.relatedProducts') || 'Related Products'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allProducts
            .filter(p => {
              // Handle complex category objects
              let pCategoryName = '';
              let productCategoryName = '';
              
              if (typeof p.category === 'object' && 'name_en' in p.category) {
                pCategoryName = language === 'ar' ? (p.category as any).name_ar : p.category.name_en;
              } else {
                pCategoryName = getLocalizedString(ensureLocalizedContent(p.category), language);
              }
              
              if (typeof product.category === 'object' && 'name_en' in product.category) {
                productCategoryName = language === 'ar' ? (product.category as any).name_ar : product.category.name_en;
              } else {
                productCategoryName = getLocalizedString(ensureLocalizedContent(product.category), language);
              }
              
              return pCategoryName === productCategoryName && p.id !== product.id;
            })
            .slice(0, 4)
            .map(related => (
              <ProductCard key={related.id} product={related} />
            ))}
        </div>
      </div>
      {/* --- End Related Products Section --- */}
    </div>
  );
});

export default ProductDetailClient; 