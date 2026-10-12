import { z } from "zod";

const money = z.coerce.number().finite().min(0);
const text = (max = 500) => z.string().trim().max(max);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const itemSchema = z.object({
  name: text(200).min(1, "Name is required"),
  description: text(1000).default(""),
  variants: text(500).default(""),
  basePrice: money,
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

const lineItemSchema = z.object({
  itemId: z.string().default(""),
  name: text(200).min(1),
  description: text(1000).default(""),
  quantity: z.coerce.number().int().min(1).max(100_000),
  basePrice: money,
  gstPercentage: z.coerce.number().min(0).max(100),
  discountType: z.enum(["percentage", "absolute"]),
  discountValue: money,
});

export const invoiceStatusSchema = z.enum(["pending", "paid", "overdue"]);

export const createInvoiceSchema = z.object({
  customer: z.object({
    fullName: text(200).min(1, "Customer name is required"),
    phone: text(50).default(""),
    email: z.string().trim().email("Enter a valid email address").max(200),
    address: text(500).default(""),
  }),
  lineItems: z.array(lineItemSchema).min(1, "Add at least one item"),
  dueDate: isoDate,
  status: z.enum(["pending", "paid"]).default("pending"),
  sendEmail: z.boolean().default(false),
});

export const updateStatusSchema = z.object({ status: invoiceStatusSchema });
