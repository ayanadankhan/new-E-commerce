// PURPOSE: Read, update, or delete a single tenant by slug.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Tenant } from "@/models/Tenant";
import { tenantSchema } from "@/lib/validations";
import { serializeTenant } from "@/lib/serializers";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    await connectDB();
    const tenant = await Tenant.findOne({ slug }).lean();
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "Tenant not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { tenant: serializeTenant(tenant) },
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
    const { slug } = await params;
    await connectDB();
    const tenant = await Tenant.findOne({ slug });
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "Tenant not found" },
        { status: 404 }
      );
    }
    const allowed =
      session?.user?.role === "SUPER_ADMIN" ||
      (session?.user?.role === "STORE_OWNER" &&
        session.user.tenantId === String(tenant._id));
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    const body: unknown = await req.json();
    const parsed = tenantSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().formErrors.join(", ") },
        { status: 400 }
      );
    }
    Object.assign(tenant, parsed.data);
    await tenant.save();
    return NextResponse.json({
      success: true,
      data: { tenant: serializeTenant(tenant) },
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
    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    const { slug } = await params;
    await connectDB();
    const tenant = await Tenant.findOneAndDelete({ slug }).lean();
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "Tenant not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
