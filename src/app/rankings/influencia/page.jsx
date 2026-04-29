import prisma from "@/lib/db";
import Link from "next/link";
import { Users, Crown, Feather, Shield } from "lucide-react";

export const metadata = {
    title: "Cónclave de Expansión — Cuentistas",
    description: "Quienes han traído más talento al Tribunal. El Leaderboard de Influencia.",
    revalidate: 300
};

const INFLUENCE_TIERS = [
    { min: 15, titulo: "El Heraldo del Tribunal",      icon: "⚜️", color: "text-yellow-500", badge: "border-yellow-500/50 bg-yellow-500/5"  },
    { min: 5,  titulo: "Portador de Nuevas Plumas",    icon: "🪶", color: "text-purple-400", badge: "border-purple-500/40 bg-purple-500/5"  },
    { min: 1,  titulo: "El Invocador",                  icon: "🔮", color: "text-blue-400",   badge: "border-blue-500/40 bg-blue-500/5"     },
];

function getTier(count) {
    return INFLUENCE_TIERS.find(t => count >= t.min) || null;
}

export default async function InfluenciaLeaderboardPage() {
    const evangelistas = await prisma.user.findMany({
        where: { successfulReferrals: { gte: 1 } },
        select: {
            id: true,
            username: true,
            nombre: true,
            successfulReferrals: true,
            elo: true,
            rank: true,
            victorias: true
        },
        orderBy: { successfulReferrals: "desc" },
        take: 50
    });

    return (
        <main className="min-h-screen bg-[#050505] text-white p-10 md:p-28 animate-elegant">
            <div className="max-w-5xl mx-auto space-y-40">

                <header className="space-y-8">
                    <p className="text-[10px] tracking-[0.8em] uppercase text-gold font-light">— Cónclave de Expansión —</p>
                    <h1 className="text-7xl md:text-9xl font-light tracking-tighter text-white font-serif italic uppercase leading-none">
                        Evangelistas
                    </h1>
                    <p className="text-gray-500 font-serif italic text-xl max-w-2xl leading-relaxed">
                        Quienes han traído talento real al Tribunal. No por dinero. Por orgullo. Por tribu.
                    </p>
                    <div className="h-[1px] bg-white/5 w-full"></div>
                </header>

                {/* HITOS DE INFLUENCIA */}
                <section className="space-y-8">
                    <h2 className="text-[10px] tracking-[0.6em] uppercase text-gray-500">Títulos por Influencia</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {INFLUENCE_TIERS.map(tier => (
                            <div key={tier.titulo} className={`royal-card p-8 border ${tier.badge} text-center space-y-4`}>
                                <span className="text-4xl">{tier.icon}</span>
                                <p className={`text-[11px] tracking-widest uppercase font-black ${tier.color}`}>{tier.titulo}</p>
                                <p className="text-[9px] tracking-widest text-gray-600 uppercase">{tier.min}+ referidos válidos</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* LEADERBOARD */}
                <section className="space-y-6">
                    <h2 className="text-[10px] tracking-[0.6em] uppercase text-gray-500">Portadores de Nuevas Voces</h2>

                    {evangelistas.length === 0 ? (
                        <div className="royal-card p-20 text-center border-white/5">
                            <p className="text-gray-600 italic font-serif text-lg">El Tribunal aguarda a los primeros evangelistas.</p>
                            <p className="text-gray-700 text-sm mt-4">Comparte una obra. El Tribunal recordará quién trajo el talento.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {evangelistas.map((user, idx) => {
                                const tier = getTier(user.successfulReferrals);
                                return (
                                    <div key={user.id} className={`royal-card p-6 flex items-center justify-between gap-6 border-white/5 hover:border-gold/20 transition-all ${idx === 0 ? 'border-yellow-500/20 bg-yellow-500/[0.02]' : ''}`}>
                                        <div className="flex items-center gap-6">
                                            {/* Posición */}
                                            <span className={`text-3xl font-mono font-light w-10 text-center ${idx === 0 ? 'text-gold' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-700' : 'text-gray-700'}`}>
                                                {idx + 1}
                                            </span>
                                            
                                            {/* Identidad */}
                                            <div>
                                                <p className="font-serif italic text-white/90 text-lg">{user.nombre || user.username}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[9px] text-gray-600 tracking-widest uppercase font-sans">{user.rank}</span>
                                                    <span className="text-[9px] text-gold/60">ELO {user.elo}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            {/* Título de influencia */}
                                            {tier && (
                                                <span className={`hidden md:flex items-center gap-2 text-[9px] tracking-widest uppercase font-black px-3 py-1.5 rounded border ${tier.badge} ${tier.color}`}>
                                                    {tier.icon} {tier.titulo}
                                                </span>
                                            )}
                                            
                                            {/* Contador */}
                                            <div className="text-right">
                                                <p className="text-2xl font-mono font-light text-white/90">{user.successfulReferrals}</p>
                                                <p className="text-[8px] tracking-widest uppercase text-gray-600">convocados</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* NOTA SOBRE CALIDAD FUTURA */}
                <section className="royal-card p-12 border-white/5 space-y-4 opacity-60">
                    <p className="text-[9px] tracking-[0.5em] uppercase text-gray-600">Arquitectura Futura</p>
                    <p className="text-sm font-serif italic text-gray-500 leading-relaxed">
                        Próximamente: El ranking pesará no solo el volumen de invocados, sino la calidad del talento traído. 
                        Si tus referidos ganan concursos, tu influencia vale más que la de quienes solo trajeron espectadores.
                    </p>
                </section>

                <div className="flex justify-center">
                    <Link href="/rankings" className="text-[9px] tracking-[0.5em] uppercase text-gray-600 hover:text-gold transition-colors">
                        ← Volver a los Anales
                    </Link>
                </div>
            </div>
        </main>
    );
}
