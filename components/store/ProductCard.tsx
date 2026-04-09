// UI: Product grid tile with image, title, price, and add-to-cart control.

"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";

export interface ProductCardProps {
  product: Product;
  slug: string;
  currency?: string;
  list?: boolean;
}

export function ProductCard({
  product,
  slug,
  currency = "USD",
  list,
}: ProductCardProps) {
  const { addItem } = useCart(slug);
  const img = product.images[0] ?? "/placeholder-product.png";

  const onAdd = () => {
    addItem(product, 1);
    toast.success("Added to cart");
  };

  if (list) {
    return (
      <Card className="flex flex-row overflow-hidden">
        <div className="relative h-32 w-32 shrink-0 bg-muted sm:h-40 sm:w-40">
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover"
            sizes="160px"
          />
          {product.stock <= 0 ? (
            <Badge className="absolute right-1 top-1 text-[10px]" variant="destructive">
              Sold out
            </Badge>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-4">
          <Link
            href={`/store/${slug}/products/${product.id}`}
            className="font-medium hover:underline"
          >
            {product.name}
          </Link>
          <p className="mt-1 font-mono text-sm text-primary">
            {formatCurrency(product.price, currency)}
          </p>
          <Button
            className="mt-auto w-full sm:w-auto"
            size="sm"
            disabled={product.stock <= 0}
            onClick={onAdd}
            aria-label={`Add ${product.name} to cart`}
          >
            Add to cart
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-square w-full bg-muted">
        <Image
          src={img}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        {product.stock <= 0 ? (
          <Badge className="absolute right-2 top-2" variant="destructive">
            Out of stock
          </Badge>
        ) : null}
      </div>
      <CardContent className="p-4">
        <Link
          href={`/store/${slug}/products/${product.id}`}
          className="line-clamp-2 font-medium hover:underline"
        >
          {product.name}
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-2 font-mono text-sm">
          <span className="text-lg font-semibold text-primary">
            {formatCurrency(product.price, currency)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <span className="text-muted-foreground line-through">
              {formatCurrency(product.compareAtPrice, currency)}
            </span>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          disabled={product.stock <= 0}
          onClick={onAdd}
          aria-label={`Add ${product.name} to cart`}
        >
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
}
