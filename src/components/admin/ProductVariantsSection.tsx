import React, { useEffect, useState } from 'react';
import { ProductAttribute, ProductVariant } from '@/types';

interface ProductVariantsSectionProps {
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  setVariants: (variants: ProductVariant[]) => void;
  selectedLanguage: 'en' | 'ar';
}

function getCombinations(arr: any[][]): any[][] {
  if (arr.length === 0) return [[]];
  const [first, ...rest] = arr;
  const combos = getCombinations(rest);
  return first.flatMap(f => combos.map(c => [f, ...c]));
}

const ProductVariantsSection: React.FC<ProductVariantsSectionProps> = ({ attributes, variants, setVariants, selectedLanguage }) => {
  const [localVariants, setLocalVariants] = useState<ProductVariant[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize with existing variants only once
  useEffect(() => {
    if (!initialized && variants.length > 0 && attributes.length === 0) {
      setLocalVariants(variants);
      setInitialized(true);
    }
  }, [variants, initialized, attributes]);

  // Main effect to handle attribute changes and variant generation
  useEffect(() => {
    // Always regenerate variants when attributes change
    if (attributes.length > 0) {
      const attrValues = attributes.map(attr => attr.values.map(v => ({ attrId: attr.id, valueId: v.id, label: v.label || v.value, attrType: attr.type })));
      
      // Check if we have valid attribute values
      const hasValidValues = attrValues.every(values => values.length > 0);
      
      if (!hasValidValues) {
        // If any attribute has no values, clear variants
        setLocalVariants([]);
        setVariants([]);
        return;
      }
      
      const combos = getCombinations(attrValues);
      const generatedVariants: ProductVariant[] = combos.map((combo, idx) => {
        const attributeValues: { [attributeId: string]: string } = {};
        combo.forEach((v: any) => { attributeValues[v.attrId] = v.valueId; });
        
        // Try to find existing variant with matching attributes
        const existing = localVariants.find(v => 
          v.attributeValues && 
          JSON.stringify(v.attributeValues) === JSON.stringify(attributeValues)
        );
        
        return {
          id: existing?.id || `variant-${idx}-${Date.now()}`,
          attributeValues,
          price: existing?.price || undefined,
          image: existing?.image || '',
          sku: existing?.sku || '',
          inStock: existing?.inStock !== undefined ? existing.inStock : true,
          stockQuantity: existing?.stockQuantity || 0,
        };
      });
      
      setLocalVariants(generatedVariants);
      setVariants(generatedVariants);
    }
    // If no attributes but we have existing variants, use them
    else if (variants.length > 0) {
      setLocalVariants(variants);
    }
    // Clear variants if no attributes
    else {
      setLocalVariants([]);
      setVariants([]);
    }
  }, [JSON.stringify(attributes)]);

  const handleVariantChange = (idx: number, field: string, value: any) => {
    const updated = [...localVariants];
    (updated[idx] as any)[field] = value;
    setLocalVariants(updated);
    setVariants(updated);
  };

  if (localVariants.length === 0) return <div className="text-gray-500 text-sm">No variants available.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            {attributes.map(attr => (
              <th key={attr.id} className="px-2 py-1 text-left font-medium">{attr.name}</th>
            ))}
            <th className="px-2 py-1">Price</th>
            <th className="px-2 py-1">Image</th>
            <th className="px-2 py-1">SKU</th>
            <th className="px-2 py-1">Stock</th>
            <th className="px-2 py-1">In Stock</th>
          </tr>
        </thead>
        <tbody>
          {localVariants.map((variant, idx) => (
            <tr key={variant.id} className="bg-white dark:bg-gray-800 border-b">
              {attributes.map(attr => (
                <td key={attr.id} className="px-2 py-1">
                  {(() => {
                    if (!variant.attributeValues) return 'N/A';
                    const valueId = variant.attributeValues[attr.id];
                    if (!valueId) return 'N/A';
                    const value = attr.values.find(v => v.id === valueId);
                    return value ? (value.label || value.value) : 'N/A';
                  })()}
                </td>
              ))}
              <td className="px-2 py-1">
                <input
                  type="number"
                  value={variant.price || ''}
                  onChange={e => handleVariantChange(idx, 'price', parseFloat(e.target.value) || undefined)}
                  className="w-20 p-1 border rounded"
                  placeholder="Price"
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="url"
                  value={variant.image || ''}
                  onChange={e => handleVariantChange(idx, 'image', e.target.value)}
                  className="w-32 p-1 border rounded"
                  placeholder="Image URL"
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={variant.sku || ''}
                  onChange={e => handleVariantChange(idx, 'sku', e.target.value)}
                  className="w-24 p-1 border rounded"
                  placeholder="SKU"
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="number"
                  value={variant.stockQuantity || 0}
                  onChange={e => handleVariantChange(idx, 'stockQuantity', parseInt(e.target.value) || 0)}
                  className="w-16 p-1 border rounded"
                  placeholder="Qty"
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="checkbox"
                  checked={variant.inStock}
                  onChange={e => handleVariantChange(idx, 'inStock', e.target.checked)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductVariantsSection; 