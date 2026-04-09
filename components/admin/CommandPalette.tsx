// UI: Cmd+K palette for quick navigation across the current admin store.

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { LayoutDashboard, Package, ShoppingCart, Settings } from "lucide-react";

export interface CommandPaletteProps {
  slug: string;
}

export function CommandPalette({ slug }: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const base = `/admin/${slug}`;

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search actions…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go(base)}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go(`${base}/products`)}>
            <Package className="mr-2 h-4 w-4" />
            Products
          </CommandItem>
          <CommandItem onSelect={() => go(`${base}/orders`)}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Orders
          </CommandItem>
          <CommandItem onSelect={() => go(`${base}/settings`)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
