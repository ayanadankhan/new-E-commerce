// UI: Fixed left sidebar with logo, store name, navigation groups, and profile menu.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Warehouse,
  ShoppingCart,
  Users,
  BarChart3,
  MonitorSmartphone,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import * as React from "react";
import { signOut, useSession } from "next-auth/react";

const groups: { label: string; items: { href: string; label: string; icon: React.ElementType }[] }[] =
  [
    {
      label: "Overview",
      items: [{ href: "", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      label: "Catalog",
      items: [
        { href: "/products", label: "Products", icon: Package },
        { href: "/categories", label: "Categories", icon: FolderTree },
        { href: "/inventory", label: "Inventory", icon: Warehouse },
      ],
    },
    {
      label: "Sales",
      items: [
        { href: "/orders", label: "Orders", icon: ShoppingCart },
        { href: "/customers", label: "Customers", icon: Users },
      ],
    },
    {
      label: "Insights",
      items: [{ href: "/analytics", label: "Analytics", icon: BarChart3 }],
    },
    {
      label: "Operations",
      items: [{ href: "/pos", label: "POS Terminal", icon: MonitorSmartphone }],
    },
    {
      label: "Config",
      items: [{ href: "/settings", label: "Settings", icon: Settings }],
    },
  ];

export interface AdminSidebarProps {
  slug: string;
  storeName: string;
}

export function AdminSidebar({ slug, storeName }: AdminSidebarProps) {
  const pathname = usePathname();
  const base = `/admin/${slug}`;
  const [collapsed, setCollapsed] = React.useState(false);
  const { data } = useSession();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border bg-card transition-[width]",
        collapsed ? "w-[72px]" : "w-60"
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-border px-3">
        <Link href={base} className="flex min-w-0 flex-1 items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-sm text-primary">
            N
          </span>
          {!collapsed ? <span className="truncate text-sm">{storeName}</span> : null}
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-4 px-2" aria-label="Admin navigation">
          {groups.map((g) => (
            <div key={g.label}>
              {!collapsed ? (
                <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {g.label}
                </p>
              ) : null}
              <ul className="space-y-1">
                {g.items.map((item) => {
                  const href = `${base}${item.href}`;
                  const active =
                    item.href === ""
                      ? pathname === base
                      : pathname.startsWith(href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                          active
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed ? item.label : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-3">
        <p className={cn("truncate text-xs text-muted-foreground", collapsed && "text-center")}>
          {!collapsed ? data?.user?.email ?? "" : "•••"}
        </p>
        <Button
          variant="outline"
          className="mt-2 w-full"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          {!collapsed ? "Sign out" : "Out"}
        </Button>
      </div>
    </aside>
  );
}
