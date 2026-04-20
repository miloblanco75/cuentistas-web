"use client";

import React, { useEffect, useState } from "react";
import { CASAS } from "@/lib/constants";
import { Trophy, Shield } from "lucide-react";

export default function HouseRankingCard({ userCasa }) {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/casas/ranking")
            .then((res) => res.json())
            .then((data) => {
                if (data.ok && Array.isArray(data.ranking)) setRanking(data.ranking);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="royal-card p-12 bg-white/5 animate-pulse text-center font-serif italic text-gold/40">
            Consultando el Gran Libro de Casas...
        </div>
    );

    const winner = ranking[0];
    const safeUserCasa = (userCasa || "").toLowerCase();
    const isUserWinning = winner?.id === safeUserCasa;

    return (
        <div className="space-y-12">
            <header className="text-center space-y-4">
                <p className="text-[10px] tracking-[0.5em] uppercase text-gold/60 font-black">
                    — Hegemonía de Casas —
                </p>
                <h2 className="text-5xl font-serif italic text-white">Batalla Semanal</h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {CASAS.map((casa) => {
                    const houseId = (casa.id || "").toLowerCase();
                    const houseScore = ranking.find(r => r.id === houseId)?.puntos || 0;
                    const pos = ranking.findIndex(r => r.id === houseId) + 1;
                    const isUserHouse = houseId === safeUserCasa;

                    return (
                        <div 
                            key={casa.id} 
                            className={`royal-card p-8 group relative overflow-hidden transition-all duration-700 ${isUserHouse ? 'border-gold shadow-[0_0_30px_rgba(212,175,55,0.1)]' : 'border-white/5 opacity-80'}`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-t ${casa.bg} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}></div>
                            
                            <div className="relative z-10 space-y-6">
                                <div className="flex justify-between items-start">
                                    <span className="text-4xl">{casa.logo}</span>
                                    {pos === 1 && <Trophy className="text-gold w-5 h-5 animate-bounce" />}
                                    {isUserHouse && <Shield className="text-blue-400 w-4 h-4" />}
                                </div>
                                
                                <div className="space-y-1">
                                    <h4 className="text-xl font-serif italic text-white/90">{casa.nombre}</h4>
                                    <p className="text-[9px] tracking-widest uppercase text-gray-500">{casa.lema}</p>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                                    <div>
                                        <p className="text-[8px] uppercase tracking-widest text-gray-500">Poder</p>
                                        <p className="text-2xl font-serif italic text-gold">{houseScore} <span className="text-[10px]">PTS</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] uppercase tracking-widest text-gray-500">Rango</p>
                                        <p className="text-xl font-serif italic text-white/40">#{pos || "-"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {userCasa && (
                <div className="text-center pt-8">
                    <p className={`text-[10px] tracking-[0.3em] uppercase font-black ${isUserWinning ? 'text-gold' : 'text-red-500 animate-pulse'}`}>
                        {isUserWinning 
                          ? "Soberanos: Tu casa domina el cónclave esta semana." 
                          : "⚠️ Advertencia: Tu casa está perdiendo el honor. Tu aporte es clave."}
                    </p>
                </div>
            )}
        </div>
    );
}
