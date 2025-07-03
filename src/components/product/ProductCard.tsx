import React from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewProduct,
}) => {
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleViewProduct = () => {
    if (onViewProduct) {
      onViewProduct(product);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div 
        className="relative h-48 bg-gray-200 cursor-pointer overflow-hidden"
        onClick={handleViewProduct}
      >
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {!product.inStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 
            className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors"
            onClick={handleViewProduct}
          >
            {product.name}
          </h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {product.category}
          </span>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`text-sm ${i < Math.floor(product.rating!) ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ⭐
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <p className="text-2xl font-bold text-purple-600 mb-4">
          ${product.price}
        </p>

        {/* Add to Cart Button */}
        <Button
          fullWidth
          onClick={handleAddToCart}
          disabled={!product.inStock}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  );
};
