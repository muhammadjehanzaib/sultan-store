"use client";
import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import ContactQueriesTable from '@/components/admin/ContactQueriesTable';

export default function AdminQueries() {
  return (
    <AdminAuthGuard requiredRole={["admin", "manager", "support"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contact Queries</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">View and manage customer contact form submissions.</p>
          </div>
          <ContactQueriesTable />
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
