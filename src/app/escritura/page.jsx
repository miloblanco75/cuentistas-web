"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/components/UserContext";
import { useRouter } from "next/navigation";
import { PenTool, Timer, Zap, Award, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function EscrituraPage() {
    const { userData, loading } = useUser();
    const router = useRouter();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/stats/live");
                const data = await res.json();
                if (data.ok) setStats(data.stats);
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050508] flex items-center justify-center">
                <div className="w-12 h-12 border-t-2 border-gold rounded-full animate-spin"></div>
            </div>
        );
    }

    const activeContestId = stats?.activeContestId || "arena-activa-default";

    return (
        <main className="min-h-screen bg-[#050508] text-white p-6 md:p-24 animate-elegant">
            <div className="max-w-6xl mx-auto space-y-24">
                <header className="space-y-4">
                    <p className="text-gold text-[10px] tracking-[0.6em] uppercase opacity-60">— El Refugio del Escritor —</p>
                    <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter text-white">Escritura</h1>
                    <div className="h-[1px] w-24 bg-gold/40"></div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Active Call to Action */}
                    <div className="lg:col-span-2 space-y-12">
                        <section className="royal-card p-12 bg-gradient-to-br from-white/[0.03] to-transparent border-gold/20 hover:border-gold/40 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <PenTool size={200} className="text-gold rotate-12" />
                            </div>
                            
                            <div className="relative z-10 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                                        <span className="text-[10px] tracking-[0.4em] uppercase text-red-500 font-bold">Arena Activa</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-serif italic text-white/90">
                                        {stats?.activeContest || "Cónclave Permanente"}
                                    </h2>
                                    <p className="text-gray-400 text-lg font-light leading-relaxed max-w-xl">
                                        El tiempo es la única moneda que no se recupera. Entra en la arena y forja tu legado entre humanos.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-8 py-8 border-y border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Timer className="text-gold w-5 h-5" />
                                        <div>
                                            <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-none mb-1">Duración</p>
                                            <p className="text-white font-serif italic">60 Minutos</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Award className="text-gold w-5 h-5" />
                                        <div>
                                            <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-none mb-1">Prestigio</p>
                                            <p className="text-white font-serif italic">Ascensión</p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => router.push(`/concursos/live/${activeContestId}`)}
                                    className="royal-button px-12 py-5 text-xs group flex items-center gap-4"
                                >
                                    <span>ENTRAR A LA ARENA</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Link href="/concursos" className="royal-card p-10 flex flex-col justify-between gap-8 hover:bg-white/[0.02] transition-all">
                                <h3 className="text-2xl font-serif italic text-white/80">Ver todas las convocatorias</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] tracking-widest uppercase text-gold">Explorar</span>
                                    <ChevronRight className="w-4 h-4 text-gold" />
                                </div>
                            </Link>
                            <Link href="/biblioteca" className="royal-card p-10 flex flex-col justify-between gap-8 hover:bg-white/[0.02] transition-all">
                                <h3 className="text-2xl font-serif italic text-white/80">Revisar tus obras selladas</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] tracking-widest uppercase text-gold">Archivos</span>
                                    <ChevronRight className="w-4 h-4 text-gold" />
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Stats & Atmosphere */}
                    <div className="space-y-12">
                        <section className="royal-card p-10 space-y-8 border-white/5 bg-white/[0.01]">
                            <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-gold/60">Estado del Oráculo</h3>
                            
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gold/10 rounded-full">
                                            <Zap size={16} className="text-gold" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Esencia Tinta</p>
                                            <p className="text-2xl font-mono font-bold text-white">{userData?.tinta || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-orange-500/10 rounded-full">
                                            <span className="text-lg">🔥</span>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Racha de Fuego</p>
                                            <p className="text-2xl font-mono font-bold text-orange-500">{userData?.streak || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <p className="text-[10px] text-gray-500 italic leading-relaxed">
                                    "La escritura es el único rastro de la eternidad en el tiempo presente."
                                </p>
                            </div>
                        </section>

                        <section className="royal-card p-10 space-y-6 border-white/5 bg-white/[0.01] opacity-60">
                            <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-500">Manual del Aspirante</h3>
                            <ul className="space-y-4 text-xs font-light text-gray-400">
                                <li className="flex gap-3">
                                    <span className="text-gold">I.</span>
                                    <span>Solo se permiten palabras humanas.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-gold">II.</span>
                                    <span>El tiempo no se detiene por nadie.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-gold">III.</span>
                                    <span>Una vez sellado, el manuscrito es eterno.</span>
                                </li>
                            </ul>
                            <Link href="/manual" className="block pt-4 text-[9px] tracking-widest uppercase text-gold hover:text-white transition-colors">Expandir conocimiento →</Link>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
