// UI: Invisible client helper that scopes the persisted cart to the active store slug.

"use client";

import * as React from "react";
import { useCartStore } from "@/store/cartStore";

export function CartTenantSync({ slug }: { slug: string }) {
  React.useEffect(() => {
    useCartStore.getState().setTenantSlug(slug);
  }, [slug]);
  return null;
}
