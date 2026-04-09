// PURPOSE: Admin shell with fixed sidebar navigation scoped to the tenant slug.

import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessBackoffice } from "@/lib/access-control";
import { getTenantBySlug } from "@/lib/server-store";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { CommandPalette } from "@/components/admin/CommandPalette";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role === "CUSTOMER") {
    redirect("/");
  }
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) {
    notFound();
  }
  if (!canAccessBackoffice(session.user, slug)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar slug={slug} storeName={tenant.name} />
      <CommandPalette slug={slug} />
      <div className="pl-60">{children}</div>
    </div>
  );
}
