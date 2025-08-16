export interface ProductAttribute {
  id: string;
  name: string;
  type: 'color' | 'size' | 'material' | 'style';
  values: ProductAttributeValue[];
  required?: boolean;
}

export interface ProductAttributeValue {
  id: string;
  value: string;
  label?: string;
  hexColor?: string; // For color attributes
  priceModifier?: number; // Price adjustment for this option
  inStock?: boolean;
  imageUrl?: string; // Optional image for this variant
}

export interface LocalizedContent {
  en: string;
  ar: string;
}

export interface Product {
  id: string;
  name: string | LocalizedContent;
  name_en?: string;
  name_ar?: string;
  slug: string;
  price: number;
  // Discount fields
  salePrice?: number | null;
  discountPercent?: number | null;
  onSale?: boolean;
  saleStartDate?: Date | string | null;
  saleEndDate?: Date | string | null;
  // End discount fields
  image: string;
  category: string | LocalizedContent | { id?: string; name_en: string; name_ar: string; slug: string } | { en: string; ar: string; id?: string };
  categoryId?: string;
  description?: string | LocalizedContent;
  description_en?: string;
  description_ar?: string;
  inStock?: boolean;
  rating?: number;
  reviews?: number;
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
}

// Multilingual version for admin panel
export interface MultilingualProduct {
  id: string;
  name: LocalizedContent;
  slug: string;
  price: number;
  // Discount fields
  salePrice?: number | null;
  discountPercent?: number | null;
  onSale?: boolean;
  saleStartDate?: Date | string | null;
  saleEndDate?: Date | string | null;
  // End discount fields
  image: string;
  category: LocalizedContent;
  description?: LocalizedContent;
  inStock?: boolean;
  rating?: number;
  reviews?: number;
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  seo?: {
    title?: LocalizedContent;
    metaDescription?: LocalizedContent;
    keywords?: LocalizedContent;
  };
}

export interface ProductVariant {
  id: string;
  attributeValues: { [attributeId: string]: string } | any[]; // Maps attribute ID to selected value ID or array for complex structures
  price?: number; // Override price for this variant
  image?: string; // Specific image for this variant
  sku?: string;
  inStock?: boolean;
  stockQuantity?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedAttributes?: { [attributeId: string]: string };
  variantId?: string; // Unique identifier for this specific variant
  variantPrice?: number; // Price for this specific variant
  variantImage?: string; // Selected variant image
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface Category {
  id: string;
  name: string;
  name_en: string;
  name_ar: string;
  slug: string;
  icon?: string;
}

// Multilingual version for admin panel
export interface MultilingualCategory {
  id: string;
  name: LocalizedContent;
  slug: string;
  description?: LocalizedContent;
  icon?: string;
  parentId?: string; // For subcategories
  isActive?: boolean;
  sortOrder?: number;
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
  // Add role for RBAC
  role: 'admin' | 'manager' | 'support' | 'viewer';
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
  type: 'card' | 'paypal' | 'stripe' | 'apple_pay' | 'google_pay' | 'cod';
  name: string;
  icon?: string;
  description?: string;
  codFee?: number; // Additional fee for COD
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
  selectedAttributes?: { [attributeId: string]: string };
  variantImage?: string; // Selected variant image
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  codFee: number;
  total: number;
  billingAddress: BillingAddress;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  trackingNumber?: string;
  trackingProvider?: 'fedex' | 'ups' | 'usps' | 'dhl' | 'custom';
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
  productId: string;
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
  productId: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  lastRestocked: Date;
  stockHistory: StockHistory[];
}

export interface StockHistory {
  id: string;
  productId: string;
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

// Contact Query Types
export interface ContactQuery {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'in progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}
