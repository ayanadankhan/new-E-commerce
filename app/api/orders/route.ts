// PURPOSE: List orders and create orders with stock decrement and inventory logging.

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { canManageOrders } from "@/lib/access-control";
import { connectDB } from "@/lib/db";
import { resolveTenantId } from "@/lib/tenant-context";
import { DEFAULT_TAX_RATE } from "@/lib/constants";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Customer } from "@/models/Customer";
import { InventoryLog } from "@/models/InventoryLog";
import { orderSchema } from "@/lib/validations";
import { serializeOrder } from "@/lib/serializers";
import type { Order as OrderType } from "@/types";

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
    const session = await auth();
    const allowed = canManageOrders(session?.user, tenantId);
    const customerScoped =
      session?.user?.role === "CUSTOMER" && session.user.tenantId === tenantId;
    if (!allowed && !customerScoped) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const status = searchParams.get("status") ?? undefined;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));

    const filter: Record<string, unknown> = {
      tenantId: new mongoose.Types.ObjectId(tenantId),
    };
    if (status && status !== "ALL") {
      filter.status = status;
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        (filter.createdAt as Record<string, Date>).$gte = new Date(startDate);
      }
      if (endDate) {
        (filter.createdAt as Record<string, Date>).$lte = new Date(endDate);
      }
    }
    if (customerScoped && session.user?.email) {
      filter["customer.email"] = session.user.email;
    }

    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter),
    ]);

    const orders: OrderType[] = rows.map((r) => serializeOrder(r));
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      success: true,
      data: { orders, total, totalPages },
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
  const session = await auth();
  try {
    const body: unknown = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().formErrors.join(", ") },
        { status: 400 }
      );
    }
    const data = parsed.data;
    await connectDB();
    const tenantOid = new mongoose.Types.ObjectId(data.tenantId);

    const staffOnline =
      data.channel === "ONLINE" &&
      !!session?.user &&
      canManageOrders(session.user, data.tenantId);
    const customerOnline =
      data.channel === "ONLINE" &&
      session?.user?.role === "CUSTOMER" &&
      session.user.tenantId === data.tenantId &&
      session.user.email?.toLowerCase() ===
        data.customer.email.toLowerCase();
    const posOrder =
      data.channel === "POS" &&
      !!session?.user &&
      canManageOrders(session.user, data.tenantId);

    if (!staffOnline && !customerOnline && !posOrder) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // For development, skip transaction logic since local MongoDB doesn't support transactions
    try {
      const items: {
        productId: mongoose.Types.ObjectId;
        name: string;
        price: number;
        quantity: number;
        image?: string;
      }[] = [];
      let subtotal = 0;

      for (const line of data.items) {
        const product = await Product.findById(line.productId);
        if (!product || String(product.tenantId) !== data.tenantId) {
          throw new Error("Invalid product in order");
        }
        if (product.stock < line.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
        const price = product.price;
        subtotal += price * line.quantity;
        items.push({
          productId: product._id,
          name: product.name,
          price,
          quantity: line.quantity,
          image: product.images?.[0],
        });
      }

      const tax = Math.round(subtotal * DEFAULT_TAX_RATE * 100) / 100;
      const shipping = data.shipping ?? 0;
      const total = Math.round((subtotal + tax + shipping) * 100) / 100;
      const orderNumber = `NX-${nanoid(10).toUpperCase()}`;

      const statusHistory = [
        { status: "PENDING" as const, at: new Date() },
      ];

      let customerId: mongoose.Types.ObjectId | undefined;
      if (data.channel === "ONLINE") {
        const cust = await Customer.findOneAndUpdate(
          { tenantId: tenantOid, email: data.customer.email.toLowerCase() },
          {
            $setOnInsert: {
              name: data.customer.name,
              phone: data.customer.phone,
              tenantId: tenantOid,
              addresses: [data.shippingAddress],
            },
            $set: {
              name: data.customer.name,
              phone: data.customer.phone,
            },
          },
          { upsert: true, new: true }
        );
        customerId = cust._id;
      }

      const order = await Order.create({
        orderNumber,
        items,
        subtotal,
        tax,
        shipping,
        total,
        status: "PENDING",
        customer: {
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone,
        },
        customerId,
        shippingAddress: data.shippingAddress,
        channel: data.channel,
        tenantId: tenantOid,
        statusHistory,
      });

      for (const line of data.items) {
        const product = await Product.findById(line.productId);
        if (!product) continue;
        const prev = product.stock;
        const next = prev - line.quantity;
        product.stock = next;
        await product.save();
        await InventoryLog.create({
          productId: product._id,
          productName: product.name,
          change: -line.quantity,
          previousStock: prev,
          newStock: next,
          reason: `Order ${orderNumber}`,
          userId: session?.user?.id
            ? new mongoose.Types.ObjectId(session.user.id)
            : undefined,
          tenantId: tenantOid,
        });
      }

      if (customerId) {
        await Customer.findByIdAndUpdate(
          customerId,
          {
            $inc: { totalOrders: 1, totalSpent: total },
          }
        );
      }

      return NextResponse.json({
        success: true,
        data: { order: serializeOrder(order) },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Server error";
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
