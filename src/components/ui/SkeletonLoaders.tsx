'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

// Base skeleton component with accessibility
export function Skeleton({ className = '', children }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
      {children}
    </div>
  );
}

// Product card skeleton matching the ProductCard component exactly
export function ProductCardSkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
  const { isRTL } = useLanguage();

  if (viewMode === 'list') {
    return (
      <div 
        className="group relative bg-white rounded-xl shadow-sm border border-gray-200 flex items-center p-4"
        role="status"
        aria-label="Loading product"
      >
        {/* Product Image */}
        <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          <Skeleton className="h-full w-full" />
        </div>
        
        {/* Product Info */}
        <div className={`flex-1 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          {/* Category */}
          <Skeleton className="h-4 w-16 mb-2 rounded-full" />
          
          {/* Title */}
          <Skeleton className="h-5 w-3/4 mb-2" />
          
          {/* Description */}
          <Skeleton className="h-4 w-1/2 mb-2" />
          
          {/* Rating */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-3 w-3 rounded" />
              ))}
            </div>
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
        
        {/* Price and Actions */}
        <div className={`flex-shrink-0 ${isRTL ? 'text-left' : 'text-right'}`}>
          <Skeleton className="h-6 w-16 mb-3" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
        
        <span className="sr-only">Loading product information</span>
      </div>
    );
  }

  // Grid view skeleton
  return (
    <div 
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200"
      role="status"
      aria-label="Loading product"
    >
      {/* Product Image */}
      <div className="relative h-64 bg-gray-100 rounded-t-xl overflow-hidden">
        <Skeleton className="h-full w-full" />
        {/* Discount badge skeleton */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-6 w-12 rounded-lg" />
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <Skeleton className="h-4 w-20 rounded-full" />
        
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />
        
        {/* Description */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        
        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-4 rounded" />
            ))}
          </div>
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-3 w-16" />
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-2 pt-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
      
      <span className="sr-only">Loading product information</span>
    </div>
  );
}

// Product slider skeleton
export function ProductSliderSkeleton({ count = 4, showHeader = true }: { count?: number; showHeader?: boolean }) {
  const { isRTL } = useLanguage();
  
  return (
    <section 
      className="bg-white py-12"
      role="status"
      aria-label="Loading products"
    >
      <div className="max-w-7xl rounded-xl bg-gray-50 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Header Skeleton */}
        {showHeader && (
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-3 items-center">
              <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
          </div>
        )}
        
        {/* Products Container Skeleton */}
        <div className="relative">
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-72">
                <ProductCardSkeleton viewMode="grid" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Product count skeleton */}
        <div className="text-center mt-6">
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
      
      <span className="sr-only">Loading product slider with {count} products</span>
    </section>
  );
}

// Category section skeleton
export function CategorySectionSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section 
      className="py-12 bg-white"
      role="status"
      aria-label="Loading categories"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="group text-center">
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-6 mb-4 transition-all duration-300">
                <Skeleton className="h-12 w-12 mx-auto mb-2 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-16 mx-auto mb-1" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
          ))}
        </div>
      </div>
      
      <span className="sr-only">Loading {count} categories</span>
    </section>
  );
}

// Campaign slider skeleton
export function CampaignSliderSkeleton() {
  return (
    <section 
      className="relative h-96 bg-gray-100 overflow-hidden"
      role="status"
      aria-label="Loading campaign slider"
    >
      <Skeleton className="h-full w-full" />
      
      {/* Navigation dots skeleton */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-2 w-2 rounded-full" />
        ))}
      </div>
      
      {/* Navigation arrows skeleton */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      
      <span className="sr-only">Loading campaign slider</span>
    </section>
  );
}

// Cart sidebar skeleton
export function CartSidebarSkeleton() {
  return (
    <div 
      className="p-6 space-y-4"
      role="status"
      aria-label="Loading cart"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
      
      {/* Cart items */}
      {[...Array(3)].map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      ))}
      
      {/* Summary */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex justify-between border-t pt-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
      
      {/* Actions */}
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      
      <span className="sr-only">Loading cart items</span>
    </div>
  );
}

// Admin table skeleton
export function AdminTableSkeleton({ 
  rows = 5, 
  columns = 4,
  showHeader = true,
  showActions = true
}: { 
  rows?: number; 
  columns?: number;
  showHeader?: boolean;
  showActions?: boolean;
}) {
  return (
    <div 
      className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
      role="status"
      aria-label="Loading table data"
    >
      <table className="min-w-full divide-y divide-gray-300">
        {showHeader && (
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">
                <Skeleton className="h-4 w-4" />
              </th>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <th key={colIndex} className="px-6 py-3">
                  <Skeleton className="h-4 w-full" />
                </th>
              ))}
              {showActions && (
                <th className="px-6 py-3">
                  <Skeleton className="h-4 w-16" />
                </th>
              )}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-gray-200 bg-white">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-4" />
              </td>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
              {showActions && (
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <span className="sr-only">Loading table with {rows} rows and {columns} columns</span>
    </div>
  );
}

// Dashboard stats skeleton
export function DashboardStatsSkeleton({ stats = 4 }: { stats?: number }) {
  return (
    <div 
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      role="status"
      aria-label="Loading statistics"
    >
      {Array.from({ length: stats }).map((_, index) => (
        <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Skeleton className="h-8 w-8 rounded" />
              </div>
              <div className="ml-5 w-0 flex-1 space-y-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading {stats} statistics</span>
    </div>
  );
}

// Search results skeleton
export function SearchResultsSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div 
      className="space-y-6"
      role="status"
      aria-label="Loading search results"
    >
      {/* Search header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      
      {/* Filters */}
      <div className="flex space-x-4">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      
      {/* Results grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
      
      <span className="sr-only">Loading {count} search results</span>
    </div>
  );
}

// Order details skeleton
export function OrderDetailsSkeleton() {
  return (
    <div 
      className="bg-white shadow overflow-hidden sm:rounded-lg"
      role="status"
      aria-label="Loading order details"
    >
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
      
      <div className="px-4 py-5 sm:p-6 space-y-6">
        {/* Order items */}
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="border-t pt-4 space-y-3 max-w-sm ml-auto">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex justify-between border-t pt-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </div>
      
      <span className="sr-only">Loading order details</span>
    </div>
  );
}
