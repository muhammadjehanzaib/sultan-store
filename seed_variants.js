// Node.js script to seed database with variants
// Run with: node seed_variants.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');
  
  await prisma.stockHistory.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.attributeValue.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  
  console.log('✅ Database cleared');
}

async function seedData() {
  console.log('🌱 Seeding data...');
  
  // Insert categories
  const categories = await prisma.category.createMany({
    data: [
      { id: 'cat-1', slug: 'electronics', name_en: 'Electronics', name_ar: 'الإلكترونيات', icon: '📱' },
      { id: 'cat-2', slug: 'fashion', name_en: 'Fashion', name_ar: 'الأزياء', icon: '👕' },
      { id: 'cat-3', slug: 'home', name_en: 'Home & Kitchen', name_ar: 'المنزل والمطبخ', icon: '🏠' }
    ]
  });
  console.log(`✅ Created ${categories.count} categories`);
  
  // Insert products
  const products = await prisma.product.createMany({
    data: [
      {
        id: 'prod-1',
        slug: 'wireless-headphones',
        name_en: 'Wireless Headphones',
        name_ar: 'سماعات لاسلكية',
        description_en: 'High-quality wireless headphones with noise cancellation',
        description_ar: 'سماعات لاسلكية عالية الجودة مع إلغاء الضوضاء',
        image: '/images/products/headphones.jpg',
        price: 99.99,
        categoryId: 'cat-1',
        inStock: true,
        rating: 4.5,
        reviews: 128
      },
      {
        id: 'prod-2',
        slug: 'running-shoes',
        name_en: 'Running Shoes',
        name_ar: 'أحذية الجري',
        description_en: 'Lightweight running shoes with superior comfort',
        description_ar: 'أحذية جري خفيفة الوزن مع راحة فائقة',
        image: '/images/products/running-shoes.jpg',
        price: 129.99,
        categoryId: 'cat-2',
        inStock: true,
        rating: 4.2,
        reviews: 156
      },
      {
        id: 'prod-3',
        slug: 'coffee-maker',
        name_en: 'Coffee Maker',
        name_ar: 'صانعة القهوة',
        description_en: 'Programmable coffee maker with timer',
        description_ar: 'صانعة قهوة قابلة للبرمجة مع مؤقت',
        image: '/images/products/coffee-maker.jpg',
        price: 79.99,
        categoryId: 'cat-3',
        inStock: true,
        rating: 4.7,
        reviews: 203
      },
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
  console.log(`✅ Created ${products.count} products`);
  
  // Insert product attributes
  const attributes = await prisma.productAttribute.createMany({
    data: [
      { id: 'attr-1', productId: 'prod-1', name: 'Color', type: 'color' },
      { id: 'attr-2', productId: 'prod-2', name: 'Size', type: 'size' },
      { id: 'attr-3', productId: 'prod-2', name: 'Color', type: 'color' },
      { id: 'attr-4', productId: 'prod-4', name: 'Size', type: 'size' },
      { id: 'attr-5', productId: 'prod-4', name: 'Color', type: 'color' }
    ]
  });
  console.log(`✅ Created ${attributes.count} product attributes`);
  
  // Insert attribute values
  const attributeValues = await prisma.attributeValue.createMany({
    data: [
      // Headphones colors
      { id: 'val-1', attributeId: 'attr-1', value: 'black', label: 'Black', hexColor: '#000000' },
      { id: 'val-2', attributeId: 'attr-1', value: 'white', label: 'White', hexColor: '#FFFFFF' },
      { id: 'val-3', attributeId: 'attr-1', value: 'silver', label: 'Silver', hexColor: '#C0C0C0', priceModifier: 5 },
      
      // Running shoes sizes
      { id: 'val-4', attributeId: 'attr-2', value: 'us7', label: 'US 7' },
      { id: 'val-5', attributeId: 'attr-2', value: 'us8', label: 'US 8' },
      { id: 'val-6', attributeId: 'attr-2', value: 'us9', label: 'US 9' },
      { id: 'val-7', attributeId: 'attr-2', value: 'us10', label: 'US 10', inStock: false },
      
      // Running shoes colors
      { id: 'val-8', attributeId: 'attr-3', value: 'black', label: 'Black', hexColor: '#000000' },
      { id: 'val-9', attributeId: 'attr-3', value: 'white', label: 'White', hexColor: '#FFFFFF' },
      { id: 'val-10', attributeId: 'attr-3', value: 'red', label: 'Red', hexColor: '#FF0000' },
      
      // T-shirt sizes
      { id: 'val-11', attributeId: 'attr-4', value: 's', label: 'Small' },
      { id: 'val-12', attributeId: 'attr-4', value: 'm', label: 'Medium' },
      { id: 'val-13', attributeId: 'attr-4', value: 'l', label: 'Large', priceModifier: 2 },
      { id: 'val-14', attributeId: 'attr-4', value: 'xl', label: 'Extra Large', priceModifier: 4 },
      
      // T-shirt colors
      { id: 'val-15', attributeId: 'attr-5', value: 'blue', label: 'Blue', hexColor: '#0000FF' },
      { id: 'val-16', attributeId: 'attr-5', value: 'red', label: 'Red', hexColor: '#FF0000' },
      { id: 'val-17', attributeId: 'attr-5', value: 'green', label: 'Green', hexColor: '#008000' }
    ]
  });
  console.log(`✅ Created ${attributeValues.count} attribute values`);
  
  // Insert product variants
  const variants = await prisma.productVariant.createMany({
    data: [
      // Wireless Headphones variants
      { id: 'var-1', productId: 'prod-1', sku: 'WH-BLACK', inStock: true, stockQuantity: 20, attributeValues: { "Color": "Black" } },
      { id: 'var-2', productId: 'prod-1', sku: 'WH-WHITE', inStock: true, stockQuantity: 15, attributeValues: { "Color": "White" } },
      { id: 'var-3', productId: 'prod-1', sku: 'WH-SILVER', price: 104.99, inStock: true, stockQuantity: 8, attributeValues: { "Color": "Silver" } },
      
      // Running Shoes variants
      { id: 'var-4', productId: 'prod-2', sku: 'RS-US7-BLACK', inStock: true, stockQuantity: 5, attributeValues: { "Size": "US 7", "Color": "Black" } },
      { id: 'var-5', productId: 'prod-2', sku: 'RS-US7-WHITE', inStock: true, stockQuantity: 3, attributeValues: { "Size": "US 7", "Color": "White" } },
      { id: 'var-6', productId: 'prod-2', sku: 'RS-US8-BLACK', inStock: true, stockQuantity: 8, attributeValues: { "Size": "US 8", "Color": "Black" } },
      { id: 'var-7', productId: 'prod-2', sku: 'RS-US8-WHITE', inStock: true, stockQuantity: 6, attributeValues: { "Size": "US 8", "Color": "White" } },
      { id: 'var-8', productId: 'prod-2', sku: 'RS-US8-RED', inStock: true, stockQuantity: 4, attributeValues: { "Size": "US 8", "Color": "Red" } },
      { id: 'var-9', productId: 'prod-2', sku: 'RS-US9-BLACK', inStock: true, stockQuantity: 10, attributeValues: { "Size": "US 9", "Color": "Black" } },
      { id: 'var-10', productId: 'prod-2', sku: 'RS-US9-WHITE', inStock: true, stockQuantity: 7, attributeValues: { "Size": "US 9", "Color": "White" } },
      
      // T-shirt variants
      { id: 'var-11', productId: 'prod-4', sku: 'TS-S-BLUE', inStock: true, stockQuantity: 12, attributeValues: { "Size": "Small", "Color": "Blue" } },
      { id: 'var-12', productId: 'prod-4', sku: 'TS-S-RED', inStock: true, stockQuantity: 10, attributeValues: { "Size": "Small", "Color": "Red" } },
      { id: 'var-13', productId: 'prod-4', sku: 'TS-M-BLUE', inStock: true, stockQuantity: 15, attributeValues: { "Size": "Medium", "Color": "Blue" } },
      { id: 'var-14', productId: 'prod-4', sku: 'TS-M-RED', inStock: true, stockQuantity: 8, attributeValues: { "Size": "Medium", "Color": "Red" } },
      { id: 'var-15', productId: 'prod-4', sku: 'TS-M-GREEN', inStock: true, stockQuantity: 6, attributeValues: { "Size": "Medium", "Color": "Green" } },
      { id: 'var-16', productId: 'prod-4', sku: 'TS-L-BLUE', price: 27.99, inStock: true, stockQuantity: 5, attributeValues: { "Size": "Large", "Color": "Blue" } },
      { id: 'var-17', productId: 'prod-4', sku: 'TS-L-RED', price: 27.99, inStock: true, stockQuantity: 3, attributeValues: { "Size": "Large", "Color": "Red" } },
      { id: 'var-18', productId: 'prod-4', sku: 'TS-XL-BLUE', price: 29.99, inStock: true, stockQuantity: 2, attributeValues: { "Size": "Extra Large", "Color": "Blue" } }
    ]
  });
  console.log(`✅ Created ${variants.count} product variants`);
  
  // Insert inventory data
  const inventory = await prisma.inventory.createMany({
    data: [
      { id: 'inv-1', productId: 'prod-1', stock: 43, stockThreshold: 10 }, // Total: 20+15+8=43
      { id: 'inv-2', productId: 'prod-2', stock: 43, stockThreshold: 15 }, // Total: 5+3+8+6+4+10+7=43
      { id: 'inv-3', productId: 'prod-3', stock: 50, stockThreshold: 15 }, // Coffee maker (no variants)
      { id: 'inv-4', productId: 'prod-4', stock: 61, stockThreshold: 20 }  // Total: 12+10+15+8+6+5+3+2=61
    ]
  });
  console.log(`✅ Created ${inventory.count} inventory records`);
  
  // Insert stock history
  const stockHistory = await prisma.stockHistory.createMany({
    data: [
      { id: 'hist-1', productId: 'prod-1', change: 43, reason: 'Initial stock with variants' },
      { id: 'hist-2', productId: 'prod-2', change: 50, reason: 'Initial stock' },
      { id: 'hist-3', productId: 'prod-2', change: -7, reason: 'Sales' },
      { id: 'hist-4', productId: 'prod-3', change: 50, reason: 'Initial stock' },
      { id: 'hist-5', productId: 'prod-4', change: 70, reason: 'Initial stock' },
      { id: 'hist-6', productId: 'prod-4', change: -9, reason: 'Sales' }
    ]
  });
  console.log(`✅ Created ${stockHistory.count} stock history entries`);
  
  console.log('🎉 Database seeded successfully with variants!');
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
