import { prisma } from './client'; // adjust path to your Prisma client

async function seedCategories() {
  await prisma.category.createMany({
    data: [
      { id: 'cat-1', slug: 'electronics', name_en: 'Electronics', name_ar: 'الإلكترونيات', icon: '📱' },
      { id: 'cat-2', slug: 'fashion', name_en: 'Fashion', name_ar: 'الأزياء', icon: '👕' },
      { id: 'cat-3', slug: 'home', slug: 'home', name_en: 'Home & Kitchen', name_ar: 'المنزل والمطبخ', icon: '🏠' },
    ],
  });
}

seedCategories().then(() => {
  console.log('Categories seeded');
});
