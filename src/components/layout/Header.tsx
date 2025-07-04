import React from 'react';
import { categories } from '@/data/products';
import { scrollToElement } from '@/lib/utils';

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  onSearchClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount = 0,
  onCartClick,
  onSearchClick,
}) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">SultanStore</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => scrollToElement('featured-products')}
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Home
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToElement('featured-products')}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                {category.name}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onSearchClick}
              className="text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Search"
            >
              <span className="sr-only">Search</span>
              🔍
            </button>
            <button
              onClick={onCartClick}
              className="relative text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Shopping Cart"
            >
              <span className="sr-only">Cart</span>
              🛒
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
