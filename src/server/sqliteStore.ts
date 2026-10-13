import fs from "fs";
import path from "path";
import type { DatabaseSync } from "node:sqlite";
import type { InventoryItem, Invoice, LineItem } from "../types.js";

/*
 * Local storage in one SQLite file (Node's built-in node:sqlite, no extra
 * packages). The rest of the app still sees plain { items, invoices } objects,
 * so the API did not change.
 *
 * File: healthychef.sqlite in the project folder, or the path in HEALTHYCHEF_DB.
 * The first time the file is created, an existing db.json is imported into it.
 */

export interface Data {
  items: InventoryItem[];
  invoices: Invoice[];
}

const DB_PATH = process.env.HEALTHYCHEF_DB || path.resolve(process.cwd(), "healthychef.sqlite");
const LEGACY_JSON = path.resolve(process.cwd(), "db.json");

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    position INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    variants TEXT NOT NULL,
    base_price REAL NOT NULL
  );
  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    position INTEGER NOT NULL,
    invoice_number TEXT NOT NULL,
    date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    subtotal REAL NOT NULL,
    total_gst REAL NOT NULL,
    total_discount REAL NOT NULL,
    grand_total REAL NOT NULL,
    status TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS line_items (
    invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    item_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity REAL NOT NULL,
    base_price REAL NOT NULL,
    gst_percentage REAL NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value REAL NOT NULL,
    row_total REAL NOT NULL,
    PRIMARY KEY (invoice_id, position)
  );
