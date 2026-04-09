// PURPOSE: Map Mongoose documents to public API types for consistent JSON responses.

import type { Types } from "mongoose";
import type { CategoryDocument } from "@/models/Category";
import type { CustomerDocument } from "@/models/Customer";
import type { OrderDocument } from "@/models/Order";
import type { ProductDocument } from "@/models/Product";
import type { TenantDocument } from "@/models/Tenant";
import type {
  Category,
  Customer,
  Order,
  OrderItem,
  Product,
  Tenant,
} from "@/types";

export function serializeTenant(doc: TenantDocument): Tenant {
  return {
    id: String(doc._id),
    slug: doc.slug,
    name: doc.name,
    logo: doc.logo ?? undefined,
    currency: doc.currency,
    timezone: doc.timezone,
    plan: doc.plan,
    description: doc.description ?? undefined,
    contactEmail: doc.contactEmail ?? undefined,
    createdAt: doc.createdAt
      ? new Date(doc.createdAt).toISOString()
      : new Date().toISOString(),
  };
}

export function serializeProduct(doc: ProductDocument): Product {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    description: doc.description ?? "",
    price: doc.price,
    compareAtPrice: doc.compareAtPrice ?? undefined,
    costPerItem: doc.costPerItem ?? undefined,
    stock: doc.stock,
    weight: doc.weight ?? undefined,
    images: doc.images ?? [],
    categoryId: String(doc.categoryId),
    tenantId: String(doc.tenantId),
    isActive: doc.isActive,
    sku: doc.sku,
    barcode: doc.barcode ?? undefined,
    createdAt: doc.createdAt
      ? new Date(doc.createdAt).toISOString()
      : undefined,
    updatedAt: doc.updatedAt
      ? new Date(doc.updatedAt).toISOString()
      : undefined,
  };
}

export function serializeCategory(
  doc: Pick<CategoryDocument, "name" | "slug" | "image"> & {
    _id: Types.ObjectId | string;
    tenantId: Types.ObjectId | string;
    productCount?: number;
  }
): Category {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    image: doc.image ?? undefined,
    tenantId: String(doc.tenantId),
    productCount: doc.productCount ?? 0,
  };
}

export function serializeCustomer(doc: CustomerDocument): Customer {
  return {
    id: String(doc._id),
    email: doc.email,
    name: doc.name,
    phone: doc.phone ?? undefined,
    addresses: (doc.addresses ?? []).map((a) => ({
      line1: a.line1,
      line2: a.line2 ?? undefined,
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      country: a.country,
    })),
    tenantId: String(doc.tenantId),
    totalOrders: doc.totalOrders ?? 0,
    totalSpent: doc.totalSpent ?? 0,
    createdAt: doc.createdAt
      ? new Date(doc.createdAt).toISOString()
      : undefined,
  };
}

export function serializeOrderItem(
  item: OrderDocument["items"][number]
): OrderItem {
  return {
    productId: String(item.productId),
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image ?? undefined,
  };
}

export function serializeOrder(doc: OrderDocument): Order {
  return {
    id: String(doc._id),
    orderNumber: doc.orderNumber,
    items: doc.items.map(serializeOrderItem),
    subtotal: doc.subtotal,
    tax: doc.tax,
    shipping: doc.shipping,
    total: doc.total,
    status: doc.status,
    customer: {
      name: doc.customer?.name ?? "",
      email: doc.customer?.email ?? "",
      phone: doc.customer?.phone ?? undefined,
    },
    customerId: doc.customerId ? String(doc.customerId) : undefined,
    shippingAddress: {
      line1: doc.shippingAddress.line1,
      line2: doc.shippingAddress.line2 ?? undefined,
      city: doc.shippingAddress.city,
      state: doc.shippingAddress.state,
      postalCode: doc.shippingAddress.postalCode,
      country: doc.shippingAddress.country,
    },
    channel: doc.channel,
    tenantId: String(doc.tenantId),
    createdAt: doc.createdAt
      ? new Date(doc.createdAt).toISOString()
      : new Date().toISOString(),
    statusHistory: (doc.statusHistory ?? []).map((h) => ({
      status: h.status,
      at: new Date(h.at).toISOString(),
    })),
  };
}

export function tenantIdFromParam(
  id: string | Types.ObjectId | undefined
): string {
  return String(id);
}
