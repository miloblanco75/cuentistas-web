"use client";

import React from 'react';
import { motion } from 'framer-motion';
import AshParticles from '../market/AshParticles';
import { CASAS } from '@/lib/constants';

export default function JudgeProfile({ autor, t }) {
  const { judgeStats } = autor;
  const casaData = CASAS.find(c => c.id === autor.casa) || CASAS[0];

  const title = autor.rol === "ARCHITECT" ? "Arquitecto del Cónclave" : `Gran Custodio de la ${judgeStats.especialidad}`;

  return (
    <div className="obsidian-throne rounded-lg p-12 md:p-24 space-y-24 border border-gold/20 shadow-2xl relative">
      <AshParticles />

      {/* Header de Autoridad */}
      <header className="relative z-10 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-12">
          <div className="text-center md:text-left space-y-4">
             <div className="flex items-center gap-4 justify-center md:justify-start mb-4">
                <span className="w-12 h-px bg-gold/50"></span>
                <p className="text-[10px] tracking-[0.5em] uppercase text-gold font-bold">Residencia del Juicio</p>
             </div>
             <h1 className="text-6xl md:text-9xl font-serif italic title-obsidian">{autor.nombre}</h1>
             <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="px-3 py-1 bg-gold/20 border border-gold/40 rounded-full text-[8px] tracking-[0.2em] text-gold uppercase font-bold">
                    Voz de Mando
                </div>
                <p className="text-xs tracking-[0.4em] text-gold/60 uppercase font-cinzel">
                    {title}
                </p>
             </div>
          </div>

          <div className="relative group">
             {/* Avatar Glow Pulse */}
             <div className="absolute inset-0 border-glow-pulse rounded-full opacity-60"></div>
             <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-2 border-gold/30 p-2 bg-black relative z-10 overflow-hidden">
                <div className="text-8xl flex items-center justify-center h-full opacity-40 group-hover:opacity-80 transition-opacity">
                    {casaData.logo}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-gold/10 to-transparent"></div>
             </div>
          </div>
        </div>
      </header>

      {/* Métricas: La Balanza (The Scales) */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
         <div className="royal-card p-12 bg-white/[0.02] border-gold/10 space-y-4">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500">Sentencias Emitidas</p>
            <div className="flex items-end gap-4">
                <span className="text-5xl font-serif italic text-white">{judgeStats.sentenciasCount}</span>
                <span className="text-[10px] text-gold/40 mb-2 uppercase tracking-widest">Dictámenes</span>
            </div>
         </div>

         <div className="royal-card p-12 bg-white/[0.02] border-gold/10 space-y-6 md:col-span-2 lg:col-span-1">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500">Índice de Rigor</p>
            <div className="space-y-4">
                <div className="flex justify-between text-[9px] tracking-widest text-gold/60 uppercase">
                    <span>Benevolente</span>
                    <span>Implacable</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full border border-gold/10 relative overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(judgeStats.rigorIndex / 10) * 100}%` }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="absolute h-full bg-gradient-to-r from-gold/20 via-gold/60 to-red-500 shadow-[0_0_10px_#d4af37]"
                    />
                </div>
                <p className="text-center text-xs italic text-white/40">{judgeStats.rigorIndex} / 10 Precision</p>
            </div>
         </div>

         <div className="royal-card p-12 bg-gold/5 border-gold/20 space-y-4">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold">El Mazo de Oro</p>
            <div className="space-y-3">
                {judgeStats.cuentosCoronados?.slice(0, 3).map((c, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-gold/10 pb-2">
                        <span className="text-xs italic text-gray-300 line-clamp-1">{c.titulo}</span>
                        <span className="text-[9px] text-gold">⭐ {c.puntos}</span>
                    </div>
                ))}
                {judgeStats.cuentosCoronados?.length === 0 && <p className="text-[11px] text-gray-600 italic">No se han coronado cuentos aún.</p>}
            </div>
         </div>
      </section>

      {/* Crítica Magistral & Solicitud */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-gold/10">
         <div className="space-y-8">
            <h3 className="text-2xl font-serif italic text-white/90 tracking-widest">Crítica Magistral</h3>
            <div className="space-y-6">
                <blockquote className="border-l-2 border-gold/40 pl-6 space-y-4">
                    <p className="text-lg text-gray-400 italic">"La prosa de este autor no solo describe el vacío, lo habita. Un ejercicio magistral de economía narrativa."</p>
                    <cite className="text-[9px] tracking-widest uppercase text-gold opacity-60">— Destacado en La Gran Galería</cite>
                </blockquote>
            </div>
         </div>

         <div className="flex flex-col justify-center items-center md:items-end">
            <div className="royal-card p-12 bg-gold/10 border-gold/30 text-center space-y-6 max-w-sm">
                <header className="space-y-2">
                    <h4 className="text-xl font-serif italic text-gold">Solicitar Juicio</h4>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Prioridad Crítica</p>
                </header>
                <p className="text-xs text-gray-400 leading-relaxed">Gasta 120 gotas de Tinta para que este Custodio revise tu obra con máxima prioridad.</p>
                <button className="royal-button w-full py-4 text-[10px] tracking-widest uppercase bg-gold text-black font-bold hover:bg-amber-400">Pagar Tributo (120 Tinta)</button>
            </div>
         </div>
      </section>
    </div>
  );
}
