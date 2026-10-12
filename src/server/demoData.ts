// Clearly fake demo data. Used by `npm run seed` and to fill an empty hosted database.
import { calculateInvoiceSummary, calculateLineItemTotal } from "../lib/calculations.js";
import { addDays, todayISO } from "../lib/invoices.js";
import type { InventoryItem, Invoice, LineItem } from "../types.js";

const items: InventoryItem[] = [
  { id: "item-1", name: "Grilled Chicken Salad", description: "High protein meal with organic greens", variants: "High Protein (Standard)", basePrice: 250 },
  { id: "item-2", name: "Brown Jeera Rice", description: "Fiber-rich jeera brown rice", variants: "1 Portion", basePrice: 150 },
  { id: "item-3", name: "Cold Pressed Juice", description: "Watermelon and basil", variants: "Watermelon & Basil", basePrice: 120 },
];

function line(item: InventoryItem, quantity: number, gstPercentage: number, discountValue = 0): LineItem {
  const draft: LineItem = {
    itemId: item.id,
    name: item.name,
    description: item.variants,
    quantity,
    basePrice: item.basePrice,
    gstPercentage,
    discountType: "percentage",
    discountValue,
    rowTotal: 0,
  };
  return { ...draft, rowTotal: calculateLineItemTotal(draft).total };
}

function invoice(
  n: number,
  fullName: string,
  daysAgo: number,
  termDays: number,
  status: Invoice["status"],
  lineItems: LineItem[],
): Invoice {
  const date = addDays(todayISO(), -daysAgo);
  return {
    id: `demo-invoice-${n}`,
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`,
    date,
    dueDate: addDays(date, termDays),
    customer: {
      fullName,
      phone: "+91 00000 00000",
      email: `demo${n}@example.com`,
      address: "123 Example Street, Sample City",
    },
    lineItems,
    ...calculateInvoiceSummary(lineItems),
    status,
  };
}

const invoices: Invoice[] = [
  invoice(1, "Demo Customer One", 30, 15, "paid", [line(items[0], 2, 5, 10), line(items[1], 2, 12)]),
  invoice(2, "Demo Customer Two", 20, 15, "pending", [line(items[2], 3, 18)]),
  invoice(3, "Demo Customer Three", 2, 15, "pending", [line(items[0], 1, 18, 10)]),
];

export function buildDemoData() {
  return { items, invoices };
}
