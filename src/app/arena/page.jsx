"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/components/UserContext";
import LaurelButton from "@/components/market/LaurelButton";
import { Users, Sword, Trophy, Sparkles } from "lucide-react";

export default function ArenaPage() {
    const { isGuest, userData } = useUser();
    
    // Simulación de actividad (V10)
    const [votingCount, setVotingCount] = useState(8);
    const [leadVotes, setLeadVotes] = useState(2);
    const [duelActive, setDuelActive] = useState(true);
    const [showExitToast, setShowExitToast] = useState(false);

    // Ciclo de Simulación (8-15s)
    useEffect(() => {
        const interval = setInterval(() => {
            setVotingCount(Math.floor(Math.random() * (12 - 6 + 1) + 6));
            setLeadVotes(Math.floor(Math.random() * (4 - 1 + 1) + 1));
            setDuelActive(Math.random() > 0.3);
        }, 12000);

        // Exit Intent (Soft Toast)
        const handleBlur = () => {
            setShowExitToast(true);
            setTimeout(() => setShowExitToast(false), 3000);
        };
        window.addEventListener("blur", handleBlur);

        return () => {
            clearInterval(interval);
            window.removeEventListener("blur", handleBlur);
        };
    }, []);

    // Placeholder data para el Arena (En prod esto vendría de API)
    const currentEntry = {
        id: "mock-arena-1",
        participante: "Cuentista Anónimo",
        texto: "Las sombras no son el final del camino, sino el principio de la verdadera visión. Aquel que teme a la oscuridad nunca podrá ver el brillo real de la luna sobre el mar de plata...",
        totalVotos: 142
    };

    return (
        <main className="min-h-screen bg-[#050508] text-white font-serif relative overflow-hidden flex flex-col items-center py-24 px-6">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(212,175,55,0.08),transparent_70%)] pointer-events-none"></div>

            {/* EXIT INTENT TOAST (SOFT) */}
            <AnimatePresence>
                {showExitToast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 20 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 z-[200] bg-gold/20 backdrop-blur-xl border border-gold/40 px-8 py-3 rounded-full flex items-center gap-4 shadow-[0_0_30px_rgba(212,175,55,0.1)]"
                    >
                        <Sword className="w-4 h-4 text-gold animate-pulse" />
                        <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-black">El duelo sigue activo… tu decisión puede cambiar el resultado</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-4xl w-full space-y-16 relative z-10">
                {/* Real-time Indicators (V10 Social Pressure) */}
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
                    <div className="flex items-center gap-3 group">
                        <Users className="w-3.5 h-3.5 text-gold animate-pulse" />
                        <span className="text-[10px] tracking-[0.3em] uppercase text-white/40 group-hover:text-gold transition-colors">🔥 {votingCount} personas juzgando ahora</span>
                    </div>

                    {duelActive && (
                        <div className="flex items-center gap-3 group">
                            <Sword className="w-3.5 h-3.5 text-gold rotate-45" />
                            <span className="text-[10px] tracking-[0.3em] uppercase text-white/40 group-hover:text-gold transition-colors">⚔️ Duelo activo</span>
                        </div>
                    )}

                    <div className="flex items-center gap-3 group">
                        <Trophy className="w-3.5 h-3.5 text-gold" />
                        <span className="text-[10px] tracking-[0.3em] uppercase text-white/40 group-hover:text-gold transition-colors">🏆 Lidera por +{leadVotes} votos</span>
                    </div>
                </div>

                {/* Main Arena Content */}
                <div className="space-y-12 animate-elegant">
                    <header className="text-center space-y-4">
                        <p className="text-[9px] tracking-[0.6em] uppercase text-gold/60 font-sans">Mandato del Tribunal</p>
                        <h1 className="text-6xl font-light tracking-tighter uppercase italic">La Arena</h1>
                    </header>

                    <div className="royal-card p-12 md:p-20 space-y-12 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
                        
                        <div className="space-y-4">
                            <p className="text-[10px] tracking-[0.4em] uppercase text-gold/40">{currentEntry.participante}</p>
                            <div className="text-3xl md:text-4xl text-white/90 leading-relaxed italic first-letter:text-7xl first-letter:float-left first-letter:mr-4 font-serif">
                                "{currentEntry.texto}"
                            </div>
                        </div>

                        <div className="flex justify-center pt-8 border-t border-white/5">
                            <LaurelButton 
                                entradaId={currentEntry.id} 
                                totalVotos={currentEntry.totalVotos} 
                            />
                        </div>
                    </div>

                    {/* Micro-Conversion Hooks (V10 Polished) */}
                    <div className="text-center py-8">
                        <div className="inline-flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity">
                            <div className="h-px w-12 bg-white/10"></div>
                            <div className="space-y-2">
                                <p className="text-[10px] tracking-[0.3em] uppercase italic text-gray-500">
                                    {isGuest 
                                        ? `Tu precisión actual estimada: ${Math.floor(Math.random() * (85 - 60 + 1) + 60)}%` 
                                        : "Tu juicio es vital para el equilibrio del Tribunal"}
                                </p>
                                <p className="text-[8px] tracking-[0.2em] uppercase text-gold font-black">
                                    "Tu estilo de juicio se está definiendo"
                                </p>
                            </div>
                            <Sparkles className="w-4 h-4 text-gold/40" />
                        </div>
                    </div>
                </div>
            </div>
            
            <footer className="mt-auto py-12 text-center opacity-10">
                 <p className="text-[8px] tracking-[0.8em] font-cinzel text-white uppercase">Cuentistas — Arena Literaria</p>
            </footer>
        </main>
    );
}
