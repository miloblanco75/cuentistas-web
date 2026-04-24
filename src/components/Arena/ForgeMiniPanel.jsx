"use client";

import { useState } from "react";
import { Zap, Shield, EyeOff, Search } from "lucide-react";
import { COMBAT_FLAGS } from "@/lib/flags";

/**
 * 🛠️ FORJA MINI-PANEL (PHASE 15)
 * El disparador de monetización impulsiva dentro del editor.
 */
export default function ForgeMiniPanel({ pressure, inkBalance, onUsePower }) {
    const [isOpen, setIsOpen] = useState(false);
    
    // El disparador de dopamina: Pulsa si la presión es baja
    const isUnderPressure = pressure < 40;

    const POWERS = [
        { id: 'shadow', name: 'Velo de Sombras', icon: EyeOff, cost: 5, desc: 'Difumina tu presión real' },
        { id: 'oracle', name: 'Pulso del Oráculo', icon: Search, cost: 8, desc: 'Ver Presión Real del Top 1' },
        { id: 'shield', name: 'Escudo de Elo', icon: Shield, cost: 10, desc: 'Protección de Prestigio' }
    ];

    if (!COMBAT_FLAGS.ink_powers_enabled) return null;

    return (
        <div className="fixed bottom-10 left-10 z-50">
            {/* Botón Principal con Pulso dinámico */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative ${
                    isUnderPressure ? 'bg-amber-500 animate-pulse scale-110 shadow-amber-500/50' : 'bg-gold/20 backdrop-blur-md border border-gold/30 text-gold hover:bg-gold/40'
                }`}
            >
                <Zap size={24} className={isUnderPressure ? 'text-black' : 'text-gold'} />
                {isUnderPressure && (
                   <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[8px] font-black px-3 py-1 rounded-full whitespace-nowrap animate-bounce">
                      ⚠️ INVOCA PODER
                   </span>
                )}
            </button>

            {/* Menú de Poderes */}
            {isOpen && (
                <div className="absolute bottom-20 left-0 w-64 bg-[#0a0a0f] border border-gold/20 rounded-2xl p-4 shadow-[0_0_40px_rgba(212,175,55,0.1)] animate-elegant">
                    <p className="text-[9px] tracking-widest uppercase text-gold/60 mb-4 px-2">La Forja Táctica ({inkBalance}✒️)</p>
                    <div className="space-y-3">
                        {POWERS.map(p => (
                            <button
                                key={p.id}
                                onClick={() => onUsePower(p)}
                                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-gold/20 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <p.icon size={16} className="text-gold opacity-60 group-hover:opacity-100" />
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold text-white uppercase">{p.name}</p>
                                        <p className="text-[8px] text-white/30">{p.desc}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-gold">{p.cost}✒️</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
