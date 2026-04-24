"use client";

import { useState, useEffect } from "react";
import { Trophy, Skull, RotateCcw, ShieldAlert, Zap, TrendingUp } from "lucide-react";
import { COMBAT_FLAGS } from "@/lib/flags";

/**
 * 🏛️ RESULT SCREEN - ARENA AFTERMATH (PHASE 16)
 * Diseño emocional post-combate para forzar la revancha y retención.
 */
export default function ResultScreen({ result, winner, rival, stats }) {
    const isWinner = result === "WIN";
    const isClose = stats?.difference < 5; // Caso casi-ganador
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    if (!COMBAT_FLAGS.aftermath_enabled) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-[#050508] flex items-center justify-center p-6 md:p-12 animate-elegant overflow-y-auto">
            {/* Fondo de Gloria / Humillación */}
            <div className={`absolute inset-0 opacity-20 pointer-events-none ${isWinner ? 'bg-[radial-gradient(circle_at_center,_#d4af37,_transparent_70%)]' : 'bg-[radial-gradient(circle_at_center,_#450a0a,_transparent_70%)]'}`}></div>

            <main className="max-w-4xl w-full relative z-10 space-y-12 text-center">
                
                {/* 1. EL VEREDICTO */}
                <header className="space-y-6">
                    <div className="flex justify-center">
                        {isWinner ? (
                            <div className="w-24 h-24 bg-gold rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.5)] animate-pulse">
                                <Trophy size={48} className="text-black" />
                            </div>
                        ) : (
                            <div className="w-24 h-24 bg-rose-950 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(159,18,18,0.3)]">
                                <Skull size={48} className="text-rose-500" />
                            </div>
                        )}
                    </div>
                    <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter title-gradient">
                        {isWinner ? "DOMINASTE EL TRIBUNAL" : (isClose ? "ESTUVISTE CERCA" : "FUISTE SUPERADO")}
                    </h1>
                    <p className="text-[10px] tracking-[0.6em] uppercase text-gold/40 font-black">
                        {isWinner ? "Tu nombre queda grabado en los anales" : "Tu honor ha sido puesto a prueba"}
                    </p>
                </header>

                {/* 2. EL RETADOR (PSICOLOGÍA DE REVANCHA) */}
                {!isWinner && rival && (
                    <section className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-4 animate-shake">
                        <p className="text-[9px] tracking-widest uppercase text-white/40">Derrotado por:</p>
                        <div className="flex items-center justify-center gap-6">
                             <div className="w-16 h-16 rounded-full bg-white/10 overflow-hidden border-2 border-rose-500/30">
                                <img src={rival.image || "/avatar-placeholder.png"} alt="Rival" className="w-full h-full object-cover" />
                             </div>
                             <div className="text-left">
                                <h3 className="text-2xl font-cinzel text-white">{rival.username}</h3>
                                <p className="text-xs text-rose-400 font-bold tracking-widest uppercase">Tu Némesis 💀</p>
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
