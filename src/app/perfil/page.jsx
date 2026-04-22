"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CASAS } from "@/lib/constants";
import { useLanguage } from "@/components/LanguageContext";
import { useSession, signOut } from "next-auth/react";
import ProfileCustomizationModal from "@/components/profile/ProfileCustomizationModal";
import { useUser } from "@/components/UserContext";
import { Lock, Trophy, Target, PenTool, TrendingUp, Settings, Shield, Monitor, Type } from "lucide-react";
import "@/styles/RarityStyles.css";

export default function PerfilPage() {
    const { userData: user, loading: userLoading, refreshUser } = useUser();
    const [allPrestigeItems, setAllPrestigeItems] = useState([]);
    const [showCustomizer, setShowCustomizer] = useState(false);
    const { t } = useLanguage();
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            const fetchPrestige = async () => {
                const res = await fetch("/api/store/prestige");
                const data = await res.json();
                if (data.ok) setAllPrestigeItems(data.items);
            };
            fetchPrestige();
        } else if (status === "unauthenticated") {
            const timer = setTimeout(() => {
                router.push("/?auth=required");
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [status, router]);

    const handleEquip = async (inventoryId) => {
        const res = await fetch("/api/user/equip", {
            method: "POST",
            body: JSON.stringify({ inventoryId }),
            headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        if (data.ok) {
            await refreshUser();
        }
    };

    if (status === "loading" || userLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
                <p className="text-gold font-serif italic text-sm tracking-widest animate-pulse">Sincronizando Identidad...</p>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null; // Will redirect via useEffect
    }

    const casaData = CASAS.find(c => c.id === user.casa) || CASAS[0];
    
    // PRECISION CALCULATION (Formula: 100 - avgDiff)
    // Placeholder logic for now, should be real in production
    const precisionValue = 72; 

    // Find active items for display
    const activeFrame = allPrestigeItems.find(i => i.id === user.activeFrameId);
    const activeBadge = allPrestigeItems.find(i => i.id === user.activeBadgeId);
    const activeTitle = allPrestigeItems.find(i => i.id === user.activeTitleId);

    return (
        <main className="min-h-screen bg-[#020202] text-[#ffffff] p-8 md:p-24 animate-elegant relative selection:bg-gold/30">
            {/* BACKGROUND DEPTH */}
            <div className={`absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-b ${casaData.bg} to-transparent`}></div>

            <div className="max-w-6xl mx-auto space-y-32 relative z-10">
                
                {/* 1. IDENTITY BLOCK */}
                <header className="flex flex-col md:flex-row items-center md:items-end justify-between gap-12">
                    <div className="flex items-center gap-10">
                        {/* Avatar + Frame */}
                        <div className={`relative w-32 h-32 md:w-48 md:h-48 rounded-full border-2 border-white/5 flex items-center justify-center p-2 ${activeFrame ? `frame-${activeFrame.rarity} glow-${activeFrame.rarity}` : ''}`}>
                            <div className="w-full h-full rounded-full bg-white/5 overflow-hidden flex items-center justify-center text-5xl md:text-7xl group">
                                {user.image ? <img src={user.image} alt="Avatar" className="w-full h-full object-cover" /> : "🔱"}
                            </div>
                            
                            {/* Active Badge Overlay */}
                            {activeBadge && (
                                <div className={`absolute -bottom-2 -right-2 bg-black border border-gold/20 p-3 rounded-full shadow-2xl animate-pulse glow-${activeBadge.rarity}`}>
                                    <span className="text-xl">{activeBadge.name.split(' ')[0]}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <p className={`text-[10px] tracking-[0.5em] uppercase font-black ${activeTitle ? `title-rarity-${activeTitle.rarity}` : 'text-gold'}`}>
                                    {activeTitle ? activeTitle.name : "Aspirante del Tribunal"}
                                </p>
                                <div className="h-[1px] w-12 bg-white/10"></div>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-light tracking-tighter text-white font-serif italic leading-none">{user.nombre}</h1>
                            <p className="text-gray-500 font-sans tracking-[0.3em] uppercase text-xs">
                                {casaData.nombre} • Nivel {user.nivel}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 w-full md:w-auto">
                        <button 
                            onClick={() => setShowCustomizer(true)}
                            className="royal-button px-12 py-5 text-[10px] tracking-[0.5em] uppercase flex items-center justify-center gap-4 group"
                        >
                            <Settings size={14} className="group-hover:rotate-90 transition-transform duration-500" />
                            Personalizar Perfil 🔱
                        </button>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="text-[9px] tracking-[0.5em] uppercase text-white/20 hover:text-red-400 text-center transition-all font-sans"
                        >
                            Abandonar la Ciudadela
                        </button>
                    </div>
                </header>

                {/* 2. STATS BLOCK */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    {[
                        { label: "Precisión", value: `${precisionValue}%`, icon: Target, color: "text-gold" },
                        { label: "Victorias", value: user.victorias || 0, icon: Trophy, color: "text-blue-400" },
                        { label: "Participaciones", value: user.puntos || 0, icon: TrendingUp, color: "text-purple-400" },
                        { label: "Tinta", value: user.tinta, icon: PenTool, color: "text-white" }
                    ].map((stat, i) => (
                        <div key={i} className="royal-card p-10 flex flex-col items-center justify-center text-center space-y-4 group hover:border-gold/30 transition-all border-white/5">
                            <stat.icon className={`${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} size={20} />
                            <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-sans">{stat.label}</p>
                            <p className="text-4xl font-serif italic text-white/90">{stat.value}</p>
                        </div>
                    ))}
                </section>

                {/* ARCHITECT HIGH COMMAND SECTION */}
                {user.rol === "ARCHITECT" && (
                    <section className="royal-card p-12 border-amber-500/30 bg-amber-500/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Shield size={120} className="text-amber-500" />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-[10px] tracking-[0.6em] uppercase text-amber-500 font-black">Alta Comandancia</h2>
                                <h3 className="text-3xl font-cinzel tracking-widest text-white">Santuario del Arquitecto</h3>
                            </div>
                            <div className="flex flex-wrap gap-6">
                                <a 
                                    href="/panel"
                                    className="bg-amber-600 hover:bg-amber-500 text-black px-10 py-4 rounded-sm text-[10px] font-black tracking-[0.3em] uppercase transition-all shadow-[0_0_20px_rgba(217,175,55,0.3)]"
                                >
                                    ⚖️ Forjar Concursos
                                </a>
                                <a 
                                    href="/panel/tienda"
                                    className="bg-black/40 hover:bg-black/60 border border-amber-500/30 text-amber-500 px-10 py-4 rounded-sm text-[10px] font-black tracking-[0.3em] uppercase transition-all"
                                >
                                    💎 Gestionar Bóveda
                                </a>
                                <a 
                                    href="/ranking"
                                    className="bg-black/20 hover:bg-black/40 text-gray-400 px-10 py-4 rounded-sm text-[10px] font-black tracking-[0.3em] uppercase transition-all"
                                >
                                    📈 Anales Globales
                                </a>
                            </div>
                        </div>
                    </section>
                )}

                {/* 3. PRESTIGE DESIRE ZONE */}
                <section className="space-y-12">
                    <div className="flex items-center gap-6">
                        <h2 className="text-2xl font-serif italic text-white/80">Catálogo de Prestigio</h2>
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
                        {allPrestigeItems.map(item => {
                            const isOwned = user.inventory.some(i => i.storeItemId === item.id);
                            return (
                                <div 
                                    key={item.id} 
                                    className={`relative p-6 rounded-2xl border transition-all duration-700 flex flex-col items-center gap-4 ${
                                        isOwned 
                                            ? `border-gold/20 bg-gold/5 glow-${item.rarity}` 
                                            : 'border-white/5 bg-white/[0.02] opacity-40 grayscale group hover:opacity-60'
                                    }`}
                                >
                                    {/* Visual Representation */}
                                    <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg">
                                        {item.type === 'frame' ? <Monitor size={20} /> :
                                         item.type === 'badge' ? <Shield size={20} /> : <Type size={20} />}
                                    </div>

                                    <div className="text-center">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/60 mb-1 leading-tight">{item.name}</p>
                                        {!isOwned && (
                                            <div className="flex items-center justify-center gap-2 mt-2">
                                                <Lock size={8} className="text-gold/50" />
                                                <span className="text-gold text-[8px] font-bold">{item.priceTinta}✒️</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Rarity Indicator */}
                                    <div className={`absolute top-2 right-2 w-1 h-1 rounded-full ${
                                        item.rarity === 'legendary' ? 'bg-gold' : 
                                        item.rarity === 'epic' ? 'bg-purple-400' : 'bg-blue-400'
                                    }`}></div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 4. MEDALS & ACHIEVEMENTS (Simplified) */}
                <section className="pt-20 text-center">
                    <p className="text-[9px] text-gray-500 uppercase tracking-[0.5em] italic">Tu historia apenas comienza en la Arena...</p>
                </section>
            </div>

            {/* CUSTOMIZATION MODAL */}
            <ProfileCustomizationModal 
                isOpen={showCustomizer}
                onClose={() => setShowCustomizer(false)}
                inventory={user.inventory}
                items={allPrestigeItems}
                onEquip={handleEquip}
            />
        </main>
    );
}
