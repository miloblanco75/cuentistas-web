"use client";

import React, { useEffect, useState } from "react";
import { 
    Award, 
    Zap, 
    ArrowRight, 
    Home, 
    ShoppingBag, 
    BarChart3, 
    Flame,
    PenTool,
    Target
} from "lucide-react";
import Link from "next/link";

export default function PostActionScreen({ 
    rewards, 
    userStats, 
    isDuplicate = false,
    onClose 
}) {
    const [visible, setVisible] = useState(false);
    
    // Fallbacks from rewards payload
    const finalHouseRank = rewards?.houseRank ?? "1º";
    const finalHouseLogo = rewards?.houseLogo ?? (userStats?.casaLogo ?? "🐺");
    const streakResult = rewards?.streak ?? (userStats?.streak ?? 0);
    const streakBonus = rewards?.streakBonus ?? 0;
    
    useEffect(() => {
        setTimeout(() => setVisible(true), 100);
    }, []);

    if (!rewards && !isDuplicate) return null;

    return (
        <div className={`fixed inset-0 z-[500] flex items-center justify-center p-6 md:p-12 transition-all duration-1000 ${visible ? 'backdrop-blur-2xl bg-black/60 opacity-100' : 'backdrop-blur-0 bg-transparent opacity-0'}`}>
            <div className={`max-w-4xl w-full royal-card p-12 md:p-20 relative overflow-hidden transition-all duration-1000 transform ${visible ? 'translate-y-0 scale-100' : 'translate-y-12 scale-95'}`}>
                
                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-96 h-96 ${isDuplicate ? 'bg-blue-400/5' : 'bg-gold/5'} rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse`}></div>

                <div className="relative space-y-16">
                    {/* 1. Header & Context */}
                    <header className="text-center space-y-8">
                        <div className="flex justify-center gap-6">
                            <div className={`w-20 h-20 border ${isDuplicate ? 'border-blue-400/30' : 'border-gold/30'} rounded-full flex items-center justify-center bg-black/40 relative`}>
                                {isDuplicate ? <Target className="text-blue-400 w-10 h-10" /> : <Award className="text-gold w-10 h-10" />}
                                <div className={`absolute -inset-2 border ${isDuplicate ? 'border-blue-400/10' : 'border-gold/10'} rounded-full animate-ping`}></div>
                            </div>
                            {!isDuplicate && (
                                <>
                                    {streakResult > 0 && !rewards?.streakReset && (
                                        <div className="w-20 h-20 border border-orange-500/30 rounded-full flex flex-col items-center justify-center bg-black/40 relative animate-bounce">
                                            <span className="text-2xl">🔥</span>
                                            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-tighter">Día {streakResult}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="space-y-4">
                            <p className={`${isDuplicate ? 'text-blue-400' : 'text-gold'} text-[12px] tracking-[0.8em] uppercase font-sans`}>
                                {isDuplicate ? "Sello Existente Detectado" : "Legado Entregado al Consejo"}
                            </p>
                            <h2 className="text-5xl md:text-7xl font-light italic font-serif tracking-tighter text-white">
                                {isDuplicate ? "Ya participas en este cónclave" : (rewards?.streakReset ? "Tu fuego se ha extinguido" : (streakResult > 1 ? "Tu Fuego es Inextinguible" : "Tu Historia comienza aquí"))}
                            </h2>
                            <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-black">
                                {isDuplicate ? "Tu obra ya ha sido registrada anteriormente y está a salvo en los archivos." : (rewards?.streakReset ? "No participaste a tiempo. Has perdido tu progreso." : "Tu racha está activa. Vuelve mañana para duplicar tu gloria.")}
                            </p>
                        </div>
                    </header>

                    {/* 2. Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Progressive Rewards / Duplicate Info */}
                        <div className={`space-y-8 bg-white/[0.03] p-10 border ${isDuplicate ? 'border-blue-400/10' : 'border-white/5'}`}>
                            <div className="flex justify-between items-end">
                                <div className="space-y-2">
                                    <p className="text-[10px] tracking-widest text-gray-500 uppercase">{isDuplicate ? "Vínculo Confirmado" : "Tesoros Ganados"}</p>
                                    <h3 className="text-4xl font-serif italic text-white">{isDuplicate ? "Sello de Autor" : "Botín Real"}</h3>
                                </div>
                                {!isDuplicate ? (
                                    <div className="text-right">
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-2 text-gold font-bold">
                                                <Zap className="w-5 h-5 fill-gold" />
                                                <span className="text-3xl">+{rewards?.ink ?? 20}</span>
                                                <span className="text-xs uppercase tracking-tighter font-black">Tinta</span>
                                            </div>
                                            {streakBonus > 0 && (
                                                <span className="text-[9px] text-orange-400 font-bold uppercase tracking-widest">
                                                    +{streakBonus} Bonus por Racha 🔥
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-blue-400 font-bold mt-2">
                                            <Target className="w-5 h-5 fill-blue-400" />
                                            <span className="text-3xl">+{rewards?.xp ?? 10}</span>
                                            <span className="text-xs uppercase tracking-tighter font-black">Gloria</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <span className="text-xs text-blue-400 font-black uppercase tracking-widest animate-pulse">Protegido por el Tribunal</span>
                                        <div className="flex items-center gap-2 text-white/40">
                                            <Zap className="w-3 h-3 text-gold" />
                                            <span className="text-[10px] uppercase tracking-widest">Reserva: {userStats?.tinta ?? 0}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Progress Info / Conversion Hint */}
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-[10px] text-gray-500 italic text-center uppercase tracking-[0.3em] leading-relaxed">
                                    {isDuplicate ? (
                                        (userStats?.tinta ?? 0) >= 10 
                                            ? `“Te quedan ${userStats?.tinta} gotas de tinta. Elige bien tu próxima batalla.”`
                                            : "“Tus reservas de tinta son escasas. Busca el mercado para reabastecerte.”"
                                    ) : (
                                        "Vuelve mañana para seguir alimentando tu fuego e incrementar tu racha."
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* World/House Status */}
                        <div className="space-y-8 bg-white/[0.03] p-10 border border-white/5 flex flex-col justify-center">
                            <div className="space-y-2">
                                <p className="text-[10px] tracking-widest text-gray-500 uppercase">Estado del Cónclave</p>
                                <h3 className="text-4xl font-serif italic text-white font-bold">Orgullo de Casa</h3>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="text-6xl">{finalHouseLogo}</span>
                                <div className="space-y-1">
                                    <p className="text-2xl font-serif italic text-gold">Tu casa va en {finalHouseRank} posición 🔥</p>
                                    <p className="text-[10px] tracking-widest text-gray-500 uppercase">Compitiendo por el Gran Sello</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Decision Points (Engagement) */}
                    <div className="space-y-6">
                        <p className="text-[10px] tracking-[0.4em] uppercase text-gold/60 text-center font-black">Decide tu próximo paso</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Link 
                                href="/mercado" 
                                className={`group royal-card p-8 bg-gold/5 border-gold/20 hover:bg-gold/10 hover:border-gold/40 transition-all text-center space-y-4 ${isDuplicate && (userStats?.tinta ?? 0) < 10 ? 'ring-1 ring-gold/50' : ''}`}
                            >
                                <div className="flex justify-center">
                                    <ShoppingBag className="w-8 h-8 text-gold group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black tracking-widest uppercase text-gold">
                                        {(isDuplicate && (userStats?.tinta ?? 0) < 10) ? "Recuperar Tinta" : "Ir al mercado"}
                                    </p>
                                    <p className="text-[9px] text-gray-500 uppercase tracking-tighter">
                                        {(isDuplicate && (userStats?.tinta ?? 0) < 10) ? "No puedes entrar a más cónclaves" : "Gasta tu botín en reliquias"}
                                    </p>
                                </div>
                            </Link>

                            <Link 
                                onClick={() => {
                                    if (isDuplicate) console.log("duplicate_to_new_entry_click");
                                }}
                                href={isDuplicate && (userStats?.tinta ?? 0) >= 10 ? "/concursos" : "/concursos/exito"} 
                                className={`group royal-card p-8 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-center space-y-4 ${isDuplicate && (userStats?.tinta ?? 0) >= 10 ? 'border-gold/30 bg-gold/5' : ''}`}
                            >
                                <div className="flex justify-center">
                                    {isDuplicate && (userStats?.tinta ?? 0) >= 10 ? <Flame className="w-8 h-8 text-gold animate-fire" /> : <PenTool className="w-8 h-8 text-white/40 group-hover:text-white group-hover:scale-110 transition-transform" />}
                                </div>
                                <div className="space-y-1">
                                    <p className={`text-[10px] font-black tracking-widest uppercase ${isDuplicate && (userStats?.tinta ?? 0) >= 10 ? 'text-gold' : 'text-white/80'}`}>
                                        {isDuplicate ? ((userStats?.tinta ?? 0) >= 10 ? "OTRO CÓNCLAVE" : "Ver mi Obra") : "Ver Crónicas"}
                                    </p>
                                    <p className="text-[9px] text-gray-500 uppercase tracking-tighter">
                                        {isDuplicate ? ((userStats?.tinta ?? 0) >= 10 ? "Escribe otra historia" : "Revisa tu participación") : "Revisa tu participación"}
                                    </p>
                                </div>
                            </Link>

                            <Link href="/ranking" className="group royal-card p-8 bg-blue-400/5 border-blue-400/20 hover:bg-blue-400/10 hover:border-blue-400/40 transition-all text-center space-y-4">
                                <div className="flex justify-center">
                                    <BarChart3 className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black tracking-widest uppercase text-blue-400">Ver ranking</p>
                                    <p className="text-[9px] text-gray-500 uppercase tracking-tighter">Compara tu nivel con el resto</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* 4. Footer CTA (Primary Motivation) */}
                    <div className="pt-8 text-center space-y-8">
                        <p className="text-gray-400 text-sm font-serif italic max-w-lg mx-auto leading-relaxed">
                            {isDuplicate ? "“Este cónclave ya conoce tu nombre… pero otros aún esperan.”" : "“Tu tinta no es solo una moneda; es el combustible de tu ambición. Prepárate.”"}
                        </p>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                            {isDuplicate && (
                                <Link 
                                    href="/concursos/exito"
                                    className="px-12 py-6 border border-white/10 hover:border-gold/40 text-[9px] font-black uppercase tracking-[0.4em] transition-all text-white/40 hover:text-white"
                                >
                                    VER MI OBRA
                                </Link>
                            )}
                            <button 
                                onClick={onClose}
                                className="bg-gold hover:bg-white text-black px-16 py-6 text-[10px] font-black uppercase tracking-[0.5em] transition-all flex items-center gap-4 group shadow-[0_0_50px_rgba(212,175,55,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]"
                            >
                                {isDuplicate ? "VOLVER AL HUB" : "ACEPTAR RECOMPENSAS"} <ArrowRight className="w-4 h-4 ml-4 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
