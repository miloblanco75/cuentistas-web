"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CASAS } from "@/lib/constants";
import { useLanguage } from "@/components/LanguageContext";

export default function CompartirPrestigioPage() {
    const [user, setUser] = useState(null);
    const { t } = useLanguage();
    const router = useRouter();

    useEffect(() => {
        fetch("/api/user")
            .then(res => res.json())
            .then(data => setUser(data.user));
    }, []);

    if (!user) return <div className="min-h-screen bg-[#050505] flex items-center justify-center font-serif text-amber-500">{t("loading")}</div>;

    const casaData = CASAS.find(c => c.id === user.casa) || CASAS[0];

    return (
        <main className="min-h-screen bg-[#050508] p-6 md:p-20 flex flex-col items-center justify-center space-y-12 animate-elegant">
            <header className="text-center space-y-4">
                <h1 className="text-4xl font-cinzel text-[#d4af37] tracking-[0.2em] uppercase">{t("share_title")}</h1>
                <p className="text-gray-500 font-serif italic text-sm">"{t("share_subtitle")}"</p>
            </header>

            {/* La Tarjeta de Prestigio */}
            <div id="prestige-card" className="relative w-full max-w-[500px] aspect-[3/4] bg-[#101018] border-2 border-[#d4af37]/30 rounded-lg p-12 overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.1)] group">
                {/* Decoración Arcaica */}
                <div className="absolute top-0 left-0 w-full h-full border-[20px] border-double border-amber-500/5 pointer-events-none"></div>
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-500/40"></div>
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-500/40"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-500/40"></div>
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-500/40"></div>

                <div className="relative z-10 flex flex-col h-full items-center justify-between py-8">
                    <div className="text-center space-y-2">
                        <p className="text-[10px] tracking-[0.5em] text-amber-500 uppercase font-cinzel">Cuentistas Web</p>
                        <div className="h-[1px] w-20 bg-amber-500/20 mx-auto"></div>
                    </div>

                    <div className="space-y-6 text-center">
                        <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase">{t("share_certify")}</p>
                        <h2 className="text-5xl font-serif italic text-white tracking-tighter">{user.nombre}</h2>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-xs text-amber-500 font-cinzel tracking-widest uppercase">{t(`rango_${user.nivel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`)}</span>
                            <span className="text-[9px] text-gray-400 font-serif italic">{t("share_member")} {t(`casa_${casaData.id}`)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 w-full border-t border-b border-amber-500/10 py-8">
                        <div className="text-center">
                            <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">{t("stat_wins")}</p>
                            <p className="text-2xl font-serif text-white">{user.victorias}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">{t("streak_days")}</p>
                            <p className="text-2xl font-serif text-amber-500">🔥 {user.streak}</p>
                        </div>
                    </div>

                    <div className="text-center space-y-4">
                        <p className="text-[9px] text-gray-500 italic max-w-[200px]">"{t("share_motto")}"</p>
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 border border-amber-500/20 rounded-full flex items-center justify-center">
                                <span className="text-amber-500 text-[10px] font-cinzel">C</span>
                            </div>
                            <span className="text-xs font-cinzel tracking-widest text-amber-500/50">MMXXVI</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
                <button 
                    onClick={() => window.print()}
                    className="royal-button px-10 py-4 bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500 text-xs tracking-widest"
                >
                    {t("share_btn_pdf")}
                </button>
                <button 
                    onClick={() => router.back()}
                    className="px-10 py-4 text-gray-500 hover:text-white transition-all text-xs tracking-[0.3em] uppercase"
                >
                    {t("share_btn_back")}
                </button>
            </div>

            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-cinzel max-w-md text-center leading-relaxed">
                {t("share_tip")}
            </p>
        </main>
    );
}
