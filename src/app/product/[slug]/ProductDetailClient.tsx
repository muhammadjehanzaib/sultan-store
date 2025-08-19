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
import { formatPercentage } from '@/lib/numberFormatter';
import { calculateProductPrice, ProductWithDiscount } from '@/lib/discounts';
import { DiscountBadge } from '@/components/ui/DiscountBadge';
import { PriceDisplay } from '@/components/ui/PriceDisplay';

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
  // Admin reply fields
  adminReply?: string;
  adminReplyAt?: string;
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
  const { state, dispatch } = useCart();
  const { t, isRTL, language } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<{ [attributeId: string]: string }>({});
  const [currentPrice, setCurrentPrice] = useState(product.price);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [discountInfo, setDiscountInfo] = useState(calculateProductPrice({
    id: product.id,
    price: product.price,
    salePrice: product.salePrice,
    discountPercent: product.discountPercent,
    onSale: product.onSale || false,
    saleStartDate: product.saleStartDate ? new Date(product.saleStartDate) : null,
    saleEndDate: product.saleEndDate ? new Date(product.saleEndDate) : null
  }));
  
  // Enhanced Image System State
  const [currentImage, setCurrentImage] = useState<string>(product.image);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Get dynamic settings
  const { freeShippingThreshold } = useSettingsValues();

  // Update discount info when current price changes
  useEffect(() => {
    const newDiscountInfo = calculateProductPrice({
      id: product.id,
      price: currentPrice,
      salePrice: product.salePrice,
      discountPercent: product.discountPercent,
      onSale: product.onSale || false,
      saleStartDate: product.saleStartDate ? new Date(product.saleStartDate) : null,
      saleEndDate: product.saleEndDate ? new Date(product.saleEndDate) : null
    });
    setDiscountInfo(newDiscountInfo);
  }, [currentPrice, product.id, product.salePrice, product.discountPercent, product.onSale, product.saleStartDate, product.saleEndDate]);

  // Initialize Image Gallery System
  useEffect(() => {
    const initializeImageGallery = () => {
      // Start with the main product image
      const images = [product.image];
      
      // Add variant images that exist and are different from main image
      if (product.variants) {
        product.variants.forEach(variant => {
          if (variant.image && variant.image !== product.image && !images.includes(variant.image)) {
            images.push(variant.image);
          }
        });
      }
      
      // Add attribute value images (for color swatches, etc.)
      if (product.attributes) {
        product.attributes.forEach(attribute => {
          attribute.values.forEach(value => {
            if (value.imageUrl && value.imageUrl !== product.image && !images.includes(value.imageUrl)) {
              images.push(value.imageUrl);
            }
          });
        });
      }
      
      setAvailableImages(images);
      setCurrentImage(product.image);
      setActiveImageIndex(0);
    };

    initializeImageGallery();
  }, [product]);

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
          setReviews([]);
        }
      } catch (error) {
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
        // Handle both object and array formats for attributeValues
        if (typeof variant.attributeValues === 'object' && !Array.isArray(variant.attributeValues)) {
          const attributeValues = variant.attributeValues as { [attributeId: string]: string };
          return Object.keys(selectedAttributes).every(attrId => 
            attributeValues[attrId] === selectedAttributes[attrId]
          );
        }
        return false; // Skip array format for now
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
    
    // Use discounted price if there's a discount, otherwise use current price
    const priceToUse = discountInfo.hasDiscount ? discountInfo.discountedPrice : currentPrice;
        
    for (let i = 0; i < quantity; i++) {
      dispatch({ 
        type: 'ADD_ITEM', 
        payload: { 
          product, 
          selectedAttributes: Object.keys(selectedAttributes).length > 0 ? selectedAttributes : undefined,
          variantPrice: priceToUse, // Use discounted price when applicable
          variantImage: currentImage // Pass the currently displayed image
        } 
      });
    }
    
    
    // Add a small delay to check the state after dispatch
    setTimeout(() => {
    }, 100);
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
          {/* Enhanced Product Image Gallery */}
          <div className="space-y-3 md:space-y-4">
            {/* Main Image Display */}
            <div className="aspect-square bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg relative">
              {imageLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              )}
              <img
                src={currentImage}
                alt={name}
                className={`w-full h-full object-cover hover:scale-105 transition-all duration-300 ${
                  imageLoading ? 'opacity-50' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
              />
            </div>
            
            {/* Thumbnail Gallery */}
            {availableImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {availableImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (image !== currentImage) {
                        setImageLoading(true);
                        setCurrentImage(image);
                        setActiveImageIndex(index);
                      }
                    }}
                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      activeImageIndex === index
                        ? 'border-purple-500 ring-2 ring-purple-200'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
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

            {/* Price with Discount Display */}
            <div className="space-y-4">
              {/* Discount Badge */}
              {discountInfo.hasDiscount && (
                <div className="mb-3">
                  <DiscountBadge 
                    discountInfo={discountInfo}
                    size="lg"
                    variant="default"
                  />
                </div>
              )}
              
              {/* Price Display */}
              <div className="mb-3">
                <PriceDisplay
                  discountInfo={discountInfo}
                  currency="SAR"
                  size="xl"
                  showSavings={discountInfo.hasDiscount}
                />
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
                  variants={
                    (product.variants || []).filter(variant => 
                      typeof variant.attributeValues === 'object' && !Array.isArray(variant.attributeValues)
                    ).map(variant => ({
                      id: variant.id,
                      attributeValues: variant.attributeValues as { [key: string]: string },
                      inStock: variant.inStock
                    }))
                  }
                  onAttributeChange={(attributeId, valueId) => {
                    const newAttributes = {
                      ...selectedAttributes,
                      [attributeId]: valueId
                    };
                    setSelectedAttributes(newAttributes);
                    
                    // Calculate and update current price
                    let price = product.price;
                    
                    // Check for exact variant match first (including out-of-stock variants)
                    let matchingVariant = null;
                    if (product.variants && Object.keys(newAttributes).length > 0) {
                      matchingVariant = product.variants.find(variant => {
                        // Handle both object and array formats for attributeValues
                        if (typeof variant.attributeValues === 'object' && !Array.isArray(variant.attributeValues)) {
                          const attributeValues = variant.attributeValues as { [attributeId: string]: string };
                          const attributesMatch = Object.keys(newAttributes).every(attrId => 
                            attributeValues[attrId] === newAttributes[attrId]
                          );
                          return attributesMatch; // Allow matching even if out of stock
                        }
                        return false; // Skip array format for now
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
                    
                    // Update selected variant, price, and image
                    setSelectedVariant(matchingVariant);
                    setCurrentPrice(price);
                    
                    // Handle image switching with loading state
                    const handleImageSwitch = async (newImage: string) => {
                      if (newImage !== currentImage) {
                        setImageLoading(true);
                        try {
                          // Update current image
                          setCurrentImage(newImage);
                          // Update active image index
                          const imageIndex = availableImages.indexOf(newImage);
                          setActiveImageIndex(imageIndex >= 0 ? imageIndex : 0);
                        } finally {
                          // Small delay for smooth transition
                          setTimeout(() => setImageLoading(false), 150);
                        }
                      }
                    };
                    
                    // Switch image based on selected variant
                    if (matchingVariant && matchingVariant.image) {
                      // Variant has specific image - use it
                      handleImageSwitch(matchingVariant.image);
                    } else {
                      // Check if any selected attribute value has an image
                      let attributeImage = null;
                      if (product.attributes) {
                        for (const attribute of product.attributes) {
                          const selectedValueId = newAttributes[attribute.id];
                          if (selectedValueId) {
                            const selectedValue = attribute.values.find(v => v.id === selectedValueId);
                            if (selectedValue && selectedValue.imageUrl) {
                              attributeImage = selectedValue.imageUrl;
                              break; // Use the first attribute image found
                            }
                          }
                        }
                      }
                      
                      if (attributeImage) {
                        handleImageSwitch(attributeImage);
                      } else {
                        // Fall back to main product image
                        handleImageSwitch(product.image);
                      }
                    }
                  }}
                />
              )}
            </div>

            {/* Enhanced Stock Status */}
            <div className="space-y-2">
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <div className={`w-3 h-3 rounded-full ${product.inStock !== false ? 'bg-green-400' : 'bg-red-400'} ${product.inStock === false ? 'animate-pulse' : ''}`}></div>
                <span className={`font-medium ${product.inStock !== false ? 'text-green-700' : 'text-red-700'}`}>
                  {product.inStock !== false ? t('product.stock') : t('product.outOfStock')}
                </span>
                {selectedVariant && selectedVariant.inStock === false && (
                  <span className="text-orange-600 text-sm font-medium ml-2 bg-orange-100 px-2 py-1 rounded-full">
                    Selected variant unavailable
                  </span>
                )}
              </div>
              
              {/* Variant-specific stock information */}
              {selectedVariant && (
                <div className="text-sm space-y-1">
                  {selectedVariant.inStock === false ? (
                    <div className="flex items-center space-x-2 text-orange-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>This combination is currently out of stock</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-green-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Selected variant is in stock</span>
                    </div>
                  )}
                  
                  {/* Mock stock level for selected variant */}
                  {selectedVariant.inStock !== false && (
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      <span>Stock level:</span>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < 3 ? 'bg-green-400' : 'bg-gray-200'
                            }`}
                          ></div>
                        ))}
                      </div>
                      <span className="text-green-600 font-medium">Good</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Overall inventory info */}
              {product.variants && product.variants.length > 0 && (
                <div className="text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>{product.variants.filter(v => v.inStock !== false).length} variants available</span>
                    </div>
                    {product.variants.filter(v => v.inStock === false).length > 0 && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                        <span>{product.variants.filter(v => v.inStock === false).length} restocking soon</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity and Add to Cart - Show only if product is in stock */}
            <div className="space-y-4">
              {/* Check if product is out of stock or selected variant is out of stock */}
              {product.inStock === false ? (
                // Product completely out of stock
                <div className="flex-1 space-y-3">
                  <Button
                    disabled
                    size="lg"
                    className="w-full bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 008.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      </svg>
                      <span>{t('product.outOfStock')}</span>
                    </span>
                  </Button>
                  
                  {/* Expected restock info */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-orange-700 font-medium">Expected back in stock: SOON</span>
                    </div>
                  </div>
                </div>
              ) : selectedVariant && selectedVariant.inStock === false ? (
                // Selected variant is out of stock
                <div className="flex-1 space-y-3">
                  <Button
                    disabled
                    size="lg"
                    className="w-full bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 008.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      </svg>
                      <span>This Variant is Out of Stock</span>
                    </span>
                  </Button>
                  
                  {/* Expected restock info */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-orange-700 font-medium">Expected back in stock: SOON</span>
                    </div>
                  </div>
                </div>
              ) : (
                // Product and variant are in stock - show quantity and add to cart
                <>
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
                      {t('product.addToCart')} {quantity > 1 ? `${quantity} ` : ''}- <Price amount={(discountInfo.hasDiscount ? discountInfo.discountedPrice : currentPrice) * quantity} locale={isRTL ? 'ar' : 'en'} taxLabelType='excluded' />
                    </Button>
                    
                    {/* Wishlist Button */}
                    <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      ❤️
                    </button>
                  </div>
                </>
              )}

              {/* --- Restored: Badges/Icons for Shipping, Returns, Warranty --- */}
              <div className="grid grid-cols-3 gap-4 text-center mt-6">
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
            {/* Compact Review Statistics */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
              <div className="flex items-center justify-between gap-6">
                {/* Left: Rating Summary */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                    </div>
                    <div className="flex justify-center mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">
                      {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>
                  
                  {/* Vertical divider */}
                  <div className="w-px h-16 bg-gray-200"></div>
                  
                  {/* Compact Stats */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-green-50 rounded-md px-3 py-2">
                      <div className="text-sm font-bold text-green-700">
                        {Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100)}%
                      </div>
                      <div className="text-xs text-green-600">Positive</div>
                    </div>
                    <div className="bg-blue-50 rounded-md px-3 py-2">
                      <div className="text-sm font-bold text-blue-700">
                        {reviews.filter(r => r.adminReply).length}
                      </div>
                      <div className="text-xs text-blue-600">Replied</div>
                    </div>
                  </div>
                </div>
                
                {/* Right: Horizontal Star Distribution */}
                <div className="flex-1 max-w-md">
                  <div className="space-y-2">
                    {[5,4,3,2,1].map(star => {
                      const count = reviews.filter(r => r.rating === star).length;
                      const percentage = reviews.length > 0 ? (count/reviews.length)*100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-3 text-gray-600">{star}</span>
                          <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                star === 5 ? 'bg-green-400' :
                                star === 4 ? 'bg-green-300' :
                                star === 3 ? 'bg-yellow-400' :
                                star === 2 ? 'bg-orange-400' :
                                'bg-red-400'
                              }`}
                              style={{width: `${percentage}%`}}
                            ></div>
                          </div>
                          <span className="text-gray-500 w-6 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Far Right: Quick Recommendation */}
                <div className="text-center">
                  <div className={`text-2xl mb-1 ${
                    (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) >= 4 ? 'text-green-600' :
                    (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) >= 3 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) >= 4 ? '👍' :
                     (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) >= 3 ? '👌' :
                     '👎'}
                  </div>
                  <div className={`text-xs font-medium ${
                    (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) >= 4 ? 'text-green-600' :
                    (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) >= 3 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) >= 4 ? 'Great' :
                     (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) >= 3 ? 'Good' :
                     'Poor'}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              {reviews.map(review => {
                const userName = review.user.name || 
                  `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() || 
                  'Anonymous';
                return (
                  <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                    {/* Customer Review */}
                    <div className="mb-4">
                      {/* Customer Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {/* Customer Avatar */}
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white font-semibold text-sm">
                              {userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          {/* Customer Info */}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{userName}</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Verified Purchase
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {/* Star Rating */}
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {review.rating} out of 5
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Review Date */}
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {/* Review Content */}
                      <div className="ml-13">
                        <div className="bg-gray-50 rounded-lg p-4 mb-3">
                          <p className="text-gray-800 leading-relaxed">{review.comment}</p>
                        </div>
                        
                        {/* Review Actions */}
                        <div className="flex items-center gap-4 text-sm">
                          <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            Helpful
                          </button>
                          <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                            </svg>
                            Report
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Admin Reply */}
                    {review.adminReply && (
                      <div className="mt-4 relative">
                        {/* Connection line */}
                        <div className="absolute left-4 -top-2 w-0.5 h-6 bg-gradient-to-b from-gray-300 to-transparent"></div>
                        
                        {/* Admin Reply Container */}
                        <div className="ml-8 relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                          {/* Admin Badge */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {/* Admin Avatar */}
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              
                              {/* Admin Label with Badge */}
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-blue-900">
                                  {t('product.adminReply') || 'Store Team'}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white shadow-sm">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Verified
                                </span>
                              </div>
                            </div>
                            
                            {/* Reply Date */}
                            {review.adminReplyAt && (
                              <div className="flex items-center gap-1 text-xs text-blue-600">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{new Date(review.adminReplyAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Reply Content */}
                          <div className="pl-10">
                            <div className="text-gray-800 text-sm leading-relaxed mb-2">
                              {review.adminReply}
                            </div>
                            
                            {/* Helpful indicator */}
                            <div className="flex items-center gap-2 pt-2 border-t border-blue-100">
                              <span className="text-xs text-blue-600 font-medium">Team Response</span>
                              <div className="flex items-center gap-1">
                                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs text-gray-600">Thank you for choosing us!</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Decorative element */}
                          <div className="absolute top-3 right-3 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
                          <div className="absolute top-5 right-5 w-1 h-1 bg-indigo-400 rounded-full opacity-40"></div>
                        </div>
                      </div>
                    )}
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