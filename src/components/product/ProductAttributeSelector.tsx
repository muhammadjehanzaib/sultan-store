'use client';

import { useState, useEffect } from 'react';
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
  
  // Animation state for restocking indicators
  const [animatingItems, setAnimatingItems] = useState<Set<string>>(new Set());
  
  // Simulate restocking animation for demo (you can remove this in production)
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatingItems(prev => {
        const newSet = new Set(prev);
        // Randomly animate some out-of-stock items
        attributes.forEach(attr => {
          attr.values.forEach(val => {
            if ((val.inStock === false || isValueUnavailable(attr.id, val.id)) && Math.random() < 0.1) {
              newSet.add(`${attr.id}-${val.id}`);
              // Stop animation after 3 seconds
              setTimeout(() => {
                setAnimatingItems(current => {
                  const updated = new Set(current);
                  updated.delete(`${attr.id}-${val.id}`);
                  return updated;
                });
              }, 3000);
            }
          });
        });
        return newSet;
      });
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [attributes]);

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
  
  // Helper function to get restock date (mock data - replace with real data)
  const getRestockDate = (attributeId: string, valueId: string) => {
    // Mock restock dates - replace with actual data from your backend
    const mockDates = {
      'color': ['Jan 15', 'Jan 20', 'Feb 5', 'Coming Soon'],
      'size': ['Jan 18', 'Feb 1', 'Jan 25', 'Feb 10'],
    };
    
    const attribute = attributes.find(attr => attr.id === attributeId);
    const dates = mockDates[attribute?.type as keyof typeof mockDates] || ['Coming Soon'];
    const hash = (attributeId + valueId).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return dates[Math.abs(hash) % dates.length];
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
              const itemKey = `${attribute.id}-${value.id}`;
              const isAnimating = animatingItems.has(itemKey);
              const restockDate = getRestockDate(attribute.id, value.id);
              
              if (attribute.type === 'color') {
                return (
                  <div key={value.id} className="relative group">
                    <button
                      onClick={() => onAttributeChange(attribute.id, value.id)}
                      className={`
                        relative w-12 h-12 rounded-full border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer
                        ${isSelected 
                          ? 'border-purple-500 ring-2 ring-purple-200 shadow-lg' 
                          : isOutOfStock
                            ? 'border-dashed border-gray-400'
                            : 'border-gray-300 hover:border-purple-300 hover:shadow-md'
                        }
                        ${isAnimating ? 'animate-pulse' : ''}
                      `}
                      style={{ 
                        backgroundColor: isOutOfStock 
                          ? `color-mix(in srgb, ${value.hexColor} 30%, #f3f4f6)`
                          : value.hexColor,
                        filter: isOutOfStock ? 'grayscale(60%) brightness(1.1)' : 'none'
                      }}
                      title={`${value.label || value.value}${isOutOfStock ? ` - Back in stock: ${restockDate}` : ''}`}
                    >
                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-white rounded-full shadow-md"></div>
                        </div>
                      )}
                      
                      {/* Out of stock overlay */}
                      {isOutOfStock && (
                        <>
                          <div className="absolute inset-0 bg-white bg-opacity-40 rounded-full"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            {isAnimating ? (
                              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <div className="text-gray-700 text-xs font-bold">✕</div>
                            )}
                          </div>
                        </>
                      )}
                      
                      {/* Coming Soon badge for out of stock */}
                      {isOutOfStock && !isAnimating && (
                        <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs px-1 py-0.5 rounded-full text-center" style={{ fontSize: '8px' }}>
                          Soon
                        </div>
                      )}
                    </button>
                    
                    {/* Enhanced tooltip on hover */}
                    {isOutOfStock && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                        <div className="font-medium">{value.label || value.value}</div>
                        <div className="text-orange-300">
                          {isAnimating ? 'Restocking...' : `Back: ${restockDate}`}
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    )}
                  </div>
                );
              }
              
              // Regular attribute buttons (size, etc.)
              return (
                  <div key={value.id} className="relative group">
                    <button
                      onClick={() => onAttributeChange(attribute.id, value.id)}
                    className={`
                      relative px-4 py-3 border rounded-lg text-sm font-medium transition-all duration-300
                      ${isSelected 
                        ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md ring-2 ring-purple-200' 
                        : isOutOfStock
                          ? 'border-dashed border-gray-400 bg-gray-50 text-gray-500'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md transform hover:scale-105'
                      }
                      cursor-pointer
                      ${isAnimating ? 'animate-pulse bg-gradient-to-r from-blue-50 to-purple-50' : ''}
                    `}
                    style={{
                      filter: isOutOfStock && !isAnimating ? 'grayscale(50%)' : 'none',
                      textDecoration: isOutOfStock && !isAnimating ? 'line-through' : 'none'
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={isOutOfStock && !isAnimating ? 'opacity-70' : ''}>
                        {formatValueForDisplay(value.value, value.label, attribute.type)}
                      </span>
                      
                      {/* Price modifier */}
                      {value.priceModifier != null && value.priceModifier !== 0 && !isOutOfStock && (
                        <span className="text-xs text-purple-600 font-semibold">
                          ({value.priceModifier > 0 ? '+' : ''}${value.priceModifier})
                        </span>
                      )}
                      
                      {/* Restocking indicator */}
                      {isAnimating && (
                        <div className="w-3 h-3 border border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                    
                    {/* Coming Soon overlay for out of stock */}
                    {isOutOfStock && !isAnimating && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 rounded-lg">
                        <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                          Coming Soon
                        </div>
                      </div>
                    )}
                    
                    {/* Restocking overlay */}
                    {isOutOfStock && isAnimating && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 bg-opacity-90 rounded-lg">
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm animate-bounce">
                          Restocking...
                        </div>
                      </div>
                    )}
                  </button>
                  
                  {/* Enhanced tooltip */}
                  {isOutOfStock && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                      <div className="font-medium">{formatValueForDisplay(value.value, value.label, attribute.type)}</div>
                      <div className="text-orange-300">
                        {isAnimating ? 'Currently restocking inventory...' : `Expected back: ${restockDate}`}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {selectedValues[attribute.id] && (
            <p className="text-sm flex items-center space-x-2">
              <span className="text-gray-600">Selected:</span>
              <span className="font-medium">
                {(() => {
                  const selectedValue = attribute.values.find(v => v.id === selectedValues[attribute.id]);
                  if (!selectedValue) return '';
                  const isSelectedOutOfStock = selectedValue.inStock === false || isValueUnavailable(attribute.id, selectedValue.id);
                  return (
                    <span className={isSelectedOutOfStock ? 'text-orange-600' : 'text-gray-900'}>
                      {formatValueForDisplay(selectedValue.value, selectedValue.label, attribute.type)}
                      {isSelectedOutOfStock && (
                        <span className="ml-2 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                          Out of Stock
                        </span>
                      )}
                    </span>
                  );
                })()}
              </span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
