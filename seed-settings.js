const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if settings already exist
    const existingSettings = await prisma.settings.findFirst();
    
    if (existingSettings) {
      console.log('Settings already exist:', existingSettings);
      return;
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

    console.log('✅ Default settings created successfully:');
    console.log('- Tax Rate: 15% VAT');
    console.log('- Shipping: 15 SAR');
    console.log('- Free Shipping: Over 50 SAR');
    console.log('- Business: SaudiSafety');
    
  } catch (error) {
    console.error('❌ Error seeding settings:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
