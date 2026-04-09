// PURPOSE: Shared TypeScript interfaces for Nexus Commerce domain models and API shapes.

export type UserRole =
  | "SUPER_ADMIN"
  | "STORE_OWNER"
  | "CASHIER"
  | "CUSTOMER";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderChannel = "ONLINE" | "POS";

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  currency: string;
  timezone: string;
  plan: string;
  description?: string;
  contactEmail?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string;
  tenantSlug?: string;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  stock: number;
  weight?: number;
  images: string[];
  categoryId: string;
  tenantId: string;
  isActive: boolean;
  sku: string;
  barcode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  tenantId: string;
  productCount: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderCustomerSnapshot {
  name: string;
  email: string;
  phone?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  customer: OrderCustomerSnapshot;
  customerId?: string;
  shippingAddress: Address;
  channel: OrderChannel;
  tenantId: string;
  createdAt: string;
  statusHistory?: { status: OrderStatus; at: string }[];
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  addresses: Address[];
  tenantId: string;
  totalOrders: number;
  totalSpent: number;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  change: number;
  previousStock: number;
  newStock: number;
  reason: string;
  userId?: string;
  tenantId: string;
  createdAt: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
