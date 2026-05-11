import { LineItem } from "../types";

export function calculateLineItemTotal(item: LineItem) {
  const baseTotal = item.basePrice * item.quantity;
  
  let discountAmount = 0;
  if (item.discountType === 'percentage') {
    discountAmount = (baseTotal * item.discountValue) / 100;
  } else {
    discountAmount = item.discountValue;
  }
  
  const totalAfterDiscount = baseTotal - discountAmount;
  const gstAmount = (totalAfterDiscount * item.gstPercentage) / 100;
  
  return {
    discountAmount,
    gstAmount,
    total: totalAfterDiscount + gstAmount
  };
}

export function calculateInvoiceSummary(lineItems: LineItem[]) {
  return lineItems.reduce((acc, item) => {
    const { discountAmount, gstAmount, total } = calculateLineItemTotal(item);
    return {
      subtotal: acc.subtotal + (item.basePrice * item.quantity),
      totalDiscount: acc.totalDiscount + discountAmount,
      totalGST: acc.totalGST + gstAmount,
      grandTotal: acc.grandTotal + total
    };
  }, { subtotal: 0, totalDiscount: 0, totalGST: 0, grandTotal: 0 });
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}
