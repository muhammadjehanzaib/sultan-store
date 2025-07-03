'use client';

import { useState } from 'react';
import { Header, Hero, ProductGrid, Footer } from '@/components';
import { products } from '@/data/products';
import { Product } from '@/types';
import { scrollToElement } from '@/lib/utils';

export default function Home() {
  const [cartItems, setCartItems] = useState(0);

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => prev + 1);
    console.log('Added to cart:', product.name);
  };

  const handleViewProduct = (product: Product) => {
    console.log('View product:', product.name);
  };

  const handleCartClick = () => {
    console.log('Cart clicked, items:', cartItems);
  };

  const handleSearchClick = () => {
    console.log('Search clicked');
  };

  const handleHeroButtonClick = () => {
    scrollToElement('featured-products');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        cartItemCount={cartItems}
        onCartClick={handleCartClick}
        onSearchClick={handleSearchClick}
      />
      
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
