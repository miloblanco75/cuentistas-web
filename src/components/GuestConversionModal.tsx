"use client";

import { useGuest } from "./GuestContext";
import { useRouter } from "next/navigation";
import { X, Crown, PenTool, Sparkles } from "lucide-react";

export default function GuestConversionModal() {
    const { showConversionModal, setShowConversionModal } = useGuest();
    const router = useRouter();

    if (!showConversionModal) return null;

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-700">
            {/* BLUR BACKGROUND */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl" onClick={() => setShowConversionModal(false)}></div>

            {/* MODAL CONTENT */}
            <div className="relative w-full max-w-2xl royal-card p-12 md:p-20 overflow-hidden border-gold/40 border-2 bg-black animate-elegant shadow-[0_0_150px_rgba(212,175,55,0.1)]">
                {/* DECORATION */}
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Crown size={200} className="text-gold" />
                </div>

                <button 
                    onClick={() => setShowConversionModal(false)}
                    className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="relative z-10 space-y-12 text-center md:text-left">
                    <div className="space-y-4">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <span className="w-12 h-px bg-gold/50"></span>
                            <span className="text-gold text-[10px] font-black tracking-[0.5em] uppercase">Veredicto del Guardián</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-serif italic text-white leading-tight">
                            Tu criterio está listo para el Tribunal.
                        </h2>
                        <p className="text-gray-400 font-serif italic text-lg max-w-md">
                            Has demostrado un pulso firme y una mente aguda. Este mundo no permite que tales dones vaguen sin propósito.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 pt-6">
                        <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-4 group hover:border-gold/30 transition-all">
                            <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                                <PenTool size={20} />
                            </div>
                            <h4 className="font-bold text-sm tracking-widest uppercase text-white">Reclamar Identidad</h4>
                            <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-tighter">Únete a una de las Casas y comienza tu ascenso en el Tribunal.</p>
                        </div>
                        <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-4 group hover:border-blue-400/30 transition-all">
                            <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-400">
                                <Crown size={20} />
                            </div>
                            <h4 className="font-bold text-sm tracking-widest uppercase text-white">Bóveda de Prestigio</h4>
                            <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-tighter">Accede a la Forja y reclama marcos, medallas y ventajas exclusivas.</p>
                        </div>
                    </div>

                    <div className="pt-10 flex flex-col md:flex-row items-center gap-8">
                        <button 
                            onClick={() => { setShowConversionModal(false); router.push('/registro'); }}
                            className="royal-button w-full md:w-auto px-16 py-6 text-xs font-black shadow-[0_0_50px_rgba(212,175,55,0.2)]"
                        >
                            Unirse a la Ciudadela 🔱
                        </button>
                        <button 
                            onClick={() => setShowConversionModal(false)}
                            className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Seguir como observador
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
