import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { 
  Zap, Database, Activity, Shield, Users, 
  Terminal, BarChart3, Clock, Hammer, Gavel 
} from "lucide-react";

// Server Component for the Vault
export const dynamic = "force-dynamic";

export default async function AdminVaultPage() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.rol !== "ARCHITECT") {
        redirect("/hub");
    }

    // Initial Data Fetch
    const stats = await prisma.$transaction([
        prisma.user.count(),
        prisma.entrada.count(),
        prisma.voto.count({ where: { tipo: "EXPERTO" } }),
        prisma.globalSettings.findUnique({ where: { id: "singleton" } })
    ]);

    const [userCount, entryCount, judgmentCount, settings] = stats;

    return (
        <main className="min-h-screen bg-[#050505] text-[#ffffff] p-8 md:p-24 selection:bg-gold/30">
            <div className="max-w-7xl mx-auto space-y-24">
                {/* Master HUD Header */}
                <header className="flex flex-col md:flex-row justify-between items-center gap-12 border-b border-gold/10 pb-12">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="flex items-center gap-4 justify-center md:justify-start">
                            <div className="w-3 h-3 bg-gold animate-pulse rounded-full shadow-[0_0_15px_#d4af37]"></div>
                            <p className="text-[10px] tracking-[0.5em] uppercase text-gold font-bold">Protocolo de Arquitecto // Vault</p>
                        </div>
                        <h1 className="text-6xl font-serif italic title-obsidian">Control Maestro</h1>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Status: Connected to Cónclave Mainframe</p>
                    </div>
                    <div className="flex gap-8">
                        <div className="royal-card p-6 border-gold/20 bg-gold/5 text-center px-12">
                            <p className="text-[9px] tracking-widest text-gold uppercase mb-2">Gloria Multiplier</p>
                            <p className="text-3xl font-serif italic text-white">x{settings?.gloriaMultiplier?.toFixed(1) || '1.0'}</p>
                        </div>
                    </div>
                </header>

                {/* Dashboard Stats Grid */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                      { label: "Cuentistas", val: userCount, icon: Users },
                      { label: "Legados Forjados", val: entryCount, icon: Database },
                      { label: "Sentencias Hoy", val: judgmentCount, icon: Gavel },
                      { label: "Estabilidad", val: "99.9%", icon: Shield },
                    ].map((stat, i) => (
                       <div key={i} className="royal-card p-8 bg-white/[0.02] border-white/5 hover:border-gold/20 transition-all space-y-4 group">
                          <header className="flex justify-between items-start">
                              <p className="text-[9px] tracking-[0.4em] uppercase text-gray-500 font-sans">{stat.label}</p>
                              <stat.icon size={14} className="text-gold/20 group-hover:text-gold transition-colors" />
                          </header>
                          <p className="text-3xl font-serif italic text-white/90">{stat.val}</p>
                       </div>
                    ))}
                </section>

                {/* Live Controls & Monitor */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Live Arena Control */}
                    <div className="royal-card p-12 bg-white/[0.01] border-white/5 space-y-12">
                        <header className="flex items-center gap-4">
                            <Activity size={18} className="text-gold" />
                            <h2 className="text-2xl font-serif italic text-white tracking-widest font-bold">Monitor de Arena</h2>
                        </header>
                        
                        <div className="space-y-6">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">— Protocolos de Emergencia —</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="p-4 border border-red-500/30 bg-red-500/5 text-red-500 text-[10px] uppercase font-bold tracking-widest hover:bg-red-500/10 transition-all">
                                    Pausar Todas las Salas
                                </button>
                                <button className="p-4 border border-gold/30 bg-gold/5 text-gold text-[10px] uppercase font-bold tracking-widest hover:bg-gold/10 transition-all">
                                    Activar "Hora de la Quimera" (x2 Gloria)
                                </button>
                            </div>
                        </div>

                        <div className="pt-12 space-y-6">
                            <div className="flex justify-between items-center text-[10px] tracking-widest uppercase text-gray-500">
                                <span>Salas Activas</span>
                                <span className="animate-pulse text-gold">Real-time Feed</span>
                            </div>
                            <div className="h-64 border border-white/5 bg-black/40 p-6 font-mono text-[9px] text-green-500 overflow-y-auto space-y-2">
                                <p>[SYSTEM] Session Initialized...</p>
                                <p>[AUTH] Architect Verified.</p>
                                <p>[ARENA] Room ID: 0x82... STATUS: WAITING</p>
                                <p>[ARENA] Room ID: 0x14... STATUS: ACTIVE (34 Participants)</p>
                                <p className="animate-pulse">_</p>
                            </div>
                        </div>
                    </div>

                    {/* Economy & Treasury Control */}
                    <div className="royal-card p-12 bg-white/[0.01] border-white/5 space-y-12">
                         <header className="flex items-center gap-4">
                            <Zap size={18} className="text-gold" />
                            <h2 className="text-2xl font-serif italic text-white tracking-widest font-bold">Tesorería Real</h2>
                        </header>

                        <div className="space-y-8">
                             <div className="p-8 border-l-2 border-gold bg-gold/5 space-y-4">
                                <h4 className="text-xs font-bold tracking-widest uppercase text-gold">Inyección Global de Tinta</h4>
                                <p className="text-[10px] text-gray-500 leading-relaxed uppercase">Otorga un bono de tinta instantáneo a todos los ciudadanos del Cónclave.</p>
                                <div className="flex gap-4">
                                    <input type="number" placeholder="+50" className="bg-black/40 border border-white/10 px-4 py-2 text-[10px] w-24 outline-none focus:border-gold" />
                                    <button className="bg-gold text-black text-[9px] font-bold px-8 py-2 tracking-[0.3em] uppercase hover:bg-amber-400">Ejecutar Bono</button>
                                </div>
                             </div>

                              <div className="space-y-4 pt-12">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">— Inflación y Mercado —</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="royal-card p-6 bg-white/[0.02]">
                                        <p className="text-[9px] text-gray-500 uppercase">Costo Base de Inscripción</p>
                                        <p className="text-xl font-serif italic text-white mt-1">25 Tinta</p>
                                    </div>
                                    <div className="royal-card p-6 bg-white/[0.02]">
                                        <p className="text-[9px] text-gray-500 uppercase">Multiplicador de Recompensas</p>
                                        <p className="text-xl font-serif italic text-white mt-1">1.2x</p>
                                    </div>
                                </div>
                                <div className="pt-8">
                                    <a 
                                        href="/panel/tienda" 
                                        className="flex items-center justify-between p-6 border border-gold/40 bg-gold/5 group hover:bg-gold/10 transition-all"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold tracking-[0.2em] uppercase text-gold">Gestionar Catálogo del Mercado</p>
                                            <p className="text-[9px] text-gray-400 uppercase">Editar Ítems, Precios y Artefactos Reales</p>
                                        </div>
                                        <Hammer size={18} className="text-gold group-hover:rotate-12 transition-transform" />
                                    </a>
                                </div>
                              </div>
                        </div>
                    </div>
                </div>

                <footer className="pt-24 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 text-[9px] tracking-[0.5em] uppercase font-mono">
                    <p>© MMXXVI // Cuentistas Web: Power Layer v2.0</p>
                    <div className="flex gap-12">
                        <a href="/hub" className="hover:text-gold">Terminate Connection [ESC]</a>
                        <span className="text-gold">Shield: Active</span>
                    </div>
                </footer>
            </div>
            
            {/* HUD Overlay Scanline Effect */}
            <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        </main>
    );
}
