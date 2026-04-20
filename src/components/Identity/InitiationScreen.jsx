"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { CASAS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

export default function InitiationScreen({ onSelect }) {
    const { t } = useLanguage();
    const [selectedId, setSelectedId] = useState(null);
    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = async () => {
        if (!selectedId) return;
        setIsJoining(true);
        try {
            const res = await fetch("/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "joinHouse", casa: selectedId })
            });
            const data = await res.json();
            if (data.ok) {
                onSelect(selectedId);
            }
        } catch (error) {
            console.error("Error al unirse a la casa:", error);
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-elegant">
            <div className="max-w-6xl w-full space-y-16">
                <header className="text-center space-y-4">
                    <h2 className="text-sm tracking-[0.8em] uppercase text-gold/60 font-sans">El Ritual de Iniciación</h2>
                    <h1 className="text-7xl md:text-8xl font-serif italic tracking-tighter">Elige tu Linaje</h1>
                    <div className="h-[1px] w-32 bg-gold mx-auto"></div>
                </header>

                <div className="grid md:grid-cols-3 gap-8">
                    {CASAS.map((casa) => (
                        <motion.button
                            key={casa.id}
                            whileHover={{ y: -10 }}
                            onClick={() => setSelectedId(casa.id)}
                            className={`royal-card p-12 text-left space-y-8 transition-all relative overflow-hidden group ${
                                selectedId === casa.id 
                                ? `border-gold bg-white/[0.05] ${casa.glow}` 
                                : "border-white/5 bg-white/[0.01] hover:border-white/20"
                            }`}
                        >
                            <div className="text-7xl group-hover:scale-110 transition-transform duration-700">{casa.logo}</div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-serif italic tracking-tight" style={{ color: casa.color }}>
                                    {t(`casa_${casa.id}`)}
                                </h3>
                                <p className="text-[10px] tracking-widest uppercase font-bold text-gray-500">
                                    {t(`casa_${casa.id}_lema`)}
                                </p>
                                <p className="text-xs text-gray-400 leading-relaxed font-sans italic">
                                    {t(`casa_${casa.id}_desc`)}
                                </p>
                            </div>

                            {/* Background Aura */}
                            <div className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-[80px] opacity-20 bg-gradient-to-br ${casa.bg} transition-opacity ${selectedId === casa.id ? 'opacity-40' : 'opacity-0'}`}></div>
                        </motion.button>
                    ))}
                </div>

                <footer className="flex flex-col items-center gap-8">
                    <AnimatePresence>
                        {selectedId && (
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                onClick={handleJoin}
                                disabled={isJoining}
                                className="royal-button px-24 py-5 text-xl relative group overflow-hidden"
                            >
                                <span className="relative z-10">
                                    {isJoining ? t("processing") : "Prestar Juramento de Sangre"}
                                </span>
                                <div className="absolute inset-0 bg-gold/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            </motion.button>
                        )}
                    </AnimatePresence>
                    <p className="text-[10px] tracking-[0.5em] uppercase text-gray-600">Este juramento es eterno en los anales del Cónclave</p>
                </footer>
            </div>
        </div>
    );
}
