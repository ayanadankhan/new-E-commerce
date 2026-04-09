// UI: Storefront footer with links, social placeholders, and newsletter field.

"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface StorefrontFooterProps {
  slug: string;
  storeName: string;
}

export function StorefrontFooter({ slug, storeName }: StorefrontFooterProps) {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
        <div>
          <p className="font-semibold">{storeName}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Quality products with reliable delivery. Built on Nexus Commerce.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Shop</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href={`/store/${slug}/products`} className="hover:text-foreground">
                All products
              </Link>
            </li>
            <li>
              <Link href={`/store/${slug}/orders`} className="hover:text-foreground">
                Orders
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground">
                About Nexus
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-foreground">
                Merchant login
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Newsletter</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Get launches and offers.
          </p>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Thanks — you are on the list.");
            }}
          >
            <Input
              type="email"
              required
              placeholder="Email"
              className="bg-background"
              aria-label="Newsletter email"
            />
            <Button type="submit">Join</Button>
          </form>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {storeName}. Powered by Nexus Commerce.
      </div>
    </footer>
  );
}
