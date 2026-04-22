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
    const sections = [
        { type: 'frame', title: 'Marcos de Identidad', icon: Monitor },
        { type: 'badge', title: 'Emblemas de Rango', icon: Shield },
        { type: 'title', title: 'Títulos Honoríficos', icon: Type },
        { type: 'boost', title: 'Potenciadores del Veredicto', icon: Zap }
    ];

    return (
        <main className="min-h-screen p-8 md:p-24 bg-[#020202] text-white selection:bg-gold/30">
            <div className="max-w-6xl mx-auto space-y-24">
                
                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="w-12 h-px bg-gold/50"></span>
                            <span className="text-gold text-[10px] font-black tracking-[0.4em] uppercase">Mercado de Prestigio</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter text-white">La Forja</h1>
                        <p className="text-gray-500 font-serif italic max-w-lg">Transforma tu Tinta en identidad. El Tribunal otorga estos sellos a quienes demuestran su valor en la Arena.</p>
                    </div>

                    <div className="bg-gold/5 border border-gold/20 p-8 rounded-3xl flex items-center gap-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Balance de Tinta</p>
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

                {/* FEATURED: LEGENDARY ITEMS */}
                <section className="space-y-10">
                    <h2 className="text-xs font-black uppercase tracking-[0.5em] text-gold flex items-center gap-6">
                        <Crown size={16} /> Reliquias Legendarias
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {prestigeItems.filter(i => i.rarity === 'legendary').map(item => (
                            <div key={item.id} className="royal-card p-12 flex flex-col md:flex-row items-center gap-10 group border-gold/30 bg-gold/5 glow-legendary">
                                <div className={`w-32 h-32 flex-shrink-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-700 bg-white/5 rounded-full ${item.type === 'frame' ? 'frame-legendary' : ''}`}>
                                    {item.name.split(' ')[0]}
                                </div>
                                <div className="flex-1 space-y-6 text-center md:text-left">
                                    <div>
                                        <h3 className="text-3xl font-serif italic text-white title-rarity-legendary">{item.name}</h3>
                                        <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">{item.description}</p>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-8">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Inversión</span>
                                            <span className="text-2xl font-serif text-gold">{item.priceTinta} ✒️</span>
                                        </div>
                                        <button 
                                            onClick={() => handleBuyPrestige(item)}
                                            disabled={buying === item.id}
                                            className="royal-button px-10 py-4 text-[10px] font-black tracking-widest uppercase"
                                        >
                                            {buying === item.id ? "Pidiendo audiencia..." : "Reclamar Legado"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* PRESTIGE CATEGORIES */}
                <div className="grid md:grid-cols-2 gap-20">
                    {sections.map(section => (
                        <section key={section.type} className="space-y-10">
                             <h2 className="text-xs font-black uppercase tracking-[0.5em] text-white/40 flex items-center gap-4">
                                <section.icon size={14} /> {section.title}
                            </h2>
                            <div className="grid gap-6">
                                {prestigeItems.filter(i => i.type === section.type && i.rarity !== 'legendary').map(item => (
                                    <div key={item.id} className={`flex items-center justify-between p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group glow-${item.rarity}`}>
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                                                {item.type === 'frame' ? <Monitor size={20} className="opacity-30" /> : 
                                                 item.type === 'badge' ? item.name.split(' ')[0] : <Type size={18} className="opacity-30" />}
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-bold uppercase tracking-tighter ${
                                                    item.rarity === 'epic' ? 'text-purple-400' : 
                                                    item.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                                                }`}>{item.name}</h4>
                                                <p className="text-[10px] text-gray-500 italic font-serif">{item.rarity === 'common' ? 'Objeto Base' : item.rarity}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleBuyPrestige(item)}
                                            disabled={buying === item.id}
                                            className="bg-white/5 hover:bg-white text-white hover:text-black px-6 py-2 rounded-lg text-[10px] font-black border border-white/10 transition-all flex items-center gap-3"
                                        >
                                            {buying === item.id ? "⌛" : `${item.priceTinta} ✒️`}
                                        </button>
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
