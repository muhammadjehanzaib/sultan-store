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
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  // Auto-generate variants when attributes change
  useEffect(() => {
    if (isAutoGenerating) return; // Prevent infinite loops
    
    const autoManageVariants = () => {
      if (!attributes || attributes.length === 0) {
        // If no attributes, keep existing variants (might be manually created)
        const validVariants = variants || [];
        setDisplayVariants(validVariants);
        return;
      }

      const attributesWithValues = attributes.filter(
        (attr) => attr.values && attr.values.length > 0
      );

      if (attributesWithValues.length === 0) {
        // If attributes exist but have no values, keep existing variants
        const validVariants = variants || [];
        setDisplayVariants(validVariants);
        return;
      }

      // Generate all possible combinations
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

      // Create a map of existing variants for quick lookup
      const existingVariantsMap = new Map<string, ProductVariant>();
      (variants || []).forEach(variant => {
        const key = JSON.stringify(variant.attributeValues);
        existingVariantsMap.set(key, variant);
      });

      // Create variants for all combinations, preserving existing data
      const managedVariants: ProductVariant[] = combinations.map((combo, index) => {
        const key = JSON.stringify(combo);
        const existingVariant = existingVariantsMap.get(key);
        
        if (existingVariant) {
          // Preserve existing variant with all its customizations
          return existingVariant;
        }
        
        // Create new variant
        const skuParts: string[] = [];
        attributesWithValues.forEach((attr) => {
          const valueId = combo[attr.id];
          const value = attr.values.find((v) => v.id === valueId);
          if (value) {
            skuParts.push(value.label || value.value);
          }
        });

        const newVariant: ProductVariant = {
          id: `variant-${Date.now()}-${index}`,
          attributeValues: combo,
          price: undefined, // Let it inherit from parent product
          image: '',
          sku: skuParts.join('-').toUpperCase().replace(/\s+/g, '-'),
          inStock: true,
          stockQuantity: 0,
        };
        
        return newVariant;
      });

      setDisplayVariants(managedVariants);
      
      // Update parent state if different
      if (JSON.stringify(managedVariants) !== JSON.stringify(variants)) {
        setIsAutoGenerating(true);
        setVariants(managedVariants);
      }
    };

    autoManageVariants();
  }, [attributes, variants, setVariants, isAutoGenerating]);

  // Reset auto-generating flag after state update
  useEffect(() => {
    if (isAutoGenerating) {
      setIsAutoGenerating(false);
    }
  }, [variants, isAutoGenerating]);


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
          {!attributes || attributes.length === 0 ? (
            <>No variants - add some attributes first to create variants automatically.</>
          ) : attributes.every(attr => !attr.values || attr.values.length === 0) ? (
            <>No variants - add values to your attributes to create variants automatically.</>
          ) : (
            <>Loading variants...</>
          )}
        </div>

        <div className="text-xs text-gray-400 mt-2 text-center">
          Variants are created automatically based on your attributes.
          <br />
          Attributes: {attributes?.length || 0}, Variants: {variants?.length || 0}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-700">
          <span className="font-medium">Product Variants</span>
          <span className="text-xs text-gray-500 ml-2">({displayVariants.length} variants auto-generated)</span>
        </div>
        
        <div className="text-xs text-gray-500">
          🔄 Auto-managed based on attributes
        </div>
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
                    // Handle both object and array types for attributeValues
                    if (typeof variant.attributeValues === 'object' && !Array.isArray(variant.attributeValues)) {
                      const valueId = variant.attributeValues[attr.id];
                      if (!valueId) return 'No data';
                      const value = attr.values.find((v) => v.id === valueId);
                      return value ? value.label || value.value : 'No data';
                    }
                    return 'No data';
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
