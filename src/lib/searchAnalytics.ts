/**
 * Search Analytics and Tracking System
 * Tracks search queries, popular searches, and user behavior
 */

export interface SearchEvent {
  query: string;
  timestamp: number;
  resultsCount: number;
  selectedProduct?: string;
  sessionId: string;
}

export interface PopularSearch {
  query: string;
  count: number;
  lastSearched: number;
}

export class SearchAnalytics {
  private static instance: SearchAnalytics;
  private sessionId: string;
  private searchHistory: SearchEvent[] = [];
  private popularSearches: PopularSearch[] = [];

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.loadFromStorage();
  }

  static getInstance(): SearchAnalytics {
    if (!SearchAnalytics.instance) {
      SearchAnalytics.instance = new SearchAnalytics();
    }
    return SearchAnalytics.instance;
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    try {
      const history = localStorage.getItem('search-analytics');
      if (history) {
        this.searchHistory = JSON.parse(history);
      }

      const popular = localStorage.getItem('popular-searches');
      if (popular) {
        this.popularSearches = JSON.parse(popular);
      }
    } catch (error) {
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    try {
      // Keep only last 100 searches for performance
      const recentHistory = this.searchHistory.slice(-100);
      localStorage.setItem('search-analytics', JSON.stringify(recentHistory));
      
      // Keep only top 20 popular searches
      const topPopular = this.popularSearches
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
      localStorage.setItem('popular-searches', JSON.stringify(topPopular));
    } catch (error) {
    }
  }

  /**
   * Track a search query
   */
  trackSearch(query: string, resultsCount: number): void {
    if (!query.trim()) return;

    const normalizedQuery = query.trim().toLowerCase();
    
    // Add to search history
    const searchEvent: SearchEvent = {
      query: normalizedQuery,
      timestamp: Date.now(),
      resultsCount,
      sessionId: this.sessionId
    };
    
    this.searchHistory.push(searchEvent);

    // Update popular searches
    const existingPopular = this.popularSearches.find(p => p.query === normalizedQuery);
    if (existingPopular) {
      existingPopular.count++;
      existingPopular.lastSearched = Date.now();
    } else {
      this.popularSearches.push({
        query: normalizedQuery,
        count: 1,
        lastSearched: Date.now()
      });
    }

    this.saveToStorage();
  }

  /**
   * Track when a user clicks on a product from search results
   */
  trackProductClick(query: string, productId: string): void {
    const lastSearch = this.searchHistory
      .filter(s => s.query === query.toLowerCase().trim())
      .pop();
    
    if (lastSearch) {
      lastSearch.selectedProduct = productId;
      this.saveToStorage();
    }
  }

  /**
   * Get popular search queries
   */
  getPopularSearches(limit: number = 10): PopularSearch[] {
    return this.popularSearches
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get recent searches for the current session
   */
  getRecentSearches(limit: number = 5): string[] {
    return this.searchHistory
      .filter(s => s.sessionId === this.sessionId)
      .map(s => s.query)
      .filter((query, index, arr) => arr.indexOf(query) === index) // Remove duplicates
      .reverse()
      .slice(0, limit);
  }

  /**
   * Get search suggestions based on popular searches
   */
  getSuggestions(query: string, limit: number = 5): string[] {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase();
    return this.popularSearches
      .filter(p => p.query.includes(queryLower))
      .sort((a, b) => b.count - a.count)
      .map(p => p.query)
      .slice(0, limit);
  }

  /**
   * Get search trends (queries with increasing popularity)
   */
  getTrendingSearches(limit: number = 5): PopularSearch[] {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    return this.popularSearches
      .filter(p => p.lastSearched > oneDayAgo)
      .sort((a, b) => {
        // Sort by recent activity and count
        const recentA = now - a.lastSearched;
        const recentB = now - b.lastSearched;
        return (b.count / recentB) - (a.count / recentA);
      })
      .slice(0, limit);
  }

  /**
   * Clear analytics data
   */
  clearAnalytics(): void {
    this.searchHistory = [];
    this.popularSearches = [];
    localStorage.removeItem('search-analytics');
    localStorage.removeItem('popular-searches');
  }

  /**
   * Export analytics data for analysis
   */
  exportData(): {
    searchHistory: SearchEvent[];
    popularSearches: PopularSearch[];
    sessionId: string;
  } {
    return {
      searchHistory: this.searchHistory,
      popularSearches: this.popularSearches,
      sessionId: this.sessionId
    };
  }
}

// Export singleton instance
export const searchAnalytics = SearchAnalytics.getInstance();
