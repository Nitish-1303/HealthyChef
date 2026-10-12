import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Search, Calendar, ChevronDown, CheckCircle2, User, Phone, Mail, MapPin, Calculator, Save, Package, Terminal, Layers, ArrowRight } from "lucide-react";
import { InventoryItem, LineItem, InvoiceCustomer, Invoice } from "../types";
import { calculateLineItemTotal, calculateInvoiceSummary, formatCurrency } from "../lib/calculations";
import { useNavigate } from "react-router-dom";
import { addDays, todayISO, formatDisplayDate, DEFAULT_TERM_DAYS } from "../lib/invoices";

export default function InvoiceCreator() {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [customer, setCustomer] = useState<InvoiceCustomer>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [showItemPicker, setShowItemPicker] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'pending' | 'paid'>('pending');
  const [dueDate, setDueDate] = useState(() => addDays(todayISO(), DEFAULT_TERM_DAYS));

  // The invoice number is assigned by the server when the invoice is saved.
  const currentDate = useMemo(() => formatDisplayDate(todayISO()), []);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  const addLineItem = () => {
    setLineItems([...lineItems, {
      itemId: "",
      name: "Select Item",
      description: "",
      quantity: 1,
      basePrice: 0,
      gstPercentage: 18,
      discountType: 'percentage',
      discountValue: 0,
      rowTotal: 0
    }]);
  };

  const updateLineItem = (index: number, updates: Partial<LineItem>) => {
    const newList = [...lineItems];
    newList[index] = { ...newList[index], ...updates };
    
    // Recalculate row total
    const { total } = calculateLineItemTotal(newList[index]);
    newList[index].rowTotal = total;
    
    setLineItems(newList);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const selectItemForLineAt = (index: number, item: InventoryItem) => {
    updateLineItem(index, {
      itemId: item.id,
      name: item.name,
      description: item.variants,
      basePrice: item.basePrice,
    });
    setShowItemPicker(null);
  };

  const summary = useMemo(() => calculateInvoiceSummary(lineItems), [lineItems]);

  const handleSaveInvoice = async () => {
    if (!customer.fullName || lineItems.length === 0) {
      alert("Please fill in customer details and add at least one item.");
      return;
    }
    if (!dueDate || dueDate < todayISO()) {
      alert("Please choose a due date that is today or later.");
      return;
    }

    const sendEmail = customer.email
      ? window.confirm(`Email this invoice to ${customer.email} now?\n\nOK = save and send email\nCancel = save without emailing`)
      : false;

    setIsSaving(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, lineItems, dueDate, status, sendEmail }),
      });
      if (res.ok) {
        navigate("/dashboard");
      } else {
        const body = await res.json().catch(() => null);
        alert(body?.error || "Failed to save the invoice. Please try again.");
      }
    } catch (error) {
      console.error("Failed to save invoice:", error);
      alert("Could not reach the server. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-48">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16 border-b border-health-ink/15 pb-16">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-display font-extrabold text-health-leaf leading-none mb-6">New <br />invoice</h1>
          <p className="text-lg text-health-muted max-w-md">Add the client, pick items from your pantry and send it.</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-6 bg-white border border-health-ink/15 rounded-2xl px-6 h-16 shadow-lg shadow-health-ink/5">
            <div className="flex items-center gap-3">
              <span className="health-label font-bold text-health-sage">REF:</span>
              <span className="text-health-leaf font-bold font-display">Assigned on save</span>
            </div>
            <div className="w-px h-6 bg-health-muted/10" />
            <div className="flex bg-health-bg rounded-xl p-1">
              {(['pending', 'paid'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${
                    status === s 
                      ? 'bg-health-leaf text-white shadow-sm' 
                      : 'text-health-muted hover:text-health-leaf text-opacity-60'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 health-label text-health-sage tracking-widest uppercase text-[10px]">
            Due date
            <input
              type="date"
              value={dueDate}
              min={todayISO()}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-white border border-health-ink/15 rounded-xl px-4 py-2 text-health-leaf font-bold normal-case tracking-normal"
            />
          </label>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-xl bg-health-sage animate-pulse" />
             <span className="health-label text-health-sage tracking-widest uppercase text-[10px]">Date: {currentDate}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-12">
          <div className="health-card p-12 bg-white ">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-10 h-10 rounded-xl bg-health-sage/10 text-health-olive flex items-center justify-center">
                <User size={20} />
              </div>
              <span className="health-label text-health-leaf font-bold">Client details</span>
            </div>
            
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="health-label text-health-sage">Client name</label>
                <input 
                  type="text" 
                  placeholder="Enter Name"
                  className="w-full py-4 bg-transparent border-b border-health-ink/30 focus:outline-none focus:border-health-olive transition-all font-medium text-sm "
                  value={customer.fullName}
                  onChange={(e) => setCustomer({...customer, fullName: e.target.value})}
                />
              </div>

              <div className="space-y-6">
                <label className="health-label text-health-sage">Contact</label>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-health-ink/30 focus-within:border-health-olive">
                    <Mail size={16} className="text-health-sage opacity-60" />
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      className="w-full py-4 bg-transparent focus:outline-none text-sm "
                      value={customer.email}
                      onChange={(e) => setCustomer({...customer, email: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-4 border-b border-health-ink/30 focus-within:border-health-olive">
                    <Phone size={16} className="text-health-sage opacity-60" />
                    <input 
                      type="tel" 
                      placeholder="Phone Number"
                      className="w-full py-4 bg-transparent focus:outline-none text-sm "
                      value={customer.phone}
                      onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="health-label text-health-sage">Address</label>
                <textarea 
                  rows={4}
                  placeholder="Street, City, Pincode"
                  className="w-full py-5 bg-health-bg/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-health-sage/30 transition-all text-sm resize-none leading-relaxed p-6"
                  value={customer.address}
                  onChange={(e) => setCustomer({...customer, address: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-12">
          <div className="health-card p-12 bg-white ">
            <div className="flex items-center justify-between mb-12 pb-8 border-b border-health-ink/15">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-health-sage/10 text-health-olive flex items-center justify-center">
                  <Layers size={20} />
                </div>
                <span className="health-label text-health-leaf font-bold">Items</span>
              </div>
              <button 
                onClick={addLineItem}
                className="btn-health py-4 px-8 text-xs flex items-center gap-3"
              >
                <Plus size={16} /> Add item
              </button>
            </div>

            <div className="space-y-8">
              {lineItems.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-health-sage/20 rounded-[32px] bg-health-bg/20">
                  <Terminal size={48} className="text-health-sage opacity-30 mb-6" />
                  <p className="text-health-muted">Awaiting nutritional inputs...</p>
                </div>
              ) : lineItems.map((item, index) => (
                <div key={index} className="p-10 bg-health-bg/30 rounded-[32px] relative group hover:bg-health-cream transition-all duration-500 shadow-sm border border-transparent hover:border-health-ink/10">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    <div className="md:col-span-8 relative">
                      <label className="health-label mb-4 block text-health-sage">Selection</label>
                      <button 
                        onClick={() => setShowItemPicker(showItemPicker === index ? null : index)}
                        className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border border-health-ink/15 font-bold text-sm transition-all hover:bg-health-olive/5"
                      >
                        <span className={item.itemId ? "text-health-leaf" : "text-health-muted font-medium"}>
                          {item.itemId ? item.name : "SELECT INGREDIENT"}
                        </span>
                        <ChevronDown size={18} className="text-health-sage" />
                      </button>
                      
                      {showItemPicker === index && (
                        <div className="absolute left-0 top-full mt-3 w-full bg-health-cream health-card z-[60] py-6 max-h-72 overflow-y-auto shadow-2xl">
                          {items.map(i => (
                            <button 
                              key={i.id}
                              onClick={() => selectItemForLineAt(index, i)}
                              className="w-full text-left px-8 py-5 hover:bg-health-olive hover:text-white transition-all border-b border-health-ink/10 last:border-0"
                            >
                              <p className="font-display font-bold text-lg">{i.name}</p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="health-label text-[10px] opacity-60">{i.variants}</span>
                                <span className="font-display font-bold text-lg">{formatCurrency(i.basePrice)}</span>
                              </div>
                            </button>
                          ))}
                          {items.length === 0 && <p className="px-8 py-6 text-sm text-health-muted">No items yet. Add some in the pantry.</p>}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-4">
                      <label className="health-label mb-4 block text-health-sage">Multiplier</label>
                      <input 
                        type="number" 
                        min="1"
                        className="w-full p-5 bg-white rounded-2xl border border-health-ink/15 font-display text-2xl font-bold text-health-leaf focus:outline-none focus:ring-2 focus:ring-health-sage/20"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, { quantity: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mt-10 pt-10 border-t border-health-ink/15 items-center">
                    <div className="md:col-span-3">
                      <label className="health-label mb-4 block text-health-sage">GST (%)</label>
                      <select 
                        className="w-full px-5 py-4 bg-white rounded-2xl border border-health-ink/15 font-bold text-xs text-health-leaf focus:outline-none"
                        value={item.gstPercentage}
                        onChange={(e) => updateLineItem(index, { gstPercentage: parseInt(e.target.value) })}
                      >
                        <option value={5}>GST 5%</option>
                        <option value={12}>GST 12%</option>
                        <option value={18}>GST 18%</option>
                      </select>
                    </div>

                    <div className="md:col-span-4">
                      <label className="health-label mb-4 block text-health-sage">Discount (%)</label>
                      <div className="flex items-center bg-white rounded-2xl border border-health-ink/15 overflow-hidden">
                        <button 
                          onClick={() => updateLineItem(index, { discountType: item.discountType === 'percentage' ? 'absolute' : 'percentage' })}
                          className="w-14 h-14 flex items-center justify-center bg-health-sage/10 font-bold text-lg text-health-leaf hover:bg-health-sage hover:text-white transition-all"
                        >
                          {item.discountType === 'percentage' ? '%' : '₹'}
                        </button>
                        <input 
                          type="number" 
                          placeholder="0"
                          className="flex-1 h-14 px-6 font-bold text-sm text-health-leaf focus:outline-none "
                          value={item.discountValue}
                          onChange={(e) => updateLineItem(index, { discountValue: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-5 text-right flex flex-col items-end">
                      <label className="health-label mb-3 block text-health-sage">Price check</label>
                      <div className="text-4xl font-display font-bold text-health-leaf tracking-tight">
                        {formatCurrency(item.rowTotal || 0)}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => removeLineItem(index)}
                    className="absolute -right-4 -top-4 w-10 h-10 flex items-center justify-center bg-red-50 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-xl opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-health-ink px-6 py-6 lg:px-12 z-[70]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="grid grid-cols-3 gap-16 flex-1">
            <div className="space-y-2">
              <span className="health-label text-health-sage">Subtotal</span>
              <span className="text-3xl font-display font-bold text-health-leaf block tracking-tight">{formatCurrency(summary.subtotal)}</span>
            </div>
            <div className="space-y-2">
              <span className="health-label text-health-olive">GST</span>
              <span className="text-3xl font-display font-bold text-health-olive block tracking-tight">+{formatCurrency(summary.totalGST)}</span>
            </div>
            <div className="space-y-2">
              <span className="health-label text-red-400">Discount</span>
              <span className="text-3xl font-display font-bold text-red-500 block tracking-tight">-{formatCurrency(summary.totalDiscount)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-12 border-l border-health-ink/15 pl-16">
            <div className="text-right space-y-2">
              <span className="health-label text-health-leaf tracking-widest block font-bold text-[11px]">GRAND TOTAL</span>
              <h2 className="text-6xl font-display font-bold text-health-leaf tracking-tighter leading-none">{formatCurrency(summary.grandTotal)}</h2>
            </div>
            <button 
              disabled={isSaving}
              onClick={handleSaveInvoice}
              className="btn-health h-20 px-16 text-lg "
            >
              <span>{isSaving ? "Finalizing..." : "Create invoice"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
