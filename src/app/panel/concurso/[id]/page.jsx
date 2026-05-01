"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Shield, ShieldAlert, FileText, X } from "lucide-react";
import IntegrityReport from "@/components/admin/IntegrityReport";

export default function JudgeControlPage() {
    const { id } = useParams();
    const [concurso, setConcurso] = useState(null);
    const [entradas, setEntradas] = useState([]);
    const [drafts, setDrafts] = useState({});
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [spectatorTime, setSpectatorTime] = useState(300);
    const [selectedEntry, setSelectedEntry] = useState(null);

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

    if (loading || !concurso) return <div className="min-h-screen bg-[#050508] text-gold flex items-center justify-center font-serif text-sm">...</div>;

    return (
        <main className="min-h-screen p-8 md:p-12 bg-[#050508] text-[#ffffff] animate-elegant font-sans relative overflow-x-hidden">
            {/* Modal de Reporte de Integridad */}
            {selectedEntry && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 bg-black/90 backdrop-blur-md animate-elegant">
                    <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[#0a0a0f] border border-white/10 rounded-lg shadow-2xl">
                        <button 
                            onClick={() => setSelectedEntry(null)}
                            className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-all z-10"
                        >
                            <X size={24} />
                        </button>
                        <IntegrityReport 
                            data={selectedEntry.integrityData} 
                            participante={selectedEntry.participante || selectedEntry.username} 
                        />
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto space-y-16">
                <header className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-white/10 pb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Shield className="text-gold" size={20} />
                            <p className="text-[10px] tracking-[0.5em] uppercase text-gold font-black">Gran Tribunal • Protocolo de Integridad</p>
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tighter text-white uppercase">{concurso.titulo}</h1>
                        <p className="text-xs opacity-60 font-bold tracking-widest uppercase italic">Objetivo: {user?.rol === 'spectator' ? 'CLASIFICADO' : concurso.temaExacto}</p>
                    </div>
                    
                    {user?.rol === 'spectator' ? (
                        <div className="bg-black/60 border border-gold/40 text-gold px-8 py-4 rounded-sm animate-pulse">
                            <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-bold">Tiempo Restante</p>
                            <p className="text-4xl font-extrabold">{Math.floor(spectatorTime / 60)}:{(spectatorTime % 60).toString().padStart(2, '0')}</p>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            {concurso.status === "waiting" && (
                                <button onClick={() => handleAction("start")} className="bg-gold text-black px-10 py-4 font-black text-[10px] tracking-[0.3em] uppercase hover:bg-amber-400 transition-all">Iniciar Sesión 🔱</button>
                            )}
                            {concurso.status === "active" && (
                                <button onClick={() => handleAction("stop")} className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 font-black text-[10px] tracking-[0.3em] uppercase transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]">Cerrar Sesión 🏛️</button>
                            )}
                        </div>
                    )}
                </header>

                {/* Live Monitors (Drafts) */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {Object.entries(drafts).map(([userId, d]) => (
                        <div key={userId} className={`royal-card p-8 min-h-[300px] flex flex-col justify-between group transition-all bg-black/40 border-white/5 ${d.suspicious || d.tabSwitches > 0 ? 'border-red-900/50 bg-red-950/10' : ''}`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-2">
                                    <span className="text-lg font-bold tracking-tight text-white">@{d.username}</span>
                                    <div className="flex gap-2">
                                        {d.suspicious && <span className="text-[10px] bg-red-600 text-white px-2 py-1 rounded-sm font-black tracking-widest uppercase animate-pulse">ALERTA IA</span>}
                                        {d.tabSwitches > 0 && <span className="text-[10px] bg-white/10 text-white/60 px-2 py-1 rounded-sm font-black tracking-widest uppercase">SALIDAS: {d.tabSwitches}</span>}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedEntry(d)}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-gold transition-all"
                                    title="Ver Reporte en Vivo"
                                >
                                    <ShieldAlert size={20} />
                                </button>
                            </div>
                            <div className="flex-1 text-white/80 font-serif italic text-lg line-clamp-4 overflow-y-auto leading-relaxed scrollbar-hide">
                                {d.texto || <span className="opacity-20 italic">Aguardando ráfaga literaria...</span>}
                            </div>
                            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-white/20 font-black tracking-widest uppercase">
                                <span>{d.texto?.length || 0} RUNAS</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gold/40 rounded-full animate-pulse"></div>
                                    <span className="text-gold/60">Caja de Cristal Activa</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Finished Entries */}
                <section className="space-y-12">
                    <div className="flex items-center gap-4">
                        <h3 className="text-[11px] font-black tracking-[0.4em] uppercase text-white/20">Registros de Verdad (Entregados)</h3>
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {entradas.map(e => (
                            <div key={e.id} className={`royal-card p-6 group transition-all bg-black/20 border-white/5 hover:border-gold/30 ${e.suspicious || e.tabSwitches > 0 ? 'bg-red-950/5 border-red-900/20' : ''}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-lg font-bold tracking-tight text-white">{e.participante}</h4>
                                    <button 
                                        onClick={() => setSelectedEntry(e)}
                                        className="text-gold hover:text-white transition-all"
                                    >
                                        <FileText size={18} />
                                    </button>
                                </div>
                                <p className="text-sm text-white/40 font-serif leading-relaxed line-clamp-3 italic">"{e.texto}"</p>
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="flex gap-2">
                                        {e.suspicious && <span className="text-red-500 text-[9px] font-black uppercase">IA</span>}
                                        {e.tabSwitches > 0 && <span className="text-amber-500 text-[9px] font-black uppercase">{e.tabSwitches}X TAB</span>}
                                    </div>
                                    <span className="text-[9px] opacity-20 uppercase tracking-widest">{e.texto.length} RUNAS</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}

