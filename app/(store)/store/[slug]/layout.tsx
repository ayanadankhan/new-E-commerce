// PURPOSE: Storefront chrome with header, footer, and tenant-scoped cart sync.

import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/server-store";
import { StorefrontHeader } from "@/components/store/StorefrontHeader";
import { StorefrontFooter } from "@/components/store/StorefrontFooter";
import { CartTenantSync } from "@/components/store/CartTenantSync";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CartTenantSync slug={slug} />
      <StorefrontHeader
        slug={slug}
        storeName={tenant.name}
        logoUrl={tenant.logo}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
      <StorefrontFooter slug={slug} storeName={tenant.name} />
    </div>
  );
}
