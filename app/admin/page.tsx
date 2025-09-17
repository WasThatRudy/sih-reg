"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/lib/context/AdminAuthContext";

export default function AdminDashboard() {
  const { admin, isSuperAdmin, isEvaluator, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && admin) {
      // Redirect based on admin role
      if (isSuperAdmin) {
        router.push("/admin/super-admin-dashboard");
      } else if (isEvaluator) {
        router.push("/admin/evaluator");
      }
    }
  }, [admin, isSuperAdmin, isEvaluator, loading, router]);

  // Show loading state while determining role
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-heading border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!admin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-400">No admin data found</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // This component should redirect, so we shouldn't normally reach here
  return (
    <AdminLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-heading border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting to your dashboard...</p>
        </div>
      </div>
    </AdminLayout>
  );
}
