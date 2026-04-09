// UI: Customer directory table with spend and order totals.

"use client";

import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { Customer } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface CustomersTableProps {
  slug: string;
  customers: Customer[];
  currency?: string;
}

export function CustomersTable({
  slug,
  customers,
  currency = "USD",
}: CustomersTableProps) {
  const columns: ColumnDef<Customer>[] = [
    {
      id: "who",
      header: "Customer",
      cell: ({ row }) => {
        const c = row.original;
        const initials = c.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <Link
              href={`/admin/${slug}/customers/${c.id}`}
              className="font-medium hover:underline"
            >
              {c.name}
            </Link>
          </div>
        );
      },
    },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) =>
        row.original.createdAt
          ? formatDate(row.original.createdAt, "MMM d, yyyy")
          : "—",
    },
    { accessorKey: "totalOrders", header: "Orders" },
    {
      accessorKey: "totalSpent",
      header: "Lifetime",
      cell: ({ row }) => formatCurrency(row.original.totalSpent, currency),
    },
  ];

  const table = useReactTable({
    data: customers,
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
                No customers yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
