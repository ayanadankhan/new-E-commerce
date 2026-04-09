// PURPOSE: Update or delete a category by id.

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { canManageCatalog } from "@/lib/access-control";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { categorySchema } from "@/lib/validations";
import { serializeCategory } from "@/lib/serializers";

interface RouteParams {
  params: Promise<{ categoryId: string }>;
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { categoryId } = await params;
    if (!mongoose.isValidObjectId(categoryId)) {
      return NextResponse.json(
        { success: false, error: "Invalid category id" },
        { status: 400 }
      );
    }
    await connectDB();
    const existing = await Category.findById(categoryId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
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
    const parsed = categorySchema.partial().safeParse({
      ...(body as object),
      tenantId: String(existing.tenantId),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().formErrors.join(", ") },
        { status: 400 }
      );
    }
    const { tenantId: _tenantId, ...rest } = parsed.data;
    void _tenantId;
    Object.assign(existing, rest);
    await existing.save();
    return NextResponse.json({
      success: true,
      data: { category: serializeCategory(existing) },
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
    const { categoryId } = await params;
    if (!mongoose.isValidObjectId(categoryId)) {
      return NextResponse.json(
        { success: false, error: "Invalid category id" },
        { status: 400 }
      );
    }
    await connectDB();
    const existing = await Category.findById(categoryId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
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
