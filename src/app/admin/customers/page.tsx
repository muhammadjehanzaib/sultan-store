'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CustomersTable } from '@/components/admin/CustomersTable';
import { EnhancedCustomersTable } from '@/components/admin/EnhancedCustomersTable';
import { CustomerDashboard } from '@/components/admin/CustomerDashboard';
import { CustomerModal } from '@/components/admin/CustomerModal';
import { Button } from '@/components/ui/Button';
import { Customer } from '@/types';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AdminCustomers() {
  const { t, isRTL } = useLanguage();
  const { user } = useAdminAuth();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [customersData, setCustomersData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers'>('dashboard');
  const [viewMode, setViewMode] = useState<'enhanced' | 'basic'>('enhanced');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  // Debounced search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Fetch customers data
  const fetchCustomers = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: search.trim(),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      const response = await fetch(`/api/admin/customers?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const data = await response.json();
      setCustomersData(data.customers);
      setPagination(data.pagination);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);
  
  useEffect(() => {
    fetchCustomers(1, debouncedSearchQuery);
  }, [fetchCustomers, debouncedSearchQuery]);

  const handleViewCustomer = async (customer: Customer) => {
    try {
      // Fetch detailed customer information
      const response = await fetch(`/api/admin/customers/${customer.id}`);
      
      if (response.ok) {
        const detailedCustomer = await response.json();
        setSelectedCustomer(detailedCustomer);
      } else {
        setSelectedCustomer(customer);
      }
      
      setModalMode('view');
      setIsModalOpen(true);
    } catch (error) {
      setSelectedCustomer(customer);
      setModalMode('view');
      setIsModalOpen(true);
    }
  };
  
  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleUpdateCustomerStatus = async (customerId: string, status: Customer['status']) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update customer status');
      }
      
      const updatedCustomer = await response.json();
      
      setCustomersData(prev => 
        prev.map(customer => 
          customer.id === customerId 
            ? updatedCustomer
            : customer
        )
      );
      
      // Update selected customer if it's the same one
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(updatedCustomer);
      }
    } catch (error) {
      alert(t('admin.customers.updateStatusError'));
    }
  };
  
  const handleUpdateCustomer = async (updatedCustomer: Customer) => {
    try {
      const response = await fetch(`/api/admin/customers/${updatedCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: updatedCustomer.firstName,
          lastName: updatedCustomer.lastName,
          email: updatedCustomer.email,
          phone: updatedCustomer.phone,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update customer');
      }
      
      const updated = await response.json();
      
      setCustomersData(prev => 
        prev.map(customer => 
          customer.id === updatedCustomer.id ? updated : customer
        )
      );
      
      setSelectedCustomer(updated);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm(t('admin.customers.deleteConfirm'))) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle specific error cases with user-friendly messages
        if (response.status === 400 && errorData.error?.includes('existing orders')) {
          alert(t('admin.customers.deleteErrorWithOrders') || 'Cannot delete customer with existing orders. Please cancel or complete their orders first.');
          return;
        }
        
        // Handle other errors
        alert(errorData.error || t('admin.customers.deleteError') || 'Failed to delete customer');
        return;
      }
      
      setCustomersData(prev => prev.filter(c => c.id !== customerId));
      
      // Close modal if the deleted customer was being viewed
      if (selectedCustomer?.id === customerId) {
        setIsModalOpen(false);
        setSelectedCustomer(null);
      }
      
      // Show success message
      alert(t('admin.customers.deleteSuccess') || 'Customer deleted successfully');
      
    } catch (error) {
      alert(t('admin.customers.deleteError') || 'Failed to delete customer');
    }
  };

  const handleBulkUpdateStatus = async (customerIds: string[], status: Customer['status']) => {
    try {
      // Update multiple customers at once
      const promises = customerIds.map(customerId => 
        fetch(`/api/admin/customers/${customerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
      );
      
      await Promise.all(promises);
      
      // Update local state
      setCustomersData(prev => 
        prev.map(customer => 
          customerIds.includes(customer.id) 
            ? { ...customer, status }
            : customer
        )
      );
      
      setSelectedCustomers([]);
      alert(`Successfully updated ${customerIds.length} customers`);
    } catch (error) {
      alert('Error updating customers');
    }
  };

  const handleExportSegment = (customers: Customer[]) => {
    try {
      // Create CSV content
      const csvContent = [
        ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Total Orders', 'Total Spent', 'Joined', 'Last Login'].join(','),
        ...customers.map((customer: Customer) => [
          customer.id,
          customer.firstName,
          customer.lastName,
          customer.email,
          customer.phone || '',
          customer.status,
          customer.totalOrders,
          customer.totalSpent,
          new Date(customer.createdAt).toLocaleDateString(),
          customer.lastLoginAt ? new Date(customer.lastLoginAt).toLocaleDateString() : ''
        ].join(','))
      ].join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer-segment-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error exporting customers');
    }
  };

  const handleExportSelected = (customerIds: string[]) => {
    const selectedCustomerData = customersData.filter(c => customerIds.includes(c.id));
    handleExportSegment(selectedCustomerData);
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAllCustomers = () => {
    if (selectedCustomers.length === customersData.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customersData.map(customer => customer.id));
    }
  };
  
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    fetchCustomers(page, debouncedSearchQuery);
  };
  
  const exportCustomers = async () => {
    try {
      const params = new URLSearchParams({
        search: debouncedSearchQuery,
        export: 'true'
      });
      
      const response = await fetch(`/api/admin/customers?${params}`);
      if (!response.ok) throw new Error('Export failed');
      
      const data = await response.json();
      
      // Create CSV content
      const csvContent = [
        ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Total Orders', 'Total Spent', 'Joined', 'Last Login'].join(','),
        ...data.customers.map((customer: Customer) => [
          customer.id,
          customer.firstName,
          customer.lastName,
          customer.email,
          customer.phone || '',
          customer.status,
          customer.totalOrders,
          customer.totalSpent,
          new Date(customer.createdAt).toLocaleDateString(),
          customer.lastLoginAt ? new Date(customer.lastLoginAt).toLocaleDateString() : ''
        ].join(','))
      ].join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(t('admin.customers.exportError'));
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
              {!loading && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('admin.customers.totalCustomers').replace('{{count}}', pagination.total.toString())}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={exportCustomers}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={loading || customersData.length === 0}
              >
                {t('admin.customers.export')}
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className={`flex space-x-8 ${isRTL ? 'space-x-reverse' : ''}`}>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'customers'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                👥 {t('admin.customers.title')}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'dashboard' && (
            loading ? (
              <div className="py-8 text-center text-gray-500">Loading customers...</div>
            ) : (
              <CustomerDashboard
                customers={customersData}
                onViewCustomer={handleViewCustomer}
                onUpdateStatus={handleUpdateCustomerStatus}
                onExportSegment={handleExportSegment}
              />
            )
          )}
          
          {activeTab === 'customers' && (
            <div className="space-y-4">
              {/* View Mode Toggle */}
              <div className="flex justify-end">
                <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex">
                  <button
                    onClick={() => setViewMode('enhanced')}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      viewMode === 'enhanced'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    🔍 Enhanced
                  </button>
                  <button
                    onClick={() => setViewMode('basic')}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      viewMode === 'basic'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    📋 Basic
                  </button>
                </div>
              </div>
              
              {/* Conditional Table Rendering */}
              {loading ? (
                <div className="py-8 text-center text-gray-500">Loading customers...</div>
              ) : viewMode === 'enhanced' ? (
                <EnhancedCustomersTable
                  customers={customersData}
                  onView={handleViewCustomer}
                  onEdit={user?.role === 'admin' || user?.role === 'manager' ? handleEditCustomer : undefined}
                  onUpdateStatus={handleUpdateCustomerStatus}
                  onDelete={user?.role === 'admin' ? handleDeleteCustomer : undefined}
                  onBulkUpdateStatus={handleBulkUpdateStatus}
                  onExportSelected={handleExportSelected}
                  selectedCustomers={selectedCustomers}
                  onSelectCustomer={handleSelectCustomer}
                  onSelectAll={handleSelectAllCustomers}
                />
              ) : (
                <CustomersTable
                  customers={customersData}
                  loading={loading}
                  onView={handleViewCustomer}
                  onEdit={user?.role === 'admin' || user?.role === 'manager' ? handleEditCustomer : undefined}
                  onUpdateStatus={handleUpdateCustomerStatus}
                  onDelete={user?.role === 'admin' ? handleDeleteCustomer : undefined}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          )}

          <CustomerModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedCustomer(null);
            }}
            customer={selectedCustomer}
            mode={modalMode}
            onUpdateStatus={handleUpdateCustomerStatus}
            onUpdate={user?.role === 'admin' || user?.role === 'manager' ? handleUpdateCustomer : undefined}
          />
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
