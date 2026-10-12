import type { Invoice } from "../types.js";

export const DEFAULT_TERM_DAYS = 15;

/** Today's date as YYYY-MM-DD in the local timezone. */
export function todayISO(): string {
  return toISODate(new Date());
}

function toISODate(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Add days to a YYYY-MM-DD date and return a YYYY-MM-DD date. */
export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return toISODate(new Date(y, m - 1, d + days));
}

/** Whole days between two YYYY-MM-DD dates (b - a). */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/**
 * Older invoices were saved without a dueDate (the UI assumed 15 days).
 * Fill it in so the rest of the code can rely on it.
 */
export function withDueDate<T extends { date: string; dueDate?: string }>(invoice: T): T & { dueDate: string } {
  return { ...invoice, dueDate: invoice.dueDate || addDays(invoice.date, DEFAULT_TERM_DAYS) };
}

/**
 * The status shown to users: a pending invoice past its due date is overdue.
 * The stored status is never rewritten, so marking it paid always wins.
 */
export function effectiveStatus(invoice: Pick<Invoice, "status" | "dueDate">, today = todayISO()): Invoice["status"] {
  if (invoice.status === "pending" && invoice.dueDate < today) return "overdue";
  return invoice.status || "pending";
}

export function formatDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
