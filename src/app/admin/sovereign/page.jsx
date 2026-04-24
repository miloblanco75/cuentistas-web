"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, Sword, Zap, AlertTriangle, ShieldCheck } from "lucide-react";
import { COMBAT_FLAGS } from "@/lib/flags";

/**
 * 👑 SOVEREIGN DASHBOARD - IMPERIAL ANALYTICS (PHASE 19)
 * La cabina de mando para el Arquitecto.
 */
export default function SovereignDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // En un escenario real, cargaríamos datos agregados del API
        const mockData = {
            arpu: "$12.45",
            replayRate: "68%",
            topTrigger: "OVERTAKE (42%)",
            dangerZones: [
                { msg: "Alta tasa de abandono en Liga Bronce", severity: "high" },
                { msg: "Descenso de compras de Ink Powers (-5%)", severity: "medium" }
            ],
            leagueDistribution: [
                { name: "Ceniza", val: 45 },
                { name: "Oro", val: 12 },
                { name: "Trono", val: 1.5 }
            ]
        };
        setTimeout(() => { setData(mockData); setLoading(false); }, 800);
    }, []);

    if (!COMBAT_FLAGS.sovereign_dashboard_enabled) return <div className="p-20 text-white/20">Acceso restringido por el Tribunal.</div>;

    return (
        <main className="min-h-screen bg-[#050508] text-white p-12 space-y-12 animate-elegant">
            <header className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-serif italic text-gold">El Ojo del Soberano</h1>
                    <p className="text-[10px] tracking-[0.4em] uppercase text-white/40 font-black mt-2">Imperial Analytics System v1.0</p>
                </div>
                <div className="bg-gold/10 px-6 py-2 rounded-full border border-gold text-gold text-[10px] font-black tracking-widest uppercase">
                    Imperio Estable
                </div>
            </header>

            {/* CUADRANTES DE GUERRA */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard title="ARPU Real" val={data?.arpu} icon={Zap} trend="+1.2%" />
                <MetricCard title="Tasa de Replay" val={data?.replayRate} icon={Sword} trend="+5%" color="border-cyan-500/30" />
                <MetricCard title="Conversión Trigger" val={data?.topTrigger} icon={TrendingUp} />
                <MetricCard title="Habitantes Activos" val="3.4k" icon={Users} trend="-0.4%" />
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* ALERTAS DE PELIGRO */}
                <section className="space-y-6">
                    <h3 className="text-[10px] tracking-[0.5em] uppercase text-rose-500 font-black">Alertas de Peligro</h3>
                    <div className="space-y-4">
                        {data?.dangerZones.map((z, i) => (
                            <div key={i} className={`p-6 rounded-2xl border flex items-center gap-6 ${z.severity === 'high' ? 'bg-rose-950/20 border-rose-500/30' : 'bg-amber-950/20 border-amber-500/30'}`}>
                                <AlertTriangle className={z.severity === 'high' ? 'text-rose-500' : 'text-amber-500'} />
                                <p className="text-sm font-medium">{z.msg}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* DISTRIBUCIÓN DE JERARQUÍA */}
                <section className="space-y-6">
                    <h3 className="text-[10px] tracking-[0.5em] uppercase text-cyan-500 font-black">Mapa de Jerarquía (%)</h3>
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                        {data?.leagueDistribution.map(l => (
                            <div key={l.name} className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                    <span>{l.name}</span>
                                    <span className="text-white/40">{l.val}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000" style={{ width: `${l.val}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <footer className="pt-12 border-t border-white/5 opacity-20 text-center text-[8px] tracking-[1em] uppercase">
                Gobernando por la evidencia, no por la intuición.
            </footer>
        </main>
    );
}

function MetricCard({ title, val, icon: Icon, trend, color = "border-white/5" }) {
    return (
        <div className={`bg-white/5 border rounded-3xl p-8 space-y-4 ${color}`}>
            <div className="flex justify-between items-start">
                <Icon size={20} className="text-white/40" />
                {trend && <span className="text-[8px] font-black px-2 py-0.5 bg-white/10 rounded-full">{trend}</span>}
            </div>
            <div className="space-y-1">
                <p className="text-[9px] tracking-widest uppercase text-white/40 font-bold">{title}</p>
                <p className="text-3xl font-serif italic text-white">{val}</p>
            </div>
        </div>
    );
}
