"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TiendaPage() {
    const [user, setUser] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const load = async () => {
            const [uRes, iRes] = await Promise.all([
                fetch("/api/user"),
                fetch("/api/tienda")
            ]);
            const uData = await uRes.json();
            const iData = await iRes.json();
            
            setUser(uData.user);
            if (iData.ok) setItems(iData.items);
            setLoading(false);
        };
        load();
    }, []);

    const handleBuy = async (item) => {
        // V10: BLOQUEO DE TIENDA (MODO BETA SEGURO)
        alert("Modo Beta: Las compras y recargas de Tinta estarán disponibles próximamente.");
        setBuying(null);
        return;
        
        // El código original ha sido deshabilitado por seguridad comercial
        /*
        setBuying(item);
        await new Promise(r => setTimeout(r, 2000));
        ...
        */
    };

    if (loading) return <div className="min-h-screen bg-[#050509] flex items-center justify-center font-serif italic text-purple-400 animate-pulse">Consultando el inventario del mercado...</div>;

    const packsTinta = items.filter(i => i.tipo === 'tinta');
    const libros = items.filter(i => i.tipo === 'libro');

    return (
        <main className="min-h-screen p-10 bg-[#050509] text-white font-sans">
            <div className="max-w-6xl mx-auto space-y-16">
                <header className="flex justify-between items-center border-b border-white/5 pb-12">
                    <div>
                        <h1 className="text-6xl font-bold tracking-tighter mb-4">El Mercado Real</h1>
                        <p className="text-gray-400 font-serif italic">Abastécete de tinta o adquiere el conocimiento prohibido de los grandes maestros.</p>
                    </div>
                    <div className="bg-[#101018] border border-purple-500/30 p-6 rounded-2xl flex items-center gap-6 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Reserva de Tinta</p>
                            <p className="text-3xl font-mono text-purple-400">{user?.tinta || 0}</p>
                        </div>
                        <div className="h-12 w-12 bg-purple-600 rounded-full flex items-center justify-center text-2xl shadow-inner">✒️</div>
                    </div>
                </header>

                {/* Sección de Tinta */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-[0.5em] text-purple-500 mb-8 flex items-center gap-4">
                        <span className="w-8 h-px bg-purple-500/30"></span>
                        Suministros de Escritura
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {packsTinta.map(p => (
                            <div key={p.id} className="bg-[#101018] border border-gray-800/50 rounded-3xl p-8 flex flex-col items-center hover:border-purple-500/50 transition-all duration-500 group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-600 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">✒️</div>
                                <h3 className="text-lg font-bold mb-1">{p.nombre}</h3>
                                <p className="text-xs text-gray-500 mb-6 font-serif italic text-center px-4">{p.descripcion}</p>
                                <p className="text-purple-400 font-mono text-3xl mb-6">+{p.cantidad}</p>
                                <p className="text-gray-400 font-bold mb-8 text-sm">${p.precio} USD</p>
                                <button
                                    onClick={() => handleBuy(p)}
                                    disabled={buying !== null}
                                    className={`w-full py-4 rounded-xl font-bold transition-all ${buying?.id === p.id ? 'bg-gray-700 animate-pulse' : 'bg-white text-black hover:bg-white/90 hover:scale-[1.02]'}`}
                                >
                                    {buying?.id === p.id ? "Conectando..." : "Comprar"}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Sección de Libros */}
                {libros.length > 0 && (
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-[0.5em] text-amber-500 mb-8 flex items-center gap-4">
                            <span className="w-8 h-px bg-amber-500/30"></span>
                            Biblioteca de Libros Sagrados
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {libros.map(book => (
                                <div key={book.id} className="bg-[#0c0c12] border border-amber-500/10 rounded-2xl overflow-hidden flex flex-col group hover:border-amber-500/30 transition-all">
                                    <div className="aspect-[3/4] bg-gradient-to-b from-amber-500/5 to-transparent flex items-center justify-center relative">
                                        <span className="text-8xl group-hover:scale-110 transition-transform duration-700 opacity-20">📖</span>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-500">
                                            <h3 className="text-3xl font-bold mb-3 font-serif title-gradient">{book.nombre}</h3>
                                            <span className="text-[10px] uppercase tracking-widest text-amber-500/60 font-black">Manuscrito Original</span>
                                        </div>
                                    </div>
                                    <div className="p-8 space-y-6 flex-1 flex flex-col">
                                        <p className="text-sm text-gray-400 font-serif italic leading-relaxed line-clamp-3">
                                            "{book.descripcion}"
                                        </p>
                                        <div className="mt-auto space-y-6">
                                            <div className="flex justify-between items-center border-t border-white/5 pt-6">
                                                <div className="flex gap-2">
                                                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded-sm text-gray-500 uppercase font-bold">PDF</span>
                                                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded-sm text-gray-500 uppercase font-bold">EPUB</span>
                                                </div>
                                                <p className="text-2xl font-mono text-amber-400">${book.precio}</p>
                                            </div>
                                            <button
                                              onClick={() => handleBuy(book)}
                                              disabled={buying !== null}
                                              className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3"
                                            >
                                                {buying?.id === book.id ? (
                                                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                                ) : "Instruir en el Conocimiento"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Modal de Transacción */}
                {buying && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md">
                        <div className="bg-[#101018] border border-white/10 p-12 rounded-3xl text-center max-w-sm shadow-[0_0_100px_rgba(0,0,0,1)]">
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-4xl">🔮</div>
                            </div>
                            <h2 className="text-2xl font-bold mb-4 tracking-tighter">Procesando Vínculo Arcaico</h2>
                            <p className="text-gray-500 font-serif italic text-sm leading-relaxed">
                                Estamos invocando a las pasarelas seguras para finalizar tu intercambio de ${buying.precio} USD...
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

