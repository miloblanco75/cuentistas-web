"use client";

import { useState, useEffect } from "react";
import { Zap, Flame, Lock, Shield, Eye, TrendingUp, AlertTriangle } from "lucide-react";
import { COMBAT_FLAGS } from "@/lib/flags";

/**
 * 🔱 COMBAT HUD - ARENA CUENTISTAS (PHASE 15)
 * Intervención psicológica en tiempo real para generar presión competitiva.
 */
export default function CombatHUD({ contestId, userId }) {
    const [players, setPlayers] = useState([]);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [phase, setPhase] = useState("normal"); // normal, tension, climax
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (!COMBAT_FLAGS.combat_hud_enabled) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/arena/status?contestId=${contestId}`);
                const data = await res.json();
                if (data.ok) {
                    // TRIADA DE TENSIÓN: Ordenar y filtrar
                    const sorted = [...data.contestants].sort((a,b) => b.pressureScore - a.pressureScore);
                    const top1 = sorted[0];
                    const me = sorted.find(p => p.userId === userId);
                    const myIndex = sorted.findIndex(p => p.userId === userId);
                    const rivalAbove = myIndex > 0 ? sorted[myIndex - 1] : null;

                    // Unificar sin duplicados
                    const triad = Array.from(new Set([top1, me, rivalAbove].filter(Boolean)));
                    setPlayers(triad);
                    
                    checkEvents(data.contestants);
                }
            } catch (e) {
                console.error("Combat HUD Sync Failed...");
            }
        }, phase === "climax" ? 2000 : 4000); // Mínimo 2s

        return () => clearInterval(interval);
    }, [contestId, phase]);

    // Lógica de detección de eventos dinámicos
    const checkEvents = (currentPlayers) => {
        const me = currentPlayers.find(p => p.userId === userId);
        if (!me) return;

        const rivals = currentPlayers.filter(p => p.userId !== userId);
        const overtakers = rivals.filter(r => r.wordCount > me.wordCount && r.status === "Poseído");

        if (overtakers.length > 0) {
            pushEvent(`⚠️ ${overtakers[0].username} te está superando`);
        }
    };

    const pushEvent = (msg) => {
        setEvents(prev => [msg, ...prev].slice(0, 3));
    };

    if (!COMBAT_FLAGS.combat_hud_enabled) return null;

    return (
        <aside className={`fixed right-0 top-0 h-screen bg-black/60 backdrop-blur-xl border-l border-white/5 transition-all duration-700 z-40 ${isCollapsed ? 'w-12' : 'w-80'}`}>
            
            {/* Header / Botón de minimizado */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute left-0 top-1/2 -translate-x-1/2 w-8 h-8 bg-gold rounded-full flex items-center justify-center text-black shadow-2xl z-50 hover:scale-110 transition-transform"
            >
                {isCollapsed ? <Eye size={14} /> : <Lock size={14} />}
            </button>

            {!isCollapsed && (
                <div className="p-6 h-full flex flex-col space-y-8 animate-elegant">
                    <header className="space-y-1">
                        <p className="text-[10px] tracking-[0.5em] uppercase text-gold font-black">Presión del Tribunal</p>
                        <h2 className="text-sm font-serif italic text-white/40">Fase del Relato: {phase.toUpperCase()}</h2>
                    </header>

                    {/* EVENT FEED */}
                    <div className="h-20 space-y-2 overflow-hidden">
                        {events.map((ev, i) => (
                            <div key={i} className="text-[10px] text-rose-400 font-bold tracking-widest animate-pulse border-l border-rose-500 pl-2">
                                {ev}
                            </div>
                        ))}
                    </div>

                    {/* LEADERBOARD DE PRESIÓN */}
                    <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                        {players.map((p, i) => {
                            const isMe = p.userId === userId;
                            const isOvertaking = !isMe && p.pressureScore > 80;

                            return (
                                <div key={p.userId} className={`p-4 rounded-xl border transition-all duration-500 ${isMe ? 'bg-gold/5 border-gold/20' : 'bg-white/5 border-white/5'} ${isOvertaking ? 'animate-pulse border-rose-500/30' : ''}`}>
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="space-y-0.5">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isMe ? 'text-gold' : 'text-white/60'}`}>
                                                {isMe ? "TÚ" : p.username}
                                            </p>
                                            <p className="text-[8px] text-white/20 uppercase tracking-tighter">{p.casa}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {p.status === "Poseído" && <Flame className="w-3 h-3 text-amber-500 animate-fire" />}
                                            <span className={`text-[8px] font-bold uppercase tracking-widest ${p.status === 'Poseído' ? 'text-amber-500' : 'text-gray-600'}`}>
                                                {p.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* BARRA DE PRESIÓN */}
                                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                        <div 
                                            className={`h-full transition-all duration-700 rounded-full ${
                                                p.pressureScore > 80 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' :
                                                p.pressureScore > 50 ? 'bg-amber-500' : 'bg-sky-500'
                                            }`}
                                            style={{ width: `${p.pressureScore}%` }}
                                        ></div>
                                    </div>
                                    
                                    <div className="mt-2 flex justify-between items-center">
                                        <span className="text-[9px] text-white/20">{p.wordCount} Palabras</span>
                                        <span className="text-[9px] text-white/20">ELO: {p.elo}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <footer className="pt-4 border-t border-white/5 text-center">
                        <div className="flex items-center justify-center gap-2 text-[9px] text-white/20 uppercase tracking-widest">
                            <Shield size={10} />
                            <span>Protegido por el Tribunal</span>
                        </div>
                    </footer>
                </div>
            )}

            {/* Banner colapsado */}
            {isCollapsed && (
                <div className="h-full flex items-center justify-center">
                    <p className="rotate-90 whitespace-nowrap text-[8px] text-white/20 font-black tracking-[1em] uppercase">
                        ⚠️ EL TRIBUNAL OBSERVA
                    </p>
                </div>
            )}
        </aside>
    );
}
