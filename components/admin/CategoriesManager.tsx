// UI: Client table of categories with add dialog.

"use client";

import * as React from "react";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryForm } from "@/components/admin/CategoryForm";

export function CategoriesManager({
  tenantId,
  initial,
}: {
  tenantId: string;
  initial: Category[];
}) {
  const [open, setOpen] = React.useState(false);
  const [list, setList] = React.useState(initial);

  return (
    <div className="space-y-4">
      <Button type="button" onClick={() => setOpen(true)}>
        New category
      </Button>
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="font-mono text-xs">{c.slug}</TableCell>
                <TableCell>{c.productCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <CategoryForm
        open={open}
        onOpenChange={setOpen}
        tenantId={tenantId}
        onDone={async () => {
          const r = await fetch(`/api/categories?tenantId=${tenantId}`);
          const j = (await r.json()) as {
            success: boolean;
            data?: { categories: Category[] };
          };
          if (j.success && j.data) setList(j.data.categories);
        }}
      />
    </div>
  );
}
