// PURPOSE: Resolve tenant Mongo id from query params or middleware tenant slug header.

import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Tenant } from "@/models/Tenant";

export async function resolveTenantId(input: {
  tenantId: string | null;
  tenantSlug: string | null;
}): Promise<string | null> {
  if (input.tenantId && input.tenantId.length === 24) {
    return input.tenantId;
  }
  if (!input.tenantSlug) {
    return null;
  }
  await connectDB();
  const t = await Tenant.findOne({ slug: input.tenantSlug }).lean();
  return t ? String(t._id) : null;
}

export function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

export function toObjectId(id: string): mongoose.Types.ObjectId | null {
  if (!isValidObjectId(id)) return null;
  return new mongoose.Types.ObjectId(id);
}
