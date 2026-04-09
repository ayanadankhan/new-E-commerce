// PURPOSE: List tenants (super admin) and create a new tenant with owner user.

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Tenant } from "@/models/Tenant";
import { User } from "@/models/User";
import { registerSchema } from "@/lib/validations";
import { serializeTenant } from "@/lib/serializers";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    await connectDB();
    const tenants = await Tenant.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      success: true,
      data: { tenants: tenants.map((t) => serializeTenant(t)) },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().formErrors.join(", ") },
        { status: 400 }
      );
    }
    const { name, email, password, storeName, storeSlug } = parsed.data;
    await connectDB();
    const existing = await Tenant.findOne({ slug: storeSlug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Store slug already taken" },
        { status: 409 }
      );
    }
    const emailTaken = await User.findOne({ email: email.toLowerCase() });
    if (emailTaken) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 }
      );
    }
    const tenant = await Tenant.create({
      name: storeName,
      slug: storeSlug,
      currency: "USD",
      timezone: "UTC",
      plan: "starter",
    });
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: "STORE_OWNER",
      tenantId: tenant._id,
    });
    return NextResponse.json({
      success: true,
      data: { tenant: serializeTenant(tenant) },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
