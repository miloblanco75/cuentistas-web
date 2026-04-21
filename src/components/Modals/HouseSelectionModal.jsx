"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sparkles, Brain, Zap } from "lucide-react";
import { useUser } from "../UserContext";
import { safeFetch } from "@/lib/api";

const HOUSES = [
    {
        id: "LECHUZA",
        name: "Casa Lechuza",
        alias: "Sabiduría",
        icon: <Brain className="w-8 h-8" />,
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        border: "border-amber-400/40",
        description: "Para aquellos que analizan cada rastro de tinta con frialdad y lógica."
    },
    {
        id: "LOBO",
        name: "Casa Lobo",
        alias: "Instinto",
        icon: <Shield className="w-8 h-8" />,
        color: "text-gray-300",
        bg: "bg-gray-300/10",
        border: "border-gray-300/40",
        description: "Para quienes sienten el pulso del relato y responden con pasión primaria."
    },
    {
        id: "QUIMERA",
        name: "Casa Quimera",
        alias: "Creatividad",
        icon: <Sparkles className="w-8 h-8" />,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
        border: "border-rose-500/40",
        description: "Para los visionarios que buscan lo imposible entre las líneas."
    }
];

export default function HouseSelectionModal() {
    const { userData, setUserData, refreshUser } = useUser();
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);

    // Solo se muestra si el usuario está autenticado y no tiene casa
    const showModal = userData && userData.rol !== 'GUEST' && !userData.casa;

    if (!showModal) return null;

    const handleJoin = async (houseId) => {
        setLoading(true);
        try {
            const res = await safeFetch("/api/user", {
                method: "POST",
                body: JSON.stringify({ 
                    action: "joinHouse", 
                    casa: houseId 
                })
            });
            if (res.ok) {
                setUserData(res.user);
                // V10: Mensaje de Responsabilidad
                const houseName = HOUSES.find(h => h.id === houseId)?.name;
                alert(`Desde ahora, tus decisiones afectan el destino de tu ${houseName}`);
            }
        } catch (err) {
            console.error("❌ Error al unirse a casa:", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[300] bg-black/98 backdrop-blur-2xl flex items-center justify-center p-6 overflow-y-auto"
            >
                <div className="max-w-4xl w-full space-y-16 py-20 px-4">
                    <header className="text-center space-y-6">
                        <motion.h2 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-[10px] tracking-[0.6em] uppercase text-gold font-black"
                        >
                            Identidad del Juez
                        </motion.h2>
                        <motion.h3 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-serif italic text-white"
                        >
                            Todo buen juez pertenece a una Casa.<br/><span className="text-white/40">Elige la tuya.</span>
                        </motion.h3>
                    </header>

                    <div className="grid md:grid-cols-3 gap-8">
                        {HOUSES.map((house, idx) => (
                            <motion.div
                                key={house.id}
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 + (idx * 0.1) }}
                                whileHover={{ y: -10 }}
                                onClick={() => setSelected(house.id)}
                                className={`relative p-8 md:p-12 royal-card cursor-pointer transition-all duration-500 overflow-hidden text-center group ${selected === house.id ? `${house.border} ${house.bg}` : 'border-white/5 bg-white/[0.01]'}`}
                            >
                                <div className={`mb-8 flex justify-center transition-all duration-500 ${selected === house.id ? 'scale-125' : 'group-hover:scale-110 opacity-40 group-hover:opacity-100'} ${house.color}`}>
                                    {house.icon}
                                </div>
                                <h4 className={`text-2xl font-serif mb-2 transition-colors ${selected === house.id ? 'text-white' : 'text-white/60'}`}>{house.name}</h4>
                                <p className={`text-[9px] tracking-[0.4em] uppercase mb-8 font-black ${house.color}`}>{house.alias}</p>
                                <p className="text-xs text-white/40 leading-relaxed italic mb-10 h-16">{house.description}</p>
                                
                                <div className={`h-[1px] w-8 mx-auto transition-all duration-700 ${selected === house.id ? 'bg-gold w-32' : 'bg-white/10 group-hover:bg-white/30'}`}></div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex justify-center pt-8">
                        <button 
                            disabled={!selected || loading}
                            onClick={() => handleJoin(selected)}
                            className={`royal-button px-24 py-6 text-base flex items-center gap-4 transition-all ${!selected ? 'opacity-20 grayscale cursor-not-allowed' : ''}`}
                        >
                            {loading ? "Iniciando Rito..." : (
                                <>
                                    <Zap className="w-5 h-5 fill-black" />
                                    Vincular mi Alma
                                </>
                            )}
                        </button>
                    </div>

                    <footer className="text-center opacity-20">
                        <div className="h-px w-12 bg-white/40 mx-auto mb-4"></div>
                        <p className="text-[9px] tracking-[0.4em] uppercase text-white font-black">Esta decisión es irrevocable en los anales del tribunal</p>
                    </footer>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
