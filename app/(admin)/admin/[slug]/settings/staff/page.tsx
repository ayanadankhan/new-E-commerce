// PURPOSE: Staff roster and invite workflow (UI with sample rows).

import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getTenantBySlug } from "@/lib/server-store";
import { User } from "@/models/User";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { StaffTable } from "@/components/admin/StaffTable";
import { Button } from "@/components/ui/button";
import { StaffInviteButton } from "@/components/admin/StaffInviteButton";

export default async function AdminStaffPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();
  await connectDB();
  const users = await User.find({
    tenantId: new mongoose.Types.ObjectId(tenant.id),
  })
    .lean();
  const staff = users.map((u) => ({
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role as "STORE_OWNER" | "CASHIER" | "SUPER_ADMIN" | "CUSTOMER",
  }));

  return (
    <div className="min-h-screen">
      <AdminTopbar title="Staff" breadcrumbs={["Config", "Settings", "Staff"]} />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-2">
          <StaffInviteButton />
          <Button variant="outline" asChild>
            <Link href={`/admin/${slug}/settings`}>Back</Link>
          </Button>
        </div>
        <StaffTable staff={staff.filter((s) => s.role !== "CUSTOMER")} />
      </div>
    </div>
  );
}
