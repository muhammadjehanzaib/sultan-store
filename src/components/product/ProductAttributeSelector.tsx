'use client';

import { useState } from 'react';
import { ProductAttribute } from '@/types';

interface ProductAttributeSelectorProps {
  attributes: ProductAttribute[];
  selectedValues: { [attributeId: string]: string };
  onAttributeChange: (attributeId: string, valueId: string) => void;
  variants?: { id: string; attributeValues: { [key: string]: string }; inStock?: boolean }[];
}

export function ProductAttributeSelector({
  attributes,
  selectedValues,
  onAttributeChange,
  variants = []
}: ProductAttributeSelectorProps) {
  // Debug logging
  console.log('🎯 ProductAttributeSelector render:', {
    attributeCount: attributes?.length || 0,
    attributes: attributes,
    selectedValues,
    variantCount: variants?.length || 0
  });
  
  if (!attributes || attributes.length === 0) {
    console.log('🚫 No attributes to display - returning null');
    return null;
  }
  
  // Helper function to check if an attribute value combination would result in an inactive variant
  const isValueUnavailable = (attributeId: string, valueId: string) => {
    if (!variants || variants.length === 0) return false;
    
    // Create a hypothetical selection with this value
    const hypotheticalSelection = {
      ...selectedValues,
      [attributeId]: valueId
    };
    
    // Check if any variant matches this selection and is in stock
    const hasActiveVariant = variants.some(variant => {
      // Check if this variant matches the hypothetical selection
      const matches = Object.keys(hypotheticalSelection).every(attrId => 
        variant.attributeValues[attrId] === hypotheticalSelection[attrId]
      );
      
      // If it matches, check if it's active
      return matches && variant.inStock !== false;
    });
    
    // If no active variant matches, this value should be unavailable
    return !hasActiveVariant && Object.keys(hypotheticalSelection).length > 0;
  };

  // Helper function to format attribute values for display
  const formatValueForDisplay = (value: string, label: string | undefined, attributeType: string) => {
    // Use label if available
    if (label) {
      return label;
    }
    
    // Format size values that start with 'u' followed by numbers
    if (attributeType === 'size' && /^u\d+$/.test(value)) {
      const size = value.substring(1); // Remove 'u' prefix
      return `Size ${size}`;
    }
    
    // Return the original value as fallback
    return value;
  };

  return (
    <div className="space-y-4">
      {attributes.map(attribute => (
        <div key={attribute.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">{attribute.name}</h4>
            {attribute.required && (
              <span className="text-red-500 text-sm">*</span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {attribute.values.map(value => {
              const isSelected = selectedValues[attribute.id] === value.id;
              const isOutOfStock = value.inStock === false || isValueUnavailable(attribute.id, value.id);
              
              if (attribute.type === 'color') {
                return (
                  <button
                    key={value.id}
                    onClick={() => !isOutOfStock && onAttributeChange(attribute.id, value.id)}
                    disabled={isOutOfStock}
                    className={`
                      relative w-10 h-10 rounded-full border-2 transition-all duration-200
                      ${isSelected 
                        ? 'border-purple-500 ring-2 ring-purple-200' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                      ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    style={{ backgroundColor: value.hexColor }}
                    title={`${value.label || value.value}${isOutOfStock ? ' (Out of Stock)' : ''}`}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                      </div>
                    )}
                    {isOutOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-0.5 h-full bg-red-500 transform rotate-45"></div>
                      </div>
                    )}
                  </button>
                );
              }
              
              return (
                <button
                  key={value.id}
                  onClick={() => !isOutOfStock && onAttributeChange(attribute.id, value.id)}
                  disabled={isOutOfStock}
                  className={`
                    px-4 py-2 border rounded-lg text-sm font-medium transition-all duration-200
                    ${isSelected 
                      ? 'border-purple-500 bg-purple-50 text-purple-700' 
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }
                    ${isOutOfStock 
                      ? 'opacity-50 cursor-not-allowed line-through' 
                      : 'cursor-pointer'
                    }
                  `}
                  >
                  {formatValueForDisplay(value.value, value.label, attribute.type)}
                  {value.priceModifier != null && value.priceModifier !== 0 && (
                    <span className="ml-1 text-xs">
                      ({value.priceModifier > 0 ? '+' : ''}${value.priceModifier})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          {selectedValues[attribute.id] && (
            <p className="text-sm text-gray-600">
              Selected: {(() => {
                const selectedValue = attribute.values.find(v => v.id === selectedValues[attribute.id]);
                return selectedValue ? formatValueForDisplay(selectedValue.value, selectedValue.label, attribute.type) : '';
              })()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
