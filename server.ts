import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { sendInvoiceEmail } from "./src/services/mailService.js";

const DB_FILE = path.resolve(process.cwd(), "db.json");

interface DB {
  items: any[];
  invoices: any[];
}

async function ensureDB() {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({ items: [], invoices: [] }, null, 2));
  }
}

async function readDB(): Promise<DB> {
  const data = await fs.readFile(DB_FILE, "utf-8");
  return JSON.parse(data);
}

async function writeDB(data: DB) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  await ensureDB();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Items API
  app.get("/api/items", async (req, res) => {
    const db = await readDB();
    res.json(db.items);
  });

  app.post("/api/items", async (req, res) => {
    const db = await readDB();
    const newItem = { ...req.body, id: uuidv4() };
    db.items.push(newItem);
    await writeDB(db);
    res.json(newItem);
  });

  app.put("/api/items/:id", async (req, res) => {
    const db = await readDB();
    const index = db.items.findIndex(i => i.id === req.params.id);
    if (index > -1) {
      db.items[index] = { ...req.body, id: req.params.id };
      await writeDB(db);
      res.json(db.items[index]);
    } else {
      res.status(404).send("Item not found");
    }
  });

  app.delete("/api/items/:id", async (req, res) => {
    const db = await readDB();
    db.items = db.items.filter(i => i.id !== req.params.id);
    await writeDB(db);
    res.status(204).send();
  });

  app.post("/api/items/bulk-delete", async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).send("IDs must be an array");
    }
    const db = await readDB();
    db.items = db.items.filter(i => !ids.includes(i.id));
    await writeDB(db);
    res.status(204).send();
  });

  // Invoices API
  app.get("/api/invoices", async (req, res) => {
    const db = await readDB();
    res.json(db.invoices);
  });

  app.post("/api/invoices", async (req, res) => {
    const db = await readDB();
    const newInvoice = { ...req.body, id: uuidv4() };
    db.invoices.push(newInvoice);
    await writeDB(db);
    
    // Send email notification (async - don't block response)
    sendInvoiceEmail(newInvoice).catch(err => console.error("Failed to send initial invoice email:", err));
    
    res.json(newInvoice);
  });

  app.post("/api/invoices/:id/remind", async (req, res) => {
    const db = await readDB();
    const invoice = db.invoices.find(i => i.id === req.params.id);
    
    if (!invoice) {
      return res.status(404).send("Invoice not found");
    }

    try {
      await sendInvoiceEmail(invoice);
      res.json({ message: "Reminder email sent successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to send reminder email" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
