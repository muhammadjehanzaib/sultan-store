import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AdminLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-white dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 transition-colors duration-500">
      {/* Admin icon */}
      <div className="mb-8">
        <span className="text-5xl">🛡️</span>
      </div>
      <LoadingSpinner size="lg" />
      <div className="mt-6 text-lg font-semibold text-blue-700 dark:text-blue-200 animate-pulse flex items-center">
        Loading Admin Panel
        <span className="ml-1 animate-bounce">.</span>
        <span className="ml-1 animate-bounce delay-150">.</span>
        <span className="ml-1 animate-bounce delay-300">.</span>
      </div>
    </div>
  );
} 