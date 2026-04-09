// PURPOSE: Read, update, or delete a single customer profile.

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import {
  canManageCustomers,
  canReadCustomers,
  canReadOwnCustomerProfile,
} from "@/lib/access-control";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { customerUpdateSchema } from "@/lib/validations";
import { serializeCustomer } from "@/lib/serializers";

interface RouteParams {
  params: Promise<{ customerId: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { customerId } = await params;
    if (!mongoose.isValidObjectId(customerId)) {
      return NextResponse.json(
        { success: false, error: "Invalid customer id" },
        { status: 400 }
      );
    }
    await connectDB();
    const doc = await Customer.findById(customerId).lean();
    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }
    const tenantId = String(doc.tenantId);
    const staffOk = canReadCustomers(session?.user, tenantId);
    const selfOk = canReadOwnCustomerProfile(
      session?.user,
      tenantId,
      doc.email
    );
    if (!staffOk && !selfOk) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { customer: serializeCustomer(doc) },
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
    const { customerId } = await params;
    if (!mongoose.isValidObjectId(customerId)) {
      return NextResponse.json(
        { success: false, error: "Invalid customer id" },
        { status: 400 }
      );
    }
    await connectDB();
    const existing = await Customer.findById(customerId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }
    const tenantId = String(existing.tenantId);
    const staffOk = canManageCustomers(session?.user, tenantId);
    const selfOk = canReadOwnCustomerProfile(
      session?.user,
      tenantId,
      existing.email
    );
    if (!staffOk && !selfOk) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    const body: unknown = await req.json();
    const parsed = customerUpdateSchema.safeParse({
      ...(body as object),
      tenantId,
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
    if (rest.email) {
      existing.email = rest.email.toLowerCase();
    }
    await existing.save();
    return NextResponse.json({
      success: true,
      data: { customer: serializeCustomer(existing) },
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
    const { customerId } = await params;
    if (!mongoose.isValidObjectId(customerId)) {
      return NextResponse.json(
        { success: false, error: "Invalid customer id" },
        { status: 400 }
      );
    }
    await connectDB();
    const existing = await Customer.findById(customerId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }
    if (!canManageCustomers(session?.user, String(existing.tenantId))) {
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
