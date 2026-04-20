"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GoldenTicket({ number, visible, onComplete }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-12 bg-black/90 backdrop-blur-3xl">
      <motion.div 
        initial={{ scale: 0, rotate: -45, y: 500 }}
        animate={{ scale: 1, rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative group"
      >
        {/* Glow Aura */}
        <div className="absolute inset-0 bg-gold blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
        
        {/* The Ticket */}
        <div className="w-[320px] md:w-[480px] h-[550px] bg-gradient-to-br from-black via-gold/40 to-black border-2 border-gold/50 rounded-2xl p-1 shadow-[0_0_50px_rgba(212,175,55,0.3)] relative overflow-hidden">
          
          <div className="h-full w-full bg-black/90 rounded-2xl p-12 flex flex-col justify-between items-center text-center relative">
             {/* Scanlines internal */}
             <div className="absolute inset-0 pointer-events-none z-10 opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
             
             <header className="space-y-4">
                <span className="text-5xl">🖋️</span>
                <p className="text-[10px] tracking-[0.5em] uppercase text-gold font-bold">Cónclave de Fundadores</p>
             </header>

             <div className="space-y-4">
                <h2 className="text-4xl font-serif italic text-white tracking-widest">Pase de Acceso</h2>
                <div className="text-7xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gold to-gold/40 pb-2">
                    #{String(number).padStart(3, '0')}
                </div>
                <p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase italic">Identidad Reservada</p>
             </div>

             <div className="space-y-8 w-full">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
                <p className="text-[9px] text-gray-500 uppercase leading-relaxed tracking-widest">Este sello otorga el derecho inalienable de participar en el Gran Duelo de Inauguración.</p>
                
                <button 
                  onClick={onComplete}
                  className="royal-button w-full py-4 bg-gold text-black font-black text-[10px] tracking-[0.3em] uppercase hover:bg-amber-400"
                >
                  Confirmar Legado
                </button>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
