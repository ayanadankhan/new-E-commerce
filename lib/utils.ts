// PURPOSE: Tailwind class merging and formatting helpers used across the app.

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currencyCode: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(
  input: string | Date,
  pattern: string = "PPP"
): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return format(d, pattern);
}
