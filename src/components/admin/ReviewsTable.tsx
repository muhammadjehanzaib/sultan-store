'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Review } from '@/types';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ReviewsTableProps {
  reviews: Review[];
  onView: (review: Review) => void;
  onUpdateStatus: (reviewId: string, status: Review['status']) => void;
  onDelete: (reviewId: string) => void;
  onBulkAction: (action: 'approve' | 'reject' | 'delete', reviewIds: string[]) => void;
}

export function ReviewsTable({ 
  reviews, 
  onView, 
  onUpdateStatus, 
  onDelete, 
  onBulkAction 
}: ReviewsTableProps) {
  const { t, isRTL } = useLanguage();
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});

  const handleSelectAll = (checked: boolean) => {
    setSelectedReviews(checked ? reviews.map(r => r.id) : []);
  };

  const handleSelectReview = (reviewId: string, checked: boolean) => {
    setSelectedReviews(prev => 
      checked 
        ? [...prev, reviewId]
        : prev.filter(id => id !== reviewId)
    );
  };

  const handleStatusUpdate = async (reviewId: string, status: Review['status']) => {
    setLoadingActions(prev => ({ ...prev, [`status-${reviewId}`]: true }));
    try {
      await onUpdateStatus(reviewId, status);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`status-${reviewId}`]: false }));
    }
  };

  const handleDelete = async (reviewId: string) => {
    setLoadingActions(prev => ({ ...prev, [`delete-${reviewId}`]: true }));
    try {
      await onDelete(reviewId);
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`delete-${reviewId}`]: false }));
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedReviews.length === 0) return;
    
    setLoadingActions(prev => ({ ...prev, [`bulk-${action}`]: true }));
    try {
      await onBulkAction(action, selectedReviews);
      setSelectedReviews([]);
    } catch (error) {
      console.error(`Error with bulk ${action}:`, error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`bulk-${action}`]: false }));
    }
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {selectedReviews.length} {t('admin.reviews.selected')}
            </span>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('approve')}
                disabled={loadingActions['bulk-approve']}
              >
                {loadingActions['bulk-approve'] ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  t('admin.reviews.bulkApprove')
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('reject')}
                disabled={loadingActions['bulk-reject']}
              >
                {loadingActions['bulk-reject'] ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  t('admin.reviews.bulkReject')
                )}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleBulkAction('delete')}
                disabled={loadingActions['bulk-delete']}
              >
                {loadingActions['bulk-delete'] ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  t('admin.reviews.bulkDelete')
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  checked={selectedReviews.length === reviews.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.reviews.customer')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.reviews.product')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.reviews.rating')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.reviews.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.reviews.date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.reviews.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    checked={selectedReviews.includes(review.id)}
                    onChange={(e) => handleSelectReview(review.id, e.target.checked)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {review.customerName}
                      </div>
                      {review.verified && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          ✓ {t('admin.reviews.verified')}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    Product ID: {review.productId}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col items-start">
                    {renderStars(review.rating)}
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {review.rating}/5
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(review.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(review)}
                    >
                      {t('admin.reviews.view')}
                    </Button>
                    
                    {review.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleStatusUpdate(review.id, 'approved')}
                          disabled={loadingActions[`status-${review.id}`]}
                        >
                          {loadingActions[`status-${review.id}`] ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            t('admin.reviews.approve')
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleStatusUpdate(review.id, 'rejected')}
                          disabled={loadingActions[`status-${review.id}`]}
                        >
                          {loadingActions[`status-${review.id}`] ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            t('admin.reviews.reject')
                          )}
                        </Button>
                      </>
                    )}
                    
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleDelete(review.id)}
                      disabled={loadingActions[`delete-${review.id}`]}
                    >
                      {loadingActions[`delete-${review.id}`] ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        t('admin.reviews.delete')
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('admin.reviews.noReviews')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('admin.reviews.noReviewsDescription')}
          </p>
        </div>
      )}
    </div>
  );
}
