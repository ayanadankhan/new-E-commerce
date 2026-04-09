// PURPOSE: Zod schemas for API and form validation across tenants, products, orders, and auth.

import { z } from "zod";
import { ORDER_STATUSES } from "@/lib/constants";

const addressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(128, "Password is too long")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/\d/, "Password must include a number");

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    storeName: z.string().min(2, "Store name is required"),
    storeSlug: z
      .string()
      .min(2)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  })
  .strict();

export const tenantSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug"),
  logo: z.string().url().optional().or(z.literal("")),
  currency: z.string().min(3).max(3),
  timezone: z.string().min(1),
  description: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  plan: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug"),
  description: z.string().max(10000).default(""),
  price: z.number().min(0).max(1_000_000),
  compareAtPrice: z.number().min(0).max(1_000_000).optional(),
  costPerItem: z.number().min(0).max(1_000_000).optional(),
  stock: z.number().int().min(0).max(1_000_000),
  weight: z.number().min(0).optional(),
  images: z.array(z.string().url()).max(20).default([]),
  categoryId: z.string().min(1, "Category is required"),
  tenantId: z.string().min(1),
  isActive: z.boolean().default(true),
  sku: z.string().min(1).max(64),
  barcode: z.string().max(64).optional(),
});

export const orderItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(9999),
});

export const orderSchema = z.object({
  tenantId: z.string().min(1),
  channel: z.enum(["ONLINE", "POS"]),
  items: z.array(orderItemInputSchema).min(1, "At least one item"),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  shippingAddress: addressSchema,
  shipping: z.number().min(0).default(0),
});

export const customerSchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(32).optional(),
  addresses: z.array(addressSchema).default([]),
});

export const customerUpdateSchema = customerSchema.partial().extend({
  tenantId: z.string().min(1),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES as unknown as [string, ...string[]]),
});

export const categorySchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  image: z.string().url().optional().or(z.literal("")),
});
