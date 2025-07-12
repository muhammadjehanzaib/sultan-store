'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
// import { InventoryTable } from '@/components/admin/InventoryTable';
// import { StockAdjustmentModal } from '@/components/admin/StockAdjustmentModal';
// import { LowStockAlerts } from '@/components/admin/LowStockAlerts';
import { Button } from '@/components/ui/Button';
import { mockInventory } from '@/data/mockCustomers';
import { products } from '@/data/products';
import { InventoryItem, StockHistory } from '@/types';

export default function AdminInventory() {
  const { t, isRTL } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inventoryData, setInventoryData] = useState(mockInventory);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const handleAdjustStock = (productId: number) => {
    const inventoryItem = inventoryData.find(item => item.productId === productId);
    if (inventoryItem) {
      setSelectedProduct(inventoryItem);
      setIsModalOpen(true);
    }
  };

  const handleStockAdjustment = (productId: number, adjustment: number, reason: string) => {
    setInventoryData(prev => 
      prev.map(item => {
        if (item.productId === productId) {
          const newStock = Math.max(0, item.currentStock + adjustment);
          const newHistory: StockHistory = {
            id: `hist-${Date.now()}`,
            productId,
            type: adjustment > 0 ? 'in' : adjustment < 0 ? 'out' : 'adjustment',
            quantity: Math.abs(adjustment),
            reason,
            adminId: 'admin-001',
            adminName: 'Admin User',
            createdAt: new Date()
          };
          
          return {
            ...item,
            currentStock: newStock,
            lastRestocked: adjustment > 0 ? new Date() : item.lastRestocked,
            stockHistory: [...item.stockHistory, newHistory]
          };
        }
        return item;
      })
    );
    setIsModalOpen(false);
  };

  const handleBulkStockUpdate = (updates: Array<{ productId: number; newStock: number; reason: string }>) => {
    setInventoryData(prev => 
      prev.map(item => {
        const update = updates.find(u => u.productId === item.productId);
        if (update) {
          const adjustment = update.newStock - item.currentStock;
          const newHistory: StockHistory = {
            id: `hist-${Date.now()}-${item.productId}`,
            productId: item.productId,
            type: 'adjustment',
            quantity: Math.abs(adjustment),
            reason: update.reason,
            adminId: 'admin-001',
            adminName: 'Admin User',
            createdAt: new Date()
          };
          
          return {
            ...item,
            currentStock: update.newStock,
            stockHistory: [...item.stockHistory, newHistory]
          };
        }
        return item;
      })
    );
  };

  const lowStockItems = inventoryData.filter(item => item.currentStock <= item.reorderPoint);
  const filteredInventory = showLowStockOnly 
    ? inventoryData.filter(item => item.currentStock <= item.reorderPoint)
    : inventoryData;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('admin.inventory.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t('admin.inventory.subtitle')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              variant={showLowStockOnly ? 'primary' : 'outline'}
              className={showLowStockOnly ? 'bg-red-600 hover:bg-red-700' : 'border-red-300 text-red-700 hover:bg-red-50'}
            >
              {showLowStockOnly ? t('admin.inventory.showAll') : t('admin.inventory.showLowStock')}
            </Button>
            <Button
              onClick={() => {/* TODO: Bulk update modal */}}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {t('admin.inventory.bulkUpdate')}
            </Button>
          </div>
        </div>

        {/* {lowStockItems.length > 0 && (
          <LowStockAlerts 
            lowStockItems={lowStockItems}
            products={products}
            onAdjustStock={handleAdjustStock}
          />
        )}

        <InventoryTable
          inventory={filteredInventory}
          products={products}
          onAdjustStock={handleAdjustStock}
        />

        <StockAdjustmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          inventoryItem={selectedProduct}
          products={products}
          onAdjustStock={handleStockAdjustment}
        /> */}
      </div>
    </AdminLayout>
  );
}
