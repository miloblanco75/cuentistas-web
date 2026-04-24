"use client";

import { useState, useEffect } from "react";
import { Trophy, Skull, RotateCcw, ShieldAlert, Zap, TrendingUp } from "lucide-react";
import { COMBAT_FLAGS } from "@/lib/flags";

/**
 * 🏛️ RESULT SCREEN - ARENA AFTERMATH (PHASE 16)
 * Diseño emocional post-combate para forzar la revancha y retención.
 */
export default function ResultScreen({ result, winner, rival, stats }) {
    const strategy = stats?.strategy || "STANDARD";
    const scoreVsRival = stats?.scoreVsLastRival || 0;

    const MESSAGES = {
        NEAR_MISS: { title: "ESTUVISTE A UN GOLPE", sub: "Sólo un suspiro te separó de la gloria" },
        CRUSHING: { title: "NECESITAS PREPARARTE", sub: "Tus cimientos han fallado esta vez" },
        NEMESIS_FIGHT: { title: "TU RIVAL VOLVIÓ A IMPONERSE", sub: "Tu honor exige equilibrio" },
        STANDARD: { title: isWinner ? "DOMINASTE EL TRIBUNAL" : "FUISTE SUPERADO", sub: isWinner ? "Tu nombre queda grabado" : "Tu honor ha sido probado" }
    };

    const currentMsg = MESSAGES[strategy] || MESSAGES.STANDARD;

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    if (!COMBAT_FLAGS.aftermath_enabled) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-[#050508] flex items-center justify-center p-6 md:p-12 animate-elegant overflow-y-auto">
            {/* Fondo de Gloria / Humillación / Honor */}
            <div className={`absolute inset-0 opacity-20 pointer-events-none ${
                isWinner && scoreVsRival > 0 ? 'bg-[radial-gradient(circle_at_center,_#06b6d4,_transparent_70%)]' : 
                isWinner ? 'bg-[radial-gradient(circle_at_center,_#d4af37,_transparent_70%)]' : 
                'bg-[radial-gradient(circle_at_center,_#450a0a,_transparent_70%)]'}`}></div>

            <main className="max-w-4xl w-full relative z-10 space-y-12 text-center">
                
                {/* 1. EL VEREDICTO */}
                <header className="space-y-6">
                    <div className="flex justify-center">
                        {isWinner ? (
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl animate-pulse ${scoreVsRival > 0 ? 'bg-cyan-500 shadow-cyan-500/50' : 'bg-gold shadow-gold/50'}`}>
                                <Trophy size={48} className="text-black" />
                            </div>
                        ) : (
                            <div className="w-24 h-24 bg-rose-950 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(159,18,18,0.3)]">
                                <Skull size={48} className="text-rose-500" />
                            </div>
                        )}
                    </div>
                    {isWinner && scoreVsRival > 0 && (
                        <p className="text-cyan-400 font-black tracking-[0.8em] uppercase text-[10px] animate-bounce">👑 HONOR RESTAURADO 👑</p>
                    )}
                    <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter title-gradient">
                        {currentMsg.title}
                    </h1>
                    <p className="text-[10px] tracking-[0.6em] uppercase text-gold/40 font-black">
                        {currentMsg.sub}
                    </p>
                </header>

                {/* 2. EL MARCADOR DE NÉMESIS */}
                {rival && (
                    <section className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-4">
                        <div className="flex items-center justify-center gap-12">
                             <div className="text-center space-y-2">
                                <p className="text-[8px] text-white/20 uppercase tracking-widest">Tú</p>
                                <p className="text-4xl font-serif italic text-white">{scoreVsRival > 0 ? scoreVsRival : 0}</p>
                             </div>
                             <div className="text-gold/20 text-2xl font-cinzel">— Marcador —</div>
                             <div className="text-center space-y-2">
                                <p className="text-[8px] text-white/20 uppercase tracking-widest">{rival.username}</p>
                                <p className="text-4xl font-serif italic text-rose-500">{scoreVsRival < 0 ? Math.abs(scoreVsRival) : 0}</p>
                             </div>
                        </div>
                    </section>
                )}

                {/* 3. MÉTRICAS DE IMPACTO */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-6 bg-black/40 border border-white/5 rounded-2xl">
                        <p className="text-[8px] tracking-widest uppercase text-white/20 mb-2">Prestigio</p>
                        <p className={`text-2xl font-serif italic ${isWinner ? 'text-gold' : 'text-rose-500'}`}>
                            {isWinner ? `+${stats?.eloGain}` : `-${stats?.eloLoss}`} ELO
                        </p>
                    </div>
                    <div className="p-6 bg-black/40 border border-white/5 rounded-2xl">
                        <p className="text-[8px] tracking-widest uppercase text-white/20 mb-2">Racha</p>
                        <div className="flex items-center justify-center gap-2">
                             <span className="text-2xl font-serif italic text-white">{stats?.streak}</span>
                             <TrendingUp size={16} className={isWinner ? 'text-gold' : 'text-rose-500'} />
                        </div>
                    </div>
                    {/* ... más métricas si se requieren ... */}
                </section>

                {/* 4. EL BUCLE DE ACCIÓN (RETENCIÓN) */}
                <footer className="space-y-8 pt-8 border-t border-white/5">
                    <div className="flex flex-col md:flex-row justify-center gap-6">
                        <button className="bg-gold hover:bg-white text-black px-16 py-5 rounded-full text-[10px] font-black tracking-[0.4em] uppercase transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)] flex items-center justify-center gap-4">
                            <RotateCcw size={16} />
                            {isWinner ? "MANTENER DOMINIO" : "RECLAMAR REVANCHA"}
                        </button>
                        
                        {!isWinner && (
                            <button className="bg-rose-900/20 hover:bg-rose-900/40 border border-rose-500/30 text-rose-400 px-12 py-5 rounded-full text-[10px] font-black tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-4">
                                <ShieldAlert size={16} />
                                PROTEGER RANGO (-30% ✒️)
                            </button>
                        )}
                    </div>

                    <p className="text-[9px] text-white/20 tracking-[0.5em] uppercase animate-pulse">
                        Siguiente Combate inicia en {countdown} segundos...
                    </p>
                </header>
            </main>
        </div>
    );
}
