"use client";

import { useEffect, useState } from "react";

export default function ExamenesPage() {
    const [examenes, setExamenes] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function load() {
            const resC = await fetch("/api/concursos");
            const dataC = await resC.json();
            setExamenes(dataC.concursos.filter(c => !c.categoria) || []);

            const resU = await fetch("/api/user");
            const dataU = await resU.json();
            setUser(dataU.user);
        }
        load();
    }, []);

    if (!user) return <div className="min-h-screen bg-[#050505] flex items-center justify-center font-serif text-sm">...</div>;

    return (
        <main className="min-h-screen p-12 md:p-32 bg-[#050505] text-[#ffffff] animate-elegant font-sans">
            <div className="max-w-5xl mx-auto space-y-48">
                <header className="space-y-8 flex flex-col md:flex-row justify-between items-end">
                    <div className="space-y-4">
                        <p className="text-[10px] tracking-[0.5em] uppercase text-gold font-light">— Tribunal de Ascensión —</p>
                        <h1 className="text-8xl font-light tracking-tighter text-white font-serif italic uppercase">Actas</h1>
                    </div>
                    <div className="text-right pb-4">
                        <p className="text-[9px] tracking-[0.3em] uppercase text-gray-600 font-sans">Certificaciones Reales</p>
                        <p className="text-2xl font-serif italic text-gold">Pendientes /0{examenes.length}</p>
                    </div>
                </header>

                <div className="grid gap-12">
                    {examenes.map((e) => (
                        <div key={e.id} className="royal-card p-16 flex flex-col md:flex-row justify-between items-center group">
                            <div className="space-y-6 text-center md:text-left">
                                <div className="flex items-center gap-6 justify-center md:justify-start">
                                    <span className="text-[9px] tracking-[0.5em] uppercase text-gold font-bold">Protocolo Ministerial</span>
                                    <div className="w-8 h-[1px] bg-white/10"></div>
                                </div>
                                <h2 className="text-5xl font-serif italic text-white/90 group-hover:text-gold transition-all duration-700">{e.titulo}</h2>
                                <p className="text-xl text-gray-500 font-serif italic max-w-2xl leading-relaxed">{e.descripcion}</p>
                            </div>
                            <div className="mt-16 md:mt-0">
                                <a
                                    href={`/concursos/live/${e.id}`}
                                    className="royal-button"
                                >
                                    Enfrentar Mandato
                                </a>
                            </div>
                        </div>
                    ))}
                    {examenes.length === 0 && (
                        <div className="py-48 text-center royal-card opacity-30 italic font-serif border-transparent">
                            <p className="text-3xl text-white">No existen mandatos de certificación activos en este ciclo.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
