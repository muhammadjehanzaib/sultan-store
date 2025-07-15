import { Customer, Review, InventoryItem, StockHistory } from '@/types';
import { mockOrders } from './mockOrders';

// Generate customers from orders data
export const mockCustomers: Customer[] = [
  {
    id: 'cust-001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    avatar: '/images/avatars/john.jpg',
    createdAt: new Date('2023-06-15'),
    lastLoginAt: new Date('2024-01-15'),
    totalOrders: 2,
    totalSpent: 426.35,
    status: 'active',
    addresses: [
      {
        id: 'addr-001',
        type: 'billing',
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        phone: '+1234567890',
        isDefault: true
      }
    ],
    orders: mockOrders.filter(order => order.billingAddress.email === 'john@example.com')
  },
  {
    id: 'cust-002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '+1987654321',
    avatar: '/images/avatars/jane.jpg',
    createdAt: new Date('2023-08-22'),
    lastLoginAt: new Date('2024-01-14'),
    totalOrders: 1,
    totalSpent: 92.38,
    status: 'active',
    addresses: [
      {
        id: 'addr-002',
        type: 'billing',
        firstName: 'Jane',
        lastName: 'Smith',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
        phone: '+1987654321',
        isDefault: true
      }
    ],
    orders: mockOrders.filter(order => order.billingAddress.email === 'jane@example.com')
  },
  {
    id: 'cust-003',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    email: 'ahmed@example.com',
    phone: '+201234567890',
    avatar: '/images/avatars/ahmed.jpg',
    createdAt: new Date('2023-05-10'),
    lastLoginAt: new Date('2024-01-13'),
    totalOrders: 1,
    totalSpent: 115.97,
    status: 'active',
    addresses: [
      {
        id: 'addr-003',
        type: 'billing',
        firstName: 'Ahmed',
        lastName: 'Hassan',
        address: '789 Nile St',
        city: 'Cairo',
        state: 'Cairo',
        zipCode: '11511',
        country: 'Egypt',
        phone: '+201234567890',
        isDefault: true
      }
    ],
    orders: mockOrders.filter(order => order.billingAddress.email === 'ahmed@example.com')
  },
  {
    id: 'cust-004',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria@example.com',
    phone: '+34987654321',
    avatar: '/images/avatars/maria.jpg',
    createdAt: new Date('2023-11-03'),
    lastLoginAt: new Date('2024-01-16'),
    totalOrders: 1,
    totalSpent: 42.78,
    status: 'active',
    addresses: [
      {
        id: 'addr-004',
        type: 'billing',
        firstName: 'Maria',
        lastName: 'Garcia',
        address: '321 Barcelona St',
        city: 'Madrid',
        state: 'Madrid',
        zipCode: '28001',
        country: 'Spain',
        phone: '+34987654321',
        isDefault: true
      }
    ],
    orders: mockOrders.filter(order => order.billingAddress.email === 'maria@example.com')
  },
  {
    id: 'cust-005',
    firstName: 'Ali',
    lastName: 'Abdullah',
    email: 'ali@example.com',
    phone: '+966501234567',
    avatar: '/images/avatars/ali.jpg',
    createdAt: new Date('2023-07-18'),
    lastLoginAt: new Date('2024-01-12'),
    totalOrders: 1,
    totalSpent: 149.38,
    status: 'blocked',
    addresses: [
      {
        id: 'addr-005',
        type: 'billing',
        firstName: 'Ali',
        lastName: 'Abdullah',
        address: '555 Riyadh Rd',
        city: 'Riyadh',
        state: 'Riyadh',
        zipCode: '11564',
        country: 'Saudi Arabia',
        phone: '+966501234567',
        isDefault: true
      }
    ],
    orders: mockOrders.filter(order => order.billingAddress.email === 'ali@example.com')
  }
];

