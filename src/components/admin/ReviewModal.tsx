'use client';

import { useState } from 'react';
import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Review } from '@/types';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
  onUpdateStatus: (reviewId: string, status: Review['status']) => void;
  onReplySubmitted?: (reviewId: string, reply: string) => void;
}

export function ReviewModal({ isOpen, onClose, review, onUpdateStatus, onReplySubmitted }: ReviewModalProps) {
  const { t, isRTL } = useLanguage();
  const [adminResponse, setAdminResponse] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(review);

  // Update current review when prop changes
  React.useEffect(() => {
    if (review) {
      setCurrentReview(review);
      setAdminResponse(review.adminReply || '');
    }
  }, [review]);

  if (!isOpen || !currentReview) return null;

  const handleStatusUpdate = async (status: Review['status']) => {
    setUpdatingStatus(true);
    try {
      await onUpdateStatus(currentReview.id, status);
      // Update current review status
      setCurrentReview(prev => prev ? { ...prev, status } : null);
      onClose();
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!adminResponse.trim() || !currentReview) return;
    
    setSubmittingResponse(true);
    try {
      const method = currentReview.adminReply ? 'PUT' : 'POST';
      const response = await fetch(`/api/admin/reviews/${currentReview.id}/reply`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: adminResponse.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit reply');
      }

      const data = await response.json();
      
      // Update the current review with the new reply
      setCurrentReview(data.review);
      
      // Clear the input
      setAdminResponse('');
      
      // Notify parent component
      if (onReplySubmitted) {
        onReplySubmitted(currentReview.id, adminResponse.trim());
      }
      
      // Close modal after a short delay to show success
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting admin reply:', error);
      alert('Failed to submit reply. Please try again.');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: Review['status']) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };

    const statusLabels = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('admin.reviews.reviewDetails')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Review Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentReview.title}
                </h4>
                {getStatusBadge(currentReview.status)}
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  {renderStars(currentReview.rating)}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentReview.rating}/5
                  </span>
                </div>
                {currentReview.verified && (
                  <span className="text-sm text-green-600 dark:text-green-400">
                    ✓ {t('admin.reviews.verified')}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(currentReview.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentReview.helpful && `${currentReview.helpful} ${t('admin.reviews.helpful')}`}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">
              {t('admin.reviews.customerInfo')}
            </h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-300">{t('admin.reviews.customer')}:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{currentReview.customerName}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-300">{t('admin.reviews.customerId')}:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{currentReview.customerId}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-300">{t('admin.reviews.product')}:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{currentReview.productId}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-300">{t('admin.reviews.reviewId')}:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{currentReview.id}</span>
              </div>
            </div>
          </div>

          {/* Review Content */}
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900 dark:text-white">
              {t('admin.reviews.reviewContent')}
            </h5>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {currentReview.comment}
              </p>
            </div>
          </div>

          {/* Existing Admin Reply */}
          {currentReview.adminReply && (
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900 dark:text-white">
                {t('admin.reviews.adminResponse')}
              </h5>
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Admin Reply
                  </span>
                  <span className="text-sm text-blue-600 dark:text-blue-300">
                    {currentReview.adminReplyAt ? new Date(currentReview.adminReplyAt).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="text-blue-900 dark:text-blue-100">
                  {currentReview.adminReply}
                </p>
              </div>
            </div>
          )}

          {/* Add/Edit Admin Reply */}
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900 dark:text-white">
              {currentReview.adminReply ? 'Update Admin Reply' : 'Add Admin Reply'}
            </h5>
            <textarea
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder={'Enter your reply to this review...'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
          <div className="flex space-x-3">
            {currentReview.status === 'pending' && (
              <>
                <Button
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={updatingStatus}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updatingStatus ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    t('admin.reviews.approve')
                  )}
                </Button>
                <Button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={updatingStatus}
                  variant="secondary"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {updatingStatus ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    t('admin.reviews.reject')
                  )}
                </Button>
              </>
            )}
            {adminResponse.trim() && (
              <Button
                onClick={handleSubmitResponse}
                disabled={submittingResponse}
                variant="outline"
              >
                {submittingResponse ? (
                  <>
                    <LoadingSpinner size="sm" />
                    {t('admin.reviews.submittingResponse')}
                  </>
                ) : (
                  t('admin.reviews.submitResponse')
                )}
              </Button>
            )}
          </div>
          <Button onClick={onClose} variant="outline">
            {t('admin.reviews.close')}
          </Button>
        </div>
      </div>
    </div>
  );
}
