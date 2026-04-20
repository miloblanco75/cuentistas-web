"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LaurelButton({ entradaId, totalVotos, onVote }) {
  const [loading, setLoading] = useState(false);
  const [showLaurel, setShowLaurel] = useState(false);

  const handleVote = async () => {
    setLoading(true);
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
    <div className="flex flex-col items-center gap-4">
      <button 
        onClick={handleVote}
        disabled={loading}
        className="relative p-6 border border-gold/20 bg-gold/5 rounded-full hover:bg-gold/10 transition-all hover:scale-110 disabled:opacity-50"
      >
        <span className="text-2xl">🌿</span>
        <AnimatePresence>
          {showLaurel && (
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
         <p className="text-[10px] tracking-widest text-[#888] uppercase">Ofrecer Laurel</p>
         <p className="text-xs font-serif italic text-gold">{totalVotos} Reconocimientos</p>
      </div>
    </div>
  );
}
