'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import InventoryTable from '@/components/admin/InventoryTable';
import { EnhancedInventoryDashboard } from '@/components/admin/EnhancedInventoryDashboard';
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
  const [activeView, setActiveView] = useState<'dashboard' | 'table'>('dashboard');
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

  // Handler: View variant stock history
  const handleViewVariantHistory = async (productId: string, variantId: string) => {
    try {
      const response = await fetch(`/api/inventory/variants/${variantId}/history`);
      if (!response.ok) {
        throw new Error('Failed to fetch variant stock history');
      }
      const data = await response.json();

      // Transform API history to match our StockHistory interface
      const stockHistory: StockHistory[] = data.history.map((entry: any) => ({
        id: entry.id,
        productId: entry.productId,
        variantId: entry.variantId,
        type: entry.change > 0 ? 'in' : 'out',
        quantity: Math.abs(entry.change),
        reason: entry.reason,
        adminId: 'admin-001', // Mock data
        adminName: 'Admin User',
        createdAt: new Date(entry.createdAt)
      }));
      
      const product = productList.find(p => p.id === productId);
      const variant = product?.variants?.find(v => v.id === variantId);

      if (variant) {
        setSelectedVariant({ productId, variant });
        setVariantHistory(stockHistory);
        setIsVariantHistoryOpen(true);
      } else {
        setError('Variant not found');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    }
  };

  const handleReorderAlert = (productId: string) => {
    // TODO: Implement purchase order creation
    alert(`Reorder alert created for product ${productId}. Purchase order functionality will be implemented soon!`);
  };

  const handleBulkInventoryAdjust = (productIds: string[]) => {
    setBulkSelectedIds(productIds);
    setIsBulkModalOpen(true);
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
              <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    activeView === 'dashboard'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => setActiveView('table')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    activeView === 'table'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  📋 Table
                </button>
              </div>
              
              {activeView === 'table' && (
                <>
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
                </>
              )}
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
            activeView === 'dashboard' ? (
              <EnhancedInventoryDashboard
                products={productList}
                inventory={inventoryData}
                onAdjustStock={handleAdjustStock}
                onBulkAdjust={handleBulkInventoryAdjust}
                onReorderAlert={handleReorderAlert}
              />
            ) : (
              <>
                {/* Low Stock Alerts */}
                {lowStockItems.length > 0 && (
                  <LowStockAlerts
                    lowStockItems={lowStockItems}
                    products={productList}
                    onAdjustStock={handleAdjustStock}
                    onAdjustVariantStock={handleAdjustVariantStock}
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
            )
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

          {/* Variant Stock Adjustment Modal */}
          {isVariantModalOpen && selectedVariant && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96 max-w-md">
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Adjust Variant Stock</h2>
                
                {/* Product Info */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Product</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {(() => {
                      const product = productList.find(p => p.id === selectedVariant.productId);
                      return product ? getLocalizedString(ensureLocalizedContent(product.name), language) : 'Unknown Product';
                    })()} 
                  </div>
                </div>
                
                {/* Variant Attributes */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Variant Details</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedVariant.variant.attributeValues && Array.isArray(selectedVariant.variant.attributeValues) ? (
                      selectedVariant.variant.attributeValues.map((variantAttrValue: any) => {
                        const attributeValue = variantAttrValue.attributeValue;
                        const attribute = attributeValue?.attribute;
                        
                        return (
                          <span key={variantAttrValue.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            <span className="font-semibold">{attribute?.name || 'Attr'}:</span>
                            <span className="ml-1">{attributeValue?.label || attributeValue?.value || 'N/A'}</span>
                            {attributeValue?.hexColor && (
                              <div 
                                className="ml-2 w-3 h-3 rounded-full border border-gray-300" 
                                style={{ backgroundColor: attributeValue.hexColor }}
                              />
                            )}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-gray-500 italic text-sm">No variant attributes</span>
                    )}
                  </div>
                </div>
                
                {/* Current Stock */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Current Stock</div>
                  <div className="font-mono text-lg font-bold text-gray-900 dark:text-white">
                    {selectedVariant.variant.stockQuantity || 0} units
                  </div>
                  <div className="text-sm mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedVariant.variant.inStock 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {selectedVariant.variant.inStock ? '✓ In Stock' : '✕ Out of Stock'}
                    </span>
                  </div>
                </div>
                
                {/* Stock Adjustment Form */}
                <form onSubmit={e => {
                  e.preventDefault();
                  const form = e.target as typeof e.target & { adjustment: { value: string }, reason: { value: string } };
                  handleSaveVariantStock(selectedVariant.productId, selectedVariant.variant.id, Number(form.adjustment.value), form.reason.value);
                }}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stock Adjustment (+/-)
                    </label>
                    <input 
                      name="adjustment" 
                      type="number" 
                      placeholder="e.g. 10 or -5" 
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                      required 
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason
                    </label>
                    <input 
                      name="reason" 
                      type="text" 
                      placeholder="e.g. Restock, Sale, Correction" 
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                      required 
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button 
                      type="button" 
                      className="px-4 py-2 text-gray-700 bg-gray-200 dark:bg-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors" 
                      onClick={() => setIsVariantModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Update Stock
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Enhanced Variant History Modal */}
          {isVariantHistoryOpen && selectedVariant && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Variant Stock History</h2>
                  <button 
                    onClick={() => setIsVariantHistoryOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Variant Info Card */}
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1">
                        <div className="font-medium text-lg text-gray-900 dark:text-white mb-2">
                          {(() => {
                            const product = productList.find(p => p.id === selectedVariant.productId);
                            return product ? getLocalizedString(ensureLocalizedContent(product.name), language) : 'Unknown Product';
                          })()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {selectedVariant.variant.attributeValues && Array.isArray(selectedVariant.variant.attributeValues) && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedVariant.variant.attributeValues.map((variantAttrValue: any) => {
                                const attributeValue = variantAttrValue.attributeValue;
                                const attribute = attributeValue?.attribute;
                                return (
                                  <span key={variantAttrValue.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                    {attribute?.name || 'Attr'}: {attributeValue?.label || attributeValue?.value || 'N/A'}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {selectedVariant.variant.stockQuantity || 0} units
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedVariant.variant.inStock 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {selectedVariant.variant.inStock ? '✓ In Stock' : '✕ Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* History List */}
                  <div className="">
                    {variantHistory.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-lg font-medium mb-2">No stock history available</p>
                        <p className="text-sm">History will appear here after stock adjustments or sales.</p>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Stock Movement History</h3>
                        <div className="space-y-4">
                          {variantHistory.map((h, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                              <div className="flex items-center space-x-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  h.type === 'in' 
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                                    : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                  {h.type === 'in' ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                  ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {h.type === 'in' ? '+' : ''}{h.type === 'in' ? h.quantity : `-${h.quantity}`} units
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {h.reason || 'No reason provided'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                                <div className="font-medium">
                                  {h.createdAt.toLocaleDateString()}
                                </div>
                                <div className="mt-1">
                                  {h.createdAt.toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex justify-end">
                    <button 
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm" 
                      onClick={() => setIsVariantHistoryOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
