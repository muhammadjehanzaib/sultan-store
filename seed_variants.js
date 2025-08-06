
// Node.js script to seed database with variants
// Run with: node seed_full_database_with_variants.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stockHistory.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.variantAttributeValue.deleteMany();
  await prisma.attributeValue.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log('✅ Database cleared');
}

async function seedData() {
  console.log('🌱 Seeding data...');

  await prisma.category.createMany({
    data: [
      { id: 'cat-1', slug: 'electronics', name_en: 'Electronics', name_ar: 'الإلكترونيات', icon: '📱' },
      { id: 'cat-2', slug: 'fashion', name_en: 'Fashion', name_ar: 'الأزياء', icon: '👕' },
      { id: 'cat-3', slug: 'home', name_en: 'Home & Kitchen', name_ar: 'المنزل والمطبخ', icon: '🏠' }
    ]
  });

  await prisma.product.createMany({
    data: [
      {
        id: 'prod-4',
        slug: 'demo-t-shirt',
        name_en: 'Demo T-Shirt',
        name_ar: 'تيشيرت تجريبي',
        description_en: 'A demo t-shirt with multiple variants',
        description_ar: 'تيشيرت تجريبي مع عدة خيارات',
        image: '/images/products/tshirt.jpg',
        price: 25.99,
        categoryId: 'cat-2',
        inStock: true,
        rating: 4.0,
        reviews: 45
      }
    ]
  });

  await prisma.productAttribute.createMany({
    data: [
      { id: 'attr-4', productId: 'prod-4', name: 'Size', type: 'size' },
      { id: 'attr-5', productId: 'prod-4', name: 'Color', type: 'color' }
    ]
  });

  await prisma.attributeValue.createMany({
    data: [
      { id: 'val-11', attributeId: 'attr-4', value: 's', label: 'Small' },
      { id: 'val-12', attributeId: 'attr-4', value: 'm', label: 'Medium' },
      { id: 'val-13', attributeId: 'attr-4', value: 'l', label: 'Large', priceModifier: 2 },
      { id: 'val-14', attributeId: 'attr-4', value: 'xl', label: 'Extra Large', priceModifier: 4 },
      { id: 'val-15', attributeId: 'attr-5', value: 'blue', label: 'Blue', hexColor: '#0000FF' },
      { id: 'val-16', attributeId: 'attr-5', value: 'red', label: 'Red', hexColor: '#FF0000' },
      { id: 'val-17', attributeId: 'attr-5', value: 'green', label: 'Green', hexColor: '#008000' }
    ]
  });

  await prisma.productVariant.createMany({
    data: [
      { id: 'var-11', productId: 'prod-4', sku: 'TS-S-BLUE', price: 25.99, inStock: true, stockQuantity: 12 },
      { id: 'var-12', productId: 'prod-4', sku: 'TS-S-RED', price: 25.99, inStock: true, stockQuantity: 10 },
      { id: 'var-13', productId: 'prod-4', sku: 'TS-M-BLUE', price: 25.99, inStock: true, stockQuantity: 15 }
    ]
  });

await prisma.variantAttributeValue.createMany({
  data: [
    {
      variantId: "var-11",
      attributeValueId: "val-11"
    },
    {
      variantId: "var-11",
      attributeValueId: "val-15"
    },
    {
      variantId: "var-12",
      attributeValueId: "val-11"
    },
    {
      variantId: "var-12",
      attributeValueId: "val-16"
    },
    {
      variantId: "var-13",
      attributeValueId: "val-12"
    },
    {
      variantId: "var-13",
      attributeValueId: "val-15"
    }
  ]
});


  console.log('🎉 Database seeded successfully with attributes and variants!');
}

async function main() {
  try {
    await clearDatabase();
    await seedData();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
