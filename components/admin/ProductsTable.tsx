// UI: Product catalog table with thumbnails, stock emphasis, and bulk selection.

"use client";

import Link from "next/link";
import Image from "next/image";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface ProductsTableProps {
  slug: string;
  products: Product[];
  currency?: string;
  categoryNames?: Record<string, string>;
}

export function ProductsTable({
  slug,
  products,
  currency = "USD",
  categoryNames = {},
}: ProductsTableProps) {
  const columns: ColumnDef<Product>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
    },
    {
      id: "image",
      header: "",
      cell: ({ row }) => {
        const src = row.original.images[0] ?? "/placeholder-product.png";
        return (
          <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
            <Image src={src} alt="" fill className="object-cover" sizes="40px" />
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <Link
          href={`/admin/${slug}/products/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    { accessorKey: "sku", header: "SKU", cell: ({ row }) => <span className="font-mono text-xs">{row.original.sku}</span> },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => categoryNames[row.original.categoryId] ?? "—",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => formatCurrency(row.original.price, currency),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const s = row.original.stock;
        return (
          <span
            className={cn(
              "font-mono text-sm",
              s <= 0 && "text-destructive",
              s > 0 && s <= LOW_STOCK_THRESHOLD && "text-amber-500"
            )}
          >
            {s}
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Draft"}
        </Badge>
      ),
    },
  ];

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection: true,
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
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No products yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
