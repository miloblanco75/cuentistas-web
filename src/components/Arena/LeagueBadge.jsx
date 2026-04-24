"use client";

import { Crown, Shield, Gem, Swords, Skull, Award } from "lucide-react";

/**
 * 👑 LEAGUE BADGE - PRESTIGE SYSTEM (PHASE 17)
 * Representación visual del estatus del habitante.
 */
export default function LeagueBadge({ league, size = "md" }) {
    const CONFIG = {
        "Ceniza": { color: "text-gray-500", icon: Skull, shadow: "shadow-gray-900/50" },
        "Bronce": { color: "text-amber-800", icon: Shield, shadow: "shadow-amber-900/50" },
        "Plata": { color: "text-slate-400", icon: Swords, shadow: "shadow-slate-500/50" },
        "Oro": { color: "text-gold", icon: Award, shadow: "shadow-gold/30" },
        "Obsidiana": { color: "text-gray-950", icon: Gem, shadow: "shadow-gray-400/20" },
        "Corona": { color: "text-violet-500", icon: Crown, shadow: "shadow-violet-500/50" },
        "Trono": { color: "text-rose-600", icon: Crown, shadow: "shadow-rose-600/70" }
    };

    const leagueData = CONFIG[league] || CONFIG["Ceniza"];
    const Icon = leagueData.icon;

    const sizes = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-16 h-16"
    };

    return (
        <div className={`relative flex items-center justify-center rounded-full bg-black/40 border border-white/10 ${sizes[size]} ${leagueData.shadow} transition-all duration-700 hover:scale-110`}>
             <Icon className={`${sizes[size]} p-1.5 ${leagueData.color} drop-shadow-[0_0_10px_currentColor]`} />
             {league === "Trono" && (
                <span className="absolute -inset-1 rounded-full border border-rose-500/30 animate-pulse"></span>
             )}
        </div>
    );
}

/**
 * 🔱 CEREMONIA DE ASCENSO 
 */
export function LeagueCeremony({ type, league, onClose }) {
    const isAscension = type === "ASCENDED";

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-8 text-center animate-field-reveal">
             <div className="space-y-8 max-w-lg">
                <div className="flex justify-center animate-bounce-slow">
                    <LeagueBadge league={league} size="lg" />
                </div>
                
                <h2 className={`text-5xl font-serif italic ${isAscension ? 'text-gold' : 'text-rose-500'}`}>
                    {isAscension ? "EL TRIBUNAL TE ACLAMA" : "TU CORONA HA CAÍDO"}
                </h2>
                
                <p className="text-[10px] tracking-[0.5em] uppercase text-white/40 font-black">
                    {isAscension ? `HAS ASCENDIDO A LA LIGA ${league.toUpperCase()}` : `HAS DESCENDIDO A LA LIGA ${league.toUpperCase()}`}
                </p>

                <div className="pt-8">
                    <button 
                        onClick={onClose}
                        className="bg-white/5 border border-white/10 text-[10px] tracking-[0.4em] uppercase text-white hover:bg-white hover:text-black px-12 py-4 rounded-full transition-all"
                    >
                        {isAscension ? "reclamar honor" : "aceptar destino"}
                    </button>
                </div>
             </div>
        </div>
    );
}
