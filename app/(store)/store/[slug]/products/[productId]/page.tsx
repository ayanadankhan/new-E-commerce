// PURPOSE: Product detail with gallery, pricing, add to cart, and tabbed content.

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getTenantBySlug,
  getProductById,
  listProductsForTenant,
} from "@/lib/server-store";
import { ProductImageGallery } from "@/components/store/ProductImageGallery";
import { ProductDetailActions } from "@/components/store/ProductDetailActions";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ProductCard } from "@/components/store/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewsList } from "@/components/store/ReviewsList";
import { formatCurrency } from "@/lib/utils";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();
  const product = await getProductById(productId);
  if (!product || product.tenantId !== tenant.id) notFound();

  const related = (await listProductsForTenant(tenant.id, { limit: 5 })).filter(
    (p) => p.id !== product.id && p.categoryId === product.categoryId
  );

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductImageGallery images={product.images} productName={product.name} />
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="font-mono">
              SKU {product.sku}
            </Badge>
            {product.stock > 0 ? (
              <Badge className="bg-emerald-500/15 text-emerald-600">In stock</Badge>
            ) : (
              <Badge variant="destructive">Out of stock</Badge>
            )}
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">{product.name}</h1>
          <div className="mt-4 flex flex-wrap items-baseline gap-3 font-mono">
            <span className="text-3xl font-semibold text-primary">
              {formatCurrency(product.price, tenant.currency)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <span className="text-lg text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice, tenant.currency)}
              </span>
            ) : null}
          </div>
          <ProductDetailActions product={product} slug={slug} />
        </div>
      </div>
      <Tabs defaultValue="desc">
        <TabsList>
          <TabsTrigger value="desc">Description</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="ship">Shipping</TabsTrigger>
        </TabsList>
        <TabsContent value="desc" className="mt-4 text-sm text-muted-foreground">
          <p className="whitespace-pre-wrap">{product.description || "No description."}</p>
        </TabsContent>
        <TabsContent value="reviews" className="mt-4">
          <ReviewsList />
        </TabsContent>
        <TabsContent value="ship" className="mt-4 text-sm text-muted-foreground">
          Standard shipping 3–5 business days. Express available at checkout.
        </TabsContent>
      </Tabs>
      {related.length ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Related products</h2>
          <ProductGrid>
            {related.map((p) => (
              <ProductCard key={p.id} product={p} slug={slug} currency={tenant.currency} />
            ))}
          </ProductGrid>
        </section>
      ) : null}
      <p className="text-center">
        <Link href={`/store/${slug}/products`} className="text-sm text-primary underline">
          Back to catalog
        </Link>
      </p>
    </div>
  );
}
