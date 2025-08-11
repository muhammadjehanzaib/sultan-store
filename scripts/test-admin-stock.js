const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testVariantStockManagement() {
  try {
    console.log('🧪 Testing variant stock management...\n');
    
    // 1. Show current stock levels
    console.log('1️⃣ Current variant stock levels:');
    const variants = await prisma.productVariant.findMany({
      include: {
        product: {
          select: { name_en: true }
        },
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
    
    variants.forEach(variant => {
      const attributeInfo = variant.attributeValues.map(av => 
        `${av.attributeValue.attribute.name}: ${av.attributeValue.label || av.attributeValue.value}`
      ).join(', ');
      
      console.log(`   - ${variant.product.name_en} (${attributeInfo}): ${variant.stockQuantity} units, inStock: ${variant.inStock}`);
    });
    
    if (variants.length === 0) {
      console.log('   ❌ No variants found');
      return;
    }
    
    // 2. Test stock adjustment via API simulation
    const testVariant = variants[0];
    const stockAdjustment = -1; // Reduce by 1
    
    console.log(`\n2️⃣ Testing stock adjustment on variant ${testVariant.id}:`);
    console.log(`   Before: ${testVariant.stockQuantity} units`);
    
    // Simulate API call
    const updatedVariant = await prisma.productVariant.update({
      where: { id: testVariant.id },
      data: {
        stockQuantity: Math.max(0, testVariant.stockQuantity + stockAdjustment),
        inStock: Math.max(0, testVariant.stockQuantity + stockAdjustment) > 0
      }
    });
    
    // Add stock history entry
    await prisma.stockHistory.create({
      data: {
        productId: testVariant.productId,
        change: stockAdjustment,
        reason: `Test adjustment: ${stockAdjustment}`
      }
    });
    
    console.log(`   After: ${updatedVariant.stockQuantity} units, inStock: ${updatedVariant.inStock}`);
    
    if (updatedVariant.stockQuantity === 0) {
      console.log('   🚫 Variant is now out of stock!');
    }
    
    // 3. Check if variant shows as out of stock in product display
    console.log('\n3️⃣ Testing variant availability check:');
    
    // Get the variant with full attribute data
    const variantWithAttributes = await prisma.productVariant.findUnique({
      where: { id: testVariant.id },
      include: {
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
    
    if (variantWithAttributes) {
      const selectedAttributes = {};
      variantWithAttributes.attributeValues.forEach(av => {
        selectedAttributes[av.attributeValue.attribute.id] = av.attributeValue.id;
      });
      
      console.log('   Selected attributes:', selectedAttributes);
      console.log(`   Variant availability: inStock=${variantWithAttributes.inStock}, stockQuantity=${variantWithAttributes.stockQuantity}`);
      
      const isAvailable = variantWithAttributes.inStock && variantWithAttributes.stockQuantity > 0;
      console.log(`   ✅ Should show in UI as: ${isAvailable ? 'Available' : 'Out of Stock'}`);
    }
    
    // 4. Show all current stock levels after test
    console.log('\n4️⃣ Final stock levels:');
    const finalVariants = await prisma.productVariant.findMany({
      include: {
        product: {
          select: { name_en: true }
        },
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
    
    finalVariants.forEach(variant => {
      const attributeInfo = variant.attributeValues.map(av => 
        `${av.attributeValue.attribute.name}: ${av.attributeValue.label || av.attributeValue.value}`
      ).join(', ');
      
      const status = variant.inStock && variant.stockQuantity > 0 ? '✅' : '🚫';
      console.log(`   ${status} ${variant.product.name_en} (${attributeInfo}): ${variant.stockQuantity} units`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVariantStockManagement();
