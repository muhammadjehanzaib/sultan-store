'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import InventoryTable from '@/components/admin/InventoryTable';
import StockAdjustmentModal from '@/components/admin/StockAdjustmentModal';
import LowStockAlerts from '@/components/admin/LowStockAlerts';
import StockHistoryModal from '@/components/admin/StockHistoryModal';
import { Button } from '@/components/ui/Button';
import { mockInventory } from '@/data/mockCustomers';
import { products } from '@/data/products';
import { InventoryItem, StockHistory, Product, ProductVariant } from '@/types';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

export default function AdminInventory() {
  const { t, isRTL } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inventoryData, setInventoryData] = useState(mockInventory);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedHistoryProduct, setSelectedHistoryProduct] = useState<InventoryItem | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<number[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  // New state for products (with variants)
  const [productList, setProductList] = useState<Product[]>(products);
  // State for variant modals
  const [selectedVariant, setSelectedVariant] = useState<{ productId: number; variant: ProductVariant } | null>(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [variantHistory, setVariantHistory] = useState<StockHistory[]>([]);
  const [isVariantHistoryOpen, setIsVariantHistoryOpen] = useState(false);

  const handleAdjustStock = (productId: number) => {
    const inventoryItem = inventoryData.find(item => item.productId === productId);
    if (inventoryItem) {
      setSelectedProduct(inventoryItem);
      setIsModalOpen(true);
    }
  };

  const handleBulkAdjust = (selectedProductIds: number[]) => {
    setBulkSelectedIds(selectedProductIds);
    setIsBulkModalOpen(true);
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

  const handleViewHistory = (productId: number) => {
    const inventoryItem = inventoryData.find(item => item.productId === productId);
    if (inventoryItem) {
      setSelectedHistoryProduct(inventoryItem);
      setIsHistoryModalOpen(true);
    }
  };

  // Handler: Toggle variant activation
  const handleToggleVariantActive = (productId: number, variantId: string) => {
    setProductList(prev => prev.map(product => {
      if (product.id === productId && product.variants) {
        return {
          ...product,
          variants: product.variants.map(variant =>
            variant.id === variantId ? { ...variant, inStock: !variant.inStock } : variant
          )
        };
      }
      return product;
    }));
  };

  // Handler: Open modal to adjust variant stock
  const handleAdjustVariantStock = (productId: number, variantId: string) => {
    const product = productList.find(p => p.id === productId);
    const variant = product?.variants?.find(v => v.id === variantId);
    if (product && variant) {
      setSelectedVariant({ productId, variant });
      setIsVariantModalOpen(true);
    }
  };

  // Handler: Save variant stock adjustment
  const handleSaveVariantStock = (productId: number, variantId: string, adjustment: number, reason: string) => {
    setProductList(prev => prev.map(product => {
      if (product.id === productId && product.variants) {
        return {
          ...product,
          variants: product.variants.map(variant => {
            if (variant.id === variantId) {
              const newStock = Math.max(0, (variant.stockQuantity ?? 0) + adjustment);
              return { ...variant, stockQuantity: newStock };
            }
            return variant;
          })
        };
      }
      return product;
    }));
    setIsVariantModalOpen(false);
  };

  // Handler: View variant stock history (mock for now)
  const handleViewVariantHistory = (productId: number, variantId: string) => {
    // For demo, just show empty or mock data
    setVariantHistory([]); // Replace with real data if available
    setIsVariantHistoryOpen(true);
  };

  const lowStockItems = inventoryData.filter(item => item.currentStock <= item.reorderPoint);
  const filteredInventory = showLowStockOnly 
    ? inventoryData.filter(item => item.currentStock <= item.reorderPoint)
    : inventoryData;

  return (
    <AdminAuthGuard requiredRole={["admin", "manager", "support"]}>
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

          {/* Low Stock Alerts */}
          {lowStockItems.length > 0 && (
            <LowStockAlerts
              lowStockItems={lowStockItems}
              products={productList}
              onAdjustStock={handleAdjustStock}
            />
          )}

          {/* Inventory Table */}
          <InventoryTable
            inventory={filteredInventory}
            products={productList}
            onAdjustStock={handleAdjustStock}
            onViewHistory={handleViewHistory}
            onBulkAdjust={handleBulkAdjust}
            onToggleVariantActive={handleToggleVariantActive}
            onAdjustVariantStock={handleAdjustVariantStock}
            onViewVariantHistory={handleViewVariantHistory}
          />

          {/* Bulk Stock Adjustment Modal */}
          {isBulkModalOpen && (
            <StockAdjustmentModal
              isOpen={isBulkModalOpen}
              onClose={() => setIsBulkModalOpen(false)}
              inventoryItem={null}
              products={products.filter(p => bulkSelectedIds.includes(p.id))}
              onAdjustStock={(_productId, adjustment, reason) => {
                handleBulkStockUpdate(bulkSelectedIds.map(id => {
                  const item = inventoryData.find(i => i.productId === id);
                  return {
                    productId: id,
                    newStock: item ? item.currentStock + adjustment : adjustment,
                    reason: reason
                  };
                }));
                setIsBulkModalOpen(false);
                setBulkSelectedIds([]);
              }}
              bulkMode={true}
              bulkCount={bulkSelectedIds.length}
            />
          )}

          {/* Stock Adjustment Modal */}
          <StockAdjustmentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            inventoryItem={selectedProduct}
            products={products}
            onAdjustStock={handleStockAdjustment}
          />

          <StockHistoryModal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
            stockHistory={selectedHistoryProduct ? selectedHistoryProduct.stockHistory : []}
            productName={(() => {
              const p = products.find(prod => prod.id === selectedHistoryProduct?.productId);
              return p ? p.name : '';
            })()}
          />

          {/* Variant Stock Adjustment Modal (simple prompt for demo) */}
          {isVariantModalOpen && selectedVariant && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-80">
                <h2 className="text-lg font-bold mb-2">Adjust Variant Stock</h2>
                <div className="mb-2">
                  {Object.entries(selectedVariant.variant.attributeValues).map(([attr, val]) => (
                    <span key={attr} className="mr-2"><b>{attr}:</b> {val}</span>
                  ))}
                </div>
                <form onSubmit={e => {
                  e.preventDefault();
                  const form = e.target as typeof e.target & { adjustment: { value: string }, reason: { value: string } };
                  handleSaveVariantStock(selectedVariant.productId, selectedVariant.variant.id, Number(form.adjustment.value), form.reason.value);
                }}>
                  <input name="adjustment" type="number" placeholder="Adjustment" className="border p-1 w-full mb-2" required />
                  <input name="reason" type="text" placeholder="Reason" className="border p-1 w-full mb-2" required />
                  <div className="flex justify-end space-x-2">
                    <button type="button" className="px-3 py-1 bg-gray-300 rounded" onClick={() => setIsVariantModalOpen(false)}>Cancel</button>
                    <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Variant History Modal (simple for demo) */}
          {isVariantHistoryOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-80">
                <h2 className="text-lg font-bold mb-2">Variant Stock History</h2>
                <div className="mb-2">
                  {variantHistory.length === 0 ? <div>No history available.</div> : variantHistory.map((h, i) => (
                    <div key={i}>{h.type} {h.quantity} ({h.reason})</div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => setIsVariantHistoryOpen(false)}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
