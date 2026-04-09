// PURPOSE: Client hook for analytics dashboard charts and KPIs.

"use client";

import { useCallback, useEffect, useState } from "react";

export interface AnalyticsData {
  revenue: { date: string; amount: number }[];
  orderCount: number;
  avgOrderValue: number;
  topProducts: { name: string; units: number; revenue: number }[];
  salesByCategory: { name: string; revenue: number }[];
  ordersVolume: { date: string; count: number }[];
}

export function useAnalytics(params: {
  tenantId: string;
  startDate?: string;
  endDate?: string;
}) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!params.tenantId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const q = new URLSearchParams();
    q.set("tenantId", params.tenantId);
    if (params.startDate) q.set("startDate", params.startDate);
    if (params.endDate) q.set("endDate", params.endDate);
    const res = await fetch(`/api/analytics?${q.toString()}`);
    const json = (await res.json()) as {
      success: boolean;
      data?: AnalyticsData;
      error?: string;
    };
    if (!res.ok || !json.success || !json.data) {
      setError(json.error ?? "Failed to load analytics");
      setData(null);
    } else {
      setData(json.data);
    }
    setLoading(false);
  }, [params.tenantId, params.startDate, params.endDate]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
