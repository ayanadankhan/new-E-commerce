// PURPOSE: Aggregated analytics for revenue, orders, and category breakdown.

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { canManageOrders } from "@/lib/access-control";
import { connectDB } from "@/lib/db";
import { resolveTenantId } from "@/lib/tenant-context";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

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

    const start = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate") as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate") as string)
      : new Date();

    await connectDB();
    const tenantOid = new mongoose.Types.ObjectId(tenantId);

    const match = {
      tenantId: tenantOid,
      status: { $ne: "CANCELLED" },
      createdAt: { $gte: start, $lte: end },
    };

    const orders = await Order.find(match).lean();

    const revenueByDay = new Map<string, number>();
    const ordersByDay = new Map<string, number>();
    let totalRevenue = 0;
    for (const o of orders) {
      totalRevenue += o.total;
      const d = new Date(o.createdAt).toISOString().slice(0, 10);
      revenueByDay.set(d, (revenueByDay.get(d) ?? 0) + o.total);
      ordersByDay.set(d, (ordersByDay.get(d) ?? 0) + 1);
    }

    const revenue = Array.from(revenueByDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));

    const ordersVolume = Array.from(ordersByDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    const orderCount = orders.length;
    const avgOrderValue =
      orderCount > 0 ? Math.round((totalRevenue / orderCount) * 100) / 100 : 0;

    const productTotals = new Map<
      string,
      { name: string; units: number; revenue: number }
    >();
    for (const o of orders) {
      for (const it of o.items) {
        const key = String(it.productId);
        const cur = productTotals.get(key) ?? {
          name: it.name,
          units: 0,
          revenue: 0,
        };
        cur.units += it.quantity;
        cur.revenue += it.price * it.quantity;
        productTotals.set(key, cur);
      }
    }
    const topProducts = Array.from(productTotals.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((p) => ({
        name: p.name,
        units: p.units,
        revenue: Math.round(p.revenue * 100) / 100,
      }));

    const categories = await Category.find({ tenantId: tenantOid }).lean();
    const catName = new Map(
      categories.map((c) => [String(c._id), c.name] as const)
    );

    const productIds = Array.from(
      new Set(
        orders.flatMap((o) => o.items.map((it) => String(it.productId)))
      )
    )
      .filter((id) => mongoose.isValidObjectId(id))
      .map((id) => new mongoose.Types.ObjectId(id));
    const products = await Product.find({ _id: { $in: productIds } })
      .select("_id categoryId")
      .lean();
    const productCategoryMap = new Map(
      products.map((product) => [String(product._id), String(product.categoryId)])
    );

    const categoryRevenue = new Map<string, number>();
    for (const o of orders) {
      for (const it of o.items) {
        const cid = productCategoryMap.get(String(it.productId)) ?? "unknown";
        const name = catName.get(cid) ?? "Uncategorized";
        categoryRevenue.set(name, (categoryRevenue.get(name) ?? 0) + it.price * it.quantity);
      }
    }

    const salesByCategory = Array.from(categoryRevenue.entries()).map(
      ([name, revenueVal]) => ({
        name,
        revenue: Math.round(revenueVal * 100) / 100,
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        revenue,
        orderCount,
        avgOrderValue,
        topProducts,
        salesByCategory,
        ordersVolume,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
