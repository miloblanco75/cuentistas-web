"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Zap, Shield, Monitor, Type, Crown, Droplet } from "lucide-react";
import "@/styles/RarityStyles.css";

export default function TiendaPage() {
    const [user, setUser] = useState(null);
    const [commercialItems, setCommercialItems] = useState([]);
    const [prestigeItems, setPrestigeItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(null);
    const [message, setMessage] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Handle post-checkout messages
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success')) {
            setMessage({ type: 'success', text: `¡Transacción sellada! +${urlParams.get('tinta')} ✒️ inyectadas.` });
            setTimeout(() => setMessage(null), 10000);
        } else if (urlParams.get('canceled')) {
            setMessage({ type: 'info', text: "Transacción cancelada por el usuario." });
            setTimeout(() => setMessage(null), 5000);
        }

        const load = async () => {
            const [uRes, cRes, pRes] = await Promise.all([
                fetch("/api/user"),
                fetch("/api/tienda"),
                fetch("/api/store/prestige")
            ]);
            const uData = await uRes.json();
            const cData = await cRes.json();
            const pData = await pRes.json();
            
            if (uData.ok) setUser(uData.user);
            if (cData.ok) setCommercialItems(cData.items);
            if (pData.ok) setPrestigeItems(pData.items);
            setLoading(false);
        };
        load();
    }, []);

    const handleBuyPrestige = async (item) => {
        setBuying(item.id);
        try {
            const res = await fetch("/api/store/buy", {
                method: "POST",
                body: JSON.stringify({ itemId: item.id }),
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            if (data.ok) {
                setMessage({ type: 'success', text: `¡${item.name} adquirido!` });
                // Refresh user
                const uRes = await fetch("/api/user");
                const uData = await uRes.json();
                if (uData.ok) setUser(uData.user);
            } else {
                if (data.missing) {
                    setMessage({ type: 'error', text: `Tinta insuficiente. Faltan ${data.missing} ✒️`, tintaPack: true });
                } else {
                    setMessage({ type: 'error', text: data.error });
                }
            }
        } catch (e) {
            setMessage({ type: 'error', text: "Error en la conexión con el Tribunal" });
        } finally {
            setBuying(null);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    const handleBuyCommercial = async (item) => {
        setBuying(item.id);
        try {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                body: JSON.stringify({ 
                    itemId: item.id,
                    itemName: item.nombre,
                    itemPrice: item.precio,
                    itemTintaAmount: item.cantidad
                }),
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            if (data.ok && data.url) {
                window.location.href = data.url;
            } else {
                setMessage({ type: 'error', text: data.error || "Fallo al conectar con Stripe" });
            }
        } catch (e) {
            setMessage({ type: 'error', text: "Error en la pasarela de pagos" });
        } finally {
            setBuying(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#020202] flex items-center justify-center font-serif italic text-gold animate-pulse">
            Sincronizando el Mercado de la Ciudadela...
        </div>
    );

    const tintaPacks = commercialItems.filter(i => i.tipo === 'tinta');
    const prestigeSections = [
        { 
            id: 'presencia',
            title: '🔥 Impulsar Presencia', 
            icon: Zap, 
            desc: 'Haz que el Tribunal no te ignore. Aumenta tu visibilidad.',
            types: ['boost'] 
        },
        { 
            id: 'identidad',
            title: '👑 Identidad y Rango', 
            icon: Crown, 
            desc: 'Forja tu imagen en los Anales. Marcos, medallas y títulos.',
            types: ['frame', 'badge', 'title'] 
        },
        { 
            id: 'ventajas',
            title: '⚔️ Ventajas Tácticas', 
            icon: Shield, 
            desc: 'Acceso prioritario y privilegios en la Arena.',
            types: ['access', 'advantage'] 
        }
    ];

    return (
        <main className="min-h-screen p-8 md:p-24 bg-[#020202] text-white selection:bg-gold/30">
            <div className="max-w-6xl mx-auto space-y-24">
                
                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="w-12 h-px bg-gold/50"></span>
                            <span className="text-gold text-[10px] font-black tracking-[0.4em] uppercase">Bóveda de Poder</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter text-white">La Forja</h1>
                        <p className="text-gray-500 font-serif italic max-w-lg">Transforma tu Tinta en influencia. Cada objeto aquí presente es un paso más hacia la dominación del Tribunal.</p>
                    </div>

                    <div className="bg-gold/5 border border-gold/20 p-8 rounded-3xl flex items-center gap-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Reserva de Tinta</p>
                            <p className="text-4xl font-serif italic text-gold">{user?.tinta || 0} ✒️</p>
                        </div>
                        <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-gold/20">
                            <Droplet className="text-gold" />
                        </div>
                    </div>
                </header>

                {/* NOTIFICATIONS */}
                {message && (
                    <div className={`fixed bottom-10 right-10 z-[200] p-6 rounded-2xl border flex items-center gap-4 animate-in slide-in-from-right duration-500 shadow-2xl ${
                        message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
                        message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-gold/10 border-gold/30 text-gold'
                    }`}>
                        <div className="p-2 rounded-full bg-white/5">
                            {message.type === 'error' ? '🚫' : '🔱'}
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold uppercase tracking-widest">{message.text}</p>
                            {message.tintaPack && <p className="text-[10px] opacity-70">Obtén suministros en la sección inferior</p>}
                        </div>
                    </div>
                )}

                {/* STRATEGIC SECTIONS */}
                <div className="grid gap-24">
                    {prestigeSections.map(section => (
                        <section key={section.id} className="space-y-12">
                            <div className="space-y-2 border-l-2 border-gold/20 pl-8">
                                <h2 className="text-4xl font-serif italic text-white flex items-center gap-6">
                                    <section.icon size={28} className="text-gold" /> {section.title}
                                </h2>
                                <p className="text-gray-500 text-xs tracking-widest uppercase">{section.desc}</p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {prestigeItems.filter(i => section.types.includes(i.type)).map(item => (
                                    <div key={item.id} className={`royal-card p-10 flex flex-col justify-between gap-8 group glow-${item.rarity} relative hover:scale-[1.02] transition-all`}>
                                        {item.rarity === 'legendary' && (
                                            <div className="absolute -top-3 -right-3 bg-gold text-black text-[8px] font-black px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)] animate-bounce">
                                                LEGENDARIO
                                            </div>
                                        )}
                                        <div className="space-y-6">
                                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl">
                                                {item.type === 'frame' ? <Monitor size={24} className="opacity-40" /> : 
                                                 item.type === 'badge' ? <Shield size={24} className="opacity-40" /> : 
                                                 item.type === 'title' ? <Type size={24} className="opacity-40" /> :
                                                 <Zap size={24} className="text-gold" />}
                                            </div>
                                            <div>
                                                <h4 className={`text-xl font-serif italic ${
                                                    item.rarity === 'legendary' ? 'text-gold' :
                                                    item.rarity === 'epic' ? 'text-purple-400' : 'text-white/90'
                                                }`}>{item.name}</h4>
                                                <p className="text-[10px] text-gray-500 font-sans tracking-wide mt-2">{item.description}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Requerido</span>
                                                <span className="text-lg font-serif text-gold">{item.priceTinta} ✒️</span>
                                            </div>
                                            <button 
                                                onClick={() => handleBuyPrestige(item)}
                                                disabled={buying === item.id}
                                                className="bg-gold hover:bg-white text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                            >
                                                {buying === item.id ? "⌛" : "Reclamar 🔱"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* TINTA PACKS (INFERIOR - NECESIDAD) */}
                <section className="pt-24 border-t border-white/5 space-y-12">
                     <div className="text-center space-y-4">
                        <h2 className="text-4xl font-serif italic text-white/50">Suministros de Escritura</h2>
                        <p className="text-gray-600 text-xs tracking-widest uppercase">Para cuando tu Criterion necesita combustible real</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-60 hover:opacity-100 transition-opacity duration-700">
                        {tintaPacks.map(p => (
                            <div key={p.id} className="relative royal-card p-10 flex flex-col items-center gap-6 group hover:translate-y-[-5px] transition-all">
                                <div className="text-4xl">✒️</div>
                                <div className="text-center">
                                    <h3 className="font-bold text-sm tracking-widest uppercase mb-1">{p.nombre}</h3>
                                    <p className="text-gold font-black text-2xl">+{p.cantidad} ✒️</p>
                                </div>
                                <button 
                                    onClick={() => handleBuyCommercial(p)}
                                    disabled={buying === p.id}
                                    className="w-full py-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50"
                                >
                                    {buying === p.id ? "Conectando ⚡" : "Adquirir 💧"}
                                </button>
                                <p className="text-[10px] text-gray-600 font-bold">${p.precio} USD</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
