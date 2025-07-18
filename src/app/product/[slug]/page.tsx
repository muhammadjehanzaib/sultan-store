import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

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
    const product = {
      id: apiProduct.id,
      name: apiProduct.name_en || '', // for compatibility
      name_en: apiProduct.name_en || '',
      name_ar: apiProduct.name_ar || '',
      slug: apiProduct.slug,
      price: apiProduct.price,
      image: apiProduct.image,
      category: apiProduct.category ? apiProduct.category.name_en : '', // for compatibility
      category_en: apiProduct.category ? apiProduct.category.name_en : '',
      category_ar: apiProduct.category ? apiProduct.category.name_ar : '',
      description: apiProduct.description_en || '', // for compatibility
      description_en: apiProduct.description_en || '',
      description_ar: apiProduct.description_ar || '',
      inStock: apiProduct.inStock,
      rating: apiProduct.rating,
      reviews: apiProduct.reviews,
      attributes: apiProduct.attributes || [],
      variants: apiProduct.variants || [],
    };

    return <ProductDetailClient product={product} />;
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }
} 