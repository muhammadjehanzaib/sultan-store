/**
 * FREE Vercel-Optimized Caching Service
 * Uses Next.js built-in cache, in-memory cache, and Vercel edge cache
 * NO EXTERNAL SERVICES - COMPLETELY FREE
 */

import NodeCache from 'node-cache';
import { unstable_cache } from 'next/cache';

const CACHE_DEBUG = process.env.CACHE_DEBUG === '1';

// In-memory cache configuration - OPTIMIZED FOR LOW MEMORY
const memoryCache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL (shorter = less memory)
  checkperiod: 60, // Check expired keys every minute
  useClones: false, // Better performance, less memory
  deleteOnExpire: true,
  maxKeys: 100, // Much lower limit to prevent memory issues
});

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  revalidate?: number; // Next.js revalidation time
}

class VercelCacheService {
  /**
   * Get data from cache with multiple fallback layers
   */
  async get<T>(key: string, fallback?: () => Promise<T>, options: CacheOptions = {}): Promise<T | null> {
    const { ttl = 600 } = options;

    try {
      // Layer 1: Check in-memory cache first
      const memoryResult = memoryCache.get<T>(key);
      if (memoryResult !== undefined) {
        if (CACHE_DEBUG) console.log(`✅ Cache HIT (Memory): ${key}`);
        return memoryResult;
      }

      // Layer 2: If no fallback, return null
      if (!fallback) {
        if (CACHE_DEBUG) console.log(`❌ Cache MISS: ${key}`);
        return null;
      }

      // Layer 3: Execute fallback and cache result
      if (CACHE_DEBUG) console.log(`🔄 Cache MISS, fetching: ${key}`);
      const result = await fallback();
      
      if (result !== null && result !== undefined) {
        // Store in memory cache
        memoryCache.set(key, result, ttl);
        if (CACHE_DEBUG) console.log(`💾 Cached in memory: ${key}`);
      }

      return result;
    } catch (error) {
      if (CACHE_DEBUG) console.error(`Cache error for key ${key}:`, error);
      return fallback ? await fallback() : null;
    }
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, value: T, ttl: number = 600): boolean {
    try {
      memoryCache.set(key, value, ttl);
      if (CACHE_DEBUG) console.log(`💾 Set cache: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      if (CACHE_DEBUG) console.error(`Error setting cache for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete specific cache key
   */
  delete(key: string): boolean {
    try {
      const deleted = memoryCache.del(key);
      if (CACHE_DEBUG) console.log(`🗑️ Deleted cache: ${key} (${deleted} keys removed)`);
      return deleted > 0;
    } catch (error) {
      if (CACHE_DEBUG) console.error(`Error deleting cache for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear cache by pattern
   */
  deletePattern(pattern: string): number {
    try {
      const keys = memoryCache.keys().filter(key => key.includes(pattern));
      const deleted = memoryCache.del(keys);
      if (CACHE_DEBUG) console.log(`🗑️ Deleted cache pattern ${pattern}: ${deleted} keys`);
      return deleted;
    } catch (error) {
      if (CACHE_DEBUG) console.error(`Error deleting cache pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  flush(): void {
    try {
      memoryCache.flushAll();
      if (CACHE_DEBUG) console.log(`🧹 Flushed all cache`);
    } catch (error) {
      if (CACHE_DEBUG) console.error('Error flushing cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      keys: memoryCache.keys().length,
      hits: memoryCache.getStats().hits,
      misses: memoryCache.getStats().misses,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
  }

  /**
   * Wrap database queries with cache - MAIN PERFORMANCE BOOSTER
   */
  async cached<T>(
    key: string,
    queryFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const result = await this.get(key, queryFn, options);
    return result as T;
  }
}

// Singleton instance
export const cache = new VercelCacheService();

/**
 * Next.js unstable_cache wrapper for Vercel optimization
 * Uses Vercel's built-in caching system
 */
export function nextCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyParts: string[],
  options: { revalidate?: number; tags?: string[] } = {}
) {
  return unstable_cache(fn, keyParts, {
    revalidate: options.revalidate || 3600, // 1 hour default
    tags: options.tags || [],
  });
}

/**
 * Cache keys generator - prevents key collisions
 */
export const CacheKeys = {
  // Products
  product: (slug: string) => `product:${slug}`,
  products: (page: number = 1, limit: number = 10) => `products:${page}:${limit}`,
  productsByCategory: (categorySlug: string, page: number = 1) => `products:category:${categorySlug}:${page}`,
  
  // Categories  
  categories: () => 'categories:all',
  category: (slug: string) => `category:${slug}`,
  categoryTree: () => 'categories:tree',
  
  // Search
  search: (query: string, filters?: string) => `search:${query}:${filters || 'none'}`,
  searchSuggestions: (query: string) => `search:suggestions:${query}`,
  
  // User-specific (don't cache across users)
  cart: (userId: string) => `cart:${userId}`,
  orders: (userId: string) => `orders:${userId}`,
  
  // Settings
  settings: () => 'settings:global',

  // Campaign Slides
  campaignSlidesActive: () => 'campaign-slides:active',
  
  // Analytics
  popularProducts: () => 'analytics:popular',
  recentProducts: () => 'analytics:recent',
};

/**
 * Convenience functions for common operations
 */

// Cache product data
export const cacheProduct = (slug: string, ttl: number = 3600) => 
  (productFetcher: () => Promise<any>) => 
    cache.cached(CacheKeys.product(slug), productFetcher, { ttl });

// Cache product list
export const cacheProducts = (page: number = 1, limit: number = 10, ttl: number = 1800) => 
  (productsFetcher: () => Promise<any>) => 
    cache.cached(CacheKeys.products(page, limit), productsFetcher, { ttl });

// Cache categories
export const cacheCategories = (ttl: number = 7200) => 
  (categoriesFetcher: () => Promise<any>) => 
    cache.cached(CacheKeys.categories(), categoriesFetcher, { ttl });

/**
 * Cache invalidation helpers
 */
export const invalidateProduct = (slug: string) => {
  cache.delete(CacheKeys.product(slug));
  cache.deletePattern('products:'); // Invalidate product lists
};

export const invalidateCategory = (slug: string) => {
  cache.delete(CacheKeys.category(slug));
  cache.delete(CacheKeys.categories());
  cache.deletePattern(`products:category:${slug}`);
};

export const invalidateCampaignSlides = () => {
  cache.delete(CacheKeys.campaignSlidesActive());
};

export const invalidateSearch = () => {
  cache.deletePattern('search:');
};

/**
 * Performance monitoring
 */
export const getCachePerformance = () => {
  const stats = cache.getStats();
  const hitRate = stats.hits / (stats.hits + stats.misses) * 100;
  
  return {
    ...stats,
    hitRate: hitRate.toFixed(2) + '%',
    efficiency: hitRate > 80 ? 'Excellent' : hitRate > 60 ? 'Good' : 'Needs Improvement'
  };
};
