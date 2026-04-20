"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function JudgeScorePanel({ entradaId, onSuccess }) {
  const [scores, setScores] = useState({ tecnica: 5, creatividad: 5, impacto: 5 });
  const [mencionHonor, setMencionHonor] = useState(false);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/galeria/juzgar", {
        method: "POST",
        body: JSON.stringify({ entradaId, ...scores, mencionHonor, comentario }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) onSuccess?.();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="royal-card p-12 bg-white/[0.02] border-gold/20 space-y-12">
      <header className="text-center space-y-4">
        <p className="text-[10px] tracking-[0.5em] uppercase text-gold font-bold">Panel del Custodio</p>
        <h3 className="text-3xl font-serif italic text-white/90">Emitir Veredicto</h3>
      </header>

      <div className="grid gap-12">
        {Object.keys(scores).map(key => (
          <div key={key} className="space-y-4">
            <div className="flex justify-between text-[10px] tracking-widest uppercase">
              <span className="text-gray-500">{key}</span>
              <span className="text-gold font-bold">{scores[key]} / 10</span>
            </div>
            <input 
              type="range" min="1" max="10" step="1"
              value={scores[key]}
              onChange={(e) => setScores({...scores, [key]: parseInt(e.target.value)})}
              className="w-full accent-gold bg-white/10 h-1 rounded-full cursor-pointer"
            />
          </div>
        ))}

        <div className="flex items-center gap-6 p-6 border border-gold/10 bg-white/[0.03]">
           <button 
             onClick={() => setMencionHonor(!mencionHonor)}
             className={`w-6 h-6 rounded-sm border-2 border-gold/40 flex items-center justify-center transition-all ${mencionHonor ? 'bg-gold' : ''}`}
           >
             {mencionHonor && <span className="text-black text-xs font-bold font-serif italic">H</span>}
           </button>
           <div className="space-y-1">
             <p className="text-[9px] tracking-widest uppercase text-gold">Mención de Honor</p>
             <p className="text-[9px] text-gray-500 italic">Destaca esta obra por su genialidad excepcional.</p>
           </div>
        </div>

        <textarea 
          placeholder="Escribe tu crítica magistral aquí..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="w-full bg-black/40 border border-gold/10 p-6 text-sm italic font-serif text-white/80 outline-none focus:border-gold/40 h-32"
        />

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="royal-button w-full py-6 text-[10px] tracking-widest uppercase bg-gold text-black font-bold hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? "Registrando Sentencia..." : "Sentenciar Legado"}
        </button>
      </div>
    </div>
  );
}