// Mock reviews data
export const mockReviews: Review[] = [
  {
    id: 'rev-001',
    productId: 1,
    customerId: 'cust-001',
    customerName: 'John Doe',
    rating: 5,
    title: 'Excellent headphones!',
    comment: 'Amazing sound quality and comfortable to wear for hours. The noise cancellation works perfectly.',
    status: 'approved',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    helpful: 12,
    verified: true,
    response: {
      id: 'resp-001',
      adminId: 'admin-001',
      adminName: 'Admin User',
      message: 'Thank you for your detailed review! We\'re glad you\'re enjoying the headphones.',
      createdAt: new Date('2024-01-17')
    }
  },
  {
    id: 'rev-002',
    productId: 2,
    customerId: 'cust-002',
    customerName: 'Jane Smith',
    rating: 4,
    title: 'Good smartwatch',
    comment: 'Great features and battery life. The health tracking is very accurate.',
    status: 'approved',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    helpful: 8,
    verified: true
  },
  {
    id: 'rev-003',
    productId: 3,
    customerId: 'cust-003',
    customerName: 'Ahmed Hassan',
    rating: 5,
    title: 'Perfect coffee maker',
    comment: 'Makes excellent coffee every morning. The timer feature is very convenient.',
    status: 'approved',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    helpful: 15,
    verified: true
  },
  {
    id: 'rev-004',
    productId: 4,
    customerId: 'cust-004',
    customerName: 'Maria Garcia',
    rating: 3,
    title: 'Decent shoes but sizing issues',
    comment: 'The quality is good but they run small. I had to return and get a larger size.',
    status: 'pending',
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
    helpful: 5,
    verified: false
  },
  {
    id: 'rev-005',
    productId: 5,
    customerId: 'cust-005',
    customerName: 'Ali Abdullah',
    rating: 2,
    title: 'Not as advertised',
    comment: 'The sound quality is not as good as described. Battery life is shorter than expected.',
    status: 'pending',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    helpful: 3,
    verified: true
  },
  {
    id: 'rev-006',
    productId: 6,
    customerId: 'cust-001',
    customerName: 'John Doe',
    rating: 4,
    title: 'Great desk lamp',
    comment: 'Provides excellent lighting for work. The adjustable brightness is perfect.',
    status: 'approved',
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11'),
    helpful: 7,
    verified: true
  }
];

