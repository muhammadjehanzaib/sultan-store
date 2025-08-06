import React, { useEffect, useState } from 'react';
import { ProductAttribute, ProductVariant } from '@/types';

interface ProductVariantsSectionProps {
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  setVariants: (variants: ProductVariant[]) => void;
  selectedLanguage: 'en' | 'ar';
}

const ProductVariantsSection: React.FC<ProductVariantsSectionProps> = ({
  attributes,
  variants,
  setVariants,
  selectedLanguage,
}) => {
  const [displayVariants, setDisplayVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    // A variant is valid only if its attributes and values still exist.
    const getValidVariants = () => {
      if (!attributes || attributes.length === 0) {
        return []; // No attributes means no valid variants.
      }
      if (!variants) {
        return [];
      }
      
      return variants.filter(variant => {
        const attributeValues = variant.attributeValues || {};
        const variantAttrIds = Object.keys(attributeValues);
        
        if (variantAttrIds.length === 0) return false; // Variant is invalid if it has no attributes linked

        return variantAttrIds.every(attrId => {
          const attrDef = attributes.find(a => a.id === attrId);
          if (!attrDef) return false; // The attribute itself was deleted.

          const valueId = attributeValues[attrId];
          return attrDef.values?.some(v => v.id === valueId); // The specific value was deleted.
        });
      });
    };

    const validVariants = getValidVariants();
    
    // The display should only show valid variants.
    setDisplayVariants(validVariants);

    // If the filtering resulted in a change, update the parent state.
    if (validVariants.length !== variants.length) {
      setVariants(validVariants);
    }
  }, [variants, attributes, setVariants]);

  const generateVariants = () => {
    if (!attributes || attributes.length === 0) {
      alert('Please add attributes first before generating variants.');
      return;
    }

    const attributesWithValues = attributes.filter(
      (attr) => attr.values && attr.values.length > 0
    );
    if (attributesWithValues.length === 0) {
      alert('Please add values to your attributes first.');
      return;
    }

    const combinations: any[] = [];

    const generateCombinations = (attrIndex: number, currentCombination: any) => {
      if (attrIndex >= attributesWithValues.length) {
        combinations.push(currentCombination);
        return;
      }

      const attr = attributesWithValues[attrIndex];
      attr.values.forEach((value) => {
        generateCombinations(attrIndex + 1, {
          ...currentCombination,
          [attr.id]: value.id,
        });
      });
    };

    generateCombinations(0, {});

    const newVariants: ProductVariant[] = combinations.map((combo, index) => {
      const skuParts: string[] = [];
      attributesWithValues.forEach((attr) => {
        const valueId = combo[attr.id];
        const value = attr.values.find((v) => v.id === valueId);
        if (value) {
          skuParts.push(value.label || value.value);
        }
      });

      return {
        id: `variant-${Date.now()}-${index}`,
        attributeValues: combo,
        price: 0,
        image: '',
        sku: skuParts.join('-').toUpperCase().replace(/\s+/g, '-'),
        inStock: true,
        stockQuantity: 0,
      };
    });

    console.log('Generated variants:', newVariants);
    setDisplayVariants(newVariants);
    setVariants(newVariants);
  };

  const handleVariantChange = (idx: number, field: string, value: any) => {
    const updated = [...displayVariants];
    (updated[idx] as any)[field] = value;
    setDisplayVariants(updated);
    setVariants(updated);
  };

  if (displayVariants.length === 0) {
    return (
      <div className="p-4 border border-dashed border-gray-300 rounded-lg">
        <div className="text-gray-500 text-sm text-center">
          No variants available.
        </div>

        {attributes && attributes.length > 0 && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={generateVariants}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
              Generate Variants from Attributes
            </button>
            <div className="text-xs text-gray-400 mt-2">
              This will create variants for all attribute combinations
            </div>
          </div>
        )}

        <div className="text-xs text-gray-400 mt-2 text-center">
          Debug Info:
          <br />
          Variants received: {variants?.length || 0}
          <br />
          Attributes received: {attributes?.length || 0}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="mb-2 text-xs text-gray-500">
        Displaying {displayVariants.length} variants
      </div>
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            {attributes.map((attr) => (
              <th key={attr.id} className="px-2 py-1 text-left font-medium">
                {attr.name}
              </th>
            ))}
            <th className="px-2 py-1">Price</th>
            <th className="px-2 py-1">Image</th>
            <th className="px-2 py-1">SKU</th>
            <th className="px-2 py-1">Stock</th>
            <th className="px-2 py-1">In Stock</th>
          </tr>
        </thead>
        <tbody>
          {displayVariants.map((variant, idx) => (
            <tr key={variant.id} className="bg-white dark:bg-gray-800 border-b">
              {attributes.map((attr) => (
                <td key={attr.id} className="px-2 py-1">
                  {(() => {
                    const valueId = variant.attributeValues?.[attr.id];
                    if (!valueId) return 'No data';
                    const value = attr.values.find((v) => v.id === valueId);
                    return value ? value.label || value.value : 'No data';
                  })()}
                </td>
              ))}
              <td className="px-2 py-1">
                <input
                  type="number"
                  value={variant.price || ''}
                  onChange={(e) =>
                    handleVariantChange(idx, 'price', parseFloat(e.target.value) || undefined)
                  }
                  className="w-20 p-1 border rounded"
                  placeholder="Price"
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="url"
                  value={variant.image || ''}
                  onChange={(e) => handleVariantChange(idx, 'image', e.target.value)}
                  className="w-32 p-1 border rounded"
                  placeholder="Image URL"
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={variant.sku || ''}
                  onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                  className="w-24 p-1 border rounded"
                  placeholder="SKU"
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="number"
                  value={variant.stockQuantity || 0}
                  onChange={(e) =>
                    handleVariantChange(idx, 'stockQuantity', parseInt(e.target.value) || 0)
                  }
                  className="w-16 p-1 border rounded"
                  placeholder="Qty"
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="checkbox"
                  checked={variant.inStock}
                  onChange={(e) => handleVariantChange(idx, 'inStock', e.target.checked)}
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
