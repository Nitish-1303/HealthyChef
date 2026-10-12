import { useState, useEffect } from "react";
import { Search, FileText, Download, ChevronRight, Eye, Calendar, User, TrendingUp, Filter } from "lucide-react";
import { Invoice } from "../types";
import { formatCurrency } from "../lib/calculations";
import { formatDisplayDate } from "../lib/invoices";
import { Link } from "react-router-dom";

type StatusFilter = 'all' | 'pending' | 'paid' | 'overdue';

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      setInvoices(data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.fullName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusStyles = (status?: string) => {
    switch (status) {
      case 'paid': return 'bg-health-leaf/10 text-health-leaf border-health-leaf/20';
      case 'overdue': return 'bg-red-50 text-red-600 border-red-100';
      case 'pending':
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  // Revenue only counts invoices that have actually been paid.
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="health-card p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-health-sage">
            <Calendar size={100} />
          </div>
          <p className="health-label mb-4">// Activity</p>
          <div className="flex items-baseline gap-4">
            <span className="text-7xl font-serif font-bold text-health-leaf">{invoices.length}</span>
            <span className="health-label text-health-sage">Statements</span>
          </div>
        </div>
        
        <div className="health-card p-12 bg-health-leaf text-white relative overflow-hidden group border-none shadow-2xl shadow-health-leaf/20">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <TrendingUp size={100} />
          </div>
          <p className="health-label text-white/50 mb-4">// Valuation</p>
          <div className="flex flex-col">
            <span className="text-5xl font-serif font-bold mb-2 tracking-tight">{formatCurrency(totalRevenue)}</span>
            <span className="health-label text-white/30 uppercase tracking-widest">Collected Revenue</span>
          </div>
        </div>

        <div className="health-card p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 text-health-sage">
            <User size={100} />
          </div>
          <p className="health-label mb-4">// Clients</p>
          <div className="flex items-baseline gap-4">
            <span className="text-7xl font-serif font-bold text-health-leaf">{new Set(invoices.map(i => i.customer.email)).size}</span>
            <span className="health-label text-health-sage">Active Members</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16 border-b border-health-muted/10 pb-16">
        <div className="max-w-2xl">
          <h1 className="text-7xl font-serif font-bold text-health-leaf leading-none mb-6 italic">Nutritional <br />Analytics</h1>
          <p className="text-lg text-health-muted italic max-w-sm">Synchronized management for metabolic protocols and optimization reports.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex bg-white rounded-full border border-health-muted/10 p-1">
            {(['all', 'pending', 'paid', 'overdue'] as StatusFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  statusFilter === f 
                    ? 'bg-health-leaf text-white shadow-md' 
                    : 'text-health-muted hover:text-health-leaf'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative group w-full sm:w-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-health-sage group-focus-within:text-health-olive transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              className="w-full sm:w-96 pl-16 pr-8 py-5 bg-white rounded-full border border-health-muted/10 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-health-sage/20 transition-all placeholder:italic"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link to="/invoices/new" className="btn-health whitespace-nowrap px-10 py-5">
            + Create Statement
          </Link>
        </div>
      </div>

      <div className="health-card overflow-hidden bg-white/70 backdrop-blur-sm border-none shadow-xl shadow-health-ink/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-health-olive/5 text-health-leaf/50">
                <th className="px-10 py-6 health-label">ID_Ref</th>
                <th className="px-10 py-6 health-label">Member Identity</th>
                <th className="px-10 py-6 health-label">Date</th>
                <th className="px-10 py-6 health-label">Status</th>
                <th className="px-10 py-6 health-label">Valuation</th>
                <th className="px-10 py-6 health-label text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-health-muted/5">
              {loading ? (
                <tr><td colSpan={6} className="px-10 py-32 text-center text-health-muted italic">Gathering archival data...</td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan={6} className="px-10 py-32 text-center text-health-muted italic">No matching statements identified.</td></tr>
              ) : filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-health-bg/40 transition-all duration-300 group">
                  <td className="px-10 py-8">
                    <div className="font-serif font-bold text-health-leaf group-hover:text-health-olive transition-colors">{inv.invoiceNumber}</div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-health-sage/10 text-health-leaf rounded-2xl flex items-center justify-center font-serif font-bold text-lg group-hover:bg-health-olive group-hover:text-white transition-all duration-500">
                        {inv.customer.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-health-ink">{inv.customer.fullName}</div>
                        <div className="text-[10px] text-health-muted tracking-widest uppercase font-semibold">{inv.customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-health-muted italic text-sm">
                    {formatDisplayDate(inv.date)}
                  </td>
                  <td className="px-10 py-8">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full border font-bold text-[10px] uppercase tracking-widest ${getStatusStyles(inv.status)}`}>
                      {inv.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-10 py-8 font-serif font-bold text-health-leaf text-lg">
                    {formatCurrency(inv.grandTotal)}
                  </td>
                  <td className="px-10 py-8 text-right">
                    <Link 
                      to={`/invoices/${inv.id}`}
                      className="inline-flex py-3 px-6 rounded-full bg-health-sage/10 text-health-leaf hover:bg-health-olive hover:text-white transition-all duration-300 font-medium text-xs gap-2 items-center"
                    >
                      <Eye size={14} /> View Protocol
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
