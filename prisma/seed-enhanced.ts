import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to generate random date within last N days
const randomDateWithinDays = (days: number) => {
  const now = new Date();
  const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const randomTime = pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime());
  return new Date(randomTime);
};

// Helper function to generate random number between min and max
const randomBetween = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1)) + min;

async function enhancedSeed() {

  try {
    // 1. Create Settings
    const settings = await prisma.settings.upsert({
      where: { id: '1' },
      update: {},
      create: {
        id: '1',
        taxRate: 0.15,
        shippingRate: 15.0,
        freeShippingThreshold: 500.0,
        businessName: 'SaudiSafety',
        businessEmail: 'support@saudisafety.com',
        businessPhone: '+966 11 123 4567',
        businessAddress: 'King Fahd Road, Riyadh, Saudi Arabia',
        codFee: 25.0
      }
    });

    // 2. Create Admin Users
    const adminUsers = [
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
      }
    ];

    const createdAdmins: any[] = [];
    for (const userData of adminUsers) {
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
      createdAdmins.push(user);
    }

    // 3. Create Hierarchical Categories
    
    // Main categories
    const electronics = await prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        slug: 'electronics',
        name_en: 'Electronics',
        name_ar: 'الإلكترونيات',
        description_en: 'Latest electronic devices and gadgets',
        description_ar: 'أحدث الأجهزة والقاجيتس الإلكترونية',
        icon: '📱',
        level: 0,
        path: 'electronics',
        sortOrder: 1,
        isActive: true,
        metaTitle_en: 'Electronics - Latest Gadgets & Devices',
        metaTitle_ar: 'إلكترونيات - أحدث الأجهزة والقاجيتس'
      }
    });

    const fashion = await prisma.category.upsert({
      where: { slug: 'fashion' },
      update: {},
      create: {
        slug: 'fashion',
        name_en: 'Fashion',
        name_ar: 'الأزياء',
        description_en: 'Clothing, shoes and fashion accessories',
        description_ar: 'الملابس والأحذية وإكسسوارات الموضة',
        icon: '👕',
        level: 0,
        path: 'fashion',
        sortOrder: 2,
        isActive: true,
        metaTitle_en: 'Fashion - Clothing & Accessories',
        metaTitle_ar: 'أزياء - ملابس وإكسسوارات'
      }
    });

    const homeKitchen = await prisma.category.upsert({
      where: { slug: 'home-kitchen' },
      update: {},
      create: {
        slug: 'home-kitchen',
        name_en: 'Home & Kitchen',
        name_ar: 'المنزل والمطبخ',
        description_en: 'Home appliances and kitchen essentials',
        description_ar: 'الأجهزة المنزلية وأساسيات المطبخ',
        icon: '🏠',
        level: 0,
        path: 'home-kitchen',
        sortOrder: 3,
        isActive: true,
        metaTitle_en: 'Home & Kitchen - Appliances & Essentials',
        metaTitle_ar: 'المنزل والمطبخ - أجهزة وأساسيات'
      }
    });

    const sports = await prisma.category.upsert({
      where: { slug: 'sports' },
      update: {},
      create: {
        slug: 'sports',
        name_en: 'Sports & Outdoors',
        name_ar: 'الرياضة والهواء الطلق',
        description_en: 'Sports equipment and outdoor gear',
        description_ar: 'معدات رياضية ومعدات الهواء الطلق',
        icon: '⚽',
        level: 0,
        path: 'sports',
        sortOrder: 4,
        isActive: true,
        metaTitle_en: 'Sports & Outdoors - Equipment & Gear',
        metaTitle_ar: 'الرياضة والهواء الطلق - معدات وأدوات'
      }
    });

    const beauty = await prisma.category.upsert({
      where: { slug: 'beauty' },
      update: {},
      create: {
        slug: 'beauty',
        name_en: 'Beauty & Personal Care',
        name_ar: 'الجمال والعناية الشخصية',
        description_en: 'Beauty products and personal care items',
        description_ar: 'منتجات التجميل وعناصر العناية الشخصية',
        icon: '💄',
        level: 0,
        path: 'beauty',
        sortOrder: 5,
        isActive: true,
        metaTitle_en: 'Beauty & Personal Care - Cosmetics & Skincare',
        metaTitle_ar: 'الجمال والعناية الشخصية - مستحضرات تجميل وعناية'
      }
    });

    const automotive = await prisma.category.upsert({
      where: { slug: 'automotive' },
      update: {},
      create: {
        slug: 'automotive',
        name_en: 'Automotive',
        name_ar: 'السيارات',
        description_en: 'Car accessories and automotive parts',
        description_ar: 'إكسسوارات السيارات وقطع غيار السيارات',
        icon: '🚗',
        level: 0,
        path: 'automotive',
        sortOrder: 6,
        isActive: true,
        metaTitle_en: 'Automotive - Car Accessories & Parts',
        metaTitle_ar: 'السيارات - إكسسوارات وقطع غيار'
      }
    });

    const categories = [electronics, fashion, homeKitchen, sports, beauty, automotive];

    // Create subcategories
    const smartphones = await prisma.category.upsert({
      where: { slug: 'smartphones' },
      update: {},
      create: {
        slug: 'smartphones',
        name_en: 'Smartphones',
        name_ar: 'الهواتف الذكية',
        description_en: 'Mobile phones and accessories',
        description_ar: 'الهواتف المحمولة والإكسسوارات',
        icon: '📱',
        parentId: electronics.id,
        level: 1,
        path: 'electronics/smartphones',
        sortOrder: 1,
        isActive: true
      }
    });


    // 4. Create Comprehensive Product Catalog
    const products = [
      // Electronics - High value items
      {
        slug: 'iphone-15-pro-max',
        name_en: 'iPhone 15 Pro Max 256GB',
        name_ar: 'آيفون 15 برو ماكس 256 جيجابايت',
        description_en: 'Latest iPhone with titanium build, advanced camera system, and A17 Pro chip. Features ProRAW photography, Action Button, and USB-C connectivity.',
        description_ar: 'أحدث آيفون مع هيكل تيتانيوم ونظام كاميرا متطور ومعالج A17 برو. يتميز بتصوير ProRAW وزر العمل واتصال USB-C.',
        image: '/images/products/iphone-15-pro-max.jpg',
        price: 4999.00,
        salePrice: 4699.00,
        discountPercent: 6,
        onSale: true,
        categoryId: electronics.id,
        stock: randomBetween(8, 15),
        stockThreshold: 10,
        rating: 4.8,
        reviews: randomBetween(150, 300)
      },
      {
        slug: 'macbook-pro-16-m3',
        name_en: 'MacBook Pro 16" M3 Pro',
        name_ar: 'ماك بوك برو 16 بوصة M3 برو',
        description_en: 'Professional laptop with M3 Pro chip, 18GB unified memory, 512GB SSD. Perfect for creative professionals and developers.',
        description_ar: 'لابتوب احترافي بمعالج M3 برو، 18 جيجا ذاكرة موحدة، 512 جيجا SSD. مثالي للمبدعين المحترفين والمطورين.',
        image: '/images/products/macbook-pro-16.jpg',
        price: 8999.00,
        categoryId: electronics.id,
        stock: randomBetween(2, 5), // Critical stock
        stockThreshold: 5,
        rating: 4.9,
        reviews: randomBetween(80, 150)
      },
      {
        slug: 'samsung-galaxy-s24-ultra',
        name_en: 'Samsung Galaxy S24 Ultra',
        name_ar: 'سامسونج جالاكسي S24 الترا',
        description_en: 'Premium Android phone with built-in S Pen, 200MP camera with AI zoom, and titanium frame for durability.',
        description_ar: 'هاتف أندرويد فاخر مع قلم S مدمج، كاميرا 200 ميجابكسل مع تقريب ذكي، وإطار تيتانيوم للمتانة.',
        image: '/images/products/galaxy-s24-ultra.jpg',
        price: 4299.00,
        salePrice: 3999.00,
        discountPercent: 7,
        onSale: true,
        categoryId: electronics.id,
        stock: randomBetween(25, 45),
        stockThreshold: 15,
        rating: 4.7,
        reviews: randomBetween(200, 400)
      },
      {
        slug: 'airpods-pro-3',
        name_en: 'AirPods Pro (3rd generation)',
        name_ar: 'إيربودز برو (الجيل الثالث)',
        description_en: 'Advanced noise cancellation with Adaptive Transparency, spatial audio, and MagSafe charging case.',
        description_ar: 'إلغاء ضوضاء متقدم مع شفافية تكيفية، صوت مكاني، وعلبة شحن MagSafe.',
        image: '/images/products/airpods-pro-3.jpg',
        price: 999.00,
        categoryId: electronics.id,
        stock: randomBetween(35, 65),
        stockThreshold: 20,
        rating: 4.6,
        reviews: randomBetween(300, 500)
      },
      {
        slug: 'lg-oled-77-c4',
        name_en: 'LG OLED 77" C4 Smart TV',
        name_ar: 'تلفزيون LG OLED ذكي 77 بوصة C4',
        description_en: '4K OLED TV with perfect blacks, Dolby Vision IQ, webOS smart platform, and 120Hz gaming features.',
        description_ar: 'تلفزيون OLED 4K مع سواد مثالي، Dolby Vision IQ، منصة webOS الذكية، وميزات الألعاب 120Hz.',
        image: '/images/products/lg-oled-77.jpg',
        price: 7299.00,
        categoryId: electronics.id,
        stock: randomBetween(3, 8), // Low stock
        stockThreshold: 5,
        rating: 4.8,
        reviews: randomBetween(50, 120)
      },

      // Fashion - Popular items
      {
        slug: 'nike-air-jordan-retro-high',
        name_en: 'Nike Air Jordan 1 Retro High OG',
        name_ar: 'نايك اير جوردان 1 ريترو هاي OG',
        description_en: 'Iconic basketball sneakers with premium leather construction and classic colorway. A timeless design that never goes out of style.',
        description_ar: 'أحذية كرة سلة أيقونية بتصميم جلد فاخر وتلوين كلاسيكي. تصميم خالد لا يخرج عن الموضة أبداً.',
        image: '/images/products/jordan-retro.jpg',
        price: 599.00,
        categoryId: fashion.id,
        stock: randomBetween(40, 70),
        stockThreshold: 15,
        rating: 4.7,
        reviews: randomBetween(400, 600)
      },
      {
        slug: 'adidas-ultraboost-22',
        name_en: 'Adidas Ultraboost 22',
        name_ar: 'أديداس الترابوست 22',
        description_en: 'Premium running shoes with responsive Boost midsole, Primeknit upper, and Continental rubber outsole.',
        description_ar: 'أحذية جري فاخرة مع نعل أوسط Boost مستجيب، جزء علوي Primeknit، ونعل خارجي مطاطي Continental.',
        image: '/images/products/ultraboost-22.jpg',
        price: 799.00,
        categoryId: fashion.id,
        stock: randomBetween(80, 120), // Overstock
        stockThreshold: 20,
        rating: 4.5,
        reviews: randomBetween(250, 400)
      },
      {
        slug: 'levi-501-original-jeans',
        name_en: 'Levi\'s 501 Original Fit Jeans',
        name_ar: 'جينز ليفايز 501 قصة أصلية',
        description_en: 'The original blue jeans with classic straight fit, button fly, and authentic vintage styling.',
        description_ar: 'الجينز الأزرق الأصلي بقصة مستقيمة كلاسيكية، أزرار، وتصميم قديم أصيل.',
        image: '/images/products/levi-501.jpg',
        price: 399.00,
        categoryId: fashion.id,
        stock: randomBetween(35, 55),
        stockThreshold: 10,
        rating: 4.4,
        reviews: randomBetween(500, 800)
      },

      // Home & Kitchen - Essential appliances
      {
        slug: 'dyson-v15-detect-absolute',
        name_en: 'Dyson V15 Detect Absolute',
        name_ar: 'دايسون V15 ديتكت ابسولوت',
        description_en: 'Cordless vacuum with laser dust detection, LCD screen showing particle count, and up to 60 minutes runtime.',
        description_ar: 'مكنسة لاسلكية مع كشف الغبار بالليزر، شاشة LCD تظهر عدد الجسيمات، ووقت تشغيل يصل إلى 60 دقيقة.',
        image: '/images/products/dyson-v15.jpg',
        price: 2299.00,
        categoryId: homeKitchen.id,
        stock: randomBetween(6, 15),
        stockThreshold: 8,
        rating: 4.8,
        reviews: randomBetween(180, 300)
      },
      {
        slug: 'ninja-foodi-air-fryer-8in1',
        name_en: 'Ninja Foodi 8-in-1 Air Fryer',
        name_ar: 'نينجا فودي قلاية هوائية 8 في 1',
        description_en: 'Multi-functional air fryer with pressure cooking, slow cooking, steaming, sautéing, and dehydrating capabilities.',
        description_ar: 'قلاية هوائية متعددة الوظائف مع الطبخ بالضغط، الطبخ البطيء، البخار، القلي، والتجفيف.',
        image: '/images/products/ninja-foodi.jpg',
        price: 899.00,
        salePrice: 799.00,
        discountPercent: 11,
        onSale: true,
        categoryId: homeKitchen.id,
        stock: randomBetween(20, 45),
        stockThreshold: 12,
        rating: 4.6,
        reviews: randomBetween(350, 550)
      },
      {
        slug: 'vitamix-a3500-ascent',
        name_en: 'Vitamix A3500 Ascent Blender',
        name_ar: 'خلاط فيتاميكس A3500 اسنت',
        description_en: 'Professional-grade blender with smart technology, wireless connectivity, and self-cleaning feature.',
        description_ar: 'خلاط بدرجة احترافية مع تقنية ذكية، اتصال لاسلكي، وميزة التنظيف الذاتي.',
        image: '/images/products/vitamix-a3500.jpg',
        price: 1799.00,
        categoryId: homeKitchen.id,
        stock: randomBetween(1, 3), // Critical stock
        stockThreshold: 4,
        rating: 4.9,
        reviews: randomBetween(80, 150)
      },

      // Sports & Outdoors
      {
        slug: 'nordictrack-commercial-1750',
        name_en: 'NordicTrack Commercial 1750 Treadmill',
        name_ar: 'جهاز مشي نورديك تراك تجاري 1750',
        description_en: 'Commercial-grade treadmill with 14" HD touchscreen, iFit technology, and -3% to 15% incline range.',
        description_ar: 'جهاز مشي بدرجة تجارية مع شاشة لمس HD 14 بوصة، تقنية iFit، ونطاق ميل من -3% إلى 15%.',
        image: '/images/products/nordictrack-treadmill.jpg',
        price: 3299.00,
        categoryId: sports.id,
        stock: randomBetween(2, 6), // Low stock
        stockThreshold: 4,
        rating: 4.5,
        reviews: randomBetween(120, 200)
      },
      {
        slug: 'bowflex-selecttech-552',
        name_en: 'Bowflex SelectTech 552 Dumbbells',
        name_ar: 'دمبل بوفلكس سلكت تيك 552',
        description_en: 'Space-saving adjustable dumbbells replacing 15 sets of weights, ranging from 5 to 52.5 pounds per dumbbell.',
        description_ar: 'دمبل قابل للتعديل موفر للمساحة يحل محل 15 طقم أوزان، يتراوح من 5 إلى 52.5 رطل للدمبل الواحد.',
        image: '/images/products/bowflex-dumbbells.jpg',
        price: 1299.00,
        categoryId: sports.id,
        stock: randomBetween(18, 28),
        stockThreshold: 8,
        rating: 4.6,
        reviews: randomBetween(200, 350)
      },

      // Beauty & Personal Care
      {
        slug: 'dyson-airwrap-complete',
        name_en: 'Dyson Airwrap Complete',
        name_ar: 'دايسون ايرراب كامل',
        description_en: 'Revolutionary hair styling tool that curls, waves, smooths, and dries hair using controlled airflow - no extreme heat.',
        description_ar: 'أداة تصفيف شعر ثورية تُجعد وتُموج وتُنعم وتُجفف الشعر باستخدام تدفق هواء محكوم - بدون حرارة مفرطة.',
        image: '/images/products/dyson-airwrap.jpg',
        price: 1999.00,
        categoryId: beauty.id,
        stock: randomBetween(4, 10),
        stockThreshold: 6,
        rating: 4.7,
        reviews: randomBetween(250, 400)
      },
      {
        slug: 'korean-skincare-routine-set',
        name_en: 'Complete Korean Skincare Routine Set',
        name_ar: 'طقم روتين العناية الكورية الكامل',
        description_en: '10-step Korean skincare routine with cleanser, toner, essence, serums, moisturizer, and sunscreen.',
        description_ar: 'روتين عناية كوري من 10 خطوات مع منظف، تونر، جوهر، سيروم، مرطب، وواقي شمس.',
        image: '/images/products/korean-skincare.jpg',
        price: 299.00,
        salePrice: 249.00,
        discountPercent: 17,
        onSale: true,
        categoryId: beauty.id,
        stock: randomBetween(75, 110), // Overstock
        stockThreshold: 25,
        rating: 4.4,
        reviews: randomBetween(400, 700)
      },

      // Automotive
      {
        slug: 'tesla-model-y-accessories-kit',
        name_en: 'Tesla Model Y Premium Accessories Kit',
        name_ar: 'طقم إكسسوارات تيسلا موديل Y الفاخر',
        description_en: 'Complete accessories package including all-weather floor mats, cargo organizer, and charging accessories.',
        description_ar: 'طقم إكسسوارات كامل يتضمن سجاد أرضية لجميع الأحوال الجوية، منظم حمولة، وإكسسوارات الشحن.',
        image: '/images/products/tesla-accessories.jpg',
        price: 899.00,
        categoryId: automotive.id,
        stock: randomBetween(22, 38),
        stockThreshold: 10,
        rating: 4.3,
        reviews: randomBetween(150, 250)
      },
      {
        slug: 'wireless-car-charger-premium',
        name_en: 'Premium Wireless Car Charger',
        name_ar: 'شاحن سيارة لاسلكي فاخر',
        description_en: '15W fast wireless charging pad with auto-clamping mechanism and air vent mount compatibility.',
        description_ar: 'لوحة شحن لاسلكي سريع 15W مع آلية مشبك تلقائي وتوافق مع حامل فتحة التهوية.',
        image: '/images/products/car-wireless-charger.jpg',
        price: 199.00,
        categoryId: automotive.id,
        stock: randomBetween(45, 70),
        stockThreshold: 15,
        rating: 4.2,
        reviews: randomBetween(300, 500)
      }
    ];

    // Create products and inventory
    const createdProducts: any[] = [];
    for (const productData of products) {
      const product = await prisma.product.upsert({
        where: { slug: productData.slug },
        update: {
          name_en: productData.name_en,
          name_ar: productData.name_ar,
          description_en: productData.description_en,
          description_ar: productData.description_ar,
          image: productData.image,
          price: productData.price,
          salePrice: productData.salePrice || null,
          discountPercent: productData.discountPercent || null,
          onSale: productData.onSale || false,
          rating: productData.rating,
          reviews: productData.reviews
        },
        create: {
          slug: productData.slug,
          name_en: productData.name_en,
          name_ar: productData.name_ar,
          description_en: productData.description_en,
          description_ar: productData.description_ar,
          image: productData.image,
          price: productData.price,
          salePrice: productData.salePrice || null,
          discountPercent: productData.discountPercent || null,
          onSale: productData.onSale || false,
          inStock: productData.stock > 0,
          rating: productData.rating,
          reviews: productData.reviews,
          categoryId: productData.categoryId,
        },
      });

      // Create inventory record
      await prisma.inventory.upsert({
        where: { productId: product.id },
        update: {
          stock: productData.stock,
          stockThreshold: productData.stockThreshold,
        },
        create: {
          productId: product.id,
          stock: productData.stock,
          stockThreshold: productData.stockThreshold,
        },
      });

      createdProducts.push(product);
    }

    // 5. Create Test Customers (Users with role 'viewer')
    const customerData = [
      { firstName: 'Ahmed', lastName: 'Al-Rashid', email: 'ahmed.rashid@email.com' },
      { firstName: 'Fatima', lastName: 'Al-Zahra', email: 'fatima.zahra@email.com' },
      { firstName: 'Mohammed', lastName: 'bin Abdullah', email: 'mohammed.abdullah@email.com' },
      { firstName: 'Aisha', lastName: 'Al-Mansouri', email: 'aisha.mansouri@email.com' },
      { firstName: 'Omar', lastName: 'Al-Faisal', email: 'omar.faisal@email.com' },
      { firstName: 'Noor', lastName: 'Al-Hassan', email: 'noor.hassan@email.com' },
      { firstName: 'Khalid', lastName: 'Al-Otaibi', email: 'khalid.otaibi@email.com' },
      { firstName: 'Layla', lastName: 'Al-Nouri', email: 'layla.nouri@email.com' },
      { firstName: 'Abdullah', lastName: 'Al-Saud', email: 'abdullah.saud@email.com' },
      { firstName: 'Maryam', lastName: 'Al-Dosari', email: 'maryam.dosari@email.com' },
      { firstName: 'Yousef', lastName: 'Al-Mutairi', email: 'yousef.mutairi@email.com' },
      { firstName: 'Sarah', lastName: 'Al-Qasimi', email: 'sarah.qasimi@email.com' },
      { firstName: 'Hassan', lastName: 'Al-Thani', email: 'hassan.thani@email.com' },
      { firstName: 'Zainab', lastName: 'Al-Maktoum', email: 'zainab.maktoum@email.com' },
      { firstName: 'Ali', lastName: 'Al-Sabah', email: 'ali.sabah@email.com' },
    ];

    const createdCustomers: any[] = [];
    for (const customer of customerData) {
      const hashedPassword = await bcrypt.hash('customer123', 12);
      const joinDate = randomDateWithinDays(180);

      const user = await prisma.user.upsert({
        where: { email: customer.email },
        update: {},
        create: {
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          name: `${customer.firstName} ${customer.lastName}`,
          password: hashedPassword,
          role: 'viewer',
          phone: `+966${randomBetween(501234567, 599999999)}`,
          createdAt: joinDate,
        },
      });

      createdCustomers.push({
        ...user,
        joinDate,
        tier: Math.random() < 0.1 ? 'vip' : Math.random() < 0.3 ? 'regular' : 'new'
      });

    }

    // 6. Create Realistic Orders
    const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const paymentMethods = ['card', 'cod', 'paypal'];

    let totalOrdersCreated = 0;
    let totalRevenue = 0;
    
    for (const customer of createdCustomers) {
      // Determine number of orders based on customer tier
      let orderCount: number;
      switch (customer.tier) {
        case 'vip':
          orderCount = randomBetween(12, 25);
          break;
        case 'regular':
          orderCount = randomBetween(4, 12);
          break;
        default:
          orderCount = randomBetween(0, 4);
      }

      for (let i = 0; i < orderCount; i++) {
        const orderDate = randomDateWithinDays(90);
        const itemCount = randomBetween(1, 4);
        
        // Select random products for this order
        const orderItems = [];
        let subtotal = 0;
        
        for (let j = 0; j < itemCount; j++) {
          const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
          const quantity = randomBetween(1, 3);
          const price = randomProduct.salePrice || randomProduct.price;
          const total = price * quantity;
          
          subtotal += total;
          orderItems.push({
            productId: randomProduct.id,
            quantity,
            price,
            total
          });
        }

        const tax = subtotal * 0.15;
        const shipping = subtotal >= 500 ? 0 : 15;
        const codFee = Math.random() < 0.3 ? 25 : 0; // 30% COD orders
        const total = subtotal + tax + shipping + codFee;

        // Determine order status based on date
        const daysSinceOrder = Math.floor((new Date().getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        let status: string;
        
        if (daysSinceOrder > 14) {
          status = Math.random() < 0.88 ? 'delivered' : 'cancelled';
        } else if (daysSinceOrder > 7) {
          status = Math.random() < 0.65 ? 'delivered' : Math.random() < 0.8 ? 'shipped' : 'processing';
        } else if (daysSinceOrder > 3) {
          status = Math.random() < 0.4 ? 'shipped' : 'processing';
        } else {
          status = Math.random() < 0.3 ? 'processing' : 'pending';
        }

        const order = await prisma.order.create({
          data: {
            customerEmail: customer.email,
            customerName: customer.name,
            status,
            subtotal,
            tax,
            shipping,
            codFee,
            total,
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            billingAddress: {
              firstName: customer.firstName,
              lastName: customer.lastName,
              email: customer.email,
              address: 'King Fahd Road',
              city: 'Riyadh',
              state: 'Riyadh Province',
              zipCode: '12345',
              country: 'Saudi Arabia',
              phone: customer.phone
            },
            shippingAddress: {
              firstName: customer.firstName,
              lastName: customer.lastName,
              address: 'King Fahd Road',
              city: 'Riyadh',
              state: 'Riyadh Province', 
              zipCode: '12345',
              country: 'Saudi Arabia',
              phone: customer.phone
            },
            createdAt: orderDate,
            updatedAt: orderDate,
            trackingNumber: status === 'shipped' || status === 'delivered' 
              ? `TR${randomBetween(100000000, 999999999)}` 
              : null,
            items: {
              create: orderItems
            }
          },
        });

        totalOrdersCreated++;
        if (status === 'delivered') {
          totalRevenue += total;
        }
      }
    }

    // 7. Create Stock History Records
    for (const product of createdProducts) {
      const movementCount = randomBetween(8, 25);
      
      for (let i = 0; i < movementCount; i++) {
        const movementDate = randomDateWithinDays(120);
        const change = Math.random() < 0.6 
          ? randomBetween(5, 50)    // Positive: incoming stock
          : -randomBetween(1, 20);  // Negative: outgoing stock
          
        const reasons = change > 0 
          ? ['Restock from supplier', 'Customer return', 'Inventory adjustment', 'New product batch']
          : ['Product sold', 'Damaged item', 'Return to supplier', 'Inventory correction'];
          
        await prisma.stockHistory.create({
          data: {
            productId: product.id,
            change,
            reason: reasons[Math.floor(Math.random() * reasons.length)],
            createdAt: movementDate,
          },
        });
      }
    }

    // 8. Final Statistics
    const totalCustomers = await prisma.user.count({
      where: { role: 'viewer' }
    });
    
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();


  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the enhanced seed
enhancedSeed();
