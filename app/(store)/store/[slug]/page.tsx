// PURPOSE: Store home with hero, category scroll, featured products, and promo strip.

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getTenantBySlug,
  listCategoriesForTenant,
  listFeaturedProducts,
} from "@/lib/server-store";
import { HeroBanner } from "@/components/store/HeroBanner";
import { CategoryCard } from "@/components/store/CategoryCard";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ProductCard } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default async function StoreHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();
  const categories = await listCategoriesForTenant(tenant.id);
  const featured = await listFeaturedProducts(tenant.id, 8);

  return (
    <div className="space-y-12 animate-fade-in">
      <HeroBanner slug={slug} storeName={tenant.name} />
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Shop by category</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/store/${slug}/products`}>View all</Link>
          </Button>
        </div>
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex w-max gap-4">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} slug={slug} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>
      <section className="rounded-2xl border border-border bg-muted/30 p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Spring savings</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Free standard shipping on orders over $50. Members get early access to new drops.
        </p>
        <Button className="mt-4" asChild>
          <Link href={`/store/${slug}/products`}>Browse deals</Link>
        </Button>
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Featured products</h2>
        </div>
        <ProductGrid>
          {featured.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              slug={slug}
              currency={tenant.currency}
            />
          ))}
        </ProductGrid>
      </section>
    </div>
  );
}
