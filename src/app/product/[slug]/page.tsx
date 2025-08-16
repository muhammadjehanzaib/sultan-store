import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { convertToMultilingualProduct } from '@/lib/multilingualUtils';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  
  try {
    // Fetch product by slug
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products?includeRelations=true`);
    const data = await response.json();
    
    // Handle both direct array and wrapped response
    const products = Array.isArray(data) ? data : (data.products || []);
    
    // Defensive: check if products exist
    if (!products || products.length === 0) {
      notFound();
    }
    
    const apiProduct = products.find((p: any) => p.slug === slug);
    
    if (!apiProduct) {
      notFound();
    }

    // Convert API format to frontend format
    const product = convertToMultilingualProduct(apiProduct);
    const allProducts = products.map((p: any) => convertToMultilingualProduct(p));

    return <ProductDetailClient product={product} allProducts={allProducts} />;
  } catch (error) {
    notFound();
  }
} 