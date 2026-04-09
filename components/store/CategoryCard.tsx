// UI: Category browse card linking to filtered products.

import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

export interface CategoryCardProps {
  category: Category;
  slug: string;
}

export function CategoryCard({ category, slug }: CategoryCardProps) {
  const href = `/store/${slug}/category/${category.id}`;
  const img = category.image ?? "/placeholder-product.png";

  return (
    <Link href={href} className="group block shrink-0 w-40 sm:w-48">
      <Card className="overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="relative aspect-[4/3] bg-muted">
          <Image
            src={img}
            alt=""
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="200px"
          />
        </div>
        <CardContent className="p-3">
          <p className="line-clamp-2 text-sm font-medium">{category.name}</p>
          <p className="text-xs text-muted-foreground">
            {category.productCount} products
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
