import { Order } from '@/types';

// Mock products that work with existing Product interface
const mockProducts = [
  {
    id: 'prod_001',
    slug: 'wireless-headphones',
    name: 'Wireless Headphones',
    name_en: 'Wireless Headphones',
    name_ar: 'سماعات لاسلكية',
    description: 'High-quality wireless headphones with noise cancellation',
    description_en: 'High-quality wireless headphones with noise cancellation',
    description_ar: 'سماعات لاسلكية عالية الجودة مع إلغاء الضوضاء',
    image: '/images/products/headphones.jpg',
    price: 99.99,
    category: 'Electronics',
    categoryId: 'cat_electronics',
    inStock: true,
    rating: 4.5,
    reviews: 128,
    attributes: [
      { 
        id: 'attr_001', 
        name: 'Color', 
        type: 'color' as const,
        values: [
          { id: 'val_001', value: 'Black', label: 'Black', hexColor: '#000000' },
          { id: 'val_002', value: 'White', label: 'White', hexColor: '#FFFFFF' },
          { id: 'val_003', value: 'Blue', label: 'Blue', hexColor: '#0000FF' }
        ]
      },
      { 
        id: 'attr_002', 
        name: 'Battery Life', 
        type: 'material' as const,
        values: [
          { id: 'val_004', value: '20 hours', label: '20 hours' }
        ]
      },
      { 
        id: 'attr_003', 
        name: 'Connectivity', 
        type: 'material' as const,
        values: [
          { id: 'val_005', value: 'Bluetooth 5.0', label: 'Bluetooth 5.0' }
        ]
      },
      { 
        id: 'attr_004', 
        name: 'Noise Cancellation', 
        type: 'material' as const,
        values: [
          { id: 'val_006', value: 'Active', label: 'Active' }
        ]
      }
    ],
    variants: [
      { 
        id: 'var_001', 
        attributeValues: { 'attr_001': 'val_001' },
        price: 99.99, 
        inStock: true 
      },
      { 
        id: 'var_002', 
        attributeValues: { 'attr_001': 'val_002' },
        price: 99.99, 
        inStock: true 
      },
      { 
        id: 'var_003', 
        attributeValues: { 'attr_001': 'val_003' },
        price: 109.99, 
        inStock: false 
      }
    ]
  },
  {
    id: 'prod_002',
    slug: 'smart-watch',
    name: 'Smart Watch',
    name_en: 'Smart Watch',
    name_ar: 'ساعة ذكية',
    description: 'Feature-rich smartwatch with health tracking',
    description_en: 'Feature-rich smartwatch with health tracking',
    description_ar: 'ساعة ذكية غنية بالميزات مع تتبع الصحة',
    image: '/images/products/smartwatch.jpg',
    price: 199.99,
    category: 'Electronics',
    categoryId: 'cat_electronics',
    inStock: true,
    rating: 4.3,
    reviews: 89,
    attributes: [
      { 
        id: 'attr_005', 
        name: 'Size', 
        type: 'size' as const,
        values: [
          { id: 'val_007', value: '42mm', label: '42mm' },
          { id: 'val_008', value: '46mm', label: '46mm' }
        ]
      },
      { 
        id: 'attr_006', 
        name: 'Color', 
        type: 'color' as const,
        values: [
          { id: 'val_009', value: 'Black', label: 'Black', hexColor: '#000000' },
          { id: 'val_010', value: 'Silver', label: 'Silver', hexColor: '#C0C0C0' }
        ]
      },
      { 
        id: 'attr_007', 
        name: 'Water Resistance', 
        type: 'material' as const,
        values: [
          { id: 'val_011', value: '5ATM', label: '5ATM' }
        ]
      },
      { 
        id: 'attr_008', 
        name: 'GPS', 
        type: 'material' as const,
        values: [
          { id: 'val_012', value: 'Built-in', label: 'Built-in' }
        ]
      }
    ],
    variants: [
      { 
        id: 'var_004', 
        attributeValues: { 'attr_005': 'val_007', 'attr_006': 'val_009' },
        price: 199.99, 
        inStock: true 
      },
      { 
        id: 'var_005', 
        attributeValues: { 'attr_005': 'val_007', 'attr_006': 'val_010' },
        price: 199.99, 
        inStock: true 
      },
      { 
        id: 'var_006', 
        attributeValues: { 'attr_005': 'val_008', 'attr_006': 'val_009' },
        price: 249.99, 
        inStock: true 
      },
      { 
        id: 'var_007', 
        attributeValues: { 'attr_005': 'val_008', 'attr_006': 'val_010' },
        price: 249.99, 
        inStock: false 
      }
    ]
  },
  {
    id: 'prod_003',
    slug: 'coffee-maker',
    name: 'Coffee Maker',
    name_en: 'Coffee Maker',
    name_ar: 'صانع القهوة',
    description: 'Programmable coffee maker with timer',
    description_en: 'Programmable coffee maker with timer',
    description_ar: 'صانع قهوة قابل للبرمجة مع مؤقت',
    image: '/images/products/coffee-maker.jpg',
    price: 79.99,
    category: 'Home & Garden',
    categoryId: 'cat_home-garden',
    inStock: true,
    rating: 4.7,
    reviews: 203,
    attributes: [
      { 
        id: 'attr_009', 
        name: 'Color', 
        type: 'color' as const,
        values: [
          { id: 'val_013', value: 'Black', label: 'Black', hexColor: '#000000' },
          { id: 'val_014', value: 'Stainless Steel', label: 'Stainless Steel', hexColor: '#C0C0C0' },
          { id: 'val_015', value: 'Red', label: 'Red', hexColor: '#FF0000' }
        ]
      },
      { 
        id: 'attr_010', 
        name: 'Capacity', 
        type: 'material' as const,
        values: [
          { id: 'val_016', value: '12 cups', label: '12 cups' }
        ]
      },
      { 
        id: 'attr_011', 
        name: 'Programmable', 
        type: 'material' as const,
        values: [
          { id: 'val_017', value: 'Yes', label: 'Yes' }
        ]
      },
      { 
        id: 'attr_012', 
        name: 'Auto Shut-off', 
        type: 'material' as const,
        values: [
          { id: 'val_018', value: 'Yes', label: 'Yes' }
        ]
      }
    ],
    variants: [
      { 
        id: 'var_008', 
        attributeValues: { 'attr_009': 'val_013' },
        price: 79.99, 
        inStock: true 
      },
      { 
        id: 'var_009', 
        attributeValues: { 'attr_009': 'val_014' },
        price: 89.99, 
        inStock: true 
      },
      { 
        id: 'var_010', 
        attributeValues: { 'attr_009': 'val_015' },
        price: 79.99, 
        inStock: false 
      }
    ]
  },
  {
    id: 'prod_004',
    slug: 'running-shoes',
    name: 'Running Shoes',
    name_en: 'Running Shoes',
    name_ar: 'أحذية الجري',
    description: 'Lightweight running shoes with superior comfort',
    description_en: 'Lightweight running shoes with superior comfort',
    description_ar: 'أحذية جري خفيفة مع راحة فائقة',
    image: '/images/products/running-shoes.jpg',
    price: 129.99,
    category: 'Sports & Outdoors',
    categoryId: 'cat_sports-outdoors',
    inStock: false,
    rating: 4.2,
    reviews: 156,
    attributes: [
      { 
        id: 'attr_013', 
        name: 'Size', 
        type: 'size' as const,
        values: [
          { id: 'val_019', value: 'US 7', label: 'US 7' },
          { id: 'val_020', value: 'US 8', label: 'US 8' },
          { id: 'val_021', value: 'US 9', label: 'US 9' },
          { id: 'val_022', value: 'US 10', label: 'US 10' }
        ]
      },
      { 
        id: 'attr_014', 
        name: 'Color', 
        type: 'color' as const,
        values: [
          { id: 'val_023', value: 'Black', label: 'Black', hexColor: '#000000' }
        ]
      },
      { 
        id: 'attr_015', 
        name: 'Material', 
        type: 'material' as const,
        values: [
          { id: 'val_024', value: 'Mesh & Synthetic', label: 'Mesh & Synthetic' }
        ]
      },
      { 
        id: 'attr_016', 
        name: 'Cushioning', 
        type: 'material' as const,
        values: [
          { id: 'val_025', value: 'Air Max', label: 'Air Max' }
        ]
      }
    ],
    variants: [
      { 
        id: 'var_011', 
        attributeValues: { 'attr_013': 'val_019', 'attr_014': 'val_023' },
        price: 129.99, 
        inStock: false 
      },
      { 
        id: 'var_012', 
        attributeValues: { 'attr_013': 'val_020', 'attr_014': 'val_023' },
        price: 129.99, 
        inStock: false 
      },
      { 
        id: 'var_013', 
        attributeValues: { 'attr_013': 'val_021', 'attr_014': 'val_023' },
        price: 129.99, 
        inStock: false 
      },
      { 
        id: 'var_014', 
        attributeValues: { 'attr_013': 'val_022', 'attr_014': 'val_023' },
        price: 129.99, 
        inStock: false 
      }
    ]
  },
  {
    id: 'prod_005',
    slug: 'bluetooth-speaker',
    name: 'Bluetooth Speaker',
    name_en: 'Bluetooth Speaker',
    name_ar: 'مكبر صوت بلوتوث',
    description: 'Portable Bluetooth speaker with rich sound',
    description_en: 'Portable Bluetooth speaker with rich sound',
    description_ar: 'مكبر صوت بلوتوث محمول مع صوت غني',
    image: '/images/products/bluetooth-speaker.jpg',
    price: 49.99,
    category: 'Electronics',
    categoryId: 'cat_electronics',
    inStock: true,
    rating: 4.4,
    reviews: 98,
    attributes: [
      { 
        id: 'attr_017', 
        name: 'Color', 
        type: 'color' as const,
        values: [
          { id: 'val_026', value: 'Black', label: 'Black', hexColor: '#000000' },
          { id: 'val_027', value: 'Blue', label: 'Blue', hexColor: '#0000FF' },
          { id: 'val_028', value: 'Red', label: 'Red', hexColor: '#FF0000' }
        ]
      },
      { 
        id: 'attr_018', 
        name: 'Power Output', 
        type: 'material' as const,
        values: [
          { id: 'val_029', value: '20W', label: '20W' }
        ]
      },
      { 
        id: 'attr_019', 
        name: 'Water Resistance', 
        type: 'material' as const,
        values: [
          { id: 'val_030', value: 'IPX7', label: 'IPX7' }
        ]
      },
      { 
        id: 'attr_020', 
        name: 'Connectivity', 
        type: 'material' as const,
        values: [
          { id: 'val_031', value: 'Bluetooth 5.0', label: 'Bluetooth 5.0' }
        ]
      }
    ],
    variants: [
      { 
        id: 'var_015', 
        attributeValues: { 'attr_017': 'val_026' },
        price: 49.99, 
        inStock: true 
      },
      { 
        id: 'var_016', 
        attributeValues: { 'attr_017': 'val_027' },
        price: 49.99, 
        inStock: true 
      },
      { 
        id: 'var_017', 
        attributeValues: { 'attr_017': 'val_028' },
        price: 49.99, 
        inStock: false 
      }
    ]
  },
  {
    id: 'prod_006',
    slug: 'desk-lamp',
    name: 'Desk Lamp',
    name_en: 'Desk Lamp',
    name_ar: 'مصباح مكتب',
    description: 'Adjustable LED desk lamp with multiple brightness levels',
    description_en: 'Adjustable LED desk lamp with multiple brightness levels',
    description_ar: 'مصباح مكتب LED قابل للتعديل مع مستويات سطوع متعددة',
    image: '/images/products/desk-lamp.jpg',
    price: 34.99,
    category: 'Home & Garden',
    categoryId: 'cat_home-garden',
    inStock: true,
    rating: 4.6,
    reviews: 67,
    attributes: [
      { 
        id: 'attr_021', 
        name: 'Color', 
        type: 'color' as const,
        values: [
          { id: 'val_032', value: 'Black', label: 'Black', hexColor: '#000000' },
          { id: 'val_033', value: 'White', label: 'White', hexColor: '#FFFFFF' },
          { id: 'val_034', value: 'Silver', label: 'Silver', hexColor: '#C0C0C0' }
        ]
      },
      { 
        id: 'attr_022', 
        name: 'Light Type', 
        type: 'material' as const,
        values: [
          { id: 'val_035', value: 'LED', label: 'LED' }
        ]
      },
      { 
        id: 'attr_023', 
        name: 'Brightness Levels', 
        type: 'material' as const,
        values: [
          { id: 'val_036', value: '3 levels', label: '3 levels' }
        ]
      },
      { 
        id: 'attr_024', 
        name: 'Adjustable', 
        type: 'material' as const,
        values: [
          { id: 'val_037', value: 'Yes', label: 'Yes' }
        ]
      }
    ],
    variants: [
      { 
        id: 'var_018', 
        attributeValues: { 'attr_021': 'val_032' },
        price: 34.99, 
        inStock: true 
      },
      { 
        id: 'var_019', 
        attributeValues: { 'attr_021': 'val_033' },
        price: 34.99, 
        inStock: true 
      },
      { 
        id: 'var_020', 
        attributeValues: { 'attr_021': 'val_034' },
        price: 39.99, 
        inStock: true 
      }
    ]
  }
];

