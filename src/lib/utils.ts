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

/**
 * Advanced search utilities
 */
export const searchUtils = {
  // Calculate search relevance score
  calculateRelevance: (text: string, query: string): number => {
    if (!text || !query) return 0;
    
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Exact match gets highest score
    if (textLower === queryLower) return 100;
    
    // Starts with query gets high score
    if (textLower.startsWith(queryLower)) return 80;
    
    // Contains query gets medium score
    if (textLower.includes(queryLower)) return 60;
    
    // Word-by-word matching
    const words = queryLower.split(' ').filter(word => word.length > 1);
    let wordScore = 0;
    words.forEach(word => {
      if (textLower.includes(word)) wordScore += 20;
    });
    
    return Math.min(wordScore, 50);
  },

  // Generate search suggestions
  generateSuggestions: (query: string, products: any[]): string[] => {
    if (!query.trim()) return [];
    
    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();
    
    products.forEach(product => {
      // Add product name if it matches
      if (product.name.toLowerCase().includes(queryLower)) {
        suggestions.add(product.name);
      }
      
      // Add category if it matches
      if (product.category.toLowerCase().includes(queryLower)) {
        suggestions.add(product.category);
      }
      
      // Add description words if they match
      if (product.description) {
        const words = product.description.toLowerCase().split(' ');
        words.forEach((word: string) => {
          if (word.length > 3 && word.includes(queryLower)) {
            suggestions.add(word);
          }
        });
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  },

  // Highlight search terms in text
  highlightSearchTerms: (text: string, query: string): string => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.split(' ').join('|')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 font-semibold">$1</mark>');
  },

  // Debounce function for search
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Format search query for URL
  formatQueryForUrl: (query: string): string => {
    return encodeURIComponent(query.trim().toLowerCase());
  },

  // Parse price range from query
  parsePrice: (query: string): { min?: number; max?: number } | null => {
    const priceMatch = query.match(/\$?(\d+)(?:[-–](\d+))?/g);
    if (!priceMatch) return null;
    
    const prices = priceMatch[0].replace('$', '').split(/[-–]/);
    return {
      min: parseInt(prices[0]),
      max: prices[1] ? parseInt(prices[1]) : undefined
    };
  }
};
