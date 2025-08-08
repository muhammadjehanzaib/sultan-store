import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. Create Settings
  console.log('📝 Creating settings...');
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({
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
    console.log('✅ Settings created');
  } else {
    console.log('ℹ️  Settings already exist');
  }

  // 2. Create Admin Users
  console.log('👥 Creating users...');
  const testUsers = [
    {
      email: 'admin@saudisafety.com',
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin User',
      password: 'admin123',
      role: 'admin',
    },
    {
      email: 'manager@saudisafety.com',
      firstName: 'Manager',
      lastName: 'User',
      name: 'Manager User',
      password: 'manager123',
      role: 'manager',
    },
    {
      email: 'support@saudisafety.com',
      firstName: 'Support',
      lastName: 'Team',
      name: 'Support Team',
      password: 'support123',
      role: 'support',
    },
    {
      email: 'customer@example.com',
      firstName: 'Ahmed',
      lastName: 'Ali',
      name: 'Ahmed Ali',
      password: 'customer123',
      role: 'viewer',
    }
  ];

  for (const userData of testUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: userData.name,
        password: hashedPassword,
        role: userData.role,
      },
    });

    console.log(`✅ User: ${user.email} (${user.role})`);
  }

  // 3. Create Categories
  console.log('📂 Creating categories...');
  const categories = [
    {
      slug: 'electronics',
      name_en: 'Electronics',
      name_ar: 'الإلكترونيات',
      icon: '📱'
    },
    {
      slug: 'fashion',
      name_en: 'Fashion',
      name_ar: 'الأزياء',
      icon: '👕'
    },
    {
      slug: 'home-kitchen',
      name_en: 'Home & Kitchen',
      name_ar: 'المنزل والمطبخ',
      icon: '🏠'
    },
    {
      slug: 'sports',
      name_en: 'Sports & Outdoors',
      name_ar: 'الرياضة والهواء الطلق',
      icon: '⚽'
    },
    {
      slug: 'beauty',
      name_en: 'Beauty & Personal Care',
      name_ar: 'الجمال والعناية الشخصية',
      icon: '💄'
    },
    {
      slug: 'automotive',
      name_en: 'Automotive',
      name_ar: 'السيارات',
      icon: '🚗'
    }
  ];

  const createdCategories: any[] = [];
  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {
        name_en: categoryData.name_en,
        name_ar: categoryData.name_ar,
        icon: categoryData.icon,
      },
      create: categoryData,
    });
    createdCategories.push(category);
    console.log(`✅ Category: ${category.name_en}`);
  }

  // 4. Create Products
  console.log('📦 Creating products...');
  const products = [
    // Electronics
    {
      slug: 'iphone-15-pro',
      name_en: 'iPhone 15 Pro',
      name_ar: 'آيفون 15 برو',
      description_en: 'Latest iPhone with advanced camera system and A17 Pro chip',
      description_ar: 'أحدث آيفون مع نظام كاميرا متطور ومعالج A17 برو',
      image: '/images/products/iphone-15-pro.jpg',
      price: 4199.00,
      categorySlug: 'electronics',
    },
    {
      slug: 'samsung-tv-65-inch',
      name_en: 'Samsung 65" 4K Smart TV',
      name_ar: 'تلفزيون سامسونج ذكي 65 بوصة 4K',
      description_en: 'Crystal clear 4K display with smart TV features',
      description_ar: 'شاشة 4K فائقة الوضوح مع ميزات التلفزيون الذكي',
      image: '/images/products/samsung-tv.jpg',
      price: 2299.00,
      categorySlug: 'electronics',
    },
    {
      slug: 'airpods-pro-2',
      name_en: 'AirPods Pro (2nd generation)',
      name_ar: 'إيربودز برو (الجيل الثاني)',
      description_en: 'Active noise cancellation with transparency mode',
      description_ar: 'إلغاء نشط للضوضاء مع وضع الشفافية',
      image: '/images/products/airpods-pro.jpg',
      price: 899.00,
      categorySlug: 'electronics',
    },

    // Fashion
    {
      slug: 'nike-air-jordan',
      name_en: 'Nike Air Jordan 1 Retro',
      name_ar: 'نايك اير جوردان 1 ريترو',
      description_en: 'Classic basketball shoes with iconic design',
      description_ar: 'أحذية كرة سلة كلاسيكية بتصميم أيقوني',
      image: '/images/products/nike-jordan.jpg',
      price: 459.00,
      categorySlug: 'fashion',
    },
    {
      slug: 'adidas-tracksuit',
      name_en: 'Adidas Original Tracksuit',
      name_ar: 'بدلة رياضية أديداس أصلية',
      description_en: 'Comfortable tracksuit for daily wear and sports',
      description_ar: 'بدلة رياضية مريحة للارتداء اليومي والرياضة',
      image: '/images/products/adidas-tracksuit.jpg',
      price: 299.00,
      categorySlug: 'fashion',
    },
    {
      slug: 'leather-jacket',
      name_en: 'Premium Leather Jacket',
      name_ar: 'جاكيت جلد فاخر',
      description_en: 'High-quality genuine leather jacket',
      description_ar: 'جاكيت من الجلد الطبيعي عالي الجودة',
      image: '/images/products/leather-jacket.jpg',
      price: 599.00,
      categorySlug: 'fashion',
    },

    // Home & Kitchen
    {
      slug: 'coffee-machine',
      name_en: 'Nespresso Coffee Machine',
      name_ar: 'ماكينة قهوة نسبريسو',
      description_en: 'Professional espresso machine for perfect coffee',
      description_ar: 'ماكينة إسبريسو احترافية للقهوة المثالية',
      image: '/images/products/coffee-machine.jpg',
      price: 799.00,
      categorySlug: 'home-kitchen',
    },
    {
      slug: 'air-fryer',
      name_en: 'Digital Air Fryer 5L',
      name_ar: 'قلاية هوائية رقمية 5 لتر',
      description_en: 'Healthy cooking with 80% less oil',
      description_ar: 'طبخ صحي بزيت أقل بنسبة 80%',
      image: '/images/products/air-fryer.jpg',
      price: 199.00,
      categorySlug: 'home-kitchen',
    },
    {
      slug: 'blender-set',
      name_en: 'Professional Blender Set',
      name_ar: 'طقم خلاط احترافي',
      description_en: 'High-speed blender with multiple attachments',
      description_ar: 'خلاط عالي السرعة مع ملحقات متعددة',
      image: '/images/products/blender.jpg',
      price: 149.00,
      categorySlug: 'home-kitchen',
    },

    // Sports
    {
      slug: 'treadmill',
      name_en: 'Electric Treadmill',
      name_ar: 'جهاز المشي الكهربائي',
      description_en: 'Foldable electric treadmill for home fitness',
      description_ar: 'جهاز مشي كهربائي قابل للطي للياقة المنزلية',
      image: '/images/products/treadmill.jpg',
      price: 1299.00,
      categorySlug: 'sports',
    },
    {
      slug: 'dumbbells-set',
      name_en: 'Adjustable Dumbbells Set',
      name_ar: 'طقم دمبل قابل للتعديل',
      description_en: '20kg adjustable dumbbells for strength training',
      description_ar: 'دمبل قابل للتعديل 20 كيلو لتمارين القوة',
      image: '/images/products/dumbbells.jpg',
      price: 249.00,
      categorySlug: 'sports',
    },

    // Beauty
    {
      slug: 'skincare-set',
      name_en: 'Complete Skincare Set',
      name_ar: 'طقم العناية بالبشرة الكامل',
      description_en: 'Professional skincare routine for all skin types',
      description_ar: 'روتين عناية احترافي لجميع أنواع البشرة',
      image: '/images/products/skincare-set.jpg',
      price: 179.00,
      categorySlug: 'beauty',
    },
    {
      slug: 'hair-dryer',
      name_en: 'Professional Hair Dryer',
      name_ar: 'مجفف شعر احترافي',
      description_en: 'Ionic hair dryer with multiple heat settings',
      description_ar: 'مجفف شعر أيوني مع إعدادات حرارة متعددة',
      image: '/images/products/hair-dryer.jpg',
      price: 129.00,
      categorySlug: 'beauty',
    },

    // Automotive
    {
      slug: 'car-vacuum',
      name_en: 'Portable Car Vacuum Cleaner',
      name_ar: 'مكنسة كهربائية محمولة للسيارة',
      description_en: 'Powerful cordless vacuum for car interior cleaning',
      description_ar: 'مكنسة لاسلكية قوية لتنظيف داخل السيارة',
      image: '/images/products/car-vacuum.jpg',
      price: 89.00,
      categorySlug: 'automotive',
    },
    {
      slug: 'dash-cam',
      name_en: 'HD Dash Camera',
      name_ar: 'كاميرا تسجيل عالية الوضوح',
      description_en: '1080p dash camera with night vision',
      description_ar: 'كاميرا تسجيل 1080p مع رؤية ليلية',
      image: '/images/products/dash-cam.jpg',
      price: 199.00,
      categorySlug: 'automotive',
    },
  ];

  for (const productData of products) {
    const category = createdCategories.find(cat => cat.slug === productData.categorySlug);
    if (category) {
      const product = await prisma.product.upsert({
        where: { slug: productData.slug },
        update: {
          name_en: productData.name_en,
          name_ar: productData.name_ar,
          description_en: productData.description_en,
          description_ar: productData.description_ar,
          image: productData.image,
          price: productData.price,
        },
        create: {
          slug: productData.slug,
          name_en: productData.name_en,
          name_ar: productData.name_ar,
          description_en: productData.description_en,
          description_ar: productData.description_ar,
          image: productData.image,
          price: productData.price,
          inStock: true,
          rating: Math.random() * 2 + 3, // Random rating between 3-5
          reviews: Math.floor(Math.random() * 50) + 5, // Random reviews 5-55
          categoryId: category.id,
        },
      });
      console.log(`✅ Product: ${product.name_en} (${productData.price} SAR)`);

      // Create inventory for each product
      await prisma.inventory.upsert({
        where: { productId: product.id },
        update: {
          stock: Math.floor(Math.random() * 100) + 10, // Random stock 10-110
          stockThreshold: 5,
        },
        create: {
          productId: product.id,
          stock: Math.floor(Math.random() * 100) + 10,
          stockThreshold: 5,
        },
      });
    }
  }

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`👥 Users: ${testUsers.length}`);
  console.log(`📂 Categories: ${categories.length}`);
  console.log(`📦 Products: ${products.length}`);
  console.log('\n🔐 Admin Login:');
  console.log('Email: admin@saudisafety.com');
  console.log('Password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