export const mockOrders = [
  {
    id: 'ORD-001',
    items: [
      {
        product: {
          ...mockProducts[0], // Wireless Headphones
          // Override with specific variant data - Black color selected
          ...{
            selectedVariant: {
              id: 'var_001',
              name: 'Black',
              price: 99.99,
              inStock: true,
              selectedAttributes: {
                'attr_001': 'val_001' // Color: Black
              }
            }
          }
        } as any,
        quantity: 1,
        price: 99.99,
        total: 99.99
      },
      {
        product: {
          ...mockProducts[1], // Smart Watch
          // Override with specific variant data - 42mm Black selected
          ...{
            selectedVariant: {
              id: 'var_004',
              name: '42mm Black',
              price: 199.99,
              inStock: true,
              selectedAttributes: {
                'attr_005': 'val_007', // Size: 42mm
                'attr_006': 'val_009'  // Color: Black
              }
            }
          }
        } as any,
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
      type: 'card' as const,
      name: 'Credit Card',
      description: 'Visa ending in 1234'
    },
    status: 'processing' as const,
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-15T10:30:00'),
    trackingNumber: 'TRK123456789',
    trackingProvider: 'custom' as const
  },
  {
    id: 'ORD-002',
    items: [
      {
        product: {
          ...mockProducts[2], // Coffee Maker
          // Override with specific variant data - Stainless Steel selected
          selectedVariant: {
            id: 'var_009',
            name: 'Stainless Steel',
            price: 89.99,
            inStock: true,
            selectedAttributes: {
              'attr_009': 'val_014' // Color: Stainless Steel
            }
          }
        },
        quantity: 1,
        price: 89.99,
        total: 89.99
      }
    ],
    subtotal: 89.99,
    tax: 7.20,
    shipping: 5.99,
    total: 103.18,
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
      type: 'paypal' as const,
      name: 'PayPal',
      description: 'PayPal account'
    },
    status: 'shipped' as const,
    createdAt: new Date('2024-01-14T14:20:00'),
    updatedAt: new Date('2024-01-16T09:15:00'),
    trackingNumber: 'TRK987654321',
    trackingProvider: 'custom' as const
  },
  {
    id: 'ORD-003',
    items: [
      {
        product: {
          ...mockProducts[4], // Bluetooth Speaker
          // Override with specific variant data - Blue color selected
          selectedVariant: {
            id: 'var_016',
            name: 'Blue',
            price: 49.99,
            inStock: true,
            selectedAttributes: {
              'attr_017': 'val_027' // Color: Blue
            }
          }
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
    status: 'delivered' as const,
    createdAt: new Date('2024-01-13T16:45:00'),
    updatedAt: new Date('2024-01-17T11:30:00'),
    trackingNumber: 'TRK555666777',
    trackingProvider: 'custom' as const
  },
  {
    id: 'ORD-004',
    items: [
      {
        product: {
          ...mockProducts[5], // Desk Lamp
          // Override with specific variant data - White color selected
          selectedVariant: {
            id: 'var_019',
            name: 'White',
            price: 34.99,
            inStock: true,
            selectedAttributes: {
              'attr_021': 'val_033' // Color: White
            }
          }
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
      type: 'stripe' as const,
      name: 'Stripe',
      description: 'Bank transfer'
    },
    status: 'pending' as const,
    createdAt: new Date('2024-01-16T12:00:00'),
    updatedAt: new Date('2024-01-16T12:00:00')
  },
  {
    id: 'ORD-005',
    items: [
      {
        product: {
          ...mockProducts[3], // Running Shoes
          // Override with specific variant data - US 9 Black selected
          selectedVariant: {
            id: 'var_013',
            name: 'US 9 Black',
            price: 129.99,
            inStock: false,
            selectedAttributes: {
              'attr_013': 'val_021', // Size: US 9
              'attr_014': 'val_023'  // Color: Black
            }
          }
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
    status: 'cancelled' as const,
    createdAt: new Date('2024-01-12T08:15:00'),
    updatedAt: new Date('2024-01-13T10:20:00')
  }
];
