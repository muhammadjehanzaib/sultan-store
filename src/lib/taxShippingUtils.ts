import prisma from '@/lib/prisma';

// Cache settings for performance
let cachedSettings: any = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getSettings() {
  const now = Date.now();
  
  // Return cached settings if still valid
  if (cachedSettings && (now - cacheTime) < CACHE_DURATION) {
    return cachedSettings;
  }
  
  try {
    let settings = await prisma.settings.findFirst();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.settings.create({
        data: {}
      });
    }
    
    // Update cache
    cachedSettings = settings;
    cacheTime = now;
    
    return settings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    
    // Return default values if database fails
    return {
      taxRate: 0.15,
      shippingRate: 15.0,
      freeShippingThreshold: 50.0
    };
  }
}

export interface OrderCalculation {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  shippingRate: number;
  shippingAmount: number;
  total: number;
  freeShippingApplied: boolean;
}

export async function calculateOrderTotals(
  subtotal: number, 
  shippingCountry: string = 'SA'
): Promise<OrderCalculation> {
  const settings = await getSettings();
  
  // Calculate tax
  const taxRate = settings.taxRate;
  const taxAmount = subtotal * taxRate;
  
  // Calculate shipping
  let shippingAmount = 0;
  let freeShippingApplied = false;
  
  if (subtotal >= settings.freeShippingThreshold) {
    freeShippingApplied = true;
    shippingAmount = 0;
  } else {
    shippingAmount = settings.shippingRate;
  }
  
  // Calculate total
  const total = subtotal + taxAmount + shippingAmount;
  
  return {
    subtotal,
    taxRate,
    taxAmount: Math.round(taxAmount * 100) / 100, // Round to 2 decimal places
    shippingRate: settings.shippingRate,
    shippingAmount: Math.round(shippingAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    freeShippingApplied
  };
}

export async function calculateCartTotals(cartItems: any[]): Promise<OrderCalculation> {
  // Calculate subtotal from cart items
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.variantPrice || item.product.price;
    return sum + (price * item.quantity);
  }, 0);
  
  return calculateOrderTotals(subtotal);
}

// Helper function to format currency
export function formatCurrency(amount: number, currency: string = 'SAR'): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
}

// Helper function to get tax display info
export async function getTaxInfo() {
  const settings = await getSettings();
  return {
    rate: settings.taxRate,
    percentage: Math.round(settings.taxRate * 100),
    name: 'VAT'
  };
}

// Helper function to get shipping info
export async function getShippingInfo() {
  const settings = await getSettings();
  
  // Debug logging (remove in production)
  console.log('Database settings in getShippingInfo:', settings);
  
  return {
    rate: settings.shippingRate,
    freeThreshold: settings.freeShippingThreshold,
    freeShippingMessage: `Free shipping on orders over ${formatCurrency(settings.freeShippingThreshold)}`
  };
}

// Clear cache (useful for testing or after settings update)
export function clearSettingsCache() {
  cachedSettings = null;
  cacheTime = 0;
}
