'use client';

import { Header, Hero, ProductGrid, Footer, CartSidebar } from '@/components';
import { products } from '@/data/products';
import { Product } from '@/types';
import { scrollToElement } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

export default function Home() {
  const { state, dispatch } = useCart();

  const handleAddToCart = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const handleViewProduct = (product: Product) => {
    console.log('View product:', product.name);
  };

  const handleCartClick = () => {
    dispatch({ type: 'TOGGLE_CART' });
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
        cartItemCount={state.itemCount}
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
      
      <CartSidebar />
    </div>
  );
}
