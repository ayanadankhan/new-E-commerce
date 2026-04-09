// UI: Main image with thumbnail strip for product detail pages.

"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const list = images.length ? images : ["/placeholder-product.png"];
  const [idx, setIdx] = React.useState(0);
  const main = list[idx] ?? list[0];

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted">
        <Image
          src={main}
          alt={productName}
          fill
          className="object-cover"
          sizes="(max-width:1024px) 100vw, 50vw"
          priority
        />
      </div>
      {list.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                i === idx ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              )}
              aria-label={`Show image ${i + 1}`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
