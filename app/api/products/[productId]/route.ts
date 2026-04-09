// PURPOSE: Read, update, or delete a single product by id.

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { canManageCatalog } from "@/lib/access-control";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { productSchema } from "@/lib/validations";
import { serializeProduct } from "@/lib/serializers";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { productId } = await params;
    if (!mongoose.isValidObjectId(productId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product id" },
        { status: 400 }
      );
    }
    await connectDB();
    const doc = await Product.findById(productId).lean();
    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { product: serializeProduct(doc) },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { productId } = await params;
    if (!mongoose.isValidObjectId(productId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product id" },
        { status: 400 }
      );
    }
    await connectDB();
    const existing = await Product.findById(productId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    if (!canManageCatalog(session?.user, String(existing.tenantId))) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    const body: unknown = await req.json();
    const bodyObj =
      body !== null && typeof body === "object" && !Array.isArray(body)
        ? (body as Record<string, unknown>)
        : {};
    const categoryFromBody =
      typeof bodyObj.categoryId === "string" ? bodyObj.categoryId : undefined;
    const parsed = productSchema.partial().safeParse({
      ...bodyObj,
      tenantId: String(existing.tenantId),
      categoryId: categoryFromBody ?? String(existing.categoryId),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().formErrors.join(", ") },
        { status: 400 }
      );
    }
    const { tenantId: _tenantId, categoryId, ...rest } = parsed.data;
    void _tenantId;
    if (categoryId) {
      const category = await Category.findOne({
        _id: new mongoose.Types.ObjectId(categoryId),
        tenantId: existing.tenantId,
      })
        .select("_id")
        .lean();
      if (!category) {
        return NextResponse.json(
          { success: false, error: "Category not found for this tenant" },
          { status: 400 }
        );
      }
      existing.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    Object.assign(existing, rest);
    await existing.save();
    return NextResponse.json({
      success: true,
      data: { product: serializeProduct(existing) },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { productId } = await params;
    if (!mongoose.isValidObjectId(productId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product id" },
        { status: 400 }
      );
    }
    await connectDB();
    const existing = await Product.findById(productId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    if (!canManageCatalog(session?.user, String(existing.tenantId))) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    await existing.deleteOne();
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
