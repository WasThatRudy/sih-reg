'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/context/AdminAuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { admin, loading, isAuthenticated } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [loading, isAuthenticated, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-heading/20 border-t-heading rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated || !admin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">You need admin privileges to access this page.</p>
          <button
            onClick={() => router.push('/admin/login')}
            className="px-4 py-2 bg-heading hover:bg-heading/90 text-white rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}
