import React, { useState, useEffect } from 'react';
import { InventoryItem, Product } from '@/types';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItem: InventoryItem | null;
  products: Product[];
  onAdjustStock: (productId: number, adjustment: number, reason: string) => void;
  bulkMode?: boolean;
  bulkCount?: number;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ isOpen, onClose, inventoryItem, products, onAdjustStock, bulkMode = false, bulkCount = 0 }) => {
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState('');

  useEffect(() => {
    setAdjustment(0);
    setReason('');
  }, [inventoryItem, isOpen, bulkMode]);

  if (!isOpen || (!inventoryItem && !bulkMode)) return null;

  const product = inventoryItem ? products.find(p => p.id === inventoryItem.productId) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md">
        <h4 className="font-semibold mb-4">{bulkMode ? `Bulk Adjust Stock (${bulkCount})` : 'Adjust Stock'}</h4>
        {bulkMode ? (
          <div className="mb-2 text-blue-700 font-medium">You are adjusting stock for {bulkCount} products.</div>
        ) : (
          <>
            <div className="mb-2">
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Product</div>
              <div className="font-medium">{product ? product.name : 'Unknown'}</div>
            </div>
            <div className="mb-2">
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Current Stock</div>
              <div className="font-mono">{inventoryItem?.currentStock}</div>
            </div>
          </>
        )}
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Adjustment (+/-)</label>
          <input
            type="number"
            value={adjustment}
            onChange={e => setAdjustment(Number(e.target.value))}
            className="w-full p-2 border rounded"
            placeholder="Enter adjustment (e.g. 5 or -3)"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Reason</label>
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g. Restock, Sale, Correction"
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => {
              onAdjustStock(bulkMode ? 0 : (inventoryItem?.productId || 0), adjustment, reason);
            }}
            disabled={adjustment === 0 || !reason}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustmentModal; 