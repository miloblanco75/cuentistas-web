"use client";

import { motion } from "framer-motion";

export default function OnboardingTransitions({ phase }) {
    return (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center space-y-8">
            <div className="relative">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-24 h-24 border-t-2 border-gold rounded-full"
                ></motion.div>
                <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <span className="text-3xl">🖋️</span>
                </motion.div>
            </div>
            
            <div className="space-y-2 text-center">
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-gold text-xs tracking-[0.5em] uppercase font-black animate-pulse"
                >
                    {phase === 'connecting' ? 'Conectando con el torneo...' : 'Preparando tu duelo...'}
                </motion.p>
                <p className="text-white/20 text-[8px] tracking-[0.3em] uppercase">Sincronizando pulso humano</p>
            </div>
        </div>
    );
}
