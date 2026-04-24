"use client";

import { AlertTriangle, Timer, Shield } from "lucide-react";
import Link from "next/link";

/**
 * 🥀 SCARCITY OVERLAY - PRESTIGE DEFENSE (PHASE 18)
 * Genera presión por pérdida de estatus inminente.
 */
export default function ScarcityOverlay({ state, message, daysSinceDefense }) {
    if (state === "ACTIVE") return null;

    const isWarning = state === "WARNING";
    const isDecaying = state === "DECAYING";

    return (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all animate-elegant ${
            isDecaying ? 'bg-rose-950/20 border-rose-500/30' : 'bg-gold/5 border-gold/20'
        }`}>
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDecaying ? 'bg-rose-500 text-black' : 'bg-gold text-black shadow-gold/20'}`}>
                    <AlertTriangle size={20} className={isDecaying ? 'animate-pulse' : ''} />
                </div>
                <div>
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDecaying ? 'text-rose-400' : 'text-gold'}`}>
                        {isDecaying ? "Tu honor se desvanece" : "Defensa de Rango requerida"}
                    </h4>
                    <p className="text-[9px] text-white/40 tracking-wider">
                        {message || `Han pasado ${daysSinceDefense} días desde tu última defensa.`}
                    </p>
                </div>
            </div>

            <Link 
                href="/concursos"
                className={`px-6 py-3 rounded-full text-[8px] font-black tracking-widest uppercase transition-all flex items-center gap-2 ${
                    isDecaying ? 'bg-rose-500 text-black hover:bg-white' : 'bg-gold/10 border border-gold text-gold hover:bg-gold hover:text-black'
                }`}
            >
                <Shield size={12} />
                Defender mi Lugar
            </Link>
        </div>
    );
}
