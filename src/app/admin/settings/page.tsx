'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import { SettingsPage } from '@/components/admin/SettingsPage';

export default function AdminSettings() {
  return (
    <AdminAuthGuard requiredRole={["admin", "manager"]}>
      <AdminLayout>
        <SettingsPage />
      </AdminLayout>
    </AdminAuthGuard>
  );
}
