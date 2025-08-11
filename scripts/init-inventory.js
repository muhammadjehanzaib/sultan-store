const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeStock() {
  try {
    console.log('🔧 Initializing variant stock quantities...');
    
    // Update all variants to have some stock
    const result = await prisma.productVariant.updateMany({
      data: {
        stockQuantity: 5, // Set each variant to 5 items in stock
        inStock: true
      }
    });
    
    console.log(`✅ Updated ${result.count} variants with stock quantity 5`);
    
    // List all variants with their current stock
    const variants = await prisma.productVariant.findMany({
      include: {
        product: {
          select: {
            name_en: true
          }
        }
      }
    });
    
    console.log('\n📦 Current variant stock levels:');
    variants.forEach(variant => {
      console.log(`- ${variant.product.name_en} (Variant ${variant.id}): ${variant.stockQuantity} units, inStock: ${variant.inStock}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeStock();
