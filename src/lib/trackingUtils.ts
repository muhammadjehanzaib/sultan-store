export type TrackingProvider = 'fedex' | 'ups' | 'usps' | 'dhl' | 'custom';

export interface TrackingNumberConfig {
  provider: TrackingProvider;
  prefix?: string;
  length?: number;
}

// Tracking number formats for different providers
const TRACKING_FORMATS = {
  fedex: {
    prefix: 'FDX',
    length: 12,
    format: /^FDX\d{9}$/
  },
  ups: {
    prefix: 'UPS',
    length: 18,
    format: /^UPS\d{15}$/
  },
  usps: {
    prefix: 'USPS',
    length: 22,
    format: /^USPS\d{18}$/
  },
  dhl: {
    prefix: 'DHL',
    length: 10,
    format: /^DHL\d{7}$/
  },
  custom: {
    prefix: 'TRK',
    length: 12,
    format: /^TRK\d{9}$/
  }
};

/**
 * Generate a tracking number based on the provider
 */
export function generateTrackingNumber(provider: TrackingProvider = 'custom'): string {
  const config = TRACKING_FORMATS[provider];
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  // Generate the numeric part
  const numericPart = timestamp + random;
  
  // Create the tracking number
  const trackingNumber = `${config.prefix}${numericPart}`;
  
  return trackingNumber;
}

/**
 * Validate a tracking number format
 */
export function validateTrackingNumber(trackingNumber: string, provider?: TrackingProvider): boolean {
  if (!trackingNumber) return false;
  
  if (provider) {
    const config = TRACKING_FORMATS[provider];
    return config.format.test(trackingNumber);
  }
  
  // Check against all formats if no provider specified
  return Object.values(TRACKING_FORMATS).some(config => 
    config.format.test(trackingNumber)
  );
}

/**
 * Get tracking URL for a provider
 */
export function getTrackingUrl(trackingNumber: string, provider: TrackingProvider): string {
  const urls = {
    fedex: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    ups: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    dhl: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
    custom: `#` // Custom tracking system
  };
  
  return urls[provider] || urls.custom;
}

/**
 * Auto-generate tracking number when order status changes to shipped
 */
export function shouldGenerateTrackingNumber(oldStatus: string, newStatus: string): boolean {
  return oldStatus !== 'shipped' && newStatus === 'shipped';
}

/**
 * Get provider display name
 */
export function getProviderDisplayName(provider: TrackingProvider): string {
  const names = {
    fedex: 'FedEx',
    ups: 'UPS',
    usps: 'USPS',
    dhl: 'DHL',
    custom: 'Custom'
  };
  
  return names[provider] || 'Custom';
} 