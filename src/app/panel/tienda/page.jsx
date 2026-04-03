"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminTiendaPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        precio: 0,
        tipo: "tinta",
        cantidad: "",
        imagenUrl: "",
        enlacePdf: "",
        enlaceEpub: "",
        disponible: true
    });

    const isMaster = session?.user?.rol === "Maestro";

    useEffect(() => {
        if (session && !isMaster) {
            router.push("/panel");
            return;
        }
        if (isMaster) loadItems();
    }, [session, isMaster]);

    const loadItems = async () => {
        setLoading(true);
        const res = await fetch("/api/admin/tienda");
        const data = await res.json();
        if (data.ok) setItems(data.items);
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingItem ? "PUT" : "POST";
        const body = editingItem ? { ...formData, id: editingItem.id } : formData;

        const res = await fetch("/api/admin/tienda", {
            method,
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" }
        });

        if (res.ok) {
            setShowModal(false);
            setEditingItem(null);
            setFormData({ nombre: "", descripcion: "", precio: 0, tipo: "tinta", cantidad: "", imagenUrl: "", enlacePdf: "", enlaceEpub: "", disponible: true });
            loadItems();
        } else {
            alert("Error al guardar el item");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Seguro que deseas desvanecer este objeto del mercado?")) return;
        const res = await fetch(`/api/admin/tienda?id=${id}`, { method: "DELETE" });
        if (res.ok) loadItems();
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setFormData({ ...item });
        setShowModal(true);
    };

    if (!isMaster) return <div className="min-h-screen bg-[#050508] flex items-center justify-center font-cinzel text-amber-500">Acceso Restringido al Cónclave</div>;

    return (
        <main className="min-h-screen p-8 md:p-16 bg-[#050508] text-[#e0d7c6] font-sans relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,_rgba(212,175,55,0.03),transparent_70%)]"></div>
            
            <div className="max-w-7xl mx-auto space-y-12 relative z-10 animate-elegant">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-amber-500/10 pb-8">
                    <div>
                        <div className="flex items-center gap-4 text-amber-500 mb-2 font-cinzel">
                             <a href="/panel" className="hover:text-amber-400 transition-colors">← Panel Supremo</a>
                             <span className="opacity-30">/</span>
                             <span className="text-sm tracking-[0.6em] uppercase">Bóveda de Tesoros</span>
                        </div>
                        <h1 className="text-5xl font-cinzel tracking-widest title-gradient">Gestión de la Tienda</h1>
                    </div>
                    <button 
                        onClick={() => { setEditingItem(null); setFormData({ nombre: "", descripcion: "", precio: 0, tipo: "tinta", cantidad: "", imagenUrl: "", enlacePdf: "", enlaceEpub: "", disponible: true }); setShowModal(true); }}
                        className="royal-button px-8 py-3 text-sm shadow-xl"
                    >
                        + Forjar Nuevo Ítem
                    </button>
                </header>

                {loading ? (
                    <div className="py-20 text-center animate-pulse font-serif italic text-amber-500/40 text-xl">Consultando los anales del mercado...</div>
                ) : (
                    <div className="grid gap-6">
                        {items.length === 0 ? (
                            <div className="royal-card p-20 text-center border-amber-500/5">
                                <p className="text-gray-500 font-serif italic italic">La bóveda está vacía. Es hora de añadir conocimiento o tinta.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto royal-card bg-black/40 border-amber-500/10">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-amber-500/10 text-[10px] font-cinzel tracking-[0.3em] text-amber-500/60 uppercase">
                                            <th className="p-6">Nombre del Tesoro</th>
                                            <th className="p-6">Tipo</th>
                                            <th className="p-6">Precio</th>
                                            <th className="p-6">Estado</th>
                                            <th className="p-6 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-amber-500/5 font-serif text-sm">
                                        {items.map(item => (
                                            <tr key={item.id} className="group hover:bg-amber-500/[0.02] transition-colors">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-2xl">{item.tipo === 'tinta' ? '✒️' : item.tipo === 'libro' ? '📖' : '💎'}</span>
                                                        <div>
                                                            <p className="font-bold text-white group-hover:text-amber-400 transition-colors">{item.nombre}</p>
                                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.descripcion}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <span className="px-3 py-1 bg-amber-500/5 border border-amber-500/10 rounded-full text-[10px] font-cinzel uppercase text-amber-500/80">
                                                        {item.tipo}
                                                    </span>
                                                </td>
                                                <td className="p-6 font-mono text-amber-400">${item.precio}</td>
                                                <td className="p-6">
                                                    <span className={`w-2 h-2 rounded-full inline-block mr-2 ${item.disponible ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    {item.disponible ? 'A la Venta' : 'Oculto'}
                                                </td>
                                                <td className="p-6 text-right space-x-4">
                                                    <button onClick={() => openEdit(item)} className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest">Editar</button>
                                                    <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-widest">Desvanecer</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Forja */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 overflow-y-auto">
                    <div className="royal-card w-full max-w-2xl bg-[#0a0a0f] border-amber-500/20 p-8 my-8">
                        <div className="flex justify-between items-center mb-8 border-b border-amber-500/10 pb-4">
                            <h2 className="text-2xl font-cinzel tracking-widest text-amber-500 uppercase">{editingItem ? 'Editar Tesoro' : 'Forjar Nuevo Ítem'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-cinzel tracking-widest text-amber-500/60 uppercase">Nombre</label>
                                    <input 
                                        required
                                        className="w-full bg-white/5 border border-white/10 p-3 rounded-sm outline-none focus:border-amber-500/50 transition-colors"
                                        value={formData.nombre}
                                        onChange={e => setFormData({...formData, nombre: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-cinzel tracking-widest text-amber-500/60 uppercase">Tipo de Bien</label>
                                    <select 
                                        className="w-full bg-white/5 border border-white/10 p-3 rounded-sm outline-none focus:border-amber-500/50 transition-colors"
                                        value={formData.tipo}
                                        onChange={e => setFormData({...formData, tipo: e.target.value})}
                                    >
                                        <option value="tinta">Recarga de Tinta</option>
                                        <option value="libro">Libro / Manuscrito</option>
                                        <option value="objeto">Artefacto Cosmético</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-cinzel tracking-widest text-amber-500/60 uppercase">Descripción Arcaica</label>
                                <textarea 
                                    className="w-full bg-white/5 border border-white/10 p-3 h-24 rounded-sm outline-none focus:border-amber-500/50 transition-colors resize-none font-serif"
                                    value={formData.descripcion}
                                    onChange={e => setFormData({...formData, descripcion: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-cinzel tracking-widest text-amber-500/60 uppercase">Precio (USD)</label>
                                    <input 
                                        type="number" step="0.01" required
                                        className="w-full bg-white/5 border border-white/10 p-3 rounded-sm outline-none focus:border-amber-500/50 transition-colors font-mono"
                                        value={formData.precio}
                                        onChange={e => setFormData({...formData, precio: e.target.value})}
                                    />
                                </div>
                                {formData.tipo === 'tinta' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-cinzel tracking-widest text-amber-500/60 uppercase">Cantidad Tinta</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-white/5 border border-white/10 p-3 rounded-sm outline-none focus:border-amber-500/50 transition-colors font-mono"
                                            value={formData.cantidad}
                                            onChange={e => setFormData({...formData, cantidad: e.target.value})}
                                        />
                                    </div>
                                )}
                            </div>

                            {(formData.tipo === 'libro') && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-amber-500/5 border border-amber-500/10 rounded-sm">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-cinzel tracking-widest text-amber-500/60 uppercase">Vínculo PDF</label>
                                        <input 
                                            className="w-full bg-black/40 border border-white/10 p-2 rounded-sm outline-none focus:border-amber-500/50 text-xs"
                                            placeholder="https://..."
                                            value={formData.enlacePdf}
                                            onChange={e => setFormData({...formData, enlacePdf: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-cinzel tracking-widest text-amber-500/60 uppercase">Vínculo EPUB</label>
                                        <input 
                                            className="w-full bg-black/40 border border-white/10 p-2 rounded-sm outline-none focus:border-amber-500/50 text-xs"
                                            placeholder="https://..."
                                            value={formData.enlaceEpub}
                                            onChange={e => setFormData({...formData, enlaceEpub: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4 pt-4">
                                <input 
                                    type="checkbox"
                                    id="disponible"
                                    className="accent-amber-500"
                                    checked={formData.disponible}
                                    onChange={e => setFormData({...formData, disponible: e.target.checked})}
                                />
                                <label htmlFor="disponible" className="text-xs font-serif italic text-gray-400">¿Hacer disponible este tesoro en el mercado público?</label>
                            </div>

                            <button type="submit" className="royal-button w-full py-4 mt-4 shadow-[0_0_30px_rgba(212,175,55,0.15)] group">
                                <span className="group-hover:tracking-[0.4em] transition-all duration-500 font-cinzel uppercase">
                                    {editingItem ? 'Confirmar Transformación' : 'Lanzar al Mercado'}
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
