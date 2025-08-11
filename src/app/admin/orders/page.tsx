'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { OrdersTable } from '@/components/admin/OrdersTable';
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
  const [activeTab, setActiveTab] = useState<'orders' | 'analytics' | 'export'>('orders');

  useEffect(() => {
    setLoading(true);
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrdersData(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    console.log('Updating order status:', { orderId, status });
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
      console.log('API Response:', data);
      const updatedOrder = data.order; // API returns { order: ... }

      // Update local state with a new array reference to ensure React detects the change
      setOrdersData(prev => {
        const newOrders = prev.map(order =>
          order.id === orderId ? { ...order, ...updatedOrder } : order
        );
        console.log('Updated orders data:', newOrders);
        return newOrders;
      });

      // Update the selected order in the modal if it's the same order
      if (selectedOrder && selectedOrder.id === orderId) {
        console.log('Updating selected order in modal');
        setSelectedOrder({ ...selectedOrder, ...updatedOrder });
      }

    } catch (error) {
      console.error('Error updating order status:', error);
    }
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
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t('admin.orders.title')}
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t('admin.analytics.title')}
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'export'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t('admin.export.title')}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'orders' && (
            loading ? (
              <div className="py-8 text-center text-gray-500">Loading orders...</div>
            ) : (
              <OrdersTable
                key={JSON.stringify(ordersData.map(o => ({ id: o.id, status: o.status })))}
                orders={ordersData}
                onView={handleViewOrder}
                onUpdateStatus={handleUpdateOrderStatus}
              />
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
