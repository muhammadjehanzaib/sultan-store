'use client';

import { Hero, ProductGrid, Footer } from '@/components';
import { products } from '@/data/products';
import { Product } from '@/types';
import { scrollToElement } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { dispatch } = useCart();
  const router = useRouter();

  const handleAddToCart = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const handleViewProduct = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleHeroButtonClick = () => {
    scrollToElement('featured-products');
  };

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
