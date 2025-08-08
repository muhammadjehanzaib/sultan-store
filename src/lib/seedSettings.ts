import prisma from '@/lib/prisma';

export async function seedSettings() {
  try {
    // Check if settings already exist
    const existingSettings = await prisma.settings.findFirst();
    
    if (existingSettings) {
      console.log('Settings already exist, skipping seed');
      return existingSettings;
    }

    // Create default settings
    const settings = await prisma.settings.create({
      data: {
        taxRate: 0.15,              // 15% VAT
        shippingRate: 15.0,         // 15 SAR shipping
        freeShippingThreshold: 50.0, // Free shipping over 50 SAR
        businessName: 'SaudiSafety',
        businessEmail: 'support@saudisafety.com',
        businessPhone: '+966 XXX XXXX',
        businessAddress: 'Riyadh, Saudi Arabia'
      }
    });

    console.log('Default settings created:', settings);
    return settings;
  } catch (error) {
    console.error('Error seeding settings:', error);
    throw error;
  }
}
