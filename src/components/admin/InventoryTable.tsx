import React from 'react';
import { InventoryItem, Product } from '@/types';
import { useState } from 'react';
import Price from '@/components/ui/Price';
import { getLocalizedString, ensureLocalizedContent } from '@/lib/multilingualUtils';
import { useLanguage } from '@/contexts/LanguageContext';

interface InventoryTableProps {
  inventory: InventoryItem[];
  products: Product[];
  onAdjustStock: (productId: string) => void;
  onViewHistory: (productId: string) => void;
  onBulkAdjust: (selectedProductIds: string[]) => void;
  // New handlers for per-variant actions
  onToggleVariantActive: (productId: string, variantId: string) => void;
  onAdjustVariantStock: (productId: string, variantId: string) => void;
  onViewVariantHistory: (productId: string, variantId: string) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ inventory, products, onAdjustStock, onViewHistory, onBulkAdjust, onToggleVariantActive, onAdjustVariantStock, onViewVariantHistory }) => {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]); // Track expanded product IDs
  const { language } = useLanguage();

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? getLocalizedString(ensureLocalizedContent(product.name), language) : 'Unknown';
  };

  const getProduct = (productId: string) => products.find(p => p.id === productId);

  const allSelected = selected.length === inventory.length && inventory.length > 0;
  const toggleAll = () => {
    setSelected(allSelected ? [] : inventory.map(item => item.productId));
  };
  const toggleOne = (productId: string) => {
    setSelected(selected.includes(productId)
      ? selected.filter(id => id !== productId)
      : [...selected, productId]);
  };
  const toggleExpand = (productId: string) => {
    setExpanded(expanded.includes(productId)
      ? expanded.filter(id => id !== productId)
      : [...expanded, productId]);
  };

  return (
    <div>
      {selected.length > 0 && (
        <div className="mb-2">
          <button
            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
            onClick={() => onBulkAdjust(selected)}
          >
            Bulk Adjust ({selected.length})
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-2 py-2 text-center"></th>
              <th className="px-2 py-2 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-right">Current Stock</th>
              <th className="px-4 py-2 text-right">Min</th>
              <th className="px-4 py-2 text-right">Max</th>
              <th className="px-4 py-2 text-right">Reorder Point</th>
              <th className="px-4 py-2 text-right">Price</th>
              <th className="px-4 py-2 text-center">Last Restocked</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => {
              const product = getProduct(item.productId);
              const hasVariants = product && product.variants && product.variants.length > 0;
              const isExpanded = expanded.includes(item.productId);
              return (
                <React.Fragment key={item.productId}>
                  <tr className="bg-white dark:bg-gray-800 border-b">
                    <td className="px-2 py-2 text-center">
                      {hasVariants && (
                        <button
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          onClick={() => toggleExpand(item.productId)}
                          className="focus:outline-none"
                        >
                          {isExpanded ? '−' : '+'}
                        </button>
                      )}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(item.productId)}
                        onChange={() => toggleOne(item.productId)}
                      />
                    </td>
                    <td className="px-4 py-2">{getProductName(item.productId)}</td>
                    <td className="px-4 py-2 text-right font-mono">{item.currentStock}</td>
                    <td className="px-4 py-2 text-right">{item.minimumStock}</td>
                    <td className="px-4 py-2 text-right">{item.maximumStock}</td>
                    <td className="px-4 py-2 text-right">{item.reorderPoint}</td>
                    <td className="px-4 py-2 text-right">
                      {product && (
                        <Price amount={product.price} locale={false ? 'ar' : 'en'} className="font-semibold text-purple-700 dark:text-purple-400" />
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">{item.lastRestocked ? new Date(item.lastRestocked).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                        onClick={() => onAdjustStock(item.productId)}
                      >
                        Adjust Stock
                      </button>
                      <button
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                        onClick={() => onViewHistory(item.productId)}
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                  {hasVariants && isExpanded && (
                    <tr>
                      <td colSpan={10} className="bg-gray-50 dark:bg-gray-900">
                        <div className="p-4">
                          <table className="min-w-full text-xs border">
                            <thead>
                              <tr>
                                <th className="px-2 py-1 text-left">Variant</th>
                                <th className="px-2 py-1 text-right">Stock</th>
                                <th className="px-2 py-1 text-center">Active</th>
                                <th className="px-2 py-1 text-center">Price</th>
                                <th className="px-2 py-1 text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.variants!.map(variant => (
                                <tr key={variant.id} className="border-t">
                                  <td className="px-2 py-1">
                                    <div className="flex flex-col gap-1">
                                      {variant.sku && (
                                        <div className="text-xs font-mono text-gray-600">
                                          SKU: {variant.sku}
                                        </div>
                                      )}
                                      {variant.attributeValues && typeof variant.attributeValues === 'object' && (
                                        <div className="flex flex-wrap gap-1">
                                          {Object.entries(variant.attributeValues as Record<string, string>).map(([attrId, valueId]) => {
                                            // Get attribute and value info from the product
                                            const attribute = product?.attributes?.find(attr => attr.id === attrId);
                                            const attributeValue = attribute?.values?.find(val => val.id === valueId);
                                            
                                            return (
                                              <span key={attrId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                <span className="font-semibold">{attribute?.name || attrId}:</span>
                                                <span className="ml-1">{attributeValue?.label || attributeValue?.value || valueId}</span>
                                                {attributeValue?.hexColor && (
                                                  <div 
                                                    className="ml-1 w-3 h-3 rounded-full border border-gray-300" 
                                                    style={{ backgroundColor: attributeValue.hexColor }}
                                                  />
                                                )}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      )}
                                      {(!variant.attributeValues || Object.keys(variant.attributeValues as any).length === 0) && (
                                        <span className="text-gray-500 italic text-xs">No variants</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-2 py-1 text-right font-mono">{variant.stockQuantity ?? '-'}</td>
                                  <td className="px-2 py-1 text-center">
                                    <input
                                      type="checkbox"
                                      checked={variant.inStock ?? true}
                                      onChange={() => onToggleVariantActive(product.id, variant.id)}
                                    />
                                  </td>
                                  <td className="px-2 py-1 text-center">
                                    {variant.price !== undefined ? (
                                      <Price amount={variant.price} locale={false ? 'ar' : 'en'} className="font-semibold text-purple-700 dark:text-purple-400" />
                                    ) : product && (
                                      <Price amount={product.price} locale={false ? 'ar' : 'en'} className="font-semibold text-purple-700 dark:text-purple-400" />
                                    )}
                                  </td>
                                  <td className="px-2 py-1 text-center">
                                    <button
                                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-1"
                                      onClick={() => onAdjustVariantStock(product.id, variant.id)}
                                    >
                                      Adjust
                                    </button>
                                    <button
                                      className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                      onClick={() => onViewVariantHistory(product.id, variant.id)}
                                    >
                                      History
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable; 