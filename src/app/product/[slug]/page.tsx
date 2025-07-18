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
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products`);
    const data = await response.json();
    
    // Defensive: check if products exist
    if (!data.products) {
      console.error('No products returned from API');
      notFound();
    }
    // Debug logging
    console.log('Requested slug:', slug);
    console.log('Available slugs:', data.products.map((p: any) => p.slug));
    
    const apiProduct = data.products.find((p: any) => p.slug === slug);
    
    if (!apiProduct) {
      notFound();
    }

    // Convert API format to frontend format
    const product = convertToMultilingualProduct(apiProduct);
    const allProducts = data.products.map((p: any) => convertToMultilingualProduct(p));

    return <ProductDetailClient product={product} allProducts={allProducts} />;
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }
} 