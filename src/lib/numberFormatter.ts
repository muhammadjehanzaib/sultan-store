/**
 * Number formatting utilities for Arabic and English locales
 */

/**
 * Format a number for the given locale
 * @param number - The number to format
 * @param locale - 'ar' for Arabic, 'en' for English
 * @param options - Additional formatting options
 * @returns Formatted number string
 */
export function formatNumber(
  number: number,
  locale: 'ar' | 'en' = 'en',
  options?: Intl.NumberFormatOptions
): string {
  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(localeCode, options).format(number);
}

/**
 * Format a percentage for the given locale
 * @param percentage - The percentage value (e.g., 25 for 25%)
 * @param locale - 'ar' for Arabic, 'en' for English
 * @param decimalPlaces - Number of decimal places (default: 0)
 * @returns Formatted percentage string with % symbol
 */
export function formatPercentage(
  percentage: number,
  locale: 'ar' | 'en' = 'en',
  decimalPlaces: number = 0
): string {
  const formattedNumber = formatNumber(
    percentage,
    locale,
    {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    }
  );
  
  // Use the appropriate percent symbol based on locale
  // Arabic uses ٪ (U+066A) while English uses % (U+0025)
  const percentSymbol = locale === 'ar' ? '٪' : '%';
  
  return `${formattedNumber}${percentSymbol}`;
}

/**
 * Format a decimal number for the given locale
 * @param number - The number to format
 * @param locale - 'ar' for Arabic, 'en' for English
 * @param decimalPlaces - Number of decimal places
 * @returns Formatted decimal string
 */
export function formatDecimal(
  number: number,
  locale: 'ar' | 'en' = 'en',
  decimalPlaces: number = 2
): string {
  return formatNumber(number, locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  });
}

/**
 * Format an integer for the given locale
 * @param number - The number to format
 * @param locale - 'ar' for Arabic, 'en' for English
 * @returns Formatted integer string
 */
export function formatInteger(
  number: number,
  locale: 'ar' | 'en' = 'en'
): string {
  return formatNumber(number, locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}
