import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, ChevronLeft, Calendar, User, Mail, MapPin, Printer, Receipt, Activity, Terminal, ArrowLeft } from "lucide-react";
import { Invoice } from "../types";
import { formatCurrency, calculateLineItemTotal } from "../lib/calculations";
import { daysBetween, formatDisplayDate } from "../lib/invoices";
import jsPDF from "jspdf";
import "jspdf-autotable";
import HealthyChefLogo from "./HealthyChefLogo";

export default function InvoiceDetailView() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${id}`);
        setInvoice(res.ok ? await res.json() : null);
      } catch (error) {
        console.error("Failed to fetch invoice:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const generatePDF = () => {
    if (!invoice) {
      alert("Invoice data not available");
      return;
    }

    try {
      console.log("Starting PDF generation for invoice:", invoice.invoiceNumber);
      
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const margin = 15;
      let yPosition = margin;

      // Helper function for text
      const addText = (text: string, x: number, y: number, fontSize: number, color: [number, number, number], bold: boolean = false) => {
        doc.setFontSize(fontSize);
        doc.setTextColor(...color);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.text(text, x, y);
      };

      // Header
      addText("HealthyChef", margin, yPosition, 22, [228, 87, 46], true);
      yPosition += 8;
      addText("Meal-prep invoicing and pantry tracking", margin, yPosition, 9, [106, 86, 70]);
      
      // Invoice ID on right
      addText("INVOICE", 140, margin + 8, 16, [42, 29, 20], true);
      addText(`No. ${invoice.invoiceNumber}`, 140, margin + 16, 9, [42, 29, 20]);
      
      yPosition += 12;
      doc.setDrawColor(42, 29, 20);
      doc.line(margin, yPosition, 195 - margin, yPosition);
      yPosition += 5;

      // Date info
      addText(`Issue Date: ${invoice.date}`, margin, yPosition, 8, [106, 86, 70]);
      yPosition += 4;
      addText(`Due Date: ${invoice.dueDate}`, margin, yPosition, 8, [106, 86, 70]);
      yPosition += 8;

      // Customer section
      addText("BILL TO", margin, yPosition, 9, [228, 87, 46], true);
      yPosition += 5;
      addText(invoice.customer.fullName, margin, yPosition, 10, [42, 29, 20], true);
      yPosition += 4;
      addText(invoice.customer.phone, margin, yPosition, 8, [106, 86, 70]);
      yPosition += 3;
      addText(invoice.customer.email, margin, yPosition, 8, [106, 86, 70]);
      yPosition += 3;
      
      const addressLines = doc.splitTextToSize(invoice.customer.address, 80);
      doc.setFontSize(8);
      doc.setTextColor(142, 146, 153);
      doc.text(addressLines as any, margin, yPosition);
      yPosition += (addressLines.length * 3) + 5;

      // Line items manual table
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, 195 - margin, yPosition);
      yPosition += 4;

      // Table header
      addText("Item", margin + 2, yPosition, 8, [255, 255, 255], true);
      addText("Qty", margin + 80, yPosition, 8, [255, 255, 255], true);
      addText("Rate", margin + 100, yPosition, 8, [255, 255, 255], true);
      addText("GST", margin + 120, yPosition, 8, [255, 255, 255], true);
      addText("Total", margin + 140, yPosition, 8, [255, 255, 255], true);

      // Header background
      doc.setFillColor(44, 95, 45);
      doc.rect(margin, yPosition - 3, 195 - 2 * margin, 5, "F");
      
      yPosition += 5;

      // Table rows
      if (Array.isArray(invoice.lineItems)) {
        invoice.lineItems.forEach((item) => {
          const rowHeight = 5;
          addText(item.name || "Item", margin + 2, yPosition, 7, [42, 29, 20]);
          addText(String(item.quantity || 0), margin + 80, yPosition, 7, [42, 29, 20]);
          addText(formatCurrency(item.basePrice || 0), margin + 100, yPosition, 7, [42, 29, 20]);
          addText(`+${item.gstPercentage || 0}%`, margin + 120, yPosition, 7, [42, 29, 20]);
          addText(formatCurrency(item.rowTotal || 0), margin + 140, yPosition, 7, [47, 125, 59], true);
          yPosition += rowHeight;
        });
      }

      yPosition += 5;
      doc.line(margin, yPosition, 195 - margin, yPosition);
      yPosition += 5;

      // Summary section
      const summaryX = 140;
      addText("Base Amount:", summaryX - 30, yPosition, 8, [42, 29, 20]);
      addText(formatCurrency(invoice.subtotal || 0), summaryX + 30, yPosition, 8, [42, 29, 20]);
      yPosition += 4;

      addText("Discount:", summaryX - 30, yPosition, 8, [239, 68, 68]);
      addText(`- ${formatCurrency(invoice.totalDiscount || 0)}`, summaryX + 30, yPosition, 8, [239, 68, 68]);
      yPosition += 4;

      addText("GST:", summaryX - 30, yPosition, 8, [47, 125, 59]);
      addText(`+ ${formatCurrency(invoice.totalGST || 0)}`, summaryX + 30, yPosition, 8, [47, 125, 59]);
      yPosition += 5;

      doc.setDrawColor(42, 29, 20);
      doc.line(summaryX - 30, yPosition - 1, 195 - margin, yPosition - 1);
      yPosition += 3;

      addText("GRAND TOTAL:", summaryX - 30, yPosition, 11, [228, 87, 46], true);
      addText(formatCurrency(invoice.grandTotal || 0), summaryX + 30, yPosition, 11, [228, 87, 46], true);

      // Terms at bottom
      const pageHeight = doc.internal.pageSize.height;
      yPosition = pageHeight - 25;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, 195 - margin, yPosition);
      
      yPosition += 3;
      addText("Terms & Conditions:", margin, yPosition, 7, [47, 125, 59], true);
      yPosition += 3;
      addText(`1. Payment due by ${invoice.dueDate}.`, margin, yPosition, 6, [106, 86, 70]);
      yPosition += 3;
      addText("2. Questions? Reply to the email this invoice came with.", margin, yPosition, 6, [106, 86, 70]);
      yPosition += 3;
      addText("Thank you for your order.", margin, yPosition, 6, [106, 86, 70]);

      // Save the PDF
      doc.save(`${invoice.invoiceNumber}_HealthyChef.pdf`);
      console.log("PDF downloaded successfully:", invoice.invoiceNumber);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const getStatusStyles = (status?: string) => {
    switch (status) {
      case 'paid': return 'bg-[#8CC56B] text-health-leaf border-health-leaf';
      case 'overdue': return 'bg-health-olive text-white border-health-leaf';
      case 'pending':
      default: return 'bg-[#F5B82E] text-health-leaf border-health-leaf';
    }
  };

  const handleSendReminder = async () => {
    if (!invoice) return;
    setSendingReminder(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/remind`, { method: "POST" });
      if (res.ok) {
        alert("Reminder sent.");
      } else {
        const body = await res.json().catch(() => null);
        alert(body?.error || "Failed to send reminder. Please try again.");
      }
    } catch (error) {
      console.error("Reminder failure:", error);
    } finally {
      setSendingReminder(false);
    }
  };

  const handleStatusChange = async (status: Invoice['status']) => {
    if (!invoice) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setInvoice(await res.json());
      } else {
        alert("Failed to update the status. Please try again.");
      }
    } catch (error) {
      console.error("Status update failure:", error);
      alert("Could not reach the server. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-health-muted font-display text-xl">Loading invoice...</div>;
  if (!invoice) return <div className="p-12 text-center text-red-600 font-display text-xl">Invoice not found.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-32">
      <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <Link to="/dashboard" className="flex items-center gap-3 text-health-muted hover:text-health-olive transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-health-sage/10 flex items-center justify-center group-hover:bg-health-sage group-hover:text-white transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="health-label text-health-sage opacity-80 uppercase tracking-[0.2em] font-bold">Back to invoices</span>
        </Link>
        <div className="flex items-center gap-6">
          <button
            disabled={updatingStatus}
            onClick={() => handleStatusChange(invoice.status === 'paid' ? 'pending' : 'paid')}
            className="flex items-center gap-3 px-8 h-14 rounded-xl border border-health-ink/15 bg-white font-bold text-xs text-health-leaf hover:bg-health-cream transition-all disabled:opacity-50"
          >
            {invoice.status === 'paid' ? "Mark as Pending" : "Mark as Paid"}
          </button>
          <button 
            disabled={sendingReminder}
            onClick={handleSendReminder}
            className="flex items-center gap-3 px-8 h-14 rounded-xl border border-health-ink/15 bg-white font-bold text-xs text-health-muted hover:bg-health-cream transition-all disabled:opacity-50"
          >
            <Mail size={16} />
            {sendingReminder ? "Sending..." : "Send Reminder"}
          </button>
          <button 
            onClick={generatePDF}
            className="btn-health flex items-center gap-3 px-10 h-14 text-sm "
          >
            <Download size={18} />
            Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white health-card relative overflow-hidden " id="invoice-preview">
        <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none text-health-leaf">
          <Receipt size={300} />
        </div>
        
        <div className="p-16 lg:p-24 relative">
          {/* Document Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-24">
            <div className="space-y-10 text-center md:text-left">
              <HealthyChefLogo size={52} />
              <div className="space-y-3">
                <p className="health-label text-health-olive font-bold uppercase tracking-widest opacity-60">Meal-prep invoicing</p>
                <div className="h-0.5 w-32 bg-health-sage/30 rounded-xl mx-auto md:mx-0" />
              </div>
            </div>
            
            <div className="text-right space-y-6 w-full md:w-auto">
              <div className="space-y-2">
                <p className="health-label text-health-sage font-bold tracking-[0.2em] uppercase">Invoice number</p>
                <p className="text-5xl font-display font-bold text-health-leaf tracking-tight">{invoice.invoiceNumber}</p>
              </div>
              <div className="flex flex-col items-end gap-3 text-sm text-health-muted">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest ${getStatusStyles(invoice.status)}`}>
                    {invoice.status || 'pending'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-health-sage opacity-60" />
                  <span>Issued: {formatDisplayDate(invoice.date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-xl bg-health-sage" />
                  <span className="uppercase text-[10px] tracking-widest font-bold text-health-sage">Saved</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24 border-y border-health-ink/15 py-16">
            <div className="space-y-6">
              <h3 className="health-label text-health-olive font-bold uppercase tracking-widest">Billed To</h3>
              <div className="space-y-3">
                <p className="font-display font-bold text-2xl text-health-leaf">{invoice.customer.fullName}</p>
                <div className="text-sm text-health-muted space-y-1">
                  <p>{invoice.customer.email}</p>
                  <p>{invoice.customer.phone}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="health-label text-health-olive font-bold uppercase tracking-widest">Address</h3>
              <p className="text-sm text-health-muted leading-relaxed">{invoice.customer.address}</p>
            </div>

            <div className="space-y-6">
              <h3 className="health-label text-health-olive font-bold uppercase tracking-widest">Due date</h3>
              <div className="space-y-5">
                 <div>
                    <p className="text-3xl font-display font-bold text-health-leaf tracking-tight">
                      {formatDisplayDate(invoice.dueDate)}
                    </p>
                 </div>
                 <div className="inline-flex py-2 px-5 rounded-xl bg-health-sage/10 text-health-leaf font-bold text-[10px] uppercase tracking-widest">
                   Term: {daysBetween(invoice.date, invoice.dueDate)} Days
                 </div>
              </div>
            </div>
          </div>

          {/* Line Items Matrix */}
          <div className="mb-24 overflow-hidden rounded-[32px] border border-health-ink/15 bg-health-bg/20">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-health-sage/10 text-health-leaf/50">
                  <th className="px-10 py-6 health-label">Item</th>
                  <th className="px-10 py-6 text-center health-label">Qty</th>
                  <th className="px-10 py-6 text-right health-label">Rate</th>
                  <th className="px-10 py-6 text-right health-label">GST</th>
                  <th className="px-10 py-6 text-right health-label">Discount</th>
                  <th className="px-10 py-6 text-right health-label">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-health-muted/10 text-health-ink">
                {invoice.lineItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/50 transition-colors">
                    <td className="px-10 py-8">
                      <div className="font-display font-bold text-lg text-health-leaf">{item.name}</div>
                      <div className="opacity-60 text-xs mt-1">{item.description}</div>
                    </td>
                    <td className="px-10 py-8 text-center font-bold">{item.quantity}</td>
                    <td className="px-10 py-8 text-right text-health-muted">{formatCurrency(item.basePrice)}</td>
                    <td className="px-10 py-8 text-right font-bold text-health-olive">+{item.gstPercentage}%</td>
                    <td className="px-10 py-8 text-right font-bold text-red-400">
                      -{item.discountType === 'percentage' ? `${item.discountValue}%` : formatCurrency(item.discountValue)}
                    </td>
                    <td className="px-10 py-8 text-right font-display font-bold text-lg text-health-leaf">
                      {formatCurrency(item.rowTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Final Totals Breakdown */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-16">
            <div className="space-y-8 max-w-sm">
              <div className="flex items-center gap-4">
                 <Terminal size={18} className="text-health-olive" />
                 <h4 className="health-label text-health-leaf font-bold uppercase tracking-widest">Terms</h4>
              </div>
              <div className="text-xs text-health-muted space-y-4 leading-relaxed border-l-2 border-health-sage/30 pl-6">
                <p>1. Settlement: Please pay by the due date.</p>
                <p>2. Values: Questions about this invoice? Reply to the email it came with.</p>
              </div>
            </div>

            <div className="w-full md:w-[400px] space-y-5">
              <div className="flex justify-between items-center py-3 border-b border-health-ink/15">
                <span className="health-label text-health-sage uppercase font-bold tracking-widest text-[10px]">Base Amount</span>
                <span className="font-display font-bold text-health-leaf text-lg">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-health-ink/15">
                <span className="health-label text-red-400 uppercase font-bold tracking-widest text-[10px]">Discount</span>
                <span className="font-bold text-red-500">-{formatCurrency(invoice.totalDiscount)}</span>
              </div>
              <div className="flex justify-between items-center py-5 border-b border-health-ink/30">
                <span className="health-label text-health-olive uppercase font-bold tracking-widest text-[10px]">GST</span>
                <span className="font-bold text-health-olive">+{formatCurrency(invoice.totalGST)}</span>
              </div>
              <div className="flex justify-between items-end pt-8">
                <span className="health-label text-health-leaf font-bold tracking-widest uppercase text-sm">Total due</span>
                <span className="text-6xl font-display font-bold text-health-leaf tracking-tighter leading-none">{formatCurrency(invoice.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
