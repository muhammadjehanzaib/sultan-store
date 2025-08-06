import CategoryPageClient from './CategoryPageClient';

// Generate static paths - fetch from API
export async function generateStaticParams() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/categories`);
    const data = await response.json();
    const categories = data.categories || [];
    return categories.map((category: any) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error('Error fetching categories for static params:', error);
    return [];
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Fetch products from API
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products?includeRelations=true`);
    const data = await response.json();
    // Handle both direct array and wrapped response
    const products = Array.isArray(data) ? data : (data.products || []);
    return <CategoryPageClient slug={slug} products={products} />;
  } catch (error) {
    console.error('Error fetching products:', error);
    return <CategoryPageClient slug={slug} products={[]} />;
  }
}

