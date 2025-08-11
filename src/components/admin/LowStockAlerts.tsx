import React, { useState } from 'react';
import { InventoryItem, Product } from '@/types';
import { getLocalizedString, ensureLocalizedContent } from '@/lib/multilingualUtils';
import { useLanguage } from '@/contexts/LanguageContext';

interface LowStockVariant {
  variantId: string;
  productId: string;
  productName: string;
  stockQuantity: number;
  stockThreshold: number;
  sku?: string;
  attributeValues: any[];
}

interface LowStockAlertsProps {
  lowStockItems: InventoryItem[];
  products: Product[];
  onAdjustStock: (productId: string) => void;
  onAdjustVariantStock?: (productId: string, variantId: string) => void;
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ lowStockItems, products, onAdjustStock, onAdjustVariantStock }) => {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [dismissedVariants, setDismissedVariants] = useState<string[]>([]);
  const { language } = useLanguage();

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? getLocalizedString(ensureLocalizedContent(product.name), language) : 'Unknown';
  };

  // Find low stock variants using the product's stock threshold
  const getLowStockVariants = (): LowStockVariant[] => {
    const lowStockVariants: LowStockVariant[] = [];
    
    products.forEach(product => {
      if (product.variants && product.variants.length > 0) {
        // Get the product's stock threshold from lowStockItems or default to 5
        const productInventoryItem = lowStockItems.find(item => item.productId === product.id);
        const stockThreshold = productInventoryItem?.reorderPoint || 5;
        
        product.variants.forEach(variant => {
          if (variant.stockQuantity !== undefined && variant.stockQuantity <= stockThreshold && variant.stockQuantity > 0) {
            const productName = getProductName(product.id);
            lowStockVariants.push({
              variantId: variant.id,
              productId: product.id,
              productName,
              stockQuantity: variant.stockQuantity,
              stockThreshold,
              sku: variant.sku,
              attributeValues: Array.isArray(variant.attributeValues) ? variant.attributeValues : []
            });
          }
        });
      }
    });
    
    return lowStockVariants;
  };

  const lowStockVariants = getLowStockVariants();

  const formatVariantAttributes = (attributeValues: any[]) => {
    if (!attributeValues || attributeValues.length === 0) return 'No attributes';
    
    return attributeValues.map((variantAttrValue: any) => {
      const attributeValue = variantAttrValue.attributeValue;
      const attribute = attributeValue?.attribute;
      return `${attribute?.name || 'Attr'}: ${attributeValue?.label || attributeValue?.value || 'N/A'}`;
    }).join(', ');
  };

  return (
    <div className="space-y-3">
      {/* Product-level low stock alerts */}
      <div className="space-y-2">
        {lowStockItems.filter(item => !dismissed.includes(item.productId.toString())).map(item => (
          <div key={item.productId} className="bg-red-100 border border-red-300 text-red-800 rounded p-3 flex items-center justify-between">
            <div>
              <span className="font-semibold">Low Stock (Product):</span> {getProductName(item.productId)}
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

      {/* Variant-level low stock alerts */}
      {lowStockVariants.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Low Stock Variants:
          </div>
          {lowStockVariants.filter(variant => !dismissedVariants.includes(variant.variantId)).map(variant => (
            <div key={variant.variantId} className="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded p-3 flex items-center justify-between">
              <div className="flex-1">
                <div>
                  <span className="font-semibold">Low Stock (Variant):</span> {variant.productName}
                  <span className="ml-2">(Stock: <span className="font-mono">{variant.stockQuantity}</span>, Threshold: <span className="font-mono">{variant.stockThreshold}</span>)</span>
                </div>
                <div className="text-sm mt-1">
                  <span className="font-medium">Variant:</span> {formatVariantAttributes(variant.attributeValues)}
                  {variant.sku && (
                    <span className="ml-3 font-mono text-xs bg-yellow-200 px-1 rounded">SKU: {variant.sku}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onAdjustVariantStock && (
                  <button
                    className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                    onClick={() => onAdjustVariantStock(variant.productId, variant.variantId)}
                  >
                    Adjust Variant
                  </button>
                )}
                <button
                  className="text-yellow-600 hover:text-yellow-800 text-xl font-bold"
                  onClick={() => setDismissedVariants(prev => [...prev, variant.variantId])}
                  title="Dismiss"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LowStockAlerts; 