import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center space-x-4">
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Content Loading */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {/* Image Skeleton */}
          <div className="space-y-3 md:space-y-4">
            <div className="aspect-square bg-gray-200 rounded-xl md:rounded-2xl animate-pulse"></div>
            <div className="hidden md:grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-4 md:space-y-6">
            {/* Category */}
            <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            
            {/* Product Name */}
            <div className="h-8 md:h-10 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            
            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Price */}
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            
            {/* Description */}
            <div className="space-y-2">
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-3/5 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Add to Cart Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="fixed bottom-8 right-8 bg-white rounded-full p-3 shadow-lg">
        <LoadingSpinner size="md" />
      </div>
    </div>
  );
}
