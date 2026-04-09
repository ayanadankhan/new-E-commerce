// PURPOSE: List and create products with tenant scoping, filters, and pagination.

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { canManageCatalog, getScopedTenantId } from "@/lib/access-control";
import { connectDB } from "@/lib/db";
import { resolveTenantId } from "@/lib/tenant-context";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { productSchema } from "@/lib/validations";
import { serializeProduct } from "@/lib/serializers";
import type { Product as ProductType } from "@/types";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const tenantIdParam = searchParams.get("tenantId");
    const slug =
      searchParams.get("tenantSlug") ?? req.headers.get("x-tenant-slug");
    const tenantId = await resolveTenantId({
      tenantId: tenantIdParam,
      tenantSlug: slug,
    });
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "tenantId or valid tenant slug required" },
        { status: 400 }
      );
    }
    const category = searchParams.get("category");
    const search = searchParams.get("search") ?? "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "12")));
    const sort = searchParams.get("sort") ?? "newest";

    const filter: Record<string, unknown> = {
      tenantId: new mongoose.Types.ObjectId(tenantId),
      isActive: true,
    };
    if (category) {
      if (mongoose.isValidObjectId(category)) {
        filter.categoryId = new mongoose.Types.ObjectId(category);
      } else {
        const cat = await Category.findOne({
          tenantId,
          slug: category,
        }).lean();
        if (cat) {
          filter.categoryId = cat._id;
        }
      }
    }
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (minPrice) {
      filter.price = { ...(filter.price as object), $gte: Number(minPrice) };
    }
    if (maxPrice) {
      filter.price = { ...(filter.price as object), $lte: Number(maxPrice) };
    }
    if (inStock === "true") {
      filter.stock = { $gt: 0 };
    }

    let sortKey: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "price_asc") sortKey = { price: 1 };
    if (sort === "price_desc") sortKey = { price: -1 };
    if (sort === "popular") sortKey = { stock: -1 };

    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      Product.find(filter).sort(sortKey).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    const products: ProductType[] = rows.map((r) =>
      serializeProduct(r)
    );
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      success: true,
      data: { products, total, page, totalPages },
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
    const parsed = productSchema.safeParse(body);
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
    const category = await Category.findOne({
      _id: new mongoose.Types.ObjectId(data.categoryId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    })
      .select("_id")
      .lean();
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found for this tenant" },
        { status: 400 }
      );
    }
    const created = await Product.create({
      ...data,
      tenantId: new mongoose.Types.ObjectId(tenantId),
      categoryId: new mongoose.Types.ObjectId(data.categoryId),
    });
    return NextResponse.json({
      success: true,
      data: { product: serializeProduct(created) },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
