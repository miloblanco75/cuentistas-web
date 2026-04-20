"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const manifestoLines = [
  "En este Santuario, la palabra es ley y el tiempo es el único juez.",
  "No escribo para llenar páginas, sino para despertar mundos.",
  "Juro ante el Cónclave que cada gota de mi Tinta será auténtica,",
  "que mi pulso no temblará ante el cronómetro y que mi Legado será eterno.",
  "Soy Cuentista.",
  "Mi historia comienza ahora."
];

const houseThemes = {
  lechuza: {
    header: "Por la mirada que todo lo ve, juro técnica y verdad.",
    color: "#b8860b",
    secondary: "#8b5cf6",
    particles: ["#b8860b", "#d4af37", "#fef3c7"]
  },
  lobo: {
    header: "Por el aullido en la tormenta, juro fuego y rapidez.",
    color: "#ff4444",
    secondary: "#d4af37",
    particles: ["#ff4444", "#d4af37", "#fca5a5"]
  },
  quimera: {
    header: "Por el sueño que desafía la lógica, juro lo imposible.",
    color: "#8b5cf6",
    secondary: "#d4af37",
    particles: ["#8b5cf6", "#d4af37", "#c4b5fd"]
  }
};

export default function ManifestoOverlay({ casa, onSigned }) {
  const [step, setStep] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const theme = houseThemes[casa?.toLowerCase()] || houseThemes.lechuza;

  useEffect(() => {
    // Lock scroll
    document.body.style.overflow = 'hidden';
    
    const timers = [];
    // Sequential revelation
    manifestoLines.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setStep(i + 1);
        if (i === manifestoLines.length - 1) {
          setTimeout(() => setShowButton(true), 1000);
        }
      }, (i + 1) * 2000));
    });

    return () => {
      document.body.style.overflow = 'unset';
      timers.forEach(clearTimeout);
    };
  }, []);

  const handleSeal = async () => {
    // Ritual effects
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: theme.particles
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: theme.particles
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // API call
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        body: JSON.stringify({ action: "signOath" }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setTimeout(onSigned, 2000); // Transition after effects
      }
    } catch (e) {
      console.error("Oath failure:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
      {/* Deep Glassmorphism Background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-[#050508]/90 backdrop-blur-[40px]"
      />

      <div className="relative max-w-3xl w-full space-y-12 text-center">
        {/* Dynamic Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="space-y-4"
        >
          <p className="text-[10px] tracking-[0.8em] uppercase text-gold font-bold opacity-60">— El Gran Juramento —</p>
          <h2 className="text-3xl md:text-5xl font-cinzel italic text-white leading-tight">
             {theme.header}
          </h2>
          <div className="w-24 h-px bg-gold/30 mx-auto mt-6"></div>
        </motion.div>

        {/* Body Text (Sequential Revelation) */}
        <div className="space-y-6 font-crimson text-lg md:text-xl text-[#e0d7c6]/80 italic leading-relaxed">
          {manifestoLines.map((line, idx) => (
            <AnimatePresence key={idx}>
              {step > idx && (
                <motion.p
                  initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                >
                  {line}
                </motion.p>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* Action Button */}
        <div className="h-24 flex items-center justify-center">
          <AnimatePresence>
            {showButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${theme.color}44` }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSeal}
                className="royal-button px-12 py-4 relative group"
                style={{ borderColor: theme.color, color: theme.color }}
              >
                <span className="relative z-10">Sellar Juramento</span>
                <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Decorative Aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20"
          style={{ background: `radial-gradient(circle, ${theme.color} 0%, transparent 70%)` }}
        />
      </div>
    </div>
  );
}
