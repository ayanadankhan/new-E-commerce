// PURPOSE: Confirmation screen after successful checkout with order number.

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const order = sp.order ?? "—";

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" aria-hidden />
      <h1 className="mt-4 text-2xl font-semibold">Thank you!</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your order <span className="font-mono font-medium text-foreground">{order}</span>{" "}
        is confirmed. You will receive an email shortly.
      </p>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href={`/store/${slug}/orders`}>View orders</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/store/${slug}/products`}>Keep shopping</Link>
        </Button>
      </div>
    </div>
  );
}
