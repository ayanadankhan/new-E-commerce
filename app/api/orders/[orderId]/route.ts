// PURPOSE: Fetch, update status, or delete a single order.

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { canManageCustomers, canManageOrders, canReadOwnOrder } from "@/lib/access-control";
import type { OrderStatus } from "@/types";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { orderStatusUpdateSchema } from "@/lib/validations";
import { serializeOrder } from "@/lib/serializers";

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { orderId } = await params;
    if (!mongoose.isValidObjectId(orderId)) {
      return NextResponse.json(
        { success: false, error: "Invalid order id" },
        { status: 400 }
      );
    }
    await connectDB();
    const doc = await Order.findById(orderId).lean();
    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }
    const tenantId = String(doc.tenantId);
    const staffOk = canManageOrders(session?.user, tenantId);
    const customerOk = canReadOwnOrder(session?.user, tenantId, doc.customer?.email);
    if (!staffOk && !customerOk) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { order: serializeOrder(doc) },
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
    const { orderId } = await params;
    if (!mongoose.isValidObjectId(orderId)) {
      return NextResponse.json(
        { success: false, error: "Invalid order id" },
        { status: 400 }
      );
    }
    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }
    const tenantId = String(order.tenantId);
    if (!canManageOrders(session?.user, tenantId)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    const body: unknown = await req.json();
    const parsed = orderStatusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().formErrors.join(", ") },
        { status: 400 }
      );
    }
    order.status = parsed.data.status as OrderStatus;
    order.statusHistory.push({
      status: parsed.data.status as OrderStatus,
      at: new Date(),
    });
    await order.save();
    return NextResponse.json({
      success: true,
      data: { order: serializeOrder(order) },
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
    const { orderId } = await params;
    if (!mongoose.isValidObjectId(orderId)) {
      return NextResponse.json(
        { success: false, error: "Invalid order id" },
        { status: 400 }
      );
    }
    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }
    if (!canManageCustomers(session?.user, String(order.tenantId))) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    await order.deleteOne();
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
