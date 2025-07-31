"use client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminAuthGuard({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string | string[] }) {
  const { user, isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  // Define allowed admin roles
  const adminRoles = ['admin', 'manager', 'support'];
  const allowedRoles = requiredRole ? (Array.isArray(requiredRole) ? requiredRole : [requiredRole]) : adminRoles;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/admin/login");
        return;
      }
      
      // Check if user has admin privileges
      if (user && !adminRoles.includes(user.role)) {
        // Redirect non-admin users to the main site
        router.replace("/");
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Check role-based access
  if (user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h2>
          <p className="text-gray-700 dark:text-gray-200 mb-4">
            You don't have permission to access the admin panel.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Your role: <span className="font-semibold">{user.role}</span>
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
