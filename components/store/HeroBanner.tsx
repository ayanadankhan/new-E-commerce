// UI: Store homepage hero with title, tagline, and primary CTA.

import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface HeroBannerProps {
  slug: string;
  storeName: string;
  tagline?: string;
}

export function HeroBanner({ slug, storeName, tagline }: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 via-background to-background px-6 py-16 sm:px-12 sm:py-20">
      <div className="relative z-10 max-w-2xl animate-fade-in">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          Welcome
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          {storeName}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {tagline ?? "Discover curated products with fast checkout and secure payments."}
        </p>
        <Button className="mt-8" size="lg" asChild>
          <Link href={`/store/${slug}/products`}>Shop now</Link>
        </Button>
      </div>
    </section>
  );
}
