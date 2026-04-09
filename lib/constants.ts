// PURPOSE: Application-wide constants for statuses, roles, currencies, and labels.

import type { OrderStatus, UserRole } from "@/types";

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const USER_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "STORE_OWNER",
  "CASHIER",
  "CUSTOMER",
];

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  STORE_OWNER: "Store Owner",
  CASHIER: "Cashier",
  CUSTOMER: "Customer",
};

export const CURRENCIES = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
] as const;

export const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
  "UTC",
] as const;

export const LOW_STOCK_THRESHOLD = 5;

export const DEFAULT_TAX_RATE = 0.1;