// Mock inventory data
export const mockInventory: InventoryItem[] = [
  {
    productId: 1,
    currentStock: 45,
    minimumStock: 10,
    maximumStock: 100,
    reorderPoint: 20,
    lastRestocked: new Date('2024-01-10'),
    stockHistory: [
      {
        id: 'hist-001',
        productId: 1,
        type: 'in',
        quantity: 50,
        reason: 'Initial stock',
        adminId: 'admin-001',
        adminName: 'Admin User',
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'hist-002',
        productId: 1,
        type: 'out',
        quantity: 3,
        reason: 'Sales',
        adminId: 'admin-001',
        adminName: 'Admin User',
        createdAt: new Date('2024-01-15')
      },
      {
        id: 'hist-003',
        productId: 1,
        type: 'adjustment',
        quantity: -2,
        reason: 'Damaged goods',
        adminId: 'admin-001',
        adminName: 'Admin User',
        createdAt: new Date('2024-01-16')
      }
    ]
  },
  {
    productId: 2,
    currentStock: 28,
    minimumStock: 5,
    maximumStock: 50,
    reorderPoint: 15,
    lastRestocked: new Date('2024-01-08'),
    stockHistory: [
      {
        id: 'hist-004',
        productId: 2,
        type: 'in',
        quantity: 30,
        reason: 'Restock',
        adminId: 'admin-001',
        adminName: 'Admin User',
        createdAt: new Date('2024-01-08')
      },
      {
        id: 'hist-005',
        productId: 2,
        type: 'out',
        quantity: 2,
        reason: 'Sales',
        adminId: 'admin-001',
        adminName: 'Admin User',
        createdAt: new Date('2024-01-15')
      }
    ]
  },
  {
    productId: 3,
    currentStock: 15,
    minimumStock: 8,
    maximumStock: 40,
    reorderPoint: 12,
    lastRestocked: new Date('2024-01-05'),
    stockHistory: [
      {
        id: 'hist-006',
        productId: 3,
        type: 'in',
        quantity: 20,
        reason: 'New shipment',
        adminId: 'admin-001',
        adminName: 'Admin User',
        createdAt: new Date('2024-01-05')
      },
      {
        id: 'hist-007',
        productId: 3,
        type: 'out',
        quantity: 5,
        reason: 'Sales',
        adminId: 'admin-001',
        adminName: 'Admin User',
        createdAt: new Date('2024-01-14')
      }
    ]
  },
  {
    productId: 4,
    currentStock: 0,
    minimumStock: 10,
    maximumStock: 60,
    reorderPoint: 20,
    lastRestocked: new Date('2023-12-20'),
    stockHistory: [
      {
        id: 'hist-008',
        productId: 4,
        type: 'in',
        quantity: 25,
        reason: 'Initial stock',
        adminId: 'admin-001',
        adminName: 'Admin User',
        createdAt: new Date('2023-12-20')
      },
      {
        id: 'hist-009',
        productId: 4,
        type: 'out',
        quantity: 25,
        reason: 'Sales',
        adminId: 'admin-001',
        adminName: 'Admin User',
        createdAt: new Date('2024-01-10')
      }
    ]
  },
  {
    productId: 5,
    currentStock: 8,
    minimumStock: 15,
    maximumStock: 80,
    reorderPoint: 25,
    lastRestocked: new Date('2024-01-12'),
    stockHistory: [
      {
        id: 'hist-010',
        productId: 5,
        type: 'in',
        quantity: 40,
        reason: 'Restock',
        adminId: 'admin-001',
        adminName: 'Admin User',
        createdAt: new Date('2024-01-12')
      },
      {
        id: 'hist-011',
        productId: 5,
        type: 'out',
        quantity: 32,
        reason: 'Sales',
        adminId: 'admin-001',
        adminName: 'Admin User',
        createdAt: new Date('2024-01-13')
      }
    ]
  },
  {
    productId: 6,
    currentStock: 22,
    minimumStock: 12,
    maximumStock: 50,
    reorderPoint: 18,
    lastRestocked: new Date('2024-01-06'),
    stockHistory: [
      {
        id: 'hist-012',
        productId: 6,
        type: 'in',
        quantity: 30,
        reason: 'New shipment',
        adminId: 'admin-001',
        adminName: 'Admin User',
        createdAt: new Date('2024-01-06')
      },
      {
        id: 'hist-013',
        productId: 6,
        type: 'out',
        quantity: 8,
        reason: 'Sales',
        adminId: 'admin-001',
        adminName: 'Admin User',
        createdAt: new Date('2024-01-16')
      }
    ]
  },
  {
    productId: 7,
    currentStock: 15,
    minimumStock: 2,
    maximumStock: 30,
    reorderPoint: 3,
    lastRestocked: new Date('2024-01-17'),
    stockHistory: [
      {
        id: 'hist-100',
        productId: 7,
        type: 'in',
        quantity: 15,
        reason: 'Initial stock',
        adminId: 'admin-001',
        adminName: 'Admin User',
        createdAt: new Date('2024-01-17')
      }
    ]
  }
];

// Mock admin users for authentication and RBAC
export const mockAdminUsers = [
  {
    id: 'admin-001',
    email: 'admin@example.com',
    name: 'Super Admin',
    role: 'admin',
    password: 'adminpass',
    avatar: '/images/avatars/john.jpg',
    createdAt: new Date('2023-01-01')
  },
  {
    id: 'manager-001',
    email: 'manager@example.com',
    name: 'Product Manager',
    role: 'manager',
    password: 'managerpass',
    avatar: '/images/avatars/jane.jpg',
    createdAt: new Date('2023-02-01')
  },
  {
    id: 'support-001',
    email: 'support@example.com',
    name: 'Support Staff',
    role: 'support',
    password: 'supportpass',
    avatar: '/images/avatars/ahmed.jpg',
    createdAt: new Date('2023-03-01')
  },
  {
    id: 'viewer-001',
    email: 'viewer@example.com',
    name: 'Read Only',
    role: 'viewer',
    password: 'viewerpass',
    avatar: '/images/avatars/maria.jpg',
    createdAt: new Date('2023-04-01')
  }
];
