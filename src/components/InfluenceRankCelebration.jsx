"use client";

import { useEffect, useState } from "react";

const RANK_META = {
    "El Invocador":               { icon: "🔮", color: "text-blue-400",   glow: "shadow-[0_0_60px_rgba(59,130,246,0.3)]",    bg: "border-blue-500/40 bg-blue-500/5" },
    "Portador de Nuevas Plumas":  { icon: "🪶", color: "text-purple-400", glow: "shadow-[0_0_60px_rgba(168,85,247,0.3)]",  bg: "border-purple-500/40 bg-purple-500/5" },
    "El Heraldo del Tribunal":    { icon: "⚜️", color: "text-yellow-500", glow: "shadow-[0_0_60px_rgba(234,179,8,0.3)]",   bg: "border-yellow-500/40 bg-yellow-500/5" },
};

// Llama a este componente pasando un `newRank` cuando se desbloquea un título de influencia.
// Se autodestruye tras 6 segundos o al hacer click.
export default function InfluenceRankCelebration({ rank, onDismiss }) {
    const [visible, setVisible] = useState(true);
    const [animating, setAnimating] = useState(true);

    const meta = RANK_META[rank];
    if (!meta || !visible) return null;

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimating(false);
            setTimeout(() => setVisible(false), 500);
        }, 6000);
        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setAnimating(false);
        setTimeout(() => {
            setVisible(false);
            onDismiss?.();
        }, 400);
    };

    return (
        <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] transition-all duration-500 cursor-pointer
                ${animating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            onClick={handleDismiss}
        >
            <div className={`flex items-center gap-5 px-8 py-5 rounded-lg border ${meta.bg} ${meta.glow} backdrop-blur-md`}>
                <span className="text-3xl">{meta.icon}</span>
                <div>
                    <p className="text-[8px] tracking-[0.5em] uppercase text-gray-500 font-sans">El Tribunal ha reconocido tu capacidad de invocación</p>
                    <p className={`text-sm font-black tracking-widest uppercase ${meta.color} mt-1`}>{rank}</p>
                </div>
            </div>
        </div>
    );
}
