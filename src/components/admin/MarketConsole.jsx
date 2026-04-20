"use client";

import React, { useState, useEffect } from "react";
import { 
  Package, Plus, Edit2, Trash2, Check, X, 
  ExternalLink, Image as ImageIcon, DollarSign, Zap,
  AlertCircle, ShieldCheck, Database
} from "lucide-react";

export default function MarketConsole({ initialItems = [] }) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    precioTinta: 0,
    tipo: "objeto",
    categoria: "Artefacto",
    cantidad: 1,
    imagenUrl: "",
    disponible: true
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tienda");
      const data = await res.json();
      if (data.ok) setItems(data.items);
    } catch (e) {
      console.error("Market Sync Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = editingItem ? "PUT" : "POST";
    const body = editingItem ? { ...formData, id: editingItem.id } : formData;

    try {
      const res = await fetch("/api/admin/tienda", {
        method,
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setShowForm(false);
        setEditingItem(null);
        fetchItems();
      }
    } catch (e) {
      alert("Error al guardar el artefacto");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas destruir este artefacto del mercado?")) return;
    try {
      await fetch(`/api/admin/tienda?id=${id}`, { method: "DELETE" });
      fetchItems();
    } catch (e) {
      alert("Error al eliminar");
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      nombre: "",
      descripcion: "",
      precio: 0,
      precioTinta: 0,
      tipo: "objeto",
      categoria: "Artefacto",
      cantidad: 1,
      imagenUrl: "",
      disponible: true
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-8 animate-elegant">
      <header className="flex justify-between items-center bg-gold/5 border-l-4 border-gold p-6">
        <div>
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-gold">Market Oracle</h2>
          <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Sovereign product & pricing control</p>
        </div>
        <button 
          onClick={resetForm}
          className="bg-gold text-black px-6 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-amber-400 transition-all flex items-center gap-3"
        >
          <Plus size={14} /> New Artifact
        </button>
      </header>

      {/* Item Grid/Table */}
      <div className="grid grid-cols-1 gap-4">
        {items.map(item => (
          <div key={item.id} className="border border-white/5 bg-[#050508]/60 p-6 flex flex-col md:flex-row items-center gap-8 hover:border-gold/20 transition-all group">
            <div className="w-16 h-16 bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/30 transition-all">
                {item.imagenUrl ? (
                    <img src={item.imagenUrl} alt="" className="w-full h-full object-cover opacity-60" />
                ) : (
                    <Package size={24} className="opacity-20" />
                )}
            </div>
            
            <div className="flex-1 space-y-1 text-center md:text-left">
              <h3 className="text-xs font-bold tracking-widest uppercase flex items-center justify-center md:justify-start gap-3">
                {item.nombre}
                {!item.disponible && <span className="text-[8px] bg-red-500/20 text-red-500 px-2 py-0.5 border border-red-500/30">HIDDEN</span>}
              </h3>
              <p className="text-[10px] opacity-40 line-clamp-1 italic">{item.descripcion}</p>
            </div>

            <div className="grid grid-cols-3 gap-8 text-center px-12 border-x border-white/5">
                <div>
                   <p className="text-[8px] opacity-40 uppercase tracking-widest">USD Price</p>
                   <p className="text-xs font-bold text-gold">${item.precio}</p>
                </div>
                <div>
                   <p className="text-[8px] opacity-40 uppercase tracking-widest">Ink Price</p>
                   <p className="text-xs font-bold text-amber-500">{item.precioTinta || "—"}</p>
                </div>
                <div>
                   <p className="text-[8px] opacity-40 uppercase tracking-widest">Type</p>
                   <p className="text-[10px] opacity-60 uppercase">{item.tipo}</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button onClick={() => openEdit(item)} className="p-3 border border-white/10 hover:bg-gold/10 hover:border-gold/40 text-[#888] hover:text-gold transition-all">
                    <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-3 border border-white/10 hover:bg-red-500/10 hover:border-red-500/40 text-[#888] hover:text-red-500 transition-all">
                    <Trash2 size={16} />
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-over / Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg h-full bg-[#050508] border-l border-gold/20 p-12 overflow-y-auto space-y-12 animate-in slide-in-from-right duration-500">
            <header className="flex justify-between items-center">
                <h3 className="text-sm font-bold tracking-[0.4em] uppercase gold-gradient-text">
                    {editingItem ? "Edit Artifact" : "Forge New Artifact"}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] tracking-widest uppercase opacity-40">Artifact Name</label>
                        <input 
                            required
                            value={formData.nombre}
                            onChange={e => setFormData({...formData, nombre: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 p-4 text-xs font-serif outline-none focus:border-gold/50 transition-all"
                            placeholder="e.g. Pluma de Fénix"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] tracking-widest uppercase opacity-40">Description</label>
                        <textarea 
                            required
                            rows={3}
                            value={formData.descripcion}
                            onChange={e => setFormData({...formData, descripcion: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 p-4 text-xs font-serif outline-none focus:border-gold/50 transition-all"
                            placeholder="Describe the power of this item..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] tracking-widest uppercase opacity-40 flex items-center gap-2">
                                <DollarSign size={10} /> USD Price
                            </label>
                            <input 
                                type="number"
                                step="0.01"
                                value={formData.precio}
                                onChange={e => setFormData({...formData, precio: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-gold/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] tracking-widest uppercase opacity-40 flex items-center gap-2">
                                <Zap size={10} /> Ink Price
                            </label>
                            <input 
                                type="number"
                                value={formData.precioTinta}
                                onChange={e => setFormData({...formData, precioTinta: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-gold/50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] tracking-widest uppercase opacity-40">Type</label>
                            <select 
                                value={formData.tipo}
                                onChange={e => setFormData({...formData, tipo: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-gold/50 appearance-none text-white/80"
                            >
                                <option value="tinta" className="bg-black">Tinta (Ink Pack)</option>
                                <option value="libro" className="bg-black">Libro (Ebook)</option>
                                <option value="objeto" className="bg-black">Objeto (Artifact)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] tracking-widest uppercase opacity-40">Quantity/Amount</label>
                            <input 
                                type="number"
                                value={formData.cantidad}
                                onChange={e => setFormData({...formData, cantidad: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-gold/50"
                                placeholder="e.g. 50 (for ink packs)"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] tracking-widest uppercase opacity-40 flex items-center gap-3">
                            <ImageIcon size={10} /> Image URL
                        </label>
                        <input 
                            value={formData.imagenUrl}
                            onChange={e => setFormData({...formData, imagenUrl: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-gold/50"
                            placeholder="https://i.imgur.com/..."
                        />
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                        <button 
                            type="button"
                            onClick={() => setFormData({...formData, disponible: !formData.disponible})}
                            className={`flex-1 flex items-center justify-center gap-3 py-4 text-[9px] font-bold tracking-[0.3em] uppercase transition-all ${formData.disponible ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'}`}
                        >
                            {formData.disponible ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                            {formData.disponible ? "Publicly Visible" : "Hidden Status"}
                        </button>
                    </div>
                </div>

                <div className="pt-8">
                    <button 
                        disabled={loading}
                        className="w-full bg-gold hover:bg-amber-400 text-black font-bold py-6 text-[10px] tracking-[0.5em] uppercase transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                        {loading ? "Transmitting..." : editingItem ? "Seal Changes" : "Forge Artifact"}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
