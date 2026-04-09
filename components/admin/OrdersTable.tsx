// UI: TanStack table of orders with status badges and row navigation.

"use client";

import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { Order } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { Badge } from "@/components/ui/badge";

export interface OrdersTableProps {
  slug: string;
  orders: Order[];
  currency?: string;
}

export function OrdersTable({ slug, orders, currency = "USD" }: OrdersTableProps) {
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order",
      cell: ({ row }) => (
        <Link
          className="font-mono text-primary hover:underline"
          href={`/admin/${slug}/orders/${row.original.id}`}
        >
          {row.original.orderNumber}
        </Link>
      ),
    },
    {
      accessorKey: "customer.name",
      header: "Customer",
      cell: ({ row }) => row.original.customer.name,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.createdAt, "MMM d, yyyy"),
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) =>
        row.original.items.reduce((s, i) => s + i.quantity, 0),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => formatCurrency(row.original.total, currency),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "channel",
      header: "Channel",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.channel}</Badge>
      ),
    },
  ];

  const table = useReactTable({
    data: orders,
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
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
