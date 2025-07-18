import React, { useState } from 'react';
import { InventoryItem, Product } from '@/types';
import { getLocalizedString, ensureLocalizedContent } from '@/lib/multilingualUtils';
import { useLanguage } from '@/contexts/LanguageContext';

interface LowStockAlertsProps {
  lowStockItems: InventoryItem[];
  products: Product[];
  onAdjustStock: (productId: number) => void;
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ lowStockItems, products, onAdjustStock }) => {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const { language } = useLanguage();

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product ? getLocalizedString(ensureLocalizedContent(product.name), language) : 'Unknown';
  };

  return (
    <div className="space-y-2">
      {lowStockItems.filter(item => !dismissed.includes(item.productId.toString())).map(item => (
        <div key={item.productId} className="bg-red-100 border border-red-300 text-red-800 rounded p-3 flex items-center justify-between">
          <div>
            <span className="font-semibold">Low Stock:</span> {getProductName(item.productId)}
            <span className="ml-2">(Current: <span className="font-mono">{item.currentStock}</span>, Reorder Point: <span className="font-mono">{item.reorderPoint}</span>)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => onAdjustStock(item.productId)}
            >
              Adjust Stock
            </button>
            <button
              className="text-red-500 hover:text-red-700 text-xl font-bold"
              onClick={() => setDismissed(prev => [...prev, item.productId.toString()])}
              title="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LowStockAlerts; 