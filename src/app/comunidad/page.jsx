"use client";

import { useEffect, useState } from "react";

export default function ComunidadPage() {
    const [data, setData] = useState(null);
    const [msg, setMsg] = useState("");
    const [user, setUser] = useState(null);

    const load = async () => {
        const res = await fetch("/api/hub?type=comunidad");
        const d = await res.json();
        setData(d.comunidad);

        const resU = await fetch("/api/user");
        const du = await resU.json();
        setUser(du.user);
    };

    useEffect(() => {
        load();
        
        // WebSocket en lugar de Polling para el chat
        import("@/lib/pusherClient").then(({ pusherClient }) => {
            const channel = pusherClient.subscribe("comunidad");
            channel.bind("new-message", (newMsg) => {
                setData(prev => {
                    if (!prev) return prev;
                    // Prepend or Append depending on the desired order (UI expects reverse mapped later but UI does it itself sometimes)
                    // Currently UI shows data.mensajes
                    return {
                        ...prev,
                        mensajes: [newMsg, ...prev.mensajes]
                    };
                });
            });

            return () => {
                pusherClient.unsubscribe("comunidad");
            };
        });
    }, []);

    const sendChat = async (e) => {
        e.preventDefault();
        if (!msg.trim()) return;
        const currentMsg = msg;
        setMsg("");
        
        await fetch("/api/hub", {
            method: "POST",
            body: JSON.stringify({ type: "chat", userId: user.username, msg: currentMsg }),
            headers: { "Content-Type": "application/json" }
        });
    };

    if (!data || !user) return <div className="min-h-screen bg-[#050505] flex items-center justify-center font-serif text-sm">...</div>;

    return (
        <main className="min-h-screen bg-[#050505] text-[#ffffff] p-12 md:p-32 animate-elegant font-sans">
            <div className="max-w-7xl mx-auto space-y-48">
                <header className="space-y-8">
                    <p className="text-[10px] tracking-[0.5em] uppercase text-gold">Círculo Social</p>
                    <h1 className="text-8xl font-light tracking-tighter text-white font-serif italic uppercase">Comunidad</h1>
                </header>

                <div className="grid lg:grid-cols-5 gap-32">
                    <div className="lg:col-span-3 space-y-32">
                        <section className="space-y-16">
                            <h2 className="text-[11px] font-sans tracking-[0.6em] uppercase text-white font-light border-b border-white/5 pb-8">Crónicas Diarias</h2>
                            <div className="grid gap-8">
                                {data.anuncios.map(a => (
                                    <div key={a.id} className="royal-card p-12 flex justify-between items-center group">
                                        <div className="space-y-3">
                                            <h3 className="text-3xl font-serif italic text-white/90 group-hover:text-gold transition-all duration-700">{a.titulo}</h3>
                                            <div className="flex gap-6 items-center">
                                                <p className="text-[9px] text-gray-600 font-sans tracking-[0.3em] uppercase">Sello: {a.autor}</p>
                                                <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                                                <p className="text-[9px] text-gray-600 font-sans tracking-[0.3em] uppercase">{a.fecha}</p>
                                            </div>
                                        </div>
                                        <span className="text-gold opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0">→</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-2">
                        <section className="h-[800px] flex flex-col royal-card p-12">
                            <h2 className="text-[11px] font-sans tracking-[0.6em] uppercase text-gold font-light mb-16 italic text-center">La Mesa Redonda</h2>

                            <div className="flex-1 overflow-y-auto space-y-12 pr-6 scrollbar-hide">
                                {data.mensajes.map(m => (
                                    <div key={m.id} className="space-y-4 border-l border-white/5 pl-8 hover:border-gold/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <p className="text-[9px] font-sans text-white/40 tracking-[0.4em] uppercase">@{m.user}</p>
                                        </div>
                                        <p className="text-xl font-serif italic leading-relaxed text-gray-400">{m.texto}</p>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={sendChat} className="pt-16 mt-16 border-t border-white/5 flex flex-col gap-8">
                                <input
                                    value={msg}
                                    onChange={(e) => setMsg(e.target.value)}
                                    placeholder="Compartir pensamiento..."
                                    className="royal-input !text-xl"
                                />
                                <button className="royal-button w-full">
                                    Sellar Mensaje
                                </button>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
