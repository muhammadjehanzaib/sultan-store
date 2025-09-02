'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { EnhancedOrdersTable } from '@/components/admin/EnhancedOrdersTable';
import { OrderDashboard } from '@/components/admin/OrderDashboard';
import { OrderModal } from '@/components/admin/OrderModal';
import { OrderAnalytics } from '@/components/admin/OrderAnalytics';
import { OrderExport } from '@/components/admin/OrderExport';
import { Order } from '@/types';
import { generateTrackingNumber, shouldGenerateTrackingNumber } from '@/lib/trackingUtils';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

export default function AdminOrders() {
  const { t, isRTL } = useLanguage();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ordersData, setOrdersData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'analytics' | 'export'>('dashboard');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'enhanced' | 'basic'>('enhanced');

  // Centralized fetch with optional spinner for first load
  const fetchOrders = async (showSpinner = false) => {
    try {
      if (showSpinner) setLoading(true);
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrdersData(data.orders || []);
    } catch (e) {
      // swallow; optional: surface a toast
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    fetchOrders(true);

    // Poll every 10s for new orders and status changes
    const intervalId: number = window.setInterval(() => {
      fetchOrders(false);
    }, 10000);

    // Refresh when tab regains focus
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchOrders(false);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const handleViewOrder = (order: Order) => {
    // Open modal immediately with current snapshot
    setSelectedOrder(order);
    setIsModalOpen(true);
    // Then fetch fast, normalized details and refresh the modal data
    ;(async () => {
      try {
        const res = await fetch(`/api/orders/fast/${order.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.order) setSelectedOrder(data.order as Order);
        }
      } catch (e) {
        // ignore and keep snapshot
      }
    })();
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const data = await response.json();
      const updatedOrder = data.order; // API returns { order: ... }

      // Update local state with a new array reference to ensure React detects the change
      setOrdersData(prev => {
        const newOrders = prev.map(order =>
          order.id === orderId ? { ...order, ...updatedOrder } : order
        );
        return newOrders;
      });

      // Update the selected order in the modal if it's the same order
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, ...updatedOrder });
      }

    } catch (error) {
    }
  };

  const handleBulkUpdateStatus = async (orderIds: string[], status: Order['status']) => {
    try {
      // Update multiple orders at once
      const promises = orderIds.map(orderId => 
        fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
      );
      
      await Promise.all(promises);
      
      // Update local state
      setOrdersData(prev => 
        prev.map(order => 
          orderIds.includes(order.id) 
            ? { ...order, status }
            : order
        )
      );
      
      setSelectedOrders([]);
      alert(`Successfully updated ${orderIds.length} orders`);
    } catch (error) {
      alert('Error updating orders');
    }
  };

  const handleExportOrders = () => {
    // TODO: Implement order export functionality
    alert('Order export feature will be implemented soon!');
  };

  const handleExportSelected = (orderIds: string[]) => {
    // TODO: Implement selected orders export
    alert(`Export ${orderIds.length} selected orders feature will be implemented soon!`);
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
  setSelectedOrders(prev =>
    checked ? [...prev, orderId] : prev.filter(id => id !== orderId)
  );
};

const handleSelectAllOrders = (orderIds: string[], checked: boolean) => {
  setSelectedOrders(prev =>
    checked
      ? [...new Set([...prev, ...orderIds])] // add only visible
      : prev.filter(id => !orderIds.includes(id)) // remove only visible
  );
};

  return (
    <AdminAuthGuard requiredRole={["admin", "manager", "support"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('admin.orders.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t('admin.orders.subtitle')}
            </p>
          </div>

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
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                📋 {t('admin.orders.title')}
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                📈 {t('admin.analytics.title')}
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'export'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                📤 {t('admin.export.title')}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'dashboard' && (
            loading ? (
              <div className="py-8 text-center text-gray-500">Loading orders...</div>
            ) : (
              <OrderDashboard
                orders={ordersData}
                onViewOrder={handleViewOrder}
                onUpdateStatus={handleUpdateOrderStatus}
                onExportOrders={handleExportOrders}
              />
            )
          )}
          
          {activeTab === 'orders' && (
            loading ? (
              <div className="py-8 text-center text-gray-500">Loading orders...</div>
            ) : (
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
                {viewMode === 'enhanced' ? (
                  <EnhancedOrdersTable
                    orders={ordersData}
                    onView={handleViewOrder}
                    onUpdateStatus={handleUpdateOrderStatus}
                    onBulkUpdateStatus={handleBulkUpdateStatus}
                    onExportSelected={handleExportSelected}
                    selectedOrders={selectedOrders}
                    onSelectOrder={handleSelectOrder}
                    onSelectAll={handleSelectAllOrders}
                  />
                ) : (
                  <OrdersTable
                    key={JSON.stringify(ordersData.map(o => ({ id: o.id, status: o.status })))}
                    orders={ordersData}
                    onView={handleViewOrder}
                    onUpdateStatus={handleUpdateOrderStatus}
                  />
                )}
              </div>
            )
          )}
          
          {activeTab === 'analytics' && (
            <OrderAnalytics orders={ordersData} />
          )}
          
          {activeTab === 'export' && (
            <OrderExport orders={ordersData} />
          )}

          <OrderModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            order={selectedOrder}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
