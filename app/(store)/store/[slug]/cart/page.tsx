// PURPOSE: Full shopping cart with line controls and link to checkout.

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { CartItem } from "@/components/store/CartItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { DEFAULT_TAX_RATE } from "@/lib/constants";

export default function CartPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const subtotal = getTotal();
  const tax = Math.round(subtotal * DEFAULT_TAX_RATE * 100) / 100;
  const shipping = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + tax + shipping;

  if (!items.length) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button className="mt-4" asChild>
          <Link href={`/store/${slug}/products`}>Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Cart</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((line) => (
            <CartItem key={line.product.id} slug={slug} line={line} />
          ))}
        </CardContent>
      </Card>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 font-mono text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping estimate</span>
            <span>{formatCurrency(shipping)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <Button className="w-full" asChild>
            <Link href={`/store/${slug}/checkout`}>Proceed to checkout</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
