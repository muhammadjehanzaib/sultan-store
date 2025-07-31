'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { OrderModal } from '@/components/admin/OrderModal';
import { OrderAnalytics } from '@/components/admin/OrderAnalytics';
import { OrderExport } from '@/components/admin/OrderExport';
import { mockOrders } from '@/data/mockOrders';
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

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrdersData(prev => 
      prev.map(order => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, status, updatedAt: new Date() };
          
          // Auto-generate tracking number when status changes to shipped
          if (shouldGenerateTrackingNumber(order.status, status) && !order.trackingNumber) {
            updatedOrder.trackingNumber = generateTrackingNumber('custom');
            updatedOrder.trackingProvider = 'custom';
          }
          
          return updatedOrder;
        }
        return order;
      })
    );
    
    // Update the selected order in the modal if it's the same order
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => {
        if (!prev) return null;
        
        const updatedOrder = { ...prev, status, updatedAt: new Date() };
        
        // Auto-generate tracking number when status changes to shipped
        if (shouldGenerateTrackingNumber(prev.status, status) && !prev.trackingNumber) {
          updatedOrder.trackingNumber = generateTrackingNumber('custom');
          updatedOrder.trackingProvider = 'custom';
        }
        
        return updatedOrder;
      });
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
