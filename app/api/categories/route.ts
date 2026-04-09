// PURPOSE: List and create categories for a tenant catalog.

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { canManageCatalog, getScopedTenantId } from "@/lib/access-control";
import { resolveTenantId } from "@/lib/tenant-context";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { categorySchema } from "@/lib/validations";
import { serializeCategory } from "@/lib/serializers";

export async function GET(req: Request) {
  try {
    await connectDB();
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
    const categories = await Category.find({
      tenantId: new mongoose.Types.ObjectId(tenantId),
    })
      .sort({ name: 1 })
      .lean();

    const counts = await Product.aggregate<{ _id: string; c: number }>([
      {
        $match: {
          tenantId: new mongoose.Types.ObjectId(tenantId),
          isActive: true,
        },
      },
      { $group: { _id: "$categoryId", c: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((x) => [String(x._id), x.c]));

    const withCounts = categories.map((c) =>
      serializeCategory({
        ...c,
        productCount: countMap.get(String(c._id)) ?? 0,
      })
    );

    return NextResponse.json({
      success: true,
      data: { categories: withCounts },
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
    const parsed = categorySchema.safeParse(body);
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
    ]);
    if (!tenantId || !canManageCatalog(session?.user, tenantId)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    await connectDB();
    const created = await Category.create({
      ...data,
      tenantId: new mongoose.Types.ObjectId(tenantId),
      productCount: 0,
    });
    return NextResponse.json({
      success: true,
      data: { category: serializeCategory(created) },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
