'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Price from '@/components/ui/Price';
import Image from 'next/image';

interface ReviewableOrder {
  id: string;
  createdAt: string;
  items: {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name_en: string;
      name_ar: string;
      image: string;
      slug: string;
    };
  }[];
}

export default function ReviewsPage() {
  const { user, isAuthenticated } = useAuth();
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const [orders, setOrders] = useState<ReviewableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<{ [productId: string]: { rating: number; comment: string } }>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    fetchReviewableOrders();
  }, [isAuthenticated]);

  const fetchReviewableOrders = async () => {
    try {
      const response = await fetch('/api/orders/reviewable');
      if (!response.ok) throw new Error('Failed to fetch reviewable orders');
      
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (productId: string, rating: number) => {
    setReviews(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        rating
      }
    }));
  };

  const handleCommentChange = (productId: string, comment: string) => {
    setReviews(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        comment
      }
    }));
  };

  const handleSubmitReview = async (orderId: string, productId: string) => {
    const review = reviews[productId];
    if (!review?.rating || !review?.comment) {
      setError('Please provide both rating and comment');
      return;
    }

    setSubmitting(productId);
    setError(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          orderId,
          rating: review.rating,
          comment: review.comment
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      // Remove the product from reviewable orders after successful review
      setOrders(prev => prev.map(order => ({
        ...order,
        items: order.items.filter(item => item.productId !== productId)
      })).filter(order => order.items.length > 0));

      // Clear the review form
      setReviews(prev => {
        const newReviews = { ...prev };
        delete newReviews[productId];
        return newReviews;
      });

      // Show success message (you could add a toast here)
      alert('Review submitted successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(null);
    }
  };

  const renderStars = (productId: string, currentRating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(productId, star)}
            className={`text-8xl transition-colors ${
              star <= currentRating
                ? 'text-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Write Reviews
          </h1>
          <p className="text-gray-600 mt-2">
            Share your experience with products you've purchased
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No items to review
            </h3>
            <p className="text-gray-600 mb-6">
              You don't have any delivered orders that can be reviewed at the moment.
            </p>
            <Button onClick={() => router.push('/')}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="bg-white shadow rounded-lg p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Order #{order.id}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Delivered on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-6">
                  {order.items.map((item) => {
                    const productReview = reviews[item.productId] || { rating: 0, comment: '' };
                    const productName = isRTL ? item.product.name_ar : item.product.name_en;

                    return (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.product.image}
                              alt={productName}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/images/placeholder-product.svg';
                              }}
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{productName}</h3>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity} × <Price amount={item.price} />
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* Rating */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Rating *
                            </label>
                            {renderStars(item.productId, productReview.rating)}
                          </div>

                          {/* Comment */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Your Review *
                            </label>
                            <textarea
                              value={productReview.comment}
                              onChange={(e) => handleCommentChange(item.productId, e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Share your experience with this product..."
                            />
                          </div>

                          {/* Submit Button */}
                          <div className="flex justify-end">
                            <Button
                              onClick={() => handleSubmitReview(order.id, item.productId)}
                              disabled={!productReview.rating || !productReview.comment || submitting === item.productId}
                              className="min-w-32"
                            >
                              {submitting === item.productId ? (
                                <>
                                  <LoadingSpinner size="sm" />
                                  Submitting...
                                </>
                              ) : (
                                'Submit Review'
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
