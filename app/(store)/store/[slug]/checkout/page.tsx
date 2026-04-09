// PURPOSE: Multi-step guest checkout collecting shipping and payment (UI) then placing order.

"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { CheckoutSteps } from "@/components/store/CheckoutSteps";
import { OrderSummaryCard } from "@/components/store/OrderSummaryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

export default function CheckoutPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { data: session, status } = useSession();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const [step, setStep] = React.useState(0);
  const [tenantId, setTenantId] = React.useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = React.useState("standard");
  const [paymentMethod, setPaymentMethod] = React.useState("cash");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    email: session?.user?.email ?? "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  React.useEffect(() => {
    void (async () => {
      const r = await fetch(`/api/tenants/${slug}`);
      const j = (await r.json()) as {
        success: boolean;
        data?: { tenant: { id: string } };
      };
      if (j.success && j.data) setTenantId(j.data.tenant.id);
    })();
  }, [slug]);

  React.useEffect(() => {
    if (session?.user?.email) {
      setForm((f) => ({ ...f, email: session.user?.email ?? f.email }));
    }
  }, [session?.user?.email]);

  const shipping =
    shippingMethod === "express" ? 12.99 : shippingMethod === "overnight" ? 24.99 : 5.99;

  async function placeOrder() {
    if (!tenantId) {
      toast.error("Please refresh the page and try again.");
      return;
    }
    if (!items.length) {
      toast.error("Cart is empty");
      return;
    }
    // Validate required fields
    if (!form.name || !form.email || !form.line1 || !form.city || !form.state || !form.postalCode) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (paymentMethod === "bank") {
      toast.info("Bank transfer feature is under development. Please use Cash on Delivery for now.");
      return;
    }

    if (paymentMethod !== "cash") {
      toast.error("Invalid payment method");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          channel: "ONLINE",
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone || undefined,
          },
          shippingAddress: {
            line1: form.line1,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
          },
          shipping,
          paymentMethod: "cash_on_delivery",
        }),
      });
      const json = (await res.json()) as {
        success: boolean;
        data?: { order: { orderNumber: string; id: string } };
        error?: string;
      };
      if (!res.ok || !json.success || !json.data) {
        toast.error(json.error ?? "Order failed");
        return;
      }
      clearCart();
      router.push(
        `/store/${slug}/checkout/success?order=${encodeURIComponent(json.data.order.orderNumber)}`
      );
    } catch (err) {
      toast.error("Failed to place order. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Loading session…</p>;
  }

  if (!items.length) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button className="mt-4" asChild>
          <Link href={`/store/${slug}/products`}>Shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <CheckoutSteps current={step} />
        {step === 0 ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="line1">Address</Label>
              <Input
                id="line1"
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="zip">Postal code</Label>
                <Input
                  id="zip"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <Button type="button" onClick={() => setStep(1)}>
              Continue to shipping
            </Button>
          </div>
        ) : null}
        {step === 1 ? (
          <div className="space-y-4">
            <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
              <div className="flex items-center gap-2 rounded-lg border border-border p-3">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard">Standard — $5.99 (3–5 days)</Label>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border p-3">
                <RadioGroupItem value="express" id="express" />
                <Label htmlFor="express">Express — $12.99 (2 days)</Label>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border p-3">
                <RadioGroupItem value="overnight" id="overnight" />
                <Label htmlFor="overnight">Overnight — $24.99</Label>
              </div>
            </RadioGroup>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button type="button" onClick={() => setStep(2)}>
                Continue to payment
              </Button>
            </div>
          </div>
        ) : null}
        {step === 2 ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Select payment method</h3>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center gap-2 rounded-lg border border-border p-3">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="cursor-pointer flex-1">
                    <span className="font-medium">Cash on Delivery</span>
                    <p className="text-xs text-muted-foreground mt-1">Pay when you receive your order</p>
                  </Label>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border p-3 opacity-60 cursor-not-allowed">
                  <RadioGroupItem value="bank" id="bank" disabled />
                  <Label htmlFor="bank" className="flex-1">
                    <span className="font-medium">Bank Transfer</span>
                    <p className="text-xs text-muted-foreground mt-1">Feature under development</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                type="button" 
                onClick={() => void placeOrder()}
                disabled={isSubmitting || paymentMethod !== "cash"}
              >
                {isSubmitting ? "Processing..." : "Place order"}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      <OrderSummaryCard items={items} shipping={shipping} />
    </div>
  );
}
