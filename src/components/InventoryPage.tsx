import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Activity, Check, X, AlertTriangle } from "lucide-react";
import { InventoryItem } from "../types";
import { formatCurrency } from "../lib/calculations";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<InventoryItem> | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; ids: string[] }>({ isOpen: false, ids: [] });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      setItems(data || []);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = currentItem?.id ? "PUT" : "POST";
    const url = currentItem?.id ? `/api/items/${currentItem.id}` : "/api/items";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentItem),
      });
      fetchItems();
      setIsModalOpen(false);
      setCurrentItem(null);
    } catch (error) {
      console.error("Failed to save item:", error);
    }
  };

  const handleDelete = async () => {
    const { ids } = confirmDelete;
    if (ids.length === 0) return;

    try {
      if (ids.length === 1) {
        await fetch(`/api/items/${ids[0]}`, { method: "DELETE" });
      } else {
        await fetch("/api/items/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });
      }
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
      fetchItems();
      setConfirmDelete({ isOpen: false, ids: [] });
    } catch (error) {
      console.error("Failed to delete item(s):", error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16 border-b border-health-ink/15 pb-16">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-display font-extrabold text-health-leaf leading-none mb-6">The <br />pantry</h1>
          <p className="text-lg text-health-muted max-w-md">Your ingredients and dishes with base prices and GST, ready to drop into an invoice.</p>
        </div>
        <div className="flex items-center gap-6">
          {selectedIds.length > 0 && (
            <button 
              onClick={() => setConfirmDelete({ isOpen: true, ids: selectedIds })}
              className="flex items-center gap-3 py-5 px-10 rounded-xl border border-red-200 text-red-600 font-bold text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all shadow-lg shadow-red-50"
            >
              <Trash2 size={16} />
              Purge Selected ({selectedIds.length})
            </button>
          )}
          <button 
            onClick={() => { setCurrentItem({}); setIsModalOpen(true); }}
            className="btn-health py-5 px-10 flex items-center gap-3 "
          >
            <Plus size={18} />
            <span>New item</span>
          </button>
        </div>
      </div>

      <div className="health-card overflow-hidden bg-white/70  ">
        <div className="p-10 bg-health-olive/5 border-b border-health-ink/10 flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="relative group w-full max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-health-sage group-focus-within:text-health-olive transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search ingredients..." 
              className="w-full pl-16 pr-8 py-4 bg-white rounded-xl border-2 border-health-ink font-medium text-sm focus:outline-none focus:ring-2 focus:ring-health-sage/20 transition-all "
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 text-health-muted text-sm">
            <div className="w-2 h-2 rounded-xl bg-health-sage" />
            <span>Saved to the server</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-health-sage/10 text-health-leaf/50">
                <th className="px-10 py-6 w-16">
                  <button 
                    onClick={toggleSelectAll}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      selectedIds.length === filteredItems.length && filteredItems.length > 0
                        ? 'bg-health-leaf border-health-leaf text-white'
                        : 'border-health-ink/30 hover:border-health-leaf'
                    }`}
                  >
                    {selectedIds.length === filteredItems.length && filteredItems.length > 0 && <Check size={14} />}
                  </button>
                </th>
                <th className="px-10 py-6 health-label text-[10px]">Item</th>
                <th className="px-10 py-6 health-label text-[10px]">Variant</th>
                <th className="px-10 py-6 health-label text-[10px]">Base price</th>
                <th className="px-10 py-6 health-label text-right text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-health-muted/5">
              {loading && items.length === 0 ? (
                <tr><td colSpan={5} className="px-10 py-32 text-center text-health-muted">Syncing inventory state...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={5} className="px-10 py-32 text-center text-health-muted">Pantry is currently empty.</td></tr>
              ) : filteredItems.map((item) => (
                <tr key={item.id} className={`hover:bg-health-bg/40 transition-all duration-300 group ${selectedIds.includes(item.id) ? 'bg-health-sage/5' : ''}`}>
                  <td className="px-10 py-8">
                    <button 
                      onClick={() => toggleSelect(item.id)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        selectedIds.includes(item.id)
                          ? 'bg-health-leaf border-health-leaf text-white'
                          : 'border-health-ink/30 hover:border-health-leaf'
                      }`}
                    >
                      {selectedIds.includes(item.id) && <Check size={14} />}
                    </button>
                  </td>
                  <td className="px-10 py-8">
                    <div className="font-display font-bold text-health-leaf text-lg group-hover:text-health-olive transition-colors">{item.name}</div>
                    <div className="text-xs mt-1 text-health-muted line-clamp-1">{item.description}</div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="inline-flex px-4 py-1.5 rounded-xl bg-health-sage/20 text-health-leaf font-bold text-[10px] uppercase tracking-widest">
                      {item.variants}
                    </span>
                  </td>
                  <td className="px-10 py-8 font-display font-bold text-health-leaf text-lg">
                    {formatCurrency(item.basePrice)}
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <button 
                        onClick={() => { setCurrentItem(item); setIsModalOpen(true); }}
                        className="w-10 h-10 rounded-xl bg-health-sage/10 text-health-leaf flex items-center justify-center hover:bg-health-olive hover:text-white transition-all duration-300"
                        title="Modify Specification"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => setConfirmDelete({ isOpen: true, ids: [item.id] })}
                        className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-300"
                        title="Purge Entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmDelete.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-health-leaf/40 backdrop-blur-xl">
          <div className="bg-white health-card w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300 shadow-2xl">
            <div className="p-12 text-center space-y-8">
              <div className="w-24 h-24 bg-red-50 rounded-xl flex items-center justify-center mx-auto text-red-600 shadow-xl shadow-red-100">
                <AlertTriangle size={48} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-display font-bold text-health-leaf">Confirm Purge</h3>
                <p className="text-health-muted">Are you certain you wish to remove <span className="font-bold text-health-leaf not-italic">{confirmDelete.ids.length === 1 ? 'this entry' : `${confirmDelete.ids.length} entries`}</span> from the clinical database? This action is irreversible.</p>
              </div>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleDelete}
                  className="w-full py-5 rounded-xl bg-red-600 text-white font-bold tracking-widest text-[10px] uppercase hover:bg-red-700 transition-all shadow-xl shadow-red-200"
                >
                  Confirm Permanent Deletion
                </button>
                <button 
                  onClick={() => setConfirmDelete({ isOpen: false, ids: [] })}
                  className="w-full py-5 rounded-xl border border-health-ink/30 text-health-muted font-bold tracking-widest text-[10px] uppercase hover:bg-health-bg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-health-leaf/20 backdrop-blur-md">
          <div className="bg-health-cream health-card w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 shadow-2xl">
            <div className="px-12 py-12 border-b border-health-ink/15 bg-health-olive/5 flex justify-between items-center">
              <div>
                <h2 className="text-5xl font-display font-bold text-health-leaf leading-none">{currentItem?.id ? 'Edit item' : 'New item'}</h2>
                <p className="health-label mt-3 text-health-sage opacity-80 uppercase tracking-widest font-bold">Pantry</p>
              </div>
              <Activity size={40} className="text-health-olive opacity-20" />
            </div>
            <form onSubmit={handleSave} className="p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="health-label text-health-olive">Item name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g., Organic Quinoa"
                    className="w-full px-6 py-4 bg-health-bg/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-health-sage/30 transition-all font-medium text-sm"
                    value={currentItem?.name || ""}
                    onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                  />
                </div>
                <div className="space-y-4">
                  <label className="health-label text-health-olive">Base Price (INR)</label>
                  <input 
                    required
                    type="number" 
                    placeholder="0.00"
                    className="w-full px-6 py-4 bg-health-bg/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-health-sage/30 transition-all font-display text-xl font-bold text-health-leaf"
                    value={currentItem?.basePrice || ""}
                    onChange={(e) => setCurrentItem({ ...currentItem, basePrice: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="health-label text-health-olive">Variant</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g., Large, Gluten-Free, Vegan"
                  className="w-full px-6 py-4 bg-health-bg/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-health-sage/30 transition-all font-medium text-sm"
                  value={currentItem?.variants || ""}
                  onChange={(e) => setCurrentItem({ ...currentItem, variants: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <label className="health-label text-health-olive">Description</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Short description"
                  className="w-full px-6 py-4 bg-health-bg/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-health-sage/30 transition-all font-medium text-sm resize-none"
                  value={currentItem?.description || ""}
                  onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                />
              </div>

              <div className="pt-8 flex gap-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 rounded-xl border border-health-ink/30 text-health-muted font-bold tracking-widest text-[10px] uppercase hover:bg-health-bg transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 btn-health py-5 shadow-lg shadow-health-leaf/20"
                >
                  Save item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
