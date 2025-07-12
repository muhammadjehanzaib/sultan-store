'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { OrderModal } from '@/components/admin/OrderModal';
import { mockOrders } from '@/data/mockOrders';
import { Order } from '@/types';

export default function AdminOrders() {
  const { t, isRTL } = useLanguage();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ordersData, setOrdersData] = useState(mockOrders);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrdersData(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status, updatedAt: new Date() }
          : order
      )
    );
  };

  return (
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

        <OrdersTable
          orders={ordersData}
          onView={handleViewOrder}
          onUpdateStatus={handleUpdateOrderStatus}
        />

        <OrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          order={selectedOrder}
          onUpdateStatus={handleUpdateOrderStatus}
        />
      </div>
    </AdminLayout>
  );
}
