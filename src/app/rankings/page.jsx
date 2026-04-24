"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { Shield, Trophy, Zap, Sparkles, Brain } from "lucide-react";

const CASA_ICONS = {
    'LOBO': <Shield className="w-4 h-4 text-gray-400" />,
    'LECHUZA': <Brain className="w-4 h-4 text-amber-500" />,
    'QUIMERA': <Sparkles className="w-4 h-4 text-rose-500" />,
    'Cónclave': <Zap className="w-4 h-4 text-gold" />
};

export default function RankingPage() {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch("/api/ranking");
                const data = await res.json();
                if (data.ok) setRanking(data.ranking || []);
            } catch (e) {
                console.error("Error loading prestige:", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <main className="min-h-screen p-6 md:p-32 bg-[#050505] text-white font-sans">
            <div className="max-w-4xl mx-auto space-y-16">
                
                {/* Header Dinámico */}
                <header className="space-y-6 text-center md:text-left">
                    <a href="/hub" className="text-[10px] tracking-[0.5em] uppercase text-gold/60 hover:text-gold transition-all font-black">
                        ← {t("btn_back_hub")}
                    </a>
                    <div className="space-y-2">
                        <h1 className="text-5xl md:text-7xl font-serif italic text-white/90 tracking-tighter">Anales de Prestigio</h1>
                        <p className="text-[10px] text-gray-500 tracking-[0.4em] uppercase font-bold">El Top 100 de la Ciudadela</p>
                    </div>
                </header>

                <div className="royal-card overflow-hidden border-white/5 bg-white/[0.01]">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <span className="text-[10px] tracking-widest uppercase text-gray-500 font-black">Jerarquía de Jueces</span>
                        <div className="flex gap-4">
                            <Trophy className="w-4 h-4 text-gold opacity-50" />
                        </div>
                    </div>

                    <div className="divide-y divide-white/5">
                        {loading ? (
                            <div className="p-20 text-center animate-pulse text-gold uppercase text-[10px] tracking-[0.5em]">
                                Consultando Pergaminos...
                            </div>
                        ) : ranking.length === 0 ? (
                            <div className="p-20 text-center text-white/20 italic font-serif">
                                Todavía no hay leyendas consagradas.
                            </div>
                        ) : (
                            ranking.map((user, i) => (
                                <div 
                                    key={user.id} 
                                    className={`p-6 md:p-10 flex items-center justify-between hover:bg-white/[0.03] transition-all group ${i === 0 ? 'bg-gold/5' : ''}`}
                                >
                                    <div className="flex items-center gap-6 md:gap-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border ${i < 3 ? 'border-gold text-gold bg-gold/10' : 'border-white/10 text-white/30'}`}>
                                            {i + 1}
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg md:text-xl font-serif italic group-hover:text-gold transition-colors">
                                                    {user.username || "Nómada Silencioso"}
                                                </h3>
                                                {user.casa && (
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                                                        {CASA_ICONS[user.casa.toUpperCase()] || CASA_ICONS['Cónclave']}
                                                        <span className="text-[8px] uppercase tracking-tighter text-white/40">{user.casa}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[9px] tracking-[0.3em] uppercase text-gray-500 font-bold">{user.rank}</p>
                                        </div>
                                    </div>

                                    <div className="text-right space-y-1">
                                        <p className="text-2xl md:text-3xl font-serif italic text-white/90">{user.elo}</p>
                                        <p className="text-[8px] tracking-widest uppercase text-gold/60 font-black">Puntos ELO</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <footer className="pt-10 text-center opacity-30">
                    <p className="text-[9px] tracking-[0.5em] uppercase text-white/40 font-bold">La gloria se forja en la Arena, un relato a la vez.</p>
                </footer>
            </div>
        </main>
    );
}
