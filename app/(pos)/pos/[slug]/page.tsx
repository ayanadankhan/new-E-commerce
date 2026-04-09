// PURPOSE: POS terminal page combining catalog grid and cart with payment modal.

"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { usePOSCart } from "@/hooks/usePOSCart";
import { POSSessionBar } from "@/components/pos/POSSessionBar";
import { POSCategoryFilter } from "@/components/pos/POSCategoryFilter";
import { POSSearchBar } from "@/components/pos/POSSearchBar";
import { POSProductGrid } from "@/components/pos/POSProductGrid";
import { POSCartPanel } from "@/components/pos/POSCartPanel";
import { POSPaymentModal } from "@/components/pos/POSPaymentModal";
import type { Product, Category } from "@/types";
import { toast } from "sonner";

export default function POSTerminalPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { data: session } = useSession();
  const {
    items,
    addItem,
    removeItem,
    updateQty,
    discount,
    setDiscount,
    clearCart,
    getSubtotal,
    getTax,
    getTotal,
    setCashier,
    startSession,
    sessionStart,
  } = usePOSCart(slug);

  const [tenantId, setTenantId] = React.useState<string | null>(null);
  const [currency, setCurrency] = React.useState("USD");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [filterCat, setFilterCat] = React.useState<string | "all">("all");
  const [q, setQ] = React.useState("");
  const [payOpen, setPayOpen] = React.useState(false);
  const [tapped, setTapped] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (session?.user) {
      setCashier({
        id: session.user.id ?? "",
        email: session.user.email ?? "",
        name: session.user.name ?? "",
        role: session.user.role,
        tenantId: session.user.tenantId,
        tenantSlug: session.user.tenantSlug,
      });
      startSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user]);

  React.useEffect(() => {
    void (async () => {
      const [tr, cr] = await Promise.all([
        fetch(`/api/tenants/${slug}`),
        fetch(`/api/categories?tenantSlug=${encodeURIComponent(slug)}`),
      ]);
      const [tj, cj] = (await Promise.all([tr.json(), cr.json()])) as [
        { success: boolean; data?: { tenant: { id: string; currency: string } } },
        { success: boolean; data?: { categories: Category[] } },
      ];
      if (tj.success && tj.data) {
        setTenantId(tj.data.tenant.id);
        setCurrency(tj.data.tenant.currency);
      }
      if (cj.success && cj.data) setCategories(cj.data.categories);
    })();
  }, [slug]);

  React.useEffect(() => {
    if (!tenantId) return;
    const params = new URLSearchParams({ tenantId, limit: "60" });
    void (async () => {
      const pr = await fetch(`/api/products?${params}`);
      const pj = (await pr.json()) as {
        success: boolean;
        data?: { products: Product[] };
      };
      if (pj.success && pj.data) setProducts(pj.data.products);
    })();
  }, [tenantId]);

  const filtered = products.filter((p) => {
    if (filterCat !== "all" && p.categoryId !== filterCat) return false;
    if (q.trim()) {
      const n = q.toLowerCase();
      return (
        p.name.toLowerCase().includes(n) ||
        p.sku.toLowerCase().includes(n)
      );
    }
    return true;
  });

  const subtotal = React.useMemo(() => getSubtotal(), [items]);
  const tax = React.useMemo(() => getTax(), [subtotal]);
  const total = React.useMemo(() => getTotal(), [subtotal, tax, discount]);

  async function finalize() {
    if (!tenantId || !session?.user) {
      toast.error("Missing session");
      return;
    }
    const res = await fetch("/api/pos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId,
        channel: "POS",
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        customer: {
          name: "Walk-in",
          email: `pos+${slug}@nexus.local`,
        },
        shippingAddress: {
          line1: "In-store",
          city: "—",
          state: "—",
          postalCode: "00000",
          country: "US",
        },
        shipping: 0,
      }),
    });
    const json = (await res.json()) as {
      success: boolean;
      data?: { order: { id: string } };
      error?: string;
    };
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error ?? "Sale failed");
    }
    clearCart();
    toast.success("Sale complete");
    router.push(`/pos/${slug}/receipt/${json.data.order.id}`);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <POSSessionBar
        cashierName={session?.user?.name ?? "Cashier"}
        sessionStart={sessionStart}
      />
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-h-0 flex-col gap-3 p-3">
          <POSCategoryFilter
            categories={categories}
            activeId={filterCat}
            onChange={setFilterCat}
          />
          <POSSearchBar value={q} onChange={setQ} />
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <POSProductGrid
              products={filtered}
              currency={currency}
              tappedId={tapped}
              onAdd={(p) => {
                setTapped(p.id);
                window.setTimeout(() => setTapped(null), 150);
                addItem(p);
              }}
            />
          </div>
        </div>
        <POSCartPanel
          items={items}
          currency={currency}
          subtotal={subtotal}
          tax={tax}
          total={total}
          discount={discount}
          onDiscount={setDiscount}
          onCharge={() => setPayOpen(true)}
          onInc={(id) => {
            const line = items.find((i) => i.product.id === id);
            if (line) updateQty(id, line.quantity + 1);
          }}
          onDec={(id) => {
            const line = items.find((i) => i.product.id === id);
            if (line) updateQty(id, line.quantity - 1);
          }}
          onRemove={removeItem}
        />
      </div>
      <POSPaymentModal
        open={payOpen}
        onOpenChange={setPayOpen}
        total={total}
        currency={currency}
        onComplete={finalize}
      />
    </div>
  );
}
