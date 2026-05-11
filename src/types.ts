export interface ItemVariant {
  name: string;
  value: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  variants: string; // Stored as a string description or semi-colon separated
  basePrice: number;
}

export interface LineItem {
  itemId: string;
  name: string;
  description: string;
  quantity: number;
  basePrice: number;
  gstPercentage: number;
  discountType: 'percentage' | 'absolute';
  discountValue: number;
  rowTotal: number;
}

export interface InvoiceCustomer {
  fullName: string;
  phone: string;
  email: string;
  address: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string; // ISO string
  dueDate: string; // ISO string
  customer: InvoiceCustomer;
  lineItems: LineItem[];
  subtotal: number;
  totalGST: number;
  totalDiscount: number;
  grandTotal: number;
  status: 'pending' | 'paid' | 'overdue';
}
