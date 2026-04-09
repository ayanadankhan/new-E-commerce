// UI: Slide-in sheet from the right showing cart items.

"use client";

import * as React from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/components/store/CartItem";

export interface CartDrawerProps {
  slug: string;
  children: React.ReactNode;
}

export function CartDrawer({ slug, children }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Your cart</SheetTitle>
        </SheetHeader>
        <ScrollArea className="mt-4 flex-1 pr-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((line) => (
                <li key={line.product.id}>
                  <CartItem slug={slug} line={line} />
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        <div className="mt-auto space-y-4 pt-4">
          <Separator />
          <div className="flex justify-between font-mono text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(getTotal())}</span>
          </div>
          <Button className="w-full" asChild>
            <Link href={`/store/${slug}/cart`} onClick={() => setOpen(false)}>
              View cart & checkout
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
