/**
 * Cache Performance Stats API
 * Monitor cache hit rates and performance
 * GET /api/cache/stats
 */

import { NextResponse } from 'next/server';
import { getCachePerformance, cache } from '@/lib/cache';

export async function GET() {
  try {
    const performance = getCachePerformance();
    const stats = cache.getStats();
    
    return NextResponse.json({
      success: true,
      cache: {
        performance: {
          hitRate: performance.hitRate,
          efficiency: performance.efficiency,
          totalKeys: performance.keys,
          hits: performance.hits,
          misses: performance.misses
        },
        system: {
          uptime: `${Math.floor(performance.uptime / 3600)}h ${Math.floor((performance.uptime % 3600) / 60)}m`,
          memory: {
            used: `${Math.round(performance.memory.heapUsed / 1024 / 1024)}MB`,
            total: `${Math.round(performance.memory.heapTotal / 1024 / 1024)}MB`,
            external: `${Math.round(performance.memory.external / 1024 / 1024)}MB`
          }
        },
        recommendations: [
          parseFloat(performance.hitRate) < 60 && "Consider warming cache with popular data",
          performance.keys > 50 && "Cache has many keys, consider cleanup",
          performance.memory.heapUsed > 200 * 1024 * 1024 && "High memory usage detected (>200MB)",
          performance.keys === 0 && "Cache is empty - run 'pnpm cache:test' to activate"
        ].filter(Boolean)
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Cache stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get cache stats' },
      { status: 500 }
    );
  }
}

// Clear cache endpoint (for debugging)
export async function DELETE() {
  try {
    cache.flush();
    
    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully'
    });
    
  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
