"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FounderCounter() {
  const [stats, setStats] = useState({ count: 0, remaining: 100, isFull: false });

  useEffect(() => {
    const fetchStats = () => {
      fetch("/api/founders/count")
        .then(res => res.json())
        .then(data => {
            if (data.ok) setStats(data);
        });
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex flex-col items-center gap-2 px-6 py-2 border border-gold/10 bg-gold/5 rounded-full backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 bg-gold rounded-full animate-pulse shadow-[0_0_10px_#d4af37]"></span>
        <p className="text-[9px] md:text-[10px] tracking-[0.3em] uppercase font-cinzel text-gold font-bold">
            {stats.isFull ? "Cónclave de Fundadores Completo" : `Cupos de Fundador restantes: ${stats.remaining}/100`}
        </p>
      </div>
      
      <AnimatePresence>
        {!stats.isFull && stats.remaining <= 10 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[8px] tracking-widest text-red-500 font-bold animate-flicker uppercase"
          >
            Últimos lugares disponibles
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
