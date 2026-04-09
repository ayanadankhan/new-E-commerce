// UI: KPI metric card with label, formatted value, and optional trend hint.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatsCardProps {
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
  hint?: string;
}

export function StatsCard({ label, value, trend = "flat", hint }: StatsCardProps) {
  const Icon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon
          className={cn(
            "h-4 w-4",
            trend === "up" && "text-emerald-500",
            trend === "down" && "text-rose-500",
            trend === "flat" && "text-muted-foreground"
          )}
          aria-hidden
        />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
