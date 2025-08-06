import { Product, MultilingualProduct, LocalizedContent } from '@/types';

/**
 * Converts a string or LocalizedContent to LocalizedContent
 * If input is a string, uses it for both languages
 * Also handles category objects with name_en/name_ar properties
 */
export function ensureLocalizedContent(value: string | LocalizedContent | { name_en?: string; name_ar?: string; slug?: string } | null | undefined): LocalizedContent {
  if (!value) {
    return { en: '', ar: '' };
  }
  if (typeof value === 'string') {
    return { en: value, ar: value };
  }
  // Handle category object with name_en/name_ar properties
  if (typeof value === 'object' && ('name_en' in value || 'name_ar' in value)) {
    return {
      en: value.name_en || value.name_ar || '',
      ar: value.name_ar || value.name_en || ''
    };
  }
  return value as LocalizedContent;
}

/**
 * Gets the localized string based on current language
 */
export function getLocalizedString(content: string | LocalizedContent | null | undefined, language: 'en' | 'ar'): string {
  if (!content) {
    return '';
  }
  if (typeof content === 'string') {
    return content;
  }
  return content[language] || content.en || '';
}

/**
 * Converts legacy product data to multilingual format
 */
export function convertToMultilingualProduct(product: Product | any): MultilingualProduct {
  console.log('convertToMultilingualProduct: Converting product:', product.id, 'variants:', product.variants?.length || 0);
  
  // Handle products with separate language fields (from API)
  if (product.name_en && product.name_ar) {
    // Calculate proper stock status based on variants or inventory
    const variants = product.variants || [];
    const inventoryStock = product.inventory?.stock || 0;
    const totalVariantStock = variants.reduce((sum: number, variant: any) => sum + (variant.stockQuantity || 0), 0);
    
    // For products with variants, use variant stock total; otherwise use inventory stock
    const actualStock = variants.length > 0 ? totalVariantStock : inventoryStock;
    const isInStock = actualStock > 0;
    
    const converted = {
      ...product,
      name: { en: product.name_en, ar: product.name_ar },
      category: product.category_en && product.category_ar 
        ? { en: product.category_en, ar: product.category_ar }
        : ensureLocalizedContent(product.category),
      description: product.description_en && product.description_ar
        ? { en: product.description_en, ar: product.description_ar }
        : ensureLocalizedContent(product.description || ''),
      // Override inStock with calculated value
      inStock: isInStock,
      stockQuantity: actualStock,
      // Ensure variants are properly preserved and structured
      variants: variants.map((variant: any) => {
        let attributeValues: Record<string, string> = {};
        
        if (variant.attributeValues && Array.isArray(variant.attributeValues)) {
          // New relational structure: convert to simple object
          variant.attributeValues.forEach((joinRecord: any) => {
            if (joinRecord.attributeValue && joinRecord.attributeValue.attribute) {
              const attributeId = joinRecord.attributeValue.attribute.id;
              const valueId = joinRecord.attributeValue.id;
              attributeValues[attributeId] = valueId;
            }
          });
        } else if (variant.attributeValues) {
          // Legacy structure: already an object
          attributeValues = variant.attributeValues;
        }
        
        return {
          id: variant.id,
          attributeValues,
          price: variant.price,
          image: variant.image || '',
          sku: variant.sku || '',
          inStock: variant.inStock !== false && variant.stockQuantity > 0,
          stockQuantity: variant.stockQuantity || 0
        };
      }),
      // Ensure attributes are properly preserved
      attributes: (product.attributes || []).map((attr: any) => ({
        ...attr,
        values: attr.values || []
      })),
    };
    console.log('convertToMultilingualProduct: Converted variants:', converted.variants);
    return converted;
  }
  
  // Handle legacy products with single language fields
  const converted = {
    ...product,
    name: ensureLocalizedContent(product.name),
    category: ensureLocalizedContent(product.category),
    description: ensureLocalizedContent(product.description || ''),
    // Ensure variants are properly preserved and structured
    variants: (product.variants || []).map((variant: any) => ({
      id: variant.id,
      attributeValues: variant.attributeValues || {},
      price: variant.price,
      image: variant.image || '',
      sku: variant.sku || '',
      inStock: variant.inStock !== false,
      stockQuantity: variant.stockQuantity || 0
    })),
    // Ensure attributes are properly preserved
    attributes: (product.attributes || []).map((attr: any) => ({
      ...attr,
      values: attr.values || []
    })),
  };
  console.log('convertToMultilingualProduct: Converted variants (legacy):', converted.variants);
  return converted;
}

/**
 * Converts multilingual product data back to legacy format for compatibility
 */
export function convertToLegacyProduct(product: MultilingualProduct, language: 'en' | 'ar' = 'en'): Product {
  return {
    ...product,
    name: getLocalizedString(product.name, language),
    category: getLocalizedString(product.category, language),
    description: getLocalizedString(product.description || { en: '', ar: '' }, language),
  };
}

/**
 * Default category mappings for quick translation
 */
export const CATEGORY_MAPPINGS = {
  'Electronics': { en: 'Electronics', ar: 'الإلكترونيات' },
  'Fashion': { en: 'Fashion', ar: 'الأزياء' },
  'Home': { en: 'Home & Kitchen', ar: 'المنزل والمطبخ' },
  'Sports': { en: 'Sports', ar: 'الرياضة' },
  'Books': { en: 'Books', ar: 'الكتب' },
  'Beauty': { en: 'Beauty', ar: 'الجمال' }
};

/**
 * Helper to get category translation
 */
export function getCategoryTranslation(categoryName: string): LocalizedContent {
  const mapping = Object.values(CATEGORY_MAPPINGS).find(
    cat => cat.en === categoryName || cat.ar === categoryName
  );
  return mapping || { en: categoryName, ar: categoryName };
}
