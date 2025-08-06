'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import InventoryTable from '@/components/admin/InventoryTable';
import StockAdjustmentModal from '@/components/admin/StockAdjustmentModal';
import LowStockAlerts from '@/components/admin/LowStockAlerts';
import StockHistoryModal from '@/components/admin/StockHistoryModal';
import { Button } from '@/components/ui/Button';
import { InventoryItem, StockHistory, Product, ProductVariant } from '@/types';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import { getLocalizedString, ensureLocalizedContent } from '@/lib/multilingualUtils';

export default function AdminInventory() {
  const { t, isRTL, language } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedHistoryProduct, setSelectedHistoryProduct] = useState<InventoryItem | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  // New state for products (with variants)
  const [productList, setProductList] = useState<Product[]>([]);
  // State for variant modals
  const [selectedVariant, setSelectedVariant] = useState<{ productId: string; variant: ProductVariant } | null>(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [variantHistory, setVariantHistory] = useState<StockHistory[]>([]);
  const [isVariantHistoryOpen, setIsVariantHistoryOpen] = useState(false);

  // Fetch inventory data from API
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }
      const data = await response.json();
      
      // Transform API data to match InventoryItem interface
      const inventoryItems: InventoryItem[] = data.inventory.map((item: any) => ({
        productId: item.id,
        currentStock: item.stock,
        minimumStock: Math.floor(item.stockThreshold * 0.5), // Set min to 50% of threshold
        maximumStock: item.stockThreshold * 3, // Set max to 3x threshold
        reorderPoint: item.stockThreshold,
        lastRestocked: new Date(item.updatedAt),
        stockHistory: [] // Will be populated when viewing history
      }));
      
      setInventoryData(inventoryItems);
      
      // Use the full products data from API response (includes attributes)
      const products: Product[] = data.products.map((product: any) => ({
        id: product.id,
        name: { en: product.name_en, ar: product.name_ar },
        slug: product.slug,
        price: product.price,
        image: product.image,
        category: product.category,
        variants: product.variants || [],
        attributes: product.attributes || [], // Include attributes
        inStock: product.inventory?.stock > 0 || false
      }));
      
      setProductList(products);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleAdjustStock = (productId: string) => {
    const inventoryItem = inventoryData.find(item => item.productId === productId);
    if (inventoryItem) {
      setSelectedProduct(inventoryItem);
      setIsModalOpen(true);
    }
  };

  const handleBulkAdjust = (selectedProductIds: string[]) => {
    setBulkSelectedIds(selectedProductIds);
    setIsBulkModalOpen(true);
  };

  const handleStockAdjustment = async (productId: string, adjustment: number, reason: string) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          stockChange: adjustment,
          reason
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }
      
      // Refresh inventory data
      await fetchInventoryData();
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update inventory');
    }
  };

  const handleBulkStockUpdate = async (updates: Array<{ productId: string; newStock: number; reason: string }>) => {
    try {
      const bulkUpdates = updates.map(update => {
        const currentItem = inventoryData.find(item => item.productId === update.productId);
        return {
          productId: update.productId,
          stockChange: update.newStock - (currentItem?.currentStock || 0),
          reason: update.reason
        };
      });
      
      const response = await fetch('/api/inventory/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates: bulkUpdates })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }
      
      // Refresh inventory data
      await fetchInventoryData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update inventory');
    }
  };

  const handleViewHistory = async (productId: string) => {
    try {
      const response = await fetch(`/api/inventory/${productId}/history`);
      if (!response.ok) {
        throw new Error('Failed to fetch stock history');
      }
      
      const historyData = await response.json();
      
      // Transform API history to match our StockHistory interface
      const stockHistory: StockHistory[] = historyData.history.map((entry: any) => ({
        id: entry.id,
        productId: productId,
        type: entry.type === 'increase' ? 'in' : entry.type === 'decrease' ? 'out' : 'adjustment',
        quantity: Math.abs(entry.change),
        reason: entry.reason,
        adminId: 'admin-001',
        adminName: 'Admin User',
        createdAt: new Date(entry.createdAt)
      }));
      
      // Create a temporary inventory item for the modal
      const inventoryItem: InventoryItem = {
        productId: productId,
        currentStock: historyData.currentStock,
        minimumStock: 0,
        maximumStock: 0,
        reorderPoint: historyData.stockThreshold,
        lastRestocked: new Date(),
        stockHistory
      };
      
      setSelectedHistoryProduct(inventoryItem);
      setIsHistoryModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock history');
    }
  };

  // Handler: Toggle variant activation
  const handleToggleVariantActive = async (productId: string, variantId: string) => {
    try {
      const response = await fetch('/api/inventory/variants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId,
          action: 'toggleStatus'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle variant status');
      }

      // Refresh inventory data to get updated variant status
      await fetchInventoryData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle variant status');
    }
  };

  // Handler: Open modal to adjust variant stock
  const handleAdjustVariantStock = (productId: string, variantId: string) => {
    const product = productList.find(p => p.id === productId);
    const variant = product?.variants?.find(v => v.id === variantId);
    if (product && variant) {
      setSelectedVariant({ productId, variant });
      setIsVariantModalOpen(true);
    }
  };

  // Handler: Save variant stock adjustment
  const handleSaveVariantStock = async (productId: string, variantId: string, adjustment: number, reason: string) => {
    try {
      const response = await fetch('/api/inventory/variants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId,
          action: 'adjustStock',
          stockChange: adjustment,
          reason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to adjust variant stock');
      }

      // Refresh inventory data to get updated variant stock
      await fetchInventoryData();
      setIsVariantModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust variant stock');
    }
  };

  // Handler: View variant stock history (mock for now)
  const handleViewVariantHistory = (productId: string, variantId: string) => {
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

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading inventory data...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-red-800">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading inventory</h3>
                  <div className="mt-1 text-sm text-red-700">{error}</div>
                  <button 
                    onClick={fetchInventoryData}
                    className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <>
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
            </>
          )}

          {/* Bulk Stock Adjustment Modal */}
          {isBulkModalOpen && (
            <StockAdjustmentModal
              isOpen={isBulkModalOpen}
              onClose={() => setIsBulkModalOpen(false)}
              inventoryItem={null}
              products={productList.filter(p => bulkSelectedIds.includes(p.id))}
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
            products={productList}
            onAdjustStock={handleStockAdjustment}
          />

          <StockHistoryModal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
            stockHistory={selectedHistoryProduct ? selectedHistoryProduct.stockHistory : []}
            productName={(() => {
              const p = productList.find(prod => prod.id === selectedHistoryProduct?.productId);
              return p ? getLocalizedString(ensureLocalizedContent(p.name), language) : '';
            })()}
          />

          {/* Variant Stock Adjustment Modal (simple prompt for demo) */}
          {isVariantModalOpen && selectedVariant && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-80">
                <h2 className="text-lg font-bold mb-2">Adjust Variant Stock</h2>
                <div className="mb-2">
                  {Object.entries(selectedVariant.variant.attributeValues).map(([attr, val]) => (
                    <span key={attr} className="mr-2"><b>{attr}:</b> {typeof val === 'object' ? JSON.stringify(val) : val}</span>
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
