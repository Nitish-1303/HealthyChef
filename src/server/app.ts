import express, { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { ZodError } from "zod";
import { sendInvoiceEmail } from "../services/mailService.js";
import { ensureDB, readDB, updateDB, nextInvoiceNumber } from "./db.js";
import {
  bulkDeleteSchema,
  createInvoiceSchema,
  itemSchema,
  updateStatusSchema,
} from "./schemas.js";
import { calculateInvoiceSummary, calculateLineItemTotal } from "../lib/calculations.js";
import { effectiveStatus, todayISO, withDueDate } from "../lib/invoices.js";
import type { Invoice, LineItem } from "../types.js";

/** Stored invoices plus the derived fields the UI needs (due date, overdue). */
function presentInvoice(invoice: Invoice): Invoice {
  const withDue = withDueDate(invoice);
  return { ...withDue, status: effectiveStatus(withDue) };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// Express 4 does not catch rejected promises, so wrap async handlers.
const handle =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

/** The JSON API. server.ts adds the frontend on top; on Vercel api/index.js serves it as a function. */
export function createApp() {
  const app = express();

  app.use(express.json({ limit: "100kb" }));

  // Items API
  app.get("/api/items", handle(async (_req, res) => {
    const db = await readDB();
    res.json(db.items);
  }));

  app.post("/api/items", handle(async (req, res) => {
    const data = itemSchema.parse(req.body);
    const newItem = { ...data, id: uuidv4() };
    await updateDB((db) => db.items.push(newItem));
    res.status(201).json(newItem);
  }));

  app.put("/api/items/:id", handle(async (req, res) => {
    const data = itemSchema.parse(req.body);
    const updated = await updateDB((db) => {
      const index = db.items.findIndex((i) => i.id === req.params.id);
      if (index === -1) return null;
      db.items[index] = { ...data, id: req.params.id };
      return db.items[index];
    });
    if (!updated) return res.status(404).json({ error: "Item not found" });
    res.json(updated);
  }));

  app.delete("/api/items/:id", handle(async (req, res) => {
    await updateDB((db) => {
      db.items = db.items.filter((i) => i.id !== req.params.id);
    });
    res.status(204).send();
  }));

  app.post("/api/items/bulk-delete", handle(async (req, res) => {
    const { ids } = bulkDeleteSchema.parse(req.body);
    await updateDB((db) => {
      db.items = db.items.filter((i) => !ids.includes(i.id));
    });
    res.status(204).send();
  }));

  // Invoices API
  app.get("/api/invoices", handle(async (_req, res) => {
    const db = await readDB();
    res.json(db.invoices.map(presentInvoice));
  }));

  app.get("/api/invoices/:id", handle(async (req, res) => {
    const db = await readDB();
    const invoice = db.invoices.find((i) => i.id === req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json(presentInvoice(invoice));
  }));

  app.post("/api/invoices", handle(async (req, res) => {
    const { sendEmail, ...data } = createInvoiceSchema.parse(req.body);

    // Totals are always recalculated here, never trusted from the browser.
    const lineItems: LineItem[] = data.lineItems.map((line) => {
      const draft = { ...line, rowTotal: 0 };
      return { ...draft, rowTotal: round2(calculateLineItemTotal(draft).total) };
    });
    const summary = calculateInvoiceSummary(lineItems);

    const invoice = await updateDB((db) => {
      const created: Invoice = {
        id: uuidv4(),
        invoiceNumber: nextInvoiceNumber(db.invoices),
        date: todayISO(),
        dueDate: data.dueDate,
        customer: data.customer,
        lineItems,
        subtotal: round2(summary.subtotal),
        totalDiscount: round2(summary.totalDiscount),
        totalGST: round2(summary.totalGST),
        grandTotal: round2(summary.grandTotal),
        status: data.status,
      };
      db.invoices.push(created);
      return created;
    });

    // Only email the customer when the user confirmed it in the UI.
    // Don't block the response on it.
    if (sendEmail) {
      sendInvoiceEmail(invoice).catch((err) => console.error("Failed to send initial invoice email:", err));
    }

    res.status(201).json(presentInvoice(invoice));
  }));

  app.patch("/api/invoices/:id/status", handle(async (req, res) => {
    const { status } = updateStatusSchema.parse(req.body);
    const updated = await updateDB((db) => {
      const invoice = db.invoices.find((i) => i.id === req.params.id);
      if (!invoice) return null;
      invoice.status = status;
      return invoice;
    });
    if (!updated) return res.status(404).json({ error: "Invoice not found" });
    res.json(presentInvoice(updated));
  }));

  app.post("/api/invoices/:id/remind", handle(async (req, res) => {
    const db = await readDB();
    const invoice = db.invoices.find((i) => i.id === req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    try {
      const sent = await sendInvoiceEmail(presentInvoice(invoice));
      if (!sent) {
        return res.status(503).json({ error: "Email is not configured on the server" });
      }
      res.json({ message: "Reminder email sent successfully" });
    } catch {
      res.status(500).json({ error: "Failed to send reminder email" });
    }
  }));

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      const message = err.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; ");
      return res.status(400).json({ error: message });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  });

  return app;
}
