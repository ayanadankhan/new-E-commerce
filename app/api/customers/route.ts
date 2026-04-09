// PURPOSE: List and register customers for a tenant.

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import {
  canCreateCustomers,
  canReadCustomers,
  getScopedTenantId,
} from "@/lib/access-control";
import { connectDB } from "@/lib/db";
import { resolveTenantId } from "@/lib/tenant-context";
import { Customer } from "@/models/Customer";
import { customerSchema } from "@/lib/validations";
import { serializeCustomer } from "@/lib/serializers";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const tenantId = await resolveTenantId({
      tenantId: searchParams.get("tenantId"),
      tenantSlug:
        searchParams.get("tenantSlug") ?? req.headers.get("x-tenant-slug"),
    });
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "tenantId or tenant slug required" },
        { status: 400 }
      );
    }
    if (!canReadCustomers(session?.user, tenantId)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    const q = searchParams.get("search") ?? "";
    await connectDB();
    const filter: Record<string, unknown> = {
      tenantId: new mongoose.Types.ObjectId(tenantId),
    };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }
    const customers = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return NextResponse.json({
      success: true,
      data: { customers: customers.map((c) => serializeCustomer(c)) },
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
    const session = await auth();
    const body: unknown = await req.json();
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().formErrors.join(", ") },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const tenantId = getScopedTenantId(session?.user, data.tenantId, [
      "SUPER_ADMIN",
      "STORE_OWNER",
      "CASHIER",
    ]);
    if (!tenantId || !canCreateCustomers(session?.user, tenantId)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    await connectDB();
    const created = await Customer.create({
      ...data,
      email: data.email.toLowerCase(),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    });
    return NextResponse.json({
      success: true,
      data: { customer: serializeCustomer(created) },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
