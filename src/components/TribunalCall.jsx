"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Droplet } from "lucide-react";

export default function TribunalCall() {
    const [show, setShow] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Ejecutar silenciosamente al montar la app
        const checkReactivation = async () => {
            try {
                const res = await fetch("/api/user/reactivate", {
                    method: "POST"
                });
                if (res.ok) {
                    const result = await res.json();
                    if (result.ok && result.reactivated) {
                        setData(result);
                        setShow(true);
                    }
                }
            } catch (e) {
                // Falla silenciosamente, no molestar al usuario si hay error de red
                console.error("TribunalCall Error:", e);
            }
        };

        // Pequeño delay para no bloquear el renderizado inicial y dar un susto calculado
        const timer = setTimeout(() => {
            checkReactivation();
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    if (!show || !data) return null;

    const handleAccept = () => {
        setLoading(true);
        // Pequeña animación solemne antes de cerrar
        setTimeout(() => {
            setShow(false);
            router.refresh(); // Refresca para que el UI (Tinta, etc) se actualice globalmente
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in">
            {/* Efecto de Viñeta Oscura */}
            <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 150px rgba(0,0,0,0.9)' }}></div>
            
            <div className="relative z-10 max-w-2xl mx-auto p-12 text-center space-y-12 animate-slide-up">
                
                {/* Símbolo del Tribunal */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full animate-pulse-slow"></div>
                        <ShieldAlert size={80} className="text-gold relative z-10 opacity-80" strokeWidth={1} />
                    </div>
                </div>

                {/* Título Solemne */}
                <div className="space-y-4">
                    <p className="text-[10px] tracking-[0.8em] uppercase text-red-500 font-black animate-pulse">
                        — Citación Oficial —
                    </p>
                    <h2 className="text-5xl md:text-7xl font-serif italic text-white/90 tracking-tighter">
                        El Tribunal Llama
                    </h2>
                </div>

                {/* Mensaje Segmentado */}
                <div className="py-8 border-y border-white/10">
                    <p className="text-xl md:text-2xl font-light text-gray-300 leading-relaxed font-serif italic">
                        "{data.mensaje}"
                    </p>
                </div>

                {/* Recompensa */}
                <div className="flex flex-col items-center justify-center gap-4">
                    <p className="text-[9px] tracking-[0.4em] uppercase text-gray-500">
                        Has sido imbuido para tu redención
                    </p>
                    <div className="flex items-center gap-3 px-6 py-3 border border-gold/30 bg-gold/5 rounded-full shadow-[0_0_20px_rgba(217,175,55,0.15)]">
                        <Droplet size={16} className="text-gold" />
                        <span className="text-gold font-bold font-mono text-lg">+{data.recompensa} TINTA</span>
                    </div>
                </div>

                {/* Acción Solemne */}
                <div className="pt-8">
                    <button 
                        onClick={handleAccept}
                        disabled={loading}
                        className={`royal-button px-16 py-5 text-[10px] tracking-[0.4em] uppercase font-bold transition-all duration-1000 ${loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100 hover:bg-gold hover:text-black'}`}
                    >
                        {loading ? 'SELLANDO PACTO...' : 'ACEPTAR LA CONVOCA'}
                    </button>
                </div>
            </div>
        </div>
    );
}
