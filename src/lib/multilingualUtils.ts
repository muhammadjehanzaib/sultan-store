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
  // Handle products with separate language fields (from API)
  if (product.name_en && product.name_ar) {
    return {
      ...product,
      name: { en: product.name_en, ar: product.name_ar },
      category: product.category_en && product.category_ar 
        ? { en: product.category_en, ar: product.category_ar }
        : ensureLocalizedContent(product.category),
      description: product.description_en && product.description_ar
        ? { en: product.description_en, ar: product.description_ar }
        : ensureLocalizedContent(product.description || ''),
      // Ensure variants are preserved
      variants: product.variants || [],
      attributes: product.attributes || [],
    };
  }
  
  // Handle legacy products with single language fields
  return {
    ...product,
    name: ensureLocalizedContent(product.name),
    category: ensureLocalizedContent(product.category),
    description: ensureLocalizedContent(product.description || ''),
    // Ensure variants are preserved
    variants: product.variants || [],
    attributes: product.attributes || [],
  };
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
