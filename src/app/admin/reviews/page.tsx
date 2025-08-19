'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ReviewsTable } from '@/components/admin/ReviewsTable';
import { ReviewModal } from '@/components/admin/ReviewModal';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Review } from '@/types';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

export default function AdminReviews() {
  const { t, isRTL } = useLanguage();
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewsData, setReviewsData] = useState<Review[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/reviews?status=${statusFilter}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `Failed to fetch reviews (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Reviews data:', data); // Debug log
      setReviewsData(data.reviews || []);
    } catch (error) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleReplySubmitted = async (reviewId: string, reply: string) => {
    // Update the local state to reflect the new reply
    setReviewsData(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, adminReply: reply, adminReplyAt: new Date() }
          : review
      )
    );
    
    // Also update the selected review if it's the same one
    setSelectedReview(prev => 
      prev && prev.id === reviewId 
        ? { ...prev, adminReply: reply, adminReplyAt: new Date() }
        : prev
    );
  };

  const handleUpdateReviewStatus = async (reviewId: string, status: Review['status']) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update review status');
      }

      const data = await response.json();
      
      // Update local state with the updated review
      setReviewsData(prev => 
        prev.map(review => 
          review.id === reviewId 
            ? { ...review, status, updatedAt: new Date() }
            : review
        )
      );
    } catch (error) {
      console.error('Error updating review status:', error);
      setError('Failed to update review status');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm(t('admin.reviews.deleteConfirm'))) {
      try {
        const response = await fetch(`/api/admin/reviews/${reviewId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete review');
        }

        // Remove from local state
        setReviewsData(prev => prev.filter(r => r.id !== reviewId));
      } catch (error) {
        console.error('Error deleting review:', error);
        setError('Failed to delete review');
      }
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete', reviewIds: string[]) => {
    if (action === 'delete') {
      if (confirm(t('admin.reviews.bulkDeleteConfirm'))) {
        try {
          const response = await fetch('/api/admin/reviews', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'delete', reviewIds }),
          });

          if (!response.ok) {
            throw new Error('Failed to delete reviews');
          }

          // Remove from local state
          setReviewsData(prev => prev.filter(r => !reviewIds.includes(r.id)));
        } catch (error) {
          console.error('Error deleting reviews:', error);
          setError('Failed to delete reviews');
        }
      }
    } else {
      try {
        const response = await fetch('/api/admin/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action, reviewIds }),
        });

        if (!response.ok) {
          throw new Error(`Failed to ${action} reviews`);
        }

        // Update local state
        setReviewsData(prev => 
          prev.map(review => 
            reviewIds.includes(review.id)
              ? { ...review, status: action === 'approve' ? 'approved' : 'rejected', updatedAt: new Date() }
              : review
          )
        );
      } catch (error) {
        console.error(`Error ${action}ing reviews:`, error);
        setError(`Failed to ${action} reviews`);
      }
    }
  };

  const filteredReviews = reviewsData.filter(review => {
    if (statusFilter === 'all') return true;
    return review.status === statusFilter;
  });

  return (
    <AdminAuthGuard requiredRole={["admin", "manager", "support"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('admin.reviews.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {t('admin.reviews.subtitle')}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">{t('admin.reviews.allReviews')}</option>
                <option value="pending">{t('admin.reviews.pendingReviews')}</option>
                <option value="approved">{t('admin.reviews.approvedReviews')}</option>
                <option value="rejected">{t('admin.reviews.rejectedReviews')}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={fetchReviews} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <ReviewsTable
              reviews={filteredReviews}
              onView={handleViewReview}
              onUpdateStatus={handleUpdateReviewStatus}
              onDelete={handleDeleteReview}
              onBulkAction={handleBulkAction}
            />
          )}

          <ReviewModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            review={selectedReview}
            onUpdateStatus={handleUpdateReviewStatus}
            onReplySubmitted={handleReplySubmitted}
          />
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
