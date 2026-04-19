"use client";

import React, { useState, useEffect, cloneElement } from 'react';
import { useUser } from "@/components/UserContext";
import { useLanguage } from "@/components/LanguageContext";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  PenTool, 
  ShoppingBag, 
  User, 
  Shield, 
  Globe, 
  LogOut,
  ChevronRight,
  Flame,
  Zap,
  Target,
  Trophy,
  History,
  Sparkles,
  Settings
} from "lucide-react";
import { CASAS } from "@/lib/constants";
import { PergaminoMandatos } from "@/components/Identity/PergaminoMandatos";

export default function PlatformHubClient() {
  const userCtx = useUser();
  const { userData, loading: userLoading } = userCtx || { userData: null, loading: true };
  const { data: session } = useSession();
  const { t } = useLanguage();
  const router = useRouter();

  if (!userCtx) return (
    <div className="min-h-screen bg-[#050508] text-[#d4af37] flex flex-col items-center justify-center gap-8 font-cinzel tracking-[0.4em] uppercase">
        <div className="w-16 h-16 border-t-2 border-gold rounded-full animate-spin"></div>
        <p className="animate-pulse text-lg">Consensuando la realidad...</p>
    </div>
  );
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted || (userLoading && !userData)) {
    return (
      <div className="min-h-screen bg-[#050508] text-[#d4af37] flex flex-col items-center justify-center gap-12 font-cinzel tracking-[0.4em] uppercase">
        <div className="w-24 h-24 border-t-2 border-gold/40 rounded-full animate-spin"></div>
        <p className="animate-pulse text-sm">Cargando la Ciudadela...</p>
      </div>
    );
  }

  const currentCasa = userData?.casa ? CASAS.find(c => c.id === userData.casa.toLowerCase()) : null;
  const hasRecentParticipation = false; // Simplified for restore

  return (
    <div className="min-h-screen bg-[#050508] overflow-x-hidden max-w-[100vw]">
      {/* Background Ambience */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-radial-gradient(circle, rgba(184,134,11,0.05), transparent)"></div>
      </div>

      <div className="relative pt-16 md:pt-24 pb-20">
        <header className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10 mb-20">
          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <Shield className="w-8 h-8 text-gold" />
              <p className="text-sm md:text-base tracking-[0.5em] uppercase text-gold font-cinzel font-black">
                 {t("hub_subtitle") || "Consensuando la realidad"}
              </p>
            </div>
            <h1 className="text-6xl md:text-9xl font-black italic title-gradient uppercase leading-none tracking-tighter">
              {t("hub_title") || "Ciudadela"}
            </h1>
          </div>
          
          <div className="flex items-center gap-12 bg-white/5 p-8 rounded-xl border border-white/10 backdrop-blur-3xl">
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.4em] text-white/40 mb-2 font-bold">Tinta Arcana</p>
              <div className="flex items-center justify-end gap-4 text-gold">
                <Zap className="w-8 h-8 animate-pulse" />
                <p className="text-5xl font-black text-white">{userData?.tinta || 0}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="max-w-6xl mx-auto px-6 mb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {userData?.rol === 'ARCHITECT' && (
                    <MenuCard 
                        title="Bóveda" 
                        subtitle="Control Maestro"
                        icon={<Shield size={32} />}
                        onClick={() => router.push('/admin-vault')}
                        description="Acceso exclusivo para el Creador. Gestión de la realidad."
                        accent="gold"
                    />
                )}
                <MenuCard title="Escritura" subtitle="La Arena" icon={<PenTool size={32} />} onClick={() => router.push('/concursos/live/arena-activa-default')} description="Redacta tu testamento literario." accent="gold" />
                <MenuCard title="Mercado" subtitle="Alquimia" icon={<ShoppingBag size={32} />} onClick={() => router.push('/mercado')} description="Adquiere poder y reliquias." accent="blue" />
            </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
                <div className="col-span-1 space-y-12">
                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-[0.5em] text-gold/40 italic">Autoridad</h3>
                        {userData?.rol === 'ARCHITECT' && (
                            <div className="flex items-center gap-6 px-6 py-6 bg-red-950/20 border-2 border-red-500/50 rounded-lg shadow-[0_0_40px_rgba(220,38,38,0.2)]">
                                <Shield className="w-10 h-10 text-red-500 animate-pulse" />
                                <div className="flex flex-col">
                                    <span className="text-base font-black tracking-[0.3em] text-red-500 uppercase">Arquitecto</span>
                                    <span className="text-xs text-red-500/60 uppercase tracking-widest mt-1">Soberano</span>
                                </div>
                            </div>
                        )}
                        <p className="text-2xl font-cinzel text-white uppercase font-bold">{userData?.nombre || "Nómada"}</p>
                    </div>
                    <div className="space-y-10">
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-white/30 mb-4">Rango</p>
                            <p className="text-3xl font-black text-white uppercase font-cinzel">{userData?.nivel ?? "Visitante"}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-white/30 mb-4">Casa</p>
                            <p className="text-3xl font-black uppercase font-cinzel" style={{ color: currentCasa?.color ?? "#ffffff" }}>{userData?.casa || "Sin Afiliación"}</p>
                        </div>
                    </div>
                </div>
                <div className="col-span-1 md:col-span-3">
                    <div className="bg-white/[0.02] border border-white/10 p-10 md:p-14 rounded-lg">
                        <PergaminoMandatos misiones={userData?.misiones || []} onReclaimSuccess={() => userCtx?.refreshUser()} />
                    </div>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
}

function MenuCard({ title, subtitle, icon, onClick, description, accent }) {
  const accentColors = { gold: "border-gold/20 hover:border-gold/60 text-gold", blue: "border-blue-500/20 hover:border-blue-500/60 text-blue-400", purple: "border-purple-500/20 hover:border-purple-500/60 text-purple-400" };
  return (
    <button onClick={onClick} className={`group relative text-left p-12 bg-white/[0.01] border ${accentColors[accent] || accentColors.gold} hover:bg-white/[0.05] transition-all duration-700 border-l-[6px] shadow-xl overflow-hidden`}>
      <div className="flex justify-between items-center mb-10"><div className="p-4 bg-white/5 rounded-sm transition-transform duration-700 group-hover:scale-125">{icon}</div><ChevronRight className="w-8 h-8 text-white/10 group-hover:translate-x-4 transition-all" /></div>
      <div className="space-y-2"><p className="text-xs uppercase tracking-[0.4em] font-black text-white/30">{subtitle}</p><h3 className="text-4xl font-black text-white group-hover:text-gold transition-colors font-cinzel tracking-tighter">{title}</h3></div>
      <p className="mt-8 text-sm text-white/50 leading-relaxed font-serif opacity-0 group-hover:opacity-100 transition-opacity duration-700">{description}</p>
    </button>
  );
}
