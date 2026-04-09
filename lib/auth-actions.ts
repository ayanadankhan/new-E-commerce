// PURPOSE: Server-only credential verification for NextAuth (loaded dynamically from authorize).

import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User as UserModel } from "@/models/User";
import { Tenant } from "@/models/Tenant";
import { consumeRateLimit, resetRateLimit } from "@/lib/rate-limit";
import type { UserRole } from "@/types";

export async function loginWithCredentials(input: {
  email: string;
  password: string;
  tenantSlug?: string;
}) {
  const email = input.email.toLowerCase().trim();
  const password = input.password;
  const tenantSlugRaw = input.tenantSlug?.toLowerCase().trim() ?? "";
  const throttle = consumeRateLimit(`login:${email}`, {
    max: 5,
    windowMs: 10 * 60 * 1000,
    blockMs: 15 * 60 * 1000,
  });
  if (!throttle.allowed) {
    return null;
  }

  await connectDB();
  const userDoc = await UserModel.findOne({ email }).select("+passwordHash").lean();
  if (!userDoc?.passwordHash) {
    return null;
  }
  const valid = await bcrypt.compare(password, userDoc.passwordHash);
  if (!valid) {
    return null;
  }

  const role = userDoc.role as UserRole;
  resetRateLimit(`login:${email}`);

  if (role === "CUSTOMER") {
    if (!tenantSlugRaw) {
      return null;
    }
    const tenant = await Tenant.findOne({ slug: tenantSlugRaw }).lean();
    if (!tenant || String(userDoc.tenantId) !== String(tenant._id)) {
      return null;
    }
    return {
      id: String(userDoc._id),
      email: userDoc.email,
      name: userDoc.name,
      role,
      tenantId: String(userDoc.tenantId),
      tenantSlug: tenant.slug,
    };
  }

  let tenantSlug: string | undefined;
  if (userDoc.tenantId) {
    const tenant = await Tenant.findById(userDoc.tenantId).lean();
    tenantSlug = tenant?.slug;
  }

  if (
    tenantSlugRaw &&
    role !== "SUPER_ADMIN" &&
    tenantSlug &&
    tenantSlug !== tenantSlugRaw
  ) {
    return null;
  }

  return {
    id: String(userDoc._id),
    email: userDoc.email,
    name: userDoc.name,
    role,
    tenantId: userDoc.tenantId ? String(userDoc.tenantId) : undefined,
    tenantSlug,
  };
}
