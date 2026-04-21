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
    const isGuest = userCtx?.isGuest ?? false;
    const activeBoost = userCtx?.activeBoost ?? 0;
    const boostExpiresAt = userCtx?.boostExpiresAt;
    
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Lógica de expiración del boost
    const isBoostActive = activeBoost > 0 && boostExpiresAt && new Date(boostExpiresAt) > new Date();
    const [daysRemaining, setDaysRemaining] = React.useState(0);

    React.useEffect(() => {
        if (isBoostActive) {
            const diff = new Date(boostExpiresAt).getTime() - Date.now();
            setDaysRemaining(Math.ceil(diff / (1000 * 60 * 60 * 24)));
        }
    }, [isBoostActive, boostExpiresAt]);

    // V10: Simulación de Guerra de Casas
    const [warSignal, setWarSignal] = React.useState("Casa Lobo lidera hoy");
    React.useEffect(() => {
        const signals = [
            "Casa Lobo lidera hoy",
            "Casa Lechuza: +14 victorias semana",
            "Quimera está remontando el duelo",
            "El Tribunal observa a Casa Lobo",
            "Incursión creativa de Lechuza activa"
        ];
        const int = setInterval(() => {
            setWarSignal(signals[Math.floor(Math.random() * signals.length)]);
        }, 15000);
        return () => clearInterval(int);
    }, []);

    // ... (rest of the system bar code continues)
    
    // Mapeo de Iconos de Casa
    const HouseIcon = ({ casa, className }) => {
        if (casa === "LOBO") return <Shield className={`${className} text-gray-300`} />;
        if (casa === "LECHUZA") return <Brain className={`${className} text-amber-400`} />;
        if (casa === "QUIMERA") return <Sparkles className={`${className} text-rose-500`} />;
        return null;
    };

    const hasHistory = userData?.hasPerformedFirstAction ?? false;
    const interactionsLeft = 3 - (userData?.interactions ?? 0);

    // Banner de Espectador (V10: Micro-conversion hints)
    const SpectatorBanner = () => (
        <div className="fixed top-[72px] left-0 w-full z-[99] bg-gold/10 backdrop-blur-md border-b border-gold/20 px-8 py-2 flex justify-between items-center transition-all animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                    </span>
                    <p className="text-[9px] tracking-[0.3em] uppercase text-gold font-bold">
                        Modo Espectador — <span className="opacity-60">Nivel Simulada: Aspirante</span>
                    </p>
                </div>
                <div className="h-4 w-[1px] bg-gold/20"></div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-gold/80 italic">
                    {interactionsLeft <= 1 
                        ? "Te queda 1 decisión de gracia..." 
                        : `Te quedan ${interactionsLeft} decisiones para desbloquear tu perfil`}
                </p>
            </div>
            <Link href="/login" className="bg-gold text-black text-[9px] px-6 py-1 font-black tracking-widest uppercase rounded-sm hover:scale-105 transition-transform flex items-center gap-2">
                <Zap className="w-3 h-3 fill-black" />
                Obtener Poder Real
            </Link>
        </div>
    );

    // Placeholder de carga
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
        if (seconds === null || seconds === undefined || isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    // Caso: Invitado o Sin Sesión
    if ((!userData || isGuest) && mode === "full") {
        return (
            <>
                <nav className="fixed top-0 left-0 w-full z-[100] bg-black/40 backdrop-blur-md border-b border-white/5 px-8 py-4 flex justify-between items-center h-[72px]">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="group flex items-center gap-3">
                            <div className="w-8 h-8 border border-gold/40 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500 text-gold text-xs font-black">C</div>
                            <span className="text-white/80 text-[10px] tracking-[0.5em] uppercase font-cinzel">Ciudadela</span>
                        </Link>
                        <div className="hidden lg:block w-px h-6 bg-white/10"></div>
                        <div className="hidden lg:block">
                            <ActivityTicker />
                        </div>
                    </div>
                    <Link href="/login" className="text-[10px] tracking-[0.4em] uppercase text-gold hover:text-white transition-colors font-bold flex items-center gap-3 group">
                        <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Unirse al Cónclave
                    </Link>
                </nav>
                {isGuest && <SpectatorBanner />}
            </>
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
                    {/* Casa War Ticker (V10) */}
                    <div className="hidden lg:flex flex-col items-end px-4 border-r border-white/5 opacity-40 hover:opacity-100 transition-opacity">
                        <span className="text-[7px] text-gold font-black uppercase tracking-[0.2em] leading-none mb-1">Guerra de Casas</span>
                        <span className="text-[9px] text-white/60 uppercase tracking-widest font-serif italic animate-elegant">"{warSignal}"</span>
                    </div>

                    {/* Boost Indicator (V9) */}
                    {isBoostActive && (
                        <div className="flex items-center gap-2 group relative bg-gold/10 px-3 py-1.5 rounded-sm border border-gold/30">
                            <Zap className="w-3.5 h-3.5 text-gold animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gold font-black leading-none">+{activeBoost * 100}%</span>
                                <span className="text-[7px] text-gold/60 uppercase tracking-tighter leading-none font-bold mt-1">Activo ({daysRemaining}d)</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Casa Identity (V10) */}
                    {userData?.casa && (
                        <div className="flex items-center gap-3 px-4 border-l border-white/5 group">
                            <HouseIcon casa={userData.casa} className="w-4 h-4 animate-elegant" />
                            <div className="flex flex-col">
                                <span className="text-[8px] text-gray-500 uppercase tracking-widest leading-none font-bold">Casa</span>
                                <span className="text-white font-black text-[10px] tracking-widest uppercase">{userData.casa}</span>
                            </div>
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
