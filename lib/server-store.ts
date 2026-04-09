// PURPOSE: Server-only database helpers for storefront and admin RSC pages.

import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Tenant as TenantModel } from "@/models/Tenant";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { Customer } from "@/models/Customer";
import { serializeTenant, serializeProduct, serializeCategory } from "@/lib/serializers";
import type { Tenant, Product as ProductType, Category as CategoryType } from "@/types";

export async function getTenantBySlug(
  slug: string
): Promise<Tenant | null> {
  await connectDB();
  const doc = await TenantModel.findOne({ slug }).lean();
  return doc ? serializeTenant(doc) : null;
}

export async function getTenantObjectIdBySlug(
  slug: string
): Promise<mongoose.Types.ObjectId | null> {
  await connectDB();
  const doc = await TenantModel.findOne({ slug }).select("_id").lean();
  return doc?._id ?? null;
}

export async function listCategoriesForTenant(
  tenantId: string
): Promise<CategoryType[]> {
  await connectDB();
  const oid = new mongoose.Types.ObjectId(tenantId);
  const rows = await Category.find({ tenantId: oid }).sort({ name: 1 }).lean();
  const counts = await Product.aggregate<{ _id: mongoose.Types.ObjectId; c: number }>([
    { $match: { tenantId: oid, isActive: true } },
    { $group: { _id: "$categoryId", c: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((x) => [String(x._id), x.c]));
  return rows.map((c) =>
    serializeCategory({
      ...c,
      productCount: countMap.get(String(c._id)) ?? 0,
    })
  );
}

export async function listFeaturedProducts(
  tenantId: string,
  limit = 8
): Promise<ProductType[]> {
  await connectDB();
  const oid = new mongoose.Types.ObjectId(tenantId);
  const rows = await Product.find({ tenantId: oid, isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return rows.map((r) => serializeProduct(r));
}

export async function getProductById(
  id: string
): Promise<ProductType | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const row = await Product.findById(id).lean();
  return row ? serializeProduct(row) : null;
}

export async function listProductsForTenant(
  tenantId: string,
  opts: { categoryId?: string; limit?: number; skip?: number } = {}
): Promise<ProductType[]> {
  await connectDB();
  const oid = new mongoose.Types.ObjectId(tenantId);
  const filter: Record<string, unknown> = { tenantId: oid, isActive: true };
  if (opts.categoryId && mongoose.isValidObjectId(opts.categoryId)) {
    filter.categoryId = new mongoose.Types.ObjectId(opts.categoryId);
  }
  const rows = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip(opts.skip ?? 0)
    .limit(opts.limit ?? 24)
    .lean();
  return rows.map((r) => serializeProduct(r));
}

export async function listOrdersForTenant(
  tenantId: string,
  limit = 50
) {
  await connectDB();
  const oid = new mongoose.Types.ObjectId(tenantId);
  const rows = await Order.find({ tenantId: oid })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return rows;
}

export async function getOrderById(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  return Order.findById(id).lean();
}

export async function listCustomersForTenant(tenantId: string, limit = 100) {
  await connectDB();
  const oid = new mongoose.Types.ObjectId(tenantId);
  return Customer.find({ tenantId: oid }).sort({ createdAt: -1 }).limit(limit).lean();
}
