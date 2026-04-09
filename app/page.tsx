// PURPOSE: Marketing landing for the Nexus Commerce SaaS platform.

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ArrowRight, Store, LayoutDashboard, Monitor } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b border-border px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image src="/logo.svg" alt="" width={28} height={28} />
          Nexus Commerce
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Start free</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Multi-tenant commerce OS
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          One platform. Storefront, admin, and POS.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Launch branded online stores, run operations from a dense admin console, and
          check out customers in-store — all tenant-isolated on MongoDB and Next.js 15.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button size="lg" asChild>
            <Link href="/register">
              Create your store <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/store/demo-store">View demo storefront</Link>
          </Button>
        </div>
        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <Store className="h-8 w-8 text-primary" />
            <h2 className="mt-4 font-semibold">Online store</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              SEO-friendly catalog, cart, and customer checkout per tenant slug.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <h2 className="mt-4 font-semibold">Admin</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Products, orders, analytics, and settings with role-based access.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <Monitor className="h-8 w-8 text-primary" />
            <h2 className="mt-4 font-semibold">POS</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Touch-first selling with payments modal and printable receipts.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
