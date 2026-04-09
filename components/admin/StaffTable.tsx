// UI: Staff roster table with role badges for store settings.

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/constants";
import type { UserRole } from "@/types";

export interface StaffRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface StaffTableProps {
  staff: StaffRow[];
}

export function StaffTable({ staff }: StaffTableProps) {
  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.length ? (
            staff.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{ROLE_LABELS[s.role]}</Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                No staff loaded.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
