import { Product, MultilingualProduct, LocalizedContent } from '@/types';

/**
 * Converts a string or LocalizedContent to LocalizedContent
 * If input is a string, uses it for both languages
 */
export function ensureLocalizedContent(value: string | LocalizedContent): LocalizedContent {
  if (typeof value === 'string') {
    return { en: value, ar: value };
  }
  return value;
}

/**
 * Gets the localized string based on current language
 */
export function getLocalizedString(content: string | LocalizedContent, language: 'en' | 'ar'): string {
  if (typeof content === 'string') {
    return content;
  }
  return content[language] || content.en || '';
}

/**
 * Converts legacy product data to multilingual format
 */
export function convertToMultilingualProduct(product: Product): MultilingualProduct {
  return {
    ...product,
    name: ensureLocalizedContent(product.name),
    category: ensureLocalizedContent(product.category),
    description: ensureLocalizedContent(product.description || ''),
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
