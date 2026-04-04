"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

function MercadoContent() {
    const [data, setData] = useState(null);
    const [purchasing, setPurchasing] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const isMaster = session?.user?.rol === "Maestro";

    useEffect(() => {
        fetch("/api/hub?type=mercado")
            .then(res => res.json())
            .then(d => setData(d.mercado));

        const success = searchParams.get('success');
        const canceled = searchParams.get('canceled');
        const tintaSumada = searchParams.get('tinta');

        if (success) {
            setSuccessMsg(`¡El Banco Supremo ha aprobado tu compra! Recibiste ${tintaSumada} gotas de tinta.`);
            setTimeout(() => setSuccessMsg(''), 10000);
            window.history.replaceState(null, '', '/mercado');
        }

        if (canceled) {
            setSuccessMsg('Transferencia declinada o cancelada por el usuario.');
            setTimeout(() => setSuccessMsg(''), 5000);
            window.history.replaceState(null, '', '/mercado');
        }
    }, [searchParams]);

    if (!data) return <div className="min-h-screen bg-[#050505] flex items-center justify-center font-serif text-sm">...</div>;

    const handleRealPurchase = async (tintaItem) => {
        setPurchasing(true);
        try {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                body: JSON.stringify({ 
                    itemId: tintaItem.id,
                    itemName: tintaItem.nombre,
                    itemPrice: tintaItem.precio,
                    itemTintaAmount: tintaItem.cantidad 
                }),
                headers: { "Content-Type": "application/json" }
            });
            const dbMsg = await res.json();
            
            if (dbMsg.ok && dbMsg.url) {
                // Redirigimos al Checkout Seguro Oficial
                window.location.href = dbMsg.url;
            } else {
                setPurchasing(false);
                alert("Error contactando al Banco: " + dbMsg.error);
            }
        } catch (e) {
            setPurchasing(false);
            console.error(e);
        }
    };

    return (
        <main className="min-h-screen bg-[#050505] text-[#ffffff] p-12 md:p-32 animate-elegant font-sans">
            <div className="max-w-7xl mx-auto space-y-48">
                <header className="space-y-8 relative">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-[10px] tracking-[0.6em] uppercase text-gold font-light">— Reliquias & Artefactos —</p>
                            <h1 className="text-8xl font-light tracking-tighter text-white font-serif italic uppercase">Tienda Real</h1>
                        </div>
                        <div className="flex gap-4">
                            <a 
                                href="/hub" 
                                className="px-6 py-2 border border-white/10 hover:border-white/40 text-[10px] tracking-[0.4em] uppercase transition-all rounded-sm bg-white/5"
                            >
                                ← Volver al Hub
                            </a>
                            {isMaster && (
                                <a 
                                    href="/panel/tienda" 
                                    className="px-6 py-2 border border-gold/30 gold-gradient-text hover:border-gold text-[10px] tracking-[0.4em] uppercase transition-all rounded-sm bg-gold/10"
                                >
                                    🛠️ Gestionar Inventario
                                </a>
                            )}
                        </div>
                    </div>
                    
                    {purchasing && (
                        <div className="absolute top-0 right-0 p-4 border border-gold/40 bg-gold/5 text-gold rounded animate-pulse">
                            <span className="text-sm font-bold tracking-widest uppercase">Conectando con Stripe...</span>
                        </div>
                    )}
                    {successMsg && (
                        <div className="absolute top-0 right-0 p-4 bg-green-500/20 text-green-400 border border-green-500/50 rounded">
                            <span className="text-sm font-bold tracking-widest uppercase">{successMsg}</span>
                        </div>
                    )}
                </header>

                <section className="space-y-24 pt-12">
                    <h2 className="text-[11px] font-sans tracking-[0.8em] uppercase text-gold font-bold border-b border-gold/20 pb-10">Reserva de Tinta (Compra con USD)</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        {data.tintaItems?.length > 0 ? data.tintaItems.map(t => (
                            <div key={t.id} className="royal-card p-12 text-center group bg-gradient-to-b from-white/[0.02] to-transparent hover:border-gold/30">
                                <span className="text-6xl mb-8 block drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(212,175,55,0.6)] transition-all">
                                    {t.imagenUrl && t.imagenUrl.length < 5 ? t.imagenUrl : "💧"}
                                </span>
                                <h3 className="text-xl font-bold tracking-widest text-[#1d1d1f] font-sans uppercase text-white mb-4">{t.nombre}</h3>
                                {t.cantidad && <p className="text-[10px] text-gold/60 tracking-widest uppercase mb-4">+{t.cantidad} Gotas</p>}
                                <p className="text-3xl font-serif italic text-gold">${t.precio} USD</p>
                                <button 
                                    onClick={() => handleRealPurchase(t)}
                                    disabled={purchasing}
                                    className="royal-button w-full mt-10 py-4 opacity-70 group-hover:opacity-100"
                                >
                                    {purchasing ? "Conectando..." : "Pagar con Tarjeta"}
                                </button>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center border border-white/5 bg-white/[0.01] rounded">
                                <p className="text-[10px] tracking-[0.5em] text-gray-600 uppercase">La Reserva de Tinta está vacía</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="space-y-24">
                    <h2 className="text-[11px] font-sans tracking-[0.8em] uppercase text-white font-light border-b border-white/5 pb-10">Biblioteca del Cónclave</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-20">
                        {data.libros?.length > 0 ? data.libros.map(b => (
                            <div key={b.id} className="royal-card p-12 group space-y-12">
                                <div className="h-[400px] w-full flex items-center justify-center text-9xl opacity-30 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 select-none bg-gradient-to-b from-white/[0.02] to-transparent overflow-hidden">
                                    {b.imagenUrl && b.imagenUrl.startsWith('http') ? (
                                        <img src={b.imagenUrl} alt={b.nombre} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{b.imagenUrl || "📘"}</span>
                                    )}
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-4xl font-serif italic text-white/90 group-hover:text-gold transition-all duration-700">{b.nombre}</h3>
                                    <div className="flex justify-between items-center pt-8 border-t border-white/5">
                                        <div className="space-y-2">
                                            <p className="text-[10px] text-gray-500 tracking-[0.3em] font-sans uppercase">
                                                {b.descripcion?.length < 30 ? b.descripcion : "Obra del Cónclave"}
                                            </p>
                                            <p className="text-2xl font-serif italic text-gold">${b.precio} Oro</p>
                                        </div>
                                        <button className="royal-button px-12 py-3">Adquirir</button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center border border-white/5 bg-white/[0.01] rounded">
                                <p className="text-[10px] tracking-[0.5em] text-gray-600 uppercase">La Biblioteca espera nuevos manuscritos</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="space-y-24">
                    <h2 className="text-[11px] font-sans tracking-[0.8em] uppercase text-white font-light border-b border-white/5 pb-10">Instrumentos Reales</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        {data.merch?.length > 0 ? data.merch.map(m => (
                            <div key={m.id} className="royal-card p-10 text-center space-y-10 group border-transparent hover:border-gold/20">
                                <div className="text-6xl opacity-20 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-700">
                                    {m.imagenUrl && m.imagenUrl.length < 5 ? m.imagenUrl : "🏺"}
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-sans tracking-[0.5em] text-gray-500 group-hover:text-white transition-colors uppercase font-light">{m.nombre}</h3>
                                    <p className="text-xl font-serif italic text-gold">${m.precio} USD</p>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center border border-white/5 bg-white/[0.01] rounded">
                                <p className="text-[10px] tracking-[0.5em] text-gray-600 uppercase">No hay artefactos disponibles</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

export default function MercadoPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">...</div>}>
            <MercadoContent />
        </Suspense>
    );
}
