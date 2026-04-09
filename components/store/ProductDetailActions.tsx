// UI: Quantity selector and primary purchase actions on the product detail page.

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";

export function ProductDetailActions({
  product,
  slug,
}: {
  product: Product;
  slug: string;
}) {
  const router = useRouter();
  const { addItem } = useCart(slug);
  const [qty, setQty] = React.useState(1);

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label htmlFor="qty" className="text-sm text-muted-foreground">
          Qty
        </label>
        <Input
          id="qty"
          type="number"
          min={1}
          max={Math.max(1, product.stock)}
          className="w-20 font-mono"
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
        />
      </div>
      <Button
        disabled={product.stock <= 0}
        onClick={() => {
          addItem(product, qty);
          toast.success("Added to cart");
        }}
      >
        Add to cart
      </Button>
      <Button
        variant="secondary"
        disabled={product.stock <= 0}
        onClick={() => {
          addItem(product, qty);
          router.push(`/store/${slug}/checkout`);
        }}
      >
        Buy now
      </Button>
    </div>
  );
}
