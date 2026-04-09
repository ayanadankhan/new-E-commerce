// PURPOSE: Resolve current tenant slug from route params for store, admin, and POS.

"use client";

import { useParams } from "next/navigation";

export function useTenantSlug(): string {
  const params = useParams<{ slug?: string }>();
  return params?.slug ?? "";
}
