import { Order } from '@/types';

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    items: [
      {
        product: {
          id: 1,
          name: 'Wireless Headphones',
          price: 99.99,
          image: '/images/products/headphones.jpg',
          category: 'Electronics',
          description: 'High-quality wireless headphones with noise cancellation',
          inStock: true,
          rating: 4.5,
          reviews: 128
        },
        quantity: 1,
        price: 99.99,
        total: 99.99
      },
      {
        product: {
          id: 2,
          name: 'Smart Watch',
          price: 199.99,
          image: '/images/products/smartwatch.jpg',
          category: 'Electronics',
          description: 'Feature-rich smartwatch with health tracking',
          inStock: true,
          rating: 4.3,
          reviews: 89
        },
        quantity: 1,
        price: 199.99,
        total: 199.99
      }
    ],
    subtotal: 299.98,
    tax: 24.00,
    shipping: 9.99,
    total: 333.97,
    billingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    paymentMethod: {
      id: 'card',
      type: 'card',
      name: 'Credit Card',
      description: 'Visa ending in 1234'
    },
    status: 'processing',
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-15T10:30:00'),
    trackingNumber: 'TR123456789'
  },
  {
    id: 'ORD-002',
    items: [
      {
        product: {
          id: 3,
          name: 'Coffee Maker',
          price: 79.99,
          image: '/images/products/coffee-maker.jpg',
          category: 'Home',
          description: 'Programmable coffee maker with timer',
          inStock: true,
          rating: 4.7,
          reviews: 203
        },
        quantity: 1,
        price: 79.99,
        total: 79.99
      }
    ],
    subtotal: 79.99,
    tax: 6.40,
    shipping: 5.99,
    total: 92.38,
    billingAddress: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+1987654321',
      address: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    shippingAddress: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+1987654321',
      address: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    paymentMethod: {
      id: 'paypal',
      type: 'paypal',
      name: 'PayPal',
      description: 'PayPal account'
    },
    status: 'shipped',
    createdAt: new Date('2024-01-14T14:20:00'),
    updatedAt: new Date('2024-01-16T09:15:00'),
    trackingNumber: 'TR987654321'
  },
  {
    id: 'ORD-003',
    items: [
      {
        product: {
          id: 5,
          name: 'Bluetooth Speaker',
          price: 49.99,
          image: '/images/products/bluetooth-speaker.jpg',
          category: 'Electronics',
          description: 'Portable Bluetooth speaker with rich sound',
          inStock: true,
          rating: 4.4,
          reviews: 98
        },
        quantity: 2,
        price: 49.99,
        total: 99.98
      }
    ],
    subtotal: 99.98,
    tax: 8.00,
    shipping: 7.99,
    total: 115.97,
    billingAddress: {
      firstName: 'Ahmed',
      lastName: 'Hassan',
      email: 'ahmed@example.com',
      phone: '+201234567890',
      address: '789 Nile St',
      city: 'Cairo',
      state: 'Cairo',
      zipCode: '11511',
      country: 'Egypt'
    },
    shippingAddress: {
      firstName: 'Ahmed',
      lastName: 'Hassan',
      email: 'ahmed@example.com',
      phone: '+201234567890',
      address: '789 Nile St',
      city: 'Cairo',
      state: 'Cairo',
      zipCode: '11511',
      country: 'Egypt'
    },
    paymentMethod: {
      id: 'card',
      type: 'card',
      name: 'Credit Card',
      description: 'Mastercard ending in 5678'
    },
    status: 'delivered',
    createdAt: new Date('2024-01-13T16:45:00'),
    updatedAt: new Date('2024-01-17T11:30:00'),
    trackingNumber: 'TR555666777'
  },
  {
    id: 'ORD-004',
    items: [
      {
        product: {
          id: 6,
          name: 'Desk Lamp',
          price: 34.99,
          image: '/images/products/desk-lamp.jpg',
          category: 'Home',
          description: 'Adjustable LED desk lamp with multiple brightness levels',
          inStock: true,
          rating: 4.6,
          reviews: 67
        },
        quantity: 1,
        price: 34.99,
        total: 34.99
      }
    ],
    subtotal: 34.99,
    tax: 2.80,
    shipping: 4.99,
    total: 42.78,
    billingAddress: {
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria@example.com',
      phone: '+34987654321',
      address: '321 Barcelona St',
      city: 'Madrid',
      state: 'Madrid',
      zipCode: '28001',
      country: 'Spain'
    },
    shippingAddress: {
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria@example.com',
      phone: '+34987654321',
      address: '321 Barcelona St',
      city: 'Madrid',
      state: 'Madrid',
      zipCode: '28001',
      country: 'Spain'
    },
    paymentMethod: {
      id: 'stripe',
      type: 'stripe',
      name: 'Stripe',
      description: 'Bank transfer'
    },
    status: 'pending',
    createdAt: new Date('2024-01-16T12:00:00'),
    updatedAt: new Date('2024-01-16T12:00:00')
  },
  {
    id: 'ORD-005',
    items: [
      {
        product: {
          id: 4,
          name: 'Running Shoes',
          price: 129.99,
          image: '/images/products/running-shoes.jpg',
          category: 'Fashion',
          description: 'Lightweight running shoes with superior comfort',
          inStock: false,
          rating: 4.2,
          reviews: 156
        },
        quantity: 1,
        price: 129.99,
        total: 129.99
      }
    ],
    subtotal: 129.99,
    tax: 10.40,
    shipping: 8.99,
    total: 149.38,
    billingAddress: {
      firstName: 'Ali',
      lastName: 'Abdullah',
      email: 'ali@example.com',
      phone: '+966501234567',
      address: '555 Riyadh Rd',
      city: 'Riyadh',
      state: 'Riyadh',
      zipCode: '11564',
      country: 'Saudi Arabia'
    },
    shippingAddress: {
      firstName: 'Ali',
      lastName: 'Abdullah',
      email: 'ali@example.com',
      phone: '+966501234567',
      address: '555 Riyadh Rd',
      city: 'Riyadh',
      state: 'Riyadh',
      zipCode: '11564',
      country: 'Saudi Arabia'
    },
    paymentMethod: {
      id: 'card',
      type: 'card',
      name: 'Credit Card',
      description: 'Visa ending in 9999'
    },
    status: 'cancelled',
    createdAt: new Date('2024-01-12T08:15:00'),
    updatedAt: new Date('2024-01-13T10:20:00')
  }
];
