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
    reviews: 128,
    slug: "wireless-headphones",
    attributes: [
      {
        id: 'color',
        name: 'Color',
        type: 'color',
        values: [
          { id: 'black', value: 'Black', hexColor: '#000000' },
          { id: 'white', value: 'White', hexColor: '#FFFFFF' },
          { id: 'silver', value: 'Silver', hexColor: '#C0C0C0' }
        ]
      }
    ],
    variants: [
      {
        id: "wh-black",
        attributeValues: { color: "black" },
        price: 99.99,
        stockQuantity: 20,
        inStock: true
      },
      {
        id: "wh-white",
        attributeValues: { color: "white" },
        price: 99.99,
        stockQuantity: 15,
        inStock: true
      },
      {
        id: "wh-silver",
        attributeValues: { color: "silver" },
        price: 99.99,
        stockQuantity: 10,
        inStock: false
      }
    ]
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 199.99,
    image: "/images/products/smartwatch.jpg",
    category: "Electronics",
    description: "Feature-rich smartwatch with health tracking",
    inStock: false,
    rating: 4.3,
    reviews: 89,
    slug: "smart-watch",
     attributes: [
      {
        id: 'color',
        name: 'Color',
        type: 'color',
        values: [
          { id: 'black', value: 'Black', hexColor: '#000000' },
          { id: 'white', value: 'White', hexColor: '#FFFFFF' },
          { id: 'silver', value: 'Silver', hexColor: '#C0C0C0' }
        ]
      }
    ]
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
    reviews: 203,
    slug: "coffee-maker"
  },
  {
    id: 4,
    name: "Running Shoes",
    price: 129.99,
    image: "/images/products/running-shoes.jpg",
    category: "Fashion",
    description: "Lightweight running shoes with superior comfort",
    inStock: true,
    rating: 4.2,
    reviews: 156,
    slug: "running-shoes",
    attributes: [
      {
        id: 'size',
        name: 'Size',
        type: 'size',
        values: [
          { id: 'us7', value: 'US 7' },
          { id: 'us8', value: 'US 8' },
          { id: 'us9', value: 'US 9' },
          { id: 'us10', value: 'US 10' },
          { id: 'us11', value: 'US 11' }
        ]
      },
      {
        id: 'color',
        name: 'Color',
        type: 'color',
        values: [
          { id: 'black', value: 'Black', hexColor: '#000000' },
          { id: 'white', value: 'White', hexColor: '#FFFFFF' },
          { id: 'blue', value: 'Blue', hexColor: '#0000FF' },
          { id: 'red', value: 'Red', hexColor: '#FF0000' }
        ]
      }
    ]
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
    reviews: 98,
    slug: "bluetooth-speaker"
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
    reviews: 67,
    slug: "desk-lamp",
    attributes: [
      {
        id: 'size',
        name: 'Size',
        type: 'size',
        values: [
          { id: 'small', value: 'S' },
          { id: 'medium', value: 'M' },
          { id: 'large', value: 'L' }
        ]
      },
      {
        id: 'color',
        name: 'Color',
        type: 'color',
        values: [
          { id: 'red', value: 'Red', hexColor: '#FF0000' },
          { id: 'blue', value: 'Blue', hexColor: '#0000FF' }
        ]
      }
    ]
  },
  // Add demo product with variants
  {
    id: 7,
    name: "Demo T-Shirt",
    price: 25,
    image: "/images/products/tshirt.jpg",
    category: "Fashion",
    description: "A demo t-shirt with variants.",
    inStock: true,
    slug: "demo-t-shirt",
    attributes: [
      {
        id: 'size',
        name: 'Size',
        type: 'size',
        values: [
          { id: 's', value: 'S' },
          { id: 'm', value: 'M' }
        ]
      },
      {
        id: 'color',
        name: 'Color',
        type: 'color',
        values: [
          { id: 'red', value: 'Red', hexColor: '#FF0000' },
          { id: 'blue', value: 'Blue', hexColor: '#0000FF' }
        ]
      }
    ],
    variants: [
      {
        id: "v1",
        attributeValues: { size: "s", color: "red" },
        price: 25,
        stockQuantity: 10,
        inStock: true
      },
      {
        id: "v2",
        attributeValues: { size: "m", color: "blue" },
        price: 25,
        stockQuantity: 5,
        inStock: false
      }
    ]
  }
];

export const categories = [
  {
    id: 'electronics',
    name: { en: 'Electronics', ar: 'الإلكترونيات' },
    slug: 'electronics',
    description: { en: 'Electronic devices and gadgets', ar: 'الأجهزة الإلكترونية والأدوات' },
    icon: '📱',
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'fashion',
    name: { en: 'Fashion', ar: 'الأزياء' },
    slug: 'fashion',
    description: { en: 'Clothing and fashion accessories', ar: 'الملابس وإكسسوارات الأزياء' },
    icon: '👕',
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'home',
    name: { en: 'Home & Kitchen', ar: 'المنزل والمطبخ' },
    slug: 'home',
    description: { en: 'Home appliances and kitchen essentials', ar: 'الأجهزة المنزلية وأساسيات المطبخ' },
    icon: '🏠',
    isActive: true,
    sortOrder: 3
  },
  {
    id: 'sports',
    name: { en: 'Sports', ar: 'الرياضة' },
    slug: 'sports',
    description: { en: 'Sports equipment and athletic wear', ar: 'معدات رياضية وملابس رياضية' },
    icon: '⚽',
    isActive: true,
    sortOrder: 4
  },
  {
    id: 'books',
    name: { en: 'Books', ar: 'الكتب' },
    slug: 'books',
    description: { en: 'Books and educational materials', ar: 'الكتب والمواد التعليمية' },
    icon: '📚',
    isActive: true,
    sortOrder: 5
  },
  {
    id: 'beauty',
    name: { en: 'Beauty', ar: 'الجمال' },
    slug: 'beauty',
    description: { en: 'Beauty and personal care products', ar: 'منتجات الجمال والعناية الشخصية' },
    icon: '💄',
    isActive: true,
    sortOrder: 6
  }
];
