import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import { ensureSqlite, readSqlite, updateSqlite } from "./sqliteStore.js";
import type { InventoryItem, Invoice } from "../types.js";

export interface DB {
  items: InventoryItem[];
  invoices: Invoice[];
}

/*
 * Where the data lives:
 *  - On Vercel (BLOB_READ_WRITE_TOKEN is set) in one private Vercel Blob file.
 *    Serverless functions have no disk that survives between requests.
 *  - Everywhere else in a local SQLite file (see sqliteStore.ts).
 */
const BLOB_PATH = "healthychef/db.json";
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

// ---------- Vercel Blob storage ----------

async function readBlobDB(): Promise<{ db: DB; etag: string } | null> {
  const result = await get(BLOB_PATH, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  const text = await new Response(result.stream).text();
  return { db: JSON.parse(text), etag: result.blob.etag };
}

async function writeBlobDB(data: DB, etag?: string) {
  await put(BLOB_PATH, JSON.stringify(data), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    // First write must not replace a file another request just created.
    allowOverwrite: Boolean(etag),
    ...(etag ? { ifMatch: etag } : {}),
  });
}

/** Read the blob, creating an empty database the first time. */
async function loadBlobDB(): Promise<{ db: DB; etag: string }> {
  const existing = await readBlobDB();
  if (existing) return existing;
  try {
    await writeBlobDB({ items: [], invoices: [] });
  } catch {
    // Another request created it first; read theirs below.
  }
  const created = await readBlobDB();
  if (!created) throw new Error("Could not create the database in Vercel Blob");
  return created;
}

// ---------- shared API ----------

export async function ensureDB() {
  if (useBlob) {
    await loadBlobDB();
    return;
  }
  await ensureSqlite();
}

export async function readDB(): Promise<DB> {
  if (useBlob) return (await loadBlobDB()).db;
  return readSqlite();
}

// On Vercel several function instances can run at once. The ETag check makes a
// save fail if someone else saved first, and we then re-read and try again.
async function updateBlobDB<T>(change: (db: DB) => T | Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { db, etag } = await loadBlobDB();
    const result = await change(db);
    try {
      await writeBlobDB(db, etag);
      return result;
    } catch (err) {
      if (!(err instanceof BlobPreconditionFailedError)) throw err;
    }
  }
  throw new Error("The database is busy, please try again");
}

export function updateDB<T>(change: (db: DB) => T | Promise<T>): Promise<T> {
  return useBlob ? updateBlobDB(change) : updateSqlite(change);
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
