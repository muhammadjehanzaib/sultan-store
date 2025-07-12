export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  inStock?: boolean;
  rating?: number;
  reviews?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  isGuest?: boolean;
  addresses?: Address[];
  createdAt?: Date;
}

export interface Address {
  id: string;
  type: 'billing' | 'shipping';
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface GuestCheckoutData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'stripe' | 'apple_pay' | 'google_pay';
  name: string;
  icon?: string;
  description?: string;
}

export interface BillingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ShippingAddress extends BillingAddress {
  isDefault?: boolean;
}

export interface PaymentDetails {
  method: PaymentMethod;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  saveCard?: boolean;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  billingAddress: BillingAddress;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  trackingNumber?: string;
}

// Customer Management Types
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'blocked';
  addresses: Address[];
  orders: Order[];
}

// Review Management Types
export interface Review {
  id: string;
  productId: number;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  helpful?: number;
  verified?: boolean;
  response?: ReviewResponse;
}

export interface ReviewResponse {
  id: string;
  adminId: string;
  adminName: string;
  message: string;
  createdAt: Date;
}

// Inventory Management Types
export interface InventoryItem {
  productId: number;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  lastRestocked: Date;
  stockHistory: StockHistory[];
}

export interface StockHistory {
  id: string;
  productId: number;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  adminId: string;
  adminName: string;
  createdAt: Date;
}

// Settings Types
export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  timezone: string;
  language: string;
  maintenanceMode: boolean;
}

export interface PaymentSettings {
  stripeEnabled: boolean;
  stripePublishableKey: string;
  stripeSecretKey: string;
  paypalEnabled: boolean;
  paypalClientId: string;
  paypalClientSecret: string;
}

export interface ShippingSettings {
  freeShippingThreshold: number;
  standardShippingRate: number;
  expressShippingRate: number;
  internationalShippingRate: number;
  processingTime: number;
}

export interface TaxSettings {
  taxEnabled: boolean;
  taxRate: number;
  taxIncluded: boolean;
  taxDisplayType: 'inclusive' | 'exclusive';
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
