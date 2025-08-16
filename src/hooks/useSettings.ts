'use client';

import { useState, useEffect } from 'react';

interface Settings {
  taxRate: number;
  shippingRate: number;
  freeShippingThreshold: number;
  codFee: number;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
}

interface UseSettingsReturn {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Cache settings to avoid repeated requests
let cachedSettings: Settings | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<Settings | null>(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setError(null);
      
      // Check cache first
      const now = Date.now();
      if (cachedSettings && (now - cacheTime) < CACHE_DURATION) {
        setSettings(cachedSettings);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/settings/public');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      const data = await response.json();
      
      // Transform API response to match expected Settings interface
      const settings: Settings = {
        taxRate: data.tax.rate,
        shippingRate: data.shipping.rate,
        freeShippingThreshold: data.shipping.freeThreshold,
        codFee: data.codFee || 25.0, // COD fee from API or default
        businessName: 'SaudiSafety',
        businessEmail: 'support@saudisafety.com',
        businessPhone: '+966 XXX XXXX',
        businessAddress: 'Riyadh, Saudi Arabia'
      };
      
      // Debug logging (remove in production)
      
      // Update cache
      cachedSettings = settings;
      cacheTime = now;
      
      setSettings(settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      
      // Fallback to default settings
      const fallbackSettings: Settings = {
        taxRate: 0.15,
        shippingRate: 15.0,
        freeShippingThreshold: 50.0,
        codFee: 25.0,
        businessName: 'SaudiSafety',
        businessEmail: 'support@saudisafety.com',
        businessPhone: '+966 XXX XXXX',
        businessAddress: 'Riyadh, Saudi Arabia'
      };
      
      setSettings(fallbackSettings);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    // Clear cache and refetch
    cachedSettings = null;
    cacheTime = 0;
    setLoading(true);
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, error, refetch };
}

// Helper hook for just getting settings values with defaults
export function useSettingsValues() {
  const { settings, loading, error } = useSettings();
  
  const defaultSettings: Settings = {
    taxRate: 0.15,
    shippingRate: 15.0,
    freeShippingThreshold: 50.0,
    codFee: 25.0,
    businessName: 'SaudiSafety',
    businessEmail: 'support@saudisafety.com',
    businessPhone: '+966 XXX XXXX',
    businessAddress: 'Riyadh, Saudi Arabia'
  };

  return {
    ...defaultSettings,
    ...settings,
    loading,
    error
  };
}
