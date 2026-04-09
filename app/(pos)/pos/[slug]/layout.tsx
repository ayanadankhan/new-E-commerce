// PURPOSE: Minimal fullscreen layout for in-store POS terminals.

import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/server-store";

export default async function POSLayout({
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
    <div className="fixed inset-0 flex flex-col bg-background text-foreground">
      {children}
    </div>
  );
}
