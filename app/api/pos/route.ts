// PURPOSE: Quick POS sale endpoint that creates a POS-channel order with stock updates.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { orderSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const session = await auth();
  try {
    const body: unknown = await req.json();
    const merged = {
      ...(typeof body === "object" && body !== null ? body : {}),
      channel: "POS" as const,
    };
    const parsed = orderSchema.safeParse(merged);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().formErrors.join(", ") },
        { status: 400 }
      );
    }
    const allowed =
      !!session?.user &&
      session.user.tenantId === parsed.data.tenantId &&
      ["STORE_OWNER", "CASHIER", "SUPER_ADMIN"].includes(session.user.role);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    const internalReq = new Request(req.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: req.headers.get("cookie") ?? "",
      },
      body: JSON.stringify(parsed.data),
    });
    const { POST: createOrder } = await import("@/app/api/orders/route");
    return createOrder(internalReq);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
