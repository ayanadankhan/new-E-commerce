// PURPOSE: Inventory listing and bulk stock updates with audit logging.

import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import {
  canManageInventory,
  canManageOrders,
  getScopedTenantId,
} from "@/lib/access-control";
import { connectDB } from "@/lib/db";
import { resolveTenantId } from "@/lib/tenant-context";
import { Product } from "@/models/Product";
import { InventoryLog } from "@/models/InventoryLog";
import { serializeProduct } from "@/lib/serializers";
import type { Product as ProductType } from "@/types";

const bulkSchema = z.object({
  tenantId: z.string().min(1),
  updates: z
    .array(
      z.object({
        productId: z.string().min(1),
        stock: z.number().int().min(0),
      })
    )
    .min(1),
});

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
    if (!canManageOrders(session?.user, tenantId)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    await connectDB();
    const products = await Product.find({
      tenantId: new mongoose.Types.ObjectId(tenantId),
    })
      .sort({ name: 1 })
      .lean();
    const list: ProductType[] = products.map((p) => serializeProduct(p));
    return NextResponse.json({ success: true, data: { products: list } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const body: unknown = await req.json();
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().formErrors.join(", ") },
        { status: 400 }
      );
    }
    const scopedTenantId = getScopedTenantId(session?.user, parsed.data.tenantId, [
      "SUPER_ADMIN",
      "STORE_OWNER",
    ]);
    if (!scopedTenantId || !canManageInventory(session?.user, scopedTenantId)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    await connectDB();
    const tenantOid = new mongoose.Types.ObjectId(scopedTenantId);
    const userOid = session.user?.id
      ? new mongoose.Types.ObjectId(session.user.id)
      : undefined;

    for (const u of parsed.data.updates) {
      const product = await Product.findOne({
        _id: u.productId,
        tenantId: tenantOid,
      });
      if (!product) continue;
      const prev = product.stock;
      const next = u.stock;
      if (prev === next) continue;
      product.stock = next;
      await product.save();
      await InventoryLog.create({
        productId: product._id,
        productName: product.name,
        change: next - prev,
        previousStock: prev,
        newStock: next,
        reason: "Bulk inventory update",
        userId: userOid,
        tenantId: tenantOid,
      });
    }

    return NextResponse.json({ success: true, data: { updated: true } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
