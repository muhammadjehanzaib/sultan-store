import { Product } from '@/types';

export const products: Product[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 99.99,
    image: "/images/products/headphones.jpg",
    category: "Electronics",
    description: "High-quality wireless headphones with noise cancellation",
    inStock: true,
    rating: 4.5,
    reviews: 128
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 199.99,
    image: "/images/products/smartwatch.jpg",
    category: "Electronics",
    description: "Feature-rich smartwatch with health tracking",
    inStock: true,
    rating: 4.3,
    reviews: 89
  },
  {
    id: 3,
    name: "Coffee Maker",
    price: 79.99,
    image: "/images/products/coffee-maker.jpg",
    category: "Home",
    description: "Programmable coffee maker with timer",
    inStock: true,
    rating: 4.7,
    reviews: 203
  },
  {
    id: 4,
    name: "Running Shoes",
    price: 129.99,
    image: "/images/products/running-shoes.jpg",
    category: "Fashion",
    description: "Lightweight running shoes with superior comfort",
    inStock: false,
    rating: 4.2,
    reviews: 156
  },
  {
    id: 5,
    name: "Bluetooth Speaker",
    price: 49.99,
    image: "/images/products/bluetooth-speaker.jpg",
    category: "Electronics",
    description: "Portable Bluetooth speaker with rich sound",
    inStock: true,
    rating: 4.4,
    reviews: 98
  },
  {
    id: 6,
    name: "Desk Lamp",
    price: 34.99,
    image: "/images/products/desk-lamp.jpg",
    category: "Home",
    description: "Adjustable LED desk lamp with multiple brightness levels",
    inStock: true,
    rating: 4.6,
    reviews: 67
  }
];

export const categories = [
  { id: 'electronics', name: 'Electronics', slug: 'electronics' },
  { id: 'fashion', name: 'Fashion', slug: 'fashion' },
  { id: 'home', name: 'Home & Kitchen', slug: 'home' },
];
