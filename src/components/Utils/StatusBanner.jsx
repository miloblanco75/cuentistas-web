"use client";

import React from 'react';
import { useUser } from '@/components/UserContext';
import { AlertTriangle, Hammer, WifiOff } from 'lucide-react';

/**
 * StatusBanner: Muestra alertas globales basadas en el estado de conexión del UserContext.
 */
export default function StatusBanner() {
    const { connectionStatus } = useUser();

    if (connectionStatus === "stable") return null;

    const statusConfig = {
        unstable: {
            icon: <WifiOff className="w-5 h-5" />,
            text: "Señal débil detectada. Algunos datos podrían tardar en aparecer.",
            bgColor: "bg-amber-950/80",
            borderColor: "border-amber-500/30",
            textColor: "text-amber-400"
        },
        critical: {
            icon: <AlertTriangle className="w-5 h-5 animate-pulse" />,
            text: "Dificultad de conexión con la Ciudadela. Reintentando...",
            bgColor: "bg-red-950/80",
            borderColor: "border-red-500/30",
            textColor: "text-red-400"
        },
        maintenance: {
            icon: <Hammer className="w-5 h-5 animate-bounce" />,
            text: "Ciudadela en Mantenimiento Crítico. Por favor, intenta más tarde.",
            bgColor: "bg-slate-900",
            borderColor: "border-indigo-500/50",
            textColor: "text-indigo-300"
        }
    };

    const config = statusConfig[connectionStatus] || statusConfig.unstable;

    return (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-4 px-6 py-4 rounded-lg border backdrop-blur-md shadow-2xl transition-all duration-500 animate-in slide-in-from-bottom ${config.bgColor} ${config.borderColor} ${config.textColor}`}>
            {config.icon}
            <span className="text-sm font-cinzel font-bold tracking-widest uppercase">
                {config.text}
            </span>
        </div>
    );
}
