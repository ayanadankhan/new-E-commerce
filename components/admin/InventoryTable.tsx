// UI: Inventory rows with inline stock editing and status badges.

"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { Product } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { toast } from "sonner";

export interface InventoryTableProps {
  products: Product[];
  onSaved?: () => void;
}

export function InventoryTable({ products, onSaved }: InventoryTableProps) {
  const [drafts, setDrafts] = React.useState<Record<string, number>>({});

  const statusFor = (stock: number) => {
    if (stock <= 0) return { label: "Out of stock", variant: "destructive" as const };
    if (stock <= LOW_STOCK_THRESHOLD)
      return { label: "Low stock", variant: "secondary" as const };
    return { label: "In stock", variant: "default" as const };
  };

  const columns: ColumnDef<Product>[] = [
    { accessorKey: "name", header: "Product" },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.sku}</span>,
    },
    {
      id: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const p = row.original;
        const val = drafts[p.id] ?? p.stock;
        return (
          <Input
            className="h-8 w-20 font-mono"
            type="number"
            min={0}
            value={val}
            onChange={(e) =>
              setDrafts((d) => ({ ...d, [p.id]: Number(e.target.value) }))
            }
            aria-label={`Stock for ${p.name}`}
          />
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const v = drafts[row.original.id] ?? row.original.stock;
        const s = statusFor(v);
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      id: "save",
      header: "",
      cell: ({ row }) => {
        const p = row.original;
        const next = drafts[p.id];
        if (next === undefined) return null;
        return (
          <Button
            size="sm"
            type="button"
            onClick={async () => {
              const res = await fetch("/api/inventory", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  tenantId: p.tenantId,
                  updates: [{ productId: p.id, stock: next }],
                }),
              });
              const json = (await res.json()) as { success: boolean; error?: string };
              if (!res.ok || !json.success) {
                toast.error(json.error ?? "Update failed");
                return;
              }
              toast.success("Stock updated");
              setDrafts((d) => {
                const c = { ...d };
                delete c[p.id];
                return c;
              });
              onSaved?.();
            }}
          >
            Save
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id}>
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
