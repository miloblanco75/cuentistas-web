"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, UserPlus, Zap } from "lucide-react";
import { signIn } from "next-auth/react";
import { useUser } from "../UserContext";
import { useGuest } from "../GuestContext";

export default function SpectatorBlocker() {
    const { isGuest, limitReached, userData } = useUser();
    const { isBlocked: globalBlocked, status } = useGuest();

    const effectivelyBlocked = (status === "unauthenticated" && (globalBlocked || limitReached));

    if (!effectivelyBlocked) return null;

    const reason = globalBlocked 
        ? "Tu tiempo de descubrimiento (5 min) ha concluido." 
        : "Has alcanzado el límite de interacciones gratuitas.";

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6"
            >
                {/* Background Decor */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] animate-pulse"></div>
                </div>

                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="max-w-md w-full bg-[#0a0a0c] border border-gold/20 p-12 text-center space-y-10 relative shadow-[0_0_100px_rgba(212,175,55,0.1)]"
                >
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full border border-gold/10 flex items-center justify-center bg-gold/5 mb-4">
                            <Lock className="w-8 h-8 text-gold" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-[11px] tracking-[0.5em] uppercase text-gold font-black">Umbral del Cónclave</h2>
                        <h3 className="text-3xl font-serif italic text-white/90 leading-tight">
                            {reason}
                        </h3>
                    </div>

                    <p className="text-sm text-white/40 font-serif leading-relaxed italic">
                        "El conocimiento tiene un precio, y la entrada requiere un compromiso. Registra tu firma para reclamar tu lugar en el Tribunal."
                    </p>

                    <div className="space-y-4 pt-6">
                        <button 
                            onClick={() => signIn("google", { callbackUrl: "/hub" })}
                            className="royal-button w-full py-5 flex items-center justify-center gap-4 group"
                        >
                            <Zap className="w-4 h-4 fill-black" />
                            Unirse con Google
                        </button>
                        
                        <div className="flex items-center gap-4 justify-center pt-2">
                            <div className="h-px w-8 bg-white/5"></div>
                            <span className="text-[9px] uppercase tracking-widest text-white/20">O reclama tu legado</span>
                            <div className="h-px w-8 bg-white/5"></div>
                        </div>

                        <a 
                            href="/login"
                            className="block text-[10px] tracking-[0.3em] uppercase text-gold/60 hover:text-gold transition-colors font-bold"
                        >
                            Usar Credenciales del Tribunal
                        </a>
                    </div>

                    {/* Security Footer */}
                    <div className="pt-10 border-t border-white/5 opacity-40">
                        <p className="text-[8px] tracking-[0.2em] uppercase text-gray-500">
                            ID de Sesión: <span className="font-mono">{userData?.guestId?.substring(0, 8)}...</span>
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