`;

let db: DatabaseSync | undefined;

async function open(): Promise<DatabaseSync> {
  if (db) return db;
  // Imported here so hosted deployments (which use Vercel Blob) never load it.
  const { DatabaseSync } = await import("node:sqlite");
  const isNew = !fs.existsSync(DB_PATH);
  const conn = new DatabaseSync(DB_PATH);
  conn.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  conn.exec(SCHEMA);
  db = conn;
  if (isNew && fs.existsSync(LEGACY_JSON)) {
    const legacy = JSON.parse(fs.readFileSync(LEGACY_JSON, "utf-8")) as Data;
    save(conn, legacy, { items: [], invoices: [] });
    console.log(`Imported ${legacy.items.length} items and ${legacy.invoices.length} invoices from db.json into ${DB_PATH}`);
  }
  return conn;
}

// ---------- read ----------

function load(conn: DatabaseSync): Data {
  const items = (conn.prepare("SELECT * FROM items ORDER BY position").all() as Record<string, any>[]).map(
    (r): InventoryItem => ({
      id: r.id,
      name: r.name,
      description: r.description,
      variants: r.variants,
      basePrice: r.base_price,
    }),
  );

  const linesByInvoice = new Map<string, LineItem[]>();
  const lineRows = conn.prepare("SELECT * FROM line_items ORDER BY invoice_id, position").all() as Record<string, any>[];
  for (const r of lineRows) {
    const list = linesByInvoice.get(r.invoice_id) ?? [];
    list.push({
      itemId: r.item_id,
      name: r.name,
      description: r.description,
      quantity: r.quantity,
      basePrice: r.base_price,
      gstPercentage: r.gst_percentage,
      discountType: r.discount_type,
      discountValue: r.discount_value,
      rowTotal: r.row_total,
    });
    linesByInvoice.set(r.invoice_id, list);
  }

  const invoices = (conn.prepare("SELECT * FROM invoices ORDER BY position").all() as Record<string, any>[]).map(
    (r): Invoice => ({
      id: r.id,
      invoiceNumber: r.invoice_number,
      date: r.date,
      dueDate: r.due_date,
      customer: { fullName: r.customer_name, phone: r.customer_phone, email: r.customer_email, address: r.customer_address },
      lineItems: linesByInvoice.get(r.id) ?? [],
      subtotal: r.subtotal,
      totalGST: r.total_gst,
      totalDiscount: r.total_discount,
      grandTotal: r.grand_total,
      status: r.status,
    }),
  );
  return { items, invoices };
}

// ---------- write ----------

/** Writes only what changed between `before` and `after`, in one transaction. */
function save(conn: DatabaseSync, after: Data, before: Data) {
  const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  const beforeItems = new Map(before.items.map((i, pos) => [i.id, { i, pos }]));
  const beforeInvoices = new Map(before.invoices.map((i, pos) => [i.id, { i, pos }]));

  conn.exec("BEGIN");
  try {
    const keepItems = new Set(after.items.map((i) => i.id));
    for (const id of beforeItems.keys()) {
      if (!keepItems.has(id)) conn.prepare("DELETE FROM items WHERE id = ?").run(id);
    }
    after.items.forEach((item, pos) => {
      const old = beforeItems.get(item.id);
      if (old && old.pos === pos && same(old.i, item)) return;
      conn
        .prepare(
          `INSERT INTO items (id, position, name, description, variants, base_price) VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET position = excluded.position, name = excluded.name,
             description = excluded.description, variants = excluded.variants, base_price = excluded.base_price`,
        )
        .run(item.id, pos, item.name, item.description, item.variants, item.basePrice);
    });

    const keepInvoices = new Set(after.invoices.map((i) => i.id));
    for (const id of beforeInvoices.keys()) {
      if (!keepInvoices.has(id)) conn.prepare("DELETE FROM invoices WHERE id = ?").run(id);
    }
    after.invoices.forEach((inv, pos) => {
      const old = beforeInvoices.get(inv.id);
      if (old && old.pos === pos && same(old.i, inv)) return;
      conn
        .prepare(
          `INSERT INTO invoices (id, position, invoice_number, date, due_date, customer_name, customer_phone,
             customer_email, customer_address, subtotal, total_gst, total_discount, grand_total, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET position = excluded.position, invoice_number = excluded.invoice_number,
             date = excluded.date, due_date = excluded.due_date, customer_name = excluded.customer_name,
             customer_phone = excluded.customer_phone, customer_email = excluded.customer_email,
             customer_address = excluded.customer_address, subtotal = excluded.subtotal,
             total_gst = excluded.total_gst, total_discount = excluded.total_discount,
             grand_total = excluded.grand_total, status = excluded.status`,
        )
        .run(
          inv.id, pos, inv.invoiceNumber, inv.date, inv.dueDate, inv.customer.fullName, inv.customer.phone,
          inv.customer.email, inv.customer.address, inv.subtotal, inv.totalGST, inv.totalDiscount, inv.grandTotal, inv.status,
        );
      conn.prepare("DELETE FROM line_items WHERE invoice_id = ?").run(inv.id);
      inv.lineItems.forEach((line, linePos) => {
        conn
          .prepare(
            `INSERT INTO line_items (invoice_id, position, item_id, name, description, quantity, base_price,
               gst_percentage, discount_type, discount_value, row_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .run(inv.id, linePos, line.itemId, line.name, line.description, line.quantity, line.basePrice,
            line.gstPercentage, line.discountType, line.discountValue, line.rowTotal);
      });
    });
    conn.exec("COMMIT");
  } catch (err) {
    conn.exec("ROLLBACK");
    throw err;
  }
}

// ---------- public API used by db.ts ----------

export async function ensureSqlite() {
  await open();
}

export async function readSqlite(): Promise<Data> {
  return load(await open());
}

// Changes run one at a time so two requests cannot save over each other.
let queue: Promise<unknown> = Promise.resolve();

export function updateSqlite<T>(change: (data: Data) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const conn = await open();
    const before = load(conn);
    const after = structuredClone(before);
    const result = await change(after);
    save(conn, after, before);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

/** Replace everything (used by `npm run seed`). */
export async function replaceSqlite(data: Data) {
  const conn = await open();
  save(conn, data, load(conn));
}

export const sqlitePath = DB_PATH;
