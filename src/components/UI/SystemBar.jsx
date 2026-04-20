"use client";

import React from "react";
import Link from "next/link";
import { Zap, Shield, User, Award, Timer, ShoppingBag, BarChart3, LayoutDashboard } from "lucide-react";
import { useUser } from "../UserContext";
import ActivityTicker from "./ActivityTicker";

export default function SystemBar({ 
    mode = "full", 
    timeLeft = null, 
    isWriting = false 
}) {
    const userCtx = useUser();
    const userData = userCtx?.userData;
    const loading = userCtx?.loading ?? true;
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // AUDITORÍA: Si no hemos completado el montaje en el cliente, evitamos renderizar
    // lógica compleja que dependa de sesiones asíncronas para evitar el 'Application error'
    if (!mounted) return null;

    // Lógica de descubrimiento progresivo
    const hasHistory = userData?.hasPerformedFirstAction ?? false;

    // Si aún está cargando, mostramos una versión mínima placeholder
    if (loading && mode === "full") {
        return (
            <div className="fixed top-0 left-0 w-full z-[100] bg-black/40 backdrop-blur-md border-b border-white/5 px-8 py-6 flex justify-between items-center h-[72px]">
                <div className="w-24 h-4 bg-white/5 animate-pulse rounded"></div>
                <div className="w-48 h-4 bg-white/5 animate-pulse rounded"></div>
                <div className="w-24 h-4 bg-white/5 animate-pulse rounded"></div>
            </div>
        );
    }

    const formatTime = (seconds) => {
        if (seconds === null || seconds === undefined) return "--:--";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    // Caso: No hay usuario (es un invitado)
    if (!userData && mode === "full") {
        return (
            <nav className="fixed top-0 left-0 w-full z-[100] bg-black/40 backdrop-blur-md border-b border-white/5 px-8 py-4 flex justify-between items-center h-[72px]">
                <Link href="/" className="group flex items-center gap-3">
                    <div className="w-8 h-8 border border-gold/40 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500 text-gold text-xs font-black">C</div>
                    <span className="text-white/80 text-[10px] tracking-[0.5em] uppercase font-cinzel">Ciudadela</span>
                </Link>
                <Link href="/login" className="text-[10px] tracking-[0.4em] uppercase text-gold hover:text-white transition-colors font-bold">
                    Unirse al Cónclave
                </Link>
            </nav>
        );
    }

    if (mode === "minimized") {
        const isCritical = timeLeft !== null && timeLeft !== undefined && timeLeft <= 30;
        const isWarning = timeLeft !== null && timeLeft !== undefined && timeLeft <= 300 && timeLeft > 30;
        
        return (
            <div className={`fixed top-0 left-0 w-full z-[100] transition-all duration-1000 flex justify-center p-4 ${isWriting ? "opacity-30 hover:opacity-100" : "opacity-100"}`}>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-full flex items-center gap-8 md:gap-12 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative">
                    {/* Tinta */}
                    <div className="flex items-center gap-2 group">
                        <Zap className="w-3.5 h-3.5 text-gold group-hover:scale-125 transition-all duration-500 cursor-help" />
                        <span className="text-white font-bold text-sm tracking-widest">{userData?.tinta ?? 0}</span>
                    </div>

                    {/* Timer Central */}
                    <div className="flex flex-col items-center min-w-[120px]">
                        <div className={`flex items-center gap-3 ${isCritical ? "text-red-500 animate-pulse" : isWarning ? "text-gold" : "text-white"}`}>
                            <Timer className={`w-5 h-5 ${isCritical ? "animate-spin" : ""}`} />
                            <span className="text-2xl font-mono font-black tracking-tighter shadow-sm">
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>

                    {/* Nivel */}
                    <div className="flex items-center gap-2 group">
                        <Award className="w-4 h-4 text-gold group-hover:rotate-12 transition-all cursor-help" />
                        <span className="text-white font-bold text-sm tracking-widest">{userData?.nivel?.split(' ')[0] || "Iniciado"}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <nav className="fixed top-0 left-0 w-full z-[100] bg-black/40 backdrop-blur-md border-b border-white/5 px-8 pt-4 pb-4 flex justify-between items-center transition-all animate-in fade-in slide-in-from-top duration-700 h-[72px]">
            
            {/* LEFT: Logo & Activity */}
            <div className="flex items-center gap-8">
                <Link href="/hub" className="group flex items-center gap-3">
                    <div className="w-9 h-9 border border-gold/40 flex items-center justify-center group-hover:rotate-[135deg] transition-all duration-700 bg-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                        <span className="text-gold text-sm font-black group-hover:rotate-[-135deg] transition-all duration-700 font-cinzel">C</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white text-[10px] tracking-[0.5em] uppercase font-cinzel group-hover:text-gold transition-colors block leading-none">Ciudadela</span>
                        <span className="text-gold/40 text-[7px] uppercase tracking-[0.3em] font-bold block">Online v1.0</span>
                    </div>
                </Link>

                <div className="hidden lg:block w-px h-6 bg-white/10"></div>
                
                <div className="hidden lg:block">
                    <ActivityTicker />
                </div>
            </div>

            {/* CENTER: Quick Navigation (Vibrant Links) */}
            <div className="flex items-center gap-2 md:gap-6 bg-white/[0.03] px-6 py-2 rounded-full border border-white/5 backdrop-blur-sm">
                {hasHistory && (
                    <Link href="/hub" className="p-2 md:px-4 flex items-center gap-2 text-white/50 hover:text-gold transition-all group">
                        <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] uppercase tracking-[0.2em] font-bold hidden md:block">Hub</span>
                    </Link>
                )}

                {hasHistory && (
                    <>
                        <Link href="/mercado" className="p-2 md:px-4 flex items-center gap-2 text-white/30 hover:text-amber-400 transition-all group border-l border-white/5">
                            <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] uppercase tracking-[0.2em] font-bold hidden md:block">Mercado</span>
                        </Link>
                        <Link href="/ranking" className="p-2 md:px-4 flex items-center gap-2 text-white/30 hover:text-blue-400 transition-all group border-l border-white/5">
                            <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] uppercase tracking-[0.2em] font-bold hidden md:block">Rankings</span>
                        </Link>
                        
                        {/* ACCEDER AL PODER: Bloque exclusivo para el Arquitecto */}
                        {userData?.rol === "ARCHITECT" && (
                            <>
                                <Link href="/panel/tienda" className="p-2 md:px-4 flex items-center gap-2 text-amber-500/60 hover:text-amber-400 transition-all group border-l border-amber-500/20 bg-amber-500/5">
                                    <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold hidden md:block">Bóveda</span>
                                </Link>
                                <Link href="/panel" className="p-2 md:px-4 flex items-center gap-2 text-purple-500/60 hover:text-purple-400 transition-all group border-l border-white/5">
                                    <Award className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold hidden md:block">Panel</span>
                                </Link>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* RIGHT: User Stats & Portal */}
            <div className="flex items-center gap-4 md:gap-8">
                {/* Basic Stats & Streak */}
                <div className="flex items-center gap-4 md:gap-6">
                    {/* Racha / Streak */}
                    {(userData?.streak ?? 0) > 0 && (
                        <div className="flex items-center gap-2 group relative">
                            <div className="p-2 bg-orange-500/10 rounded-full border border-orange-500/30 group-hover:bg-orange-500/20 transition-all shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                                <span className="text-sm">🔥</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] text-gray-500 uppercase tracking-widest leading-none font-bold">Racha</span>
                                <span className="text-orange-500 font-black text-sm font-mono leading-none">{userData?.streak ?? 0}</span>
                            </div>
                            
                            {/* Warning logic: Si no ha participado HOY */}
                            {(() => {
                                if (!userData?.lastParticipation) return null;
                                const last = new Date(userData.lastParticipation);
                                const now = new Date();
                                const isToday = last.getDate() === now.getDate() && 
                                                last.getMonth() === now.getMonth() && 
                                                last.getFullYear() === now.getFullYear();
                                
                                if (!isToday) {
                                    return (
                                        <div className="absolute -bottom-6 left-0 whitespace-nowrap">
                                            <span className="text-[7px] text-red-500 font-bold uppercase tracking-tighter animate-pulse flex items-center gap-1">
                                                ⚠️ Tu racha está en riesgo
                                            </span>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    )}

                    <div className="flex items-center gap-2 group">
                        <Zap className="w-3.5 h-3.5 text-gold" />
                        <span className="text-white font-bold text-[11px] font-mono">{userData?.tinta ?? 0}</span>
                    </div>
                </div>

                {/* Profile / Portal Link */}
                <Link href="/perfil" className="flex items-center gap-4 group border-l border-white/5 pl-4 md:pl-8">
                    <div className="flex flex-col items-end opacity-60 group-hover:opacity-100 transition-all">
                        <span className="text-white font-bold text-[10px] tracking-widest uppercase group-hover:text-gold">{userData?.nombre || "Nómada"}</span>
                        <span className="text-[8px] text-gold/60 uppercase tracking-widest font-bold">{hasHistory ? "Tu Portal" : "Mi Perfil"}</span>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 border border-white/10 flex items-center justify-center bg-white/[0.02] group-hover:border-gold/50 transition-all rounded-sm overflow-hidden">
                        {userData?.image ? (
                            <img src={userData.image} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-4 h-4 text-white/40" />
                        )}
                    </div>
                </Link>
            </div>
        </nav>
    );
}
