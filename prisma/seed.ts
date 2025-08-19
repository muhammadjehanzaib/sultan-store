import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {

  // 1. Create Settings
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
  } else {
  }

  // 2. Create Admin Users
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

  }

  // 3. Create Categories (Main Categories)
  const mainCategories = [
    {
      slug: 'electronics',
      name_en: 'Electronics',
      name_ar: 'الإلكترونيات',
      icon: '📱',
      level: 0,
      sortOrder: 1
    },
    {
      slug: 'fashion',
      name_en: 'Fashion',
      name_ar: 'الأزياء',
      icon: '👕',
      level: 0,
      sortOrder: 2
    },
    {
      slug: 'home-kitchen',
      name_en: 'Home & Kitchen',
      name_ar: 'المنزل والمطبخ',
      icon: '🏠',
      level: 0,
      sortOrder: 3
    },
    {
      slug: 'sports',
      name_en: 'Sports & Outdoors',
      name_ar: 'الرياضة والهواء الطلق',
      icon: '⚽',
      level: 0,
      sortOrder: 4
    },
    {
      slug: 'beauty',
      name_en: 'Beauty & Personal Care',
      name_ar: 'الجمال والعناية الشخصية',
      icon: '💄',
      level: 0,
      sortOrder: 5
    },
    {
      slug: 'automotive',
      name_en: 'Automotive',
      name_ar: 'السيارات',
      icon: '🚗',
      level: 0,
      sortOrder: 6
    }
  ];

  const createdCategories: any[] = [];
  for (const categoryData of mainCategories) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {
        name_en: categoryData.name_en,
        name_ar: categoryData.name_ar,
        icon: categoryData.icon,
        level: categoryData.level,
        sortOrder: categoryData.sortOrder,
        path: categoryData.slug,
      },
      create: {
        ...categoryData,
        path: categoryData.slug,
      },
    });
    createdCategories.push(category);
  }

  // Create Subcategories
  const subcategories = [
    // Electronics Subcategories
    {
      slug: 'smartphones',
      name_en: 'Smartphones',
      name_ar: 'الهواتف الذكية',
      parentSlug: 'electronics',
      level: 1,
      sortOrder: 1
    },
    {
      slug: 'laptops',
      name_en: 'Laptops & Computers',
      name_ar: 'أجهزة الكمبيوتر المحمولة',
      parentSlug: 'electronics',
      level: 1,
      sortOrder: 2
    },
    {
      slug: 'tv-audio',
      name_en: 'TV & Audio',
      name_ar: 'التلفزيون والصوت',
      parentSlug: 'electronics',
      level: 1,
      sortOrder: 3
    },
    {
      slug: 'accessories',
      name_en: 'Electronics Accessories',
      name_ar: 'إكسسوارات الإلكترونيات',
      parentSlug: 'electronics',
      level: 1,
      sortOrder: 4
    },
    
    // Fashion Subcategories
    {
      slug: 'mens-clothing',
      name_en: "Men's Clothing",
      name_ar: 'ملابس الرجال',
      parentSlug: 'fashion',
      level: 1,
      sortOrder: 1
    },
    {
      slug: 'womens-clothing',
      name_en: "Women's Clothing",
      name_ar: 'ملابس النساء',
      parentSlug: 'fashion',
      level: 1,
      sortOrder: 2
    },
    {
      slug: 'shoes',
      name_en: 'Shoes',
      name_ar: 'الأحذية',
      parentSlug: 'fashion',
      level: 1,
      sortOrder: 3
    },
    {
      slug: 'bags-accessories',
      name_en: 'Bags & Accessories',
      name_ar: 'الحقائب والإكسسوارات',
      parentSlug: 'fashion',
      level: 1,
      sortOrder: 4
    },
    
    // Home & Kitchen Subcategories
    {
      slug: 'kitchen-appliances',
      name_en: 'Kitchen Appliances',
      name_ar: 'أجهزة المطبخ',
      parentSlug: 'home-kitchen',
      level: 1,
      sortOrder: 1
    },
    {
      slug: 'furniture',
      name_en: 'Furniture',
      name_ar: 'الأثاث',
      parentSlug: 'home-kitchen',
      level: 1,
      sortOrder: 2
    },
    {
      slug: 'home-decor',
      name_en: 'Home Decor',
      name_ar: 'ديكور المنزل',
      parentSlug: 'home-kitchen',
      level: 1,
      sortOrder: 3
    },
    {
      slug: 'bedding-bath',
      name_en: 'Bedding & Bath',
      name_ar: 'أغطية السرير والحمام',
      parentSlug: 'home-kitchen',
      level: 1,
      sortOrder: 4
    },
    
    // Sports Subcategories
    {
      slug: 'fitness-equipment',
      name_en: 'Fitness Equipment',
      name_ar: 'معدات اللياقة البدنية',
      parentSlug: 'sports',
      level: 1,
      sortOrder: 1
    },
    {
      slug: 'outdoor-sports',
      name_en: 'Outdoor Sports',
      name_ar: 'الرياضات الخارجية',
      parentSlug: 'sports',
      level: 1,
      sortOrder: 2
    },
    {
      slug: 'activewear',
      name_en: 'Activewear',
      name_ar: 'الملابس الرياضية',
      parentSlug: 'sports',
      level: 1,
      sortOrder: 3
    }
  ];

  for (const subcatData of subcategories) {
    const parentCategory = createdCategories.find(cat => cat.slug === subcatData.parentSlug);
    if (parentCategory) {
      const subcat = await prisma.category.upsert({
        where: { slug: subcatData.slug },
        update: {
          name_en: subcatData.name_en,
          name_ar: subcatData.name_ar,
          level: subcatData.level,
          sortOrder: subcatData.sortOrder,
          parentId: parentCategory.id,
          path: `${parentCategory.path}/${subcatData.slug}`,
        },
        create: {
          slug: subcatData.slug,
          name_en: subcatData.name_en,
          name_ar: subcatData.name_ar,
          level: subcatData.level,
          sortOrder: subcatData.sortOrder,
          parentId: parentCategory.id,
          path: `${parentCategory.path}/${subcatData.slug}`,
        },
      });
      createdCategories.push(subcat);
    }
  }

  // 4. Create Products
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

}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
