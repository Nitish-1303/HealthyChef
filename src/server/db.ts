import fs from "fs/promises";
import path from "path";
import type { InventoryItem, Invoice } from "../types.js";

const DB_FILE = path.resolve(process.cwd(), "db.json");

export interface DB {
  items: InventoryItem[];
  invoices: Invoice[];
}

export async function ensureDB() {
  try {
    await fs.access(DB_FILE);
  } catch {
    await writeDB({ items: [], invoices: [] });
  }
}

export async function readDB(): Promise<DB> {
  const data = await fs.readFile(DB_FILE, "utf-8");
  return JSON.parse(data);
}

export async function writeDB(data: DB) {
  // Write to a temp file first so a crash mid-write cannot corrupt db.json.
  const tmp = `${DB_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, DB_FILE);
}

// Requests that change data run one at a time, so two saves can never read the
// same snapshot and overwrite each other.
let queue: Promise<unknown> = Promise.resolve();

export function updateDB<T>(change: (db: DB) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDB();
    const result = await change(db);
    await writeDB(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

/** Next invoice number for the year: INV-2026-0001, INV-2026-0002, ... */
export function nextInvoiceNumber(invoices: Invoice[], year = new Date().getFullYear()): string {
  const prefix = `INV-${year}-`;
  const highest = invoices
    .filter((inv) => inv.invoiceNumber.startsWith(prefix))
    .map((inv) => Number(inv.invoiceNumber.slice(prefix.length)))
    // Old random numbers were 4 digits too; they still count so we never reuse one.
    .filter((n) => Number.isInteger(n))
    .reduce((max, n) => Math.max(max, n), 0);
  return `${prefix}${String(highest + 1).padStart(4, "0")}`;
}
