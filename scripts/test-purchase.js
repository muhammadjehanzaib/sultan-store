const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simulatePurchase() {
  try {
    console.log('🛒 Simulating a purchase...');
    
    // Get the first variant
    const firstVariant = await prisma.productVariant.findFirst({
      include: {
        product: true,
        attributeValues: {
          include: {
            attributeValue: {
              include: {
                attribute: true
              }
            }
          }
        }
      }
    });
    
    if (!firstVariant) {
      console.log('❌ No variants found');
      return;
    }
    
    console.log(`📦 Before purchase - Variant ${firstVariant.id}: ${firstVariant.stockQuantity} units`);
    
    // Build selectedAttributes for this variant
    const selectedAttributes = {};
    firstVariant.attributeValues.forEach(av => {
      selectedAttributes[av.attributeValue.attribute.id] = av.attributeValue.id;
    });
    
    console.log('🔍 Selected attributes:', selectedAttributes);
    
    // Simulate the inventory update logic from checkout
    const quantityToPurchase = 1;
    const newStockQuantity = Math.max(0, firstVariant.stockQuantity - quantityToPurchase);
    const shouldMarkOutOfStock = newStockQuantity === 0;
    
    // Update variant stock
    const updatedVariant = await prisma.productVariant.update({
      where: { id: firstVariant.id },
      data: {
        stockQuantity: newStockQuantity,
        inStock: !shouldMarkOutOfStock
      }
    });
    
    console.log(`📦 After purchase - Variant ${updatedVariant.id}: ${updatedVariant.stockQuantity} units, inStock: ${updatedVariant.inStock}`);
    
    if (shouldMarkOutOfStock) {
      console.log('🚫 This variant is now out of stock!');
    }
    
    // Show all current stock levels
    const allVariants = await prisma.productVariant.findMany({
      include: {
        product: {
          select: {
            name_en: true
          }
        }
      }
    });
    
    console.log('\n📦 All variant stock levels:');
    allVariants.forEach(variant => {
      console.log(`- ${variant.product.name_en} (${variant.id}): ${variant.stockQuantity} units, inStock: ${variant.inStock}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simulatePurchase();
