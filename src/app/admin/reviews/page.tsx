'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
// import { ReviewsTable } from '@/components/admin/ReviewsTable';
// import { ReviewModal } from '@/components/admin/ReviewModal';
import { Button } from '@/components/ui/Button';
import { mockReviews } from '@/data/mockCustomers';
import { Review } from '@/types';

export default function AdminReviews() {
  const { t, isRTL } = useLanguage();
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewsData, setReviewsData] = useState(mockReviews);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleUpdateReviewStatus = (reviewId: string, status: Review['status']) => {
    setReviewsData(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, status, updatedAt: new Date() }
          : review
      )
    );
  };

  const handleDeleteReview = (reviewId: string) => {
    if (confirm(t('admin.reviews.deleteConfirm'))) {
      setReviewsData(prev => prev.filter(r => r.id !== reviewId));
    }
  };

  const handleBulkAction = (action: 'approve' | 'reject' | 'delete', reviewIds: string[]) => {
    if (action === 'delete') {
      if (confirm(t('admin.reviews.bulkDeleteConfirm'))) {
        setReviewsData(prev => prev.filter(r => !reviewIds.includes(r.id)));
      }
    } else {
      setReviewsData(prev => 
        prev.map(review => 
          reviewIds.includes(review.id)
            ? { ...review, status: action === 'approve' ? 'approved' : 'rejected', updatedAt: new Date() }
            : review
        )
      );
    }
  };

  const filteredReviews = reviewsData.filter(review => {
    if (statusFilter === 'all') return true;
    return review.status === statusFilter;
  });

  return (
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

        {/* <ReviewsTable
          reviews={filteredReviews}
          onView={handleViewReview}
          onUpdateStatus={handleUpdateReviewStatus}
          onDelete={handleDeleteReview}
          onBulkAction={handleBulkAction}
        />

        <ReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          review={selectedReview}
          onUpdateStatus={handleUpdateReviewStatus}
        /> */}
      </div>
    </AdminLayout>
  );
}
