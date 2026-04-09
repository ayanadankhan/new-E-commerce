// PURPOSE: Product grid filtered to a single category for the storefront.

import { notFound } from "next/navigation";
import {
  getTenantBySlug,
  listCategoriesForTenant,
  listProductsForTenant,
} from "@/lib/server-store";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ProductCard } from "@/components/store/ProductCard";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string; categoryId: string }>;
}) {
  const { slug, categoryId } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();
  const categories = await listCategoriesForTenant(tenant.id);
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) notFound();
  const products = await listProductsForTenant(tenant.id, { categoryId });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{cat.name}</h1>
        <p className="text-sm text-muted-foreground">
          {products.length} product{products.length === 1 ? "" : "s"}
        </p>
      </div>
      <ProductGrid>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} slug={slug} currency={tenant.currency} />
        ))}
      </ProductGrid>
    </div>
  );
}
