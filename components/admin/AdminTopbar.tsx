// UI: Sticky top bar with title, breadcrumbs, notifications entry, and theme toggle.

"use client";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NotificationsPanel } from "@/components/admin/NotificationsPanel";

export interface AdminTopbarProps {
  title: string;
  breadcrumbs?: string[];
}

export function AdminTopbar({ title, breadcrumbs }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold">{title}</h1>
        {breadcrumbs?.length ? (
          <p className="truncate text-xs text-muted-foreground">
            {breadcrumbs.join(" / ")}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <NotificationsPanel />
        <ThemeToggle />
      </div>
    </header>
  );
}
