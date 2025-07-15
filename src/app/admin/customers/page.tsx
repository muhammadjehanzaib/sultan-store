'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CustomersTable } from '@/components/admin/CustomersTable';
// import { CustomerModal } from '@/components/admin/CustomerModal';
import { Button } from '@/components/ui/Button';
import { mockCustomers } from '@/data/mockCustomers';
import { Customer } from '@/types';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

export default function AdminCustomers() {
  const { t, isRTL } = useLanguage();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customersData, setCustomersData] = useState(mockCustomers);

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleUpdateCustomerStatus = (customerId: string, status: Customer['status']) => {
    setCustomersData(prev => 
      prev.map(customer => 
        customer.id === customerId 
          ? { ...customer, status }
          : customer
      )
    );
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm(t('admin.customers.deleteConfirm'))) {
      setCustomersData(prev => prev.filter(c => c.id !== customerId));
    }
  };

  return (
    <AdminAuthGuard requiredRole={["admin", "manager", "support"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('admin.customers.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {t('admin.customers.subtitle')}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => {/* TODO: Export customers */}}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {t('admin.customers.export')}
              </Button>
            </div>
          </div>

          <CustomersTable
            customers={customersData}
            onView={handleViewCustomer}
            onUpdateStatus={handleUpdateCustomerStatus}
            onDelete={handleDeleteCustomer}
          />

          {/* <CustomerModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            customer={selectedCustomer}
            onUpdateStatus={handleUpdateCustomerStatus}
          /> */}
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
