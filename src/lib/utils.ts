/**
 * Smooth scroll to an element by ID
 * @param elementId - The ID of the element to scroll to
 * @param offset - Optional offset from the top in pixels (default: 80 for header space)
 */
export const scrollToElement = (elementId: string, offset: number = 80) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
};

/**
 * Format price to currency string
 * @param price - The price number
 * @param currency - Currency symbol (default: '$')
 * @returns Formatted price string
 */
export const formatPrice = (price: number, currency: string = '$'): string => {
  return `${currency}${price.toFixed(2)}`;
};

/**
 * Generate star rating display
 * @param rating - Rating number (0-5)
 * @returns Array of star states
 */
export const generateStarRating = (rating: number): boolean[] => {
  return Array.from({ length: 5 }, (_, index) => index < Math.floor(rating));
};
