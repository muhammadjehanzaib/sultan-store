'use client';

import { Hero, ProductGrid, Footer } from '@/components';
import { Product } from '@/types';
import { scrollToElement } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Home() {
  const { dispatch } = useCart();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    fetch('/api/products?includeRelations=true')
      .then(res => res.json())
      .then((data: any) => {
        console.log('Main page API response:', data);
        // The API now returns products directly as an array
        const products = Array.isArray(data) ? data : [];
        console.log('Products to process on main page:', products);
        
        // Convert API format to frontend format
        const frontendProducts = products.map((apiProduct: any) => ({
          id: apiProduct.id,
          name: { en: apiProduct.name_en || '', ar: apiProduct.name_ar || '' },
          slug: apiProduct.slug,
          price: apiProduct.price,
          image: apiProduct.image,
          category: apiProduct.category
            ? { en: apiProduct.category.name_en || '', ar: apiProduct.category.name_ar || '' }
            : { en: '', ar: '' },
          description: { en: apiProduct.description_en || '', ar: apiProduct.description_ar || '' },
          inStock: apiProduct.inStock,
          rating: apiProduct.rating,
          reviews: apiProduct.reviews,
          attributes: apiProduct.attributes || [],
          variants: apiProduct.variants || [],
        }));
        console.log('Converted frontend products:', frontendProducts);
        setProducts(frontendProducts);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products on main page:', error);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (product: Product, selectedAttributes?: { [attributeId: string]: string }) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, selectedAttributes } });
  };

  const handleViewProduct = (product: Product) => {
    router.push(`/product/${product.slug}`);
  };

  const handleHeroButtonClick = () => {
    scrollToElement('featured-products');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero 
        onButtonClick={handleHeroButtonClick}
      />
      
      <ProductGrid 
        products={products}
        onAddToCart={handleAddToCart}
        onViewProduct={handleViewProduct}
      />
      
      <Footer />
    </div>
  );
}
