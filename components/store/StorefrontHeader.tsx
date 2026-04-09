// UI: Storefront top navigation with logo, search trigger, cart sheet, and account link.

"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SearchBar } from "@/components/store/SearchBar";
import { CartDrawer } from "@/components/store/CartDrawer";
import { useCartStore } from "@/store/cartStore";
import { Badge } from "@/components/ui/badge";

export interface StorefrontHeaderProps {
  slug: string;
  storeName: string;
  logoUrl?: string;
}

export function StorefrontHeader({
  slug,
  storeName,
  logoUrl,
}: StorefrontHeaderProps) {
  const count = useCartStore((s) => s.getItemCount());

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          href={`/store/${slug}`}
          className="flex shrink-0 items-center gap-2 font-semibold"
          aria-label={`${storeName} home`}
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt=""
              width={32}
              height={32}
              className="rounded-md"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-sm text-primary">
              {storeName.slice(0, 1)}
            </span>
          )}
          <span className="hidden sm:inline">{storeName}</span>
        </Link>
        <div className="mx-auto hidden max-w-xl flex-1 md:block">
          <SearchBar slug={slug} />
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="md:hidden" asChild>
            <Link href={`/store/${slug}/products`} aria-label="Browse products">
              <Search className="h-4 w-4" />
            </Link>
          </Button>
          <CartDrawer slug={slug}>
            <Button
              variant="outline"
              size="icon"
              className="relative"
              aria-label={`Shopping cart, ${count} items`}
            >
              <ShoppingCart className="h-4 w-4" />
              {count > 0 ? (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-[10px]">
                  {count}
                </Badge>
              ) : null}
            </Button>
          </CartDrawer>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/store/${slug}/account`} aria-label="Account">
              <User className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="border-t border-border px-4 py-2 md:hidden">
        <SearchBar slug={slug} />
      </div>
    </header>
  );
}
