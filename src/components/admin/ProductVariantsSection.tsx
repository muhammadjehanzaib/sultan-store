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

  useEffect(() => {
    // Generate all combinations of attribute values
    const attrValues = attributes.map(attr => attr.values.map(v => ({ attrId: attr.id, valueId: v.id, label: v.label || v.value, attrType: attr.type })));
    const combos = getCombinations(attrValues);
    const generatedVariants: ProductVariant[] = combos.map((combo, idx) => {
      const attributeValues: { [attributeId: string]: string } = {};
      combo.forEach((v: any) => { attributeValues[v.attrId] = v.valueId; });
      // Try to find existing variant for this combo
      const existing = variants.find(v => JSON.stringify(v.attributeValues) === JSON.stringify(attributeValues));
      return existing || {
        id: `${idx}-${Date.now()}`,
        attributeValues,
        price: undefined,
        image: '',
        sku: '',
        inStock: true,
        stockQuantity: 0,
      };
    });
    setLocalVariants(generatedVariants);
    setVariants(generatedVariants);
    // eslint-disable-next-line
  }, [JSON.stringify(attributes)]);

  const handleVariantChange = (idx: number, field: string, value: any) => {
    const updated = [...localVariants];
    (updated[idx] as any)[field] = value;
    setLocalVariants(updated);
    setVariants(updated);
  };

  if (localVariants.length === 0) return <div className="text-gray-500 text-sm">No variants generated. Add attributes and values.</div>;

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
                  {attr.values.find(v => v.id === variant.attributeValues[attr.id])?.label || ''}
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