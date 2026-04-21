"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useUser } from '../../components/UserContext';

export default function LaurelButton({ entradaId, totalVotos, onVote }) {
  const { isGuest, userData } = useUser();
  const [loading, setLoading] = useState(false);
  const [showLaurel, setShowLaurel] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  const calculateMatchScore = () => {
    const rand = Math.random();
    let score, message, validation;

    if (rand > 0.6) {
        score = Math.floor(Math.random() * (95 - 80 + 1) + 80);
        message = "Tu criterio coincide con el Tribunal";
        validation = "Tu criterio tiene potencial";
    } else if (rand > 0.2) {
        score = Math.floor(Math.random() * (79 - 60 + 1) + 60);
        message = "Tu decisión estuvo cerca del criterio del Tribunal";
        validation = "Tu forma de juzgar es interesante";
    } else {
        score = Math.floor(Math.random() * (59 - 30 + 1) + 30);
        message = "Tu criterio difiere del Tribunal";
        validation = "Diferencia sustancial con el Tribunal";
    }

    return { score, message, validation };
  };

  const handleVote = async () => {
    if (loading || isAnalyzing) return;
    setLoading(true);

    // V10: LÓGICA DRAMA + ESPECTADOR
    if (isGuest) {
        setIsAnalyzing(true);
        try {
            // Notificar interacción
            await fetch("/api/guest/status", {
                method: "POST",
                body: JSON.stringify({ action: "arena_vote" }),
                headers: { "Content-Type": "application/json" }
            });

            // Drama Delay (800-1200ms)
            const delay = Math.floor(Math.random() * (1200 - 800 + 1) + 800);
            await new Promise(resolve => setTimeout(resolve, delay));

            const result = calculateMatchScore();
            setMatchResult(result);
            setIsAnalyzing(false);
            setShowLaurel(true);
            
            // Sync user state immediately after interaction
            useUser().refreshUser?.();

            // Auto-cerrar después de 5s para dar tiempo a leer
            setTimeout(() => {
                setShowLaurel(false);
                setMatchResult(null);
            }, 5000);
            
        } catch (e) {
            console.error("⚠️ Error en drama:", e);
            setIsAnalyzing(false);
        } finally {
            setLoading(false);
        }
        return;
    }

    // VOTO REAL (LOGGED USERS)
    try {
      const res = await fetch("/api/galeria/votar", {
        method: "POST",
        body: JSON.stringify({ entradaId }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setShowLaurel(true);
        setTimeout(() => setShowLaurel(false), 2000);
        onVote?.();
      } else {
        const error = await res.json();
        alert(error.error || "Algo salió mal");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 relative">
      {/* Match Result Overlay (V10 Drama) */}
      <AnimatePresence mode="wait">
        {isAnalyzing && (
            <motion.div 
                key="analyzing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: -40 }}
                exit={{ opacity: 0 }}
                className="absolute z-[110] bg-gold/10 backdrop-blur-xl border border-gold/20 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.1)]"
            >
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-gold rounded-full animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
                    <span className="text-[10px] text-gold font-sans tracking-[0.3em] uppercase whitespace-nowrap animate-shimmer">El Tribunal está evaluando tu decisión...</span>
                </div>
            </motion.div>
        )}

        {matchResult && (
            <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: -120, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="absolute z-[110] w-64 bg-black/95 border border-gold/40 p-8 rounded-sm backdrop-blur-2xl shadow-[0_0_60px_rgba(212,175,55,0.3)] text-center overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent"></div>
                
                <div className="relative">
                    <div className="text-gold font-serif italic text-5xl mb-3 tracking-tighter drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">{matchResult.score}%</div>
                    <div className="text-gold/40 text-[8px] uppercase tracking-[0.4em] font-black mb-6">Coincidencia con el Tribunal</div>
                </div>
                
                <div className="space-y-4 relative">
                    <div className="text-white text-[11px] leading-relaxed uppercase tracking-wider font-light italic">
                        "{matchResult.message}"
                    </div>
                    <div className="h-[1px] w-8 bg-gold/20 mx-auto"></div>
                    <div className="space-y-2">
                        <div className="text-gold text-[9px] uppercase tracking-[0.3em] font-black">
                            {matchResult.validation}
                        </div>
                        {Math.random() > 0.8 && (
                            <div className="text-[8px] text-white/40 uppercase tracking-widest font-serif italic">
                                "Pocos usuarios coinciden con el Tribunal en este nivel"
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={handleVote}
        disabled={loading}
        className="relative p-6 border border-gold/20 bg-gold/5 rounded-full hover:bg-gold/10 transition-all hover:scale-110 disabled:opacity-50 group"
      >
        <span className="text-2xl group-hover:rotate-12 transition-transform block">🌿</span>
        <AnimatePresence>
          {showLaurel && !matchResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
                animate={{ opacity: 1, scale: 1.5, y: -40 }}
                exit={{ opacity: 0, scale: 2, y: -60 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 flex items-center justify-center text-4xl text-gold"
            >
                👑
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <div className="text-center">
         <p className="text-[10px] tracking-widest text-[#888] uppercase">{isGuest ? "Probar Voto" : "Ofrecer Laurel"}</p>
         <p className="text-xs font-serif italic text-gold">{totalVotos} Reconocimientos</p>
      </div>
    </div>
  );
}
