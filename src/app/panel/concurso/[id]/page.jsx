"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function JudgeControlPage() {
    const { id } = useParams();
    const [concurso, setConcurso] = useState(null);
    const [entradas, setEntradas] = useState([]);
    const [drafts, setDrafts] = useState({});
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [spectatorTime, setSpectatorTime] = useState(300);

    const fetchStatus = async () => {
        const res = await fetch(`/api/concursos?id=${id}`);
        const data = await res.json();
        if (data.ok) setConcurso(data.concurso);

        const resE = await fetch(`/api/entradas`);
        const dataE = await resE.json();
        if (dataE.ok) setEntradas(dataE.entradas.filter(e => e.concursoId === id));

        const resD = await fetch(`/api/hub?type=drafts&id=${id}`);
        const dataD = await resD.json();
        if (dataD.ok) setDrafts(dataD.drafts);

        const resU = await fetch("/api/user");
        const dataU = await resU.json();
        if (dataU.ok) setUser(dataU.user);

        setLoading(false);
    };

    useEffect(() => {
        fetchStatus();
        
        // Pusher real-time updates for drafts
        let channelName = `concurso-${id}`;
        let pusherInstance;

        import("@/lib/pusherClient").then(({ pusherClient }) => {
            pusherInstance = pusherClient;
            const channel = pusherClient.subscribe(channelName);
            
            channel.bind("live-draft", (newDraft) => {
                setDrafts(prev => ({
                    ...prev,
                    [newDraft.userId]: newDraft
                }));
            });
        });

        const interval = setInterval(() => {
            // Re-fetch only db data periodically, drafts come from Pusher!
            fetch(`/api/entradas`).then(res => res.json()).then(dataE => {
                if (dataE.ok) setEntradas(dataE.entradas.filter(e => e.concursoId === id));
            });
        }, 10000);

        return () => {
            clearInterval(interval);
            if (pusherInstance) pusherInstance.unsubscribe(channelName);
        };
    }, [id]);

    useEffect(() => {
        if (user?.rol === 'spectator') {
            const timer = setInterval(() => {
                setSpectatorTime(prev => {
                    if (prev <= 1) {
                        window.location.href = "/registro"; // Kick them out
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [user]);

    const handleAction = async (action) => {
        await fetch("/api/concursos/control", {
            method: "POST",
            body: JSON.stringify({ id, action }),
            headers: { "Content-Type": "application/json" }
        });
        fetchStatus();
    };

    if (loading || !concurso) return <div className="min-h-screen bg-[#050505] text-gold flex items-center justify-center font-serif text-sm">...</div>;

    return (
        <main className="min-h-screen p-8 md:p-24 bg-[#fbfbfb] text-[#1d1d1f] animate-elegant font-sans bg-apple-gradient">
            <div className="max-w-7xl mx-auto space-y-32">
                <header className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-[#e5e5ea] pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">⚖️</span>
                            <p className="text-sm tracking-widest uppercase text-[#5856d6] font-bold">Gran Tribunal • Integridad Digital</p>
                        </div>
                        <h1 className="text-6xl font-extrabold tracking-tight text-[#1d1d1f] uppercase">{concurso.titulo}</h1>
                        <p className="text-sm opacity-60 font-bold tracking-widest uppercase">Mandato: {user?.rol === 'spectator' ? 'CLASIFICADO' : concurso.temaExacto}</p>
                    </div>
                    
                    {user?.rol === 'spectator' ? (
                        <div className="bg-zinc-900 border border-[#5856d6] text-white px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(88,86,214,0.3)] animate-pulse">
                            <p className="text-xs uppercase tracking-[0.2em] opacity-60 font-bold">Tiempo Restante de Visita</p>
                            <p className="text-4xl font-extrabold">{Math.floor(spectatorTime / 60)}:{(spectatorTime % 60).toString().padStart(2, '0')}</p>
                        </div>
                    ) : (
                        <div className="flex gap-6">
                            {concurso.status === "waiting" && (
                                <button onClick={() => handleAction("start")} className="royal-button px-10 py-4 text-lg">Revelar Mandato</button>
                            )}
                            {concurso.status === "active" && (
                                <button onClick={() => handleAction("stop")} className="royal-button bg-red-500 hover:bg-red-600 text-white border-none shadow-lg">Cerrar Sesión</button>
                            )}
                        </div>
                    )}
                </header>

                <div className="grid lg:grid-cols-2 gap-10">
                    {Object.entries(drafts).map(([userId, d]) => (
                        <div key={userId} className={`royal-card p-10 h-96 flex flex-col justify-between group transition-all bg-white shadow-xl ${d.suspicious || d.tabSwitches > 0 ? 'border-red-500 bg-red-50' : ''}`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-2">
                                    <span className="text-lg font-bold tracking-tight text-[#1d1d1f]">@{d.username}</span>
                                    <div className="flex gap-3">
                                        {d.suspicious && <span className="text-[12px] bg-red-600 text-white px-3 py-1 rounded-full font-bold tracking-tight uppercase animate-pulse">ALERTA IA</span>}
                                        {d.tabSwitches > 0 && <span className="text-[12px] bg-zinc-200 text-zinc-700 px-3 py-1 rounded-full font-bold tracking-tight uppercase">SALIDAS: {d.tabSwitches}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {d.tabSwitches > 0 && <span className="text-red-500 text-2xl">⚠️</span>}
                                </div>
                            </div>
                            <div className="flex-1 text-zinc-700 font-semibold text-lg lg:text-xl line-clamp-[6] overflow-y-auto leading-relaxed scrollbar-hide">
                                {d.texto || <span className="opacity-30 italic">Inspiración en pausa...</span>}
                            </div>
                            <div className="mt-8 pt-6 border-t border-[#e5e5ea] flex justify-between items-center text-sm text-zinc-400 font-bold tracking-tight uppercase">
                                <span>{d.texto.length} Runas</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-[#5856d6] rounded-full animate-pulse shadow-[0_0_12px_rgba(88,86,214,0.5)]"></div>
                                    <span className="text-[#5856d6]">Sincronía Activa</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <section className="space-y-16 pt-12">
                    <h3 className="text-sm font-bold tracking-[0.4em] uppercase text-zinc-400 text-center">Registros de Verdad</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {entradas.map(e => (
                            <div key={e.id} className={`royal-card p-8 group transition-all bg-white shadow-lg  ${e.suspicious || e.tabSwitches > 0 ? 'bg-red-50 border-red-200 shadow-red-100' : ''}`}>
                                <div className="flex justify-between items-start mb-6">
                                    <h4 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">{e.participante}</h4>
                                    <div className="flex flex-col items-end gap-2">
                                        {e.suspicious && <span className="text-red-600 text-[10px] font-bold tracking-tight uppercase">IA WARNING</span>}
                                        {e.tabSwitches > 0 && <span className="text-red-600 text-[10px] font-bold tracking-tight uppercase">ABANDONÓ {e.tabSwitches}X</span>}
                                    </div>
                                </div>
                                <p className="text-lg text-zinc-600 font-semibold leading-relaxed group-hover:text-[#1d1d1f] transition-colors line-clamp-4 italic">"{e.texto}"</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
