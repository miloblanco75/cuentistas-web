import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Prestige Engine Dashboard — Admin" };

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "ermiloblanco75@gmail.com";

function KPI({ label, value, sub, color = "text-white" }) {
    return (
        <div className="border border-white/5 rounded p-6 space-y-1 bg-[#080810]">
            <p className="text-[8px] tracking-[0.5em] uppercase text-gray-600">{label}</p>
            <p className={`text-4xl font-mono font-light ${color}`}>{value}</p>
            {sub && <p className="text-[9px] text-gray-600 italic">{sub}</p>}
        </div>
    );
}

export default async function PrestigeEngineDashboard() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.email !== ADMIN_EMAIL) redirect("/hub");

    const [
        sealShown,
        sealShared,
        referralClicks,
        referralRegistered,
        referralArena,
        rankUnlocked,
        shareByPlatform,
        topInvocadores,
        recentEvents,
        emocionesCounts,
        avgSecondsToShare
    ] = await Promise.all([
        prisma.referralEvent.count({ where: { event: "seal_shown", NOT: { metadata: { path: ['source'], equals: 'prestige_survey' } } } }),
        prisma.referralEvent.count({ where: { event: "seal_shared" } }),
        prisma.referralEvent.count({ where: { event: "referral_click" } }),
        prisma.referralEvent.count({ where: { event: "referral_registered" } }),
        prisma.referralEvent.count({ where: { event: "referral_arena" } }),
        prisma.referralEvent.count({ where: { event: "rank_unlocked" } }),
        prisma.referralEvent.groupBy({
            by: ["platform"],
            where: { event: "seal_shared" },
            _count: { platform: true },
            orderBy: { _count: { platform: "desc" } }
        }),
        prisma.user.findMany({
            where: { successfulReferrals: { gte: 1 } },
            select: { username: true, successfulReferrals: true, influenceRank: true, elo: true },
            orderBy: { successfulReferrals: "desc" },
            take: 10
        }),
        prisma.referralEvent.findMany({
            orderBy: { createdAt: "desc" },
            take: 30
        }),
        // Emociones del survey
        prisma.referralEvent.findMany({
            where: { metadata: { path: ['source'], equals: 'prestige_survey' } },
            select: { metadata: true }
        }),
        prisma.referralEvent.findMany({
            where: { event: "seal_shared", NOT: { metadata: { equals: null } } },
            select: { metadata: true }
        })
    ]);

    const shareRate = sealShown > 0 ? ((sealShared / sealShown) * 100).toFixed(1) : 0;
    const regRate = referralClicks > 0 ? ((referralRegistered / referralClicks) * 100).toFixed(1) : 0;
    const actRate = referralRegistered > 0 ? ((referralArena / referralRegistered) * 100).toFixed(1) : 0;

    // Time to Share
    const seconds = (avgSecondsToShare as Array<{ metadata: Record<string, unknown> | null }>)
        .map(e => (e.metadata as Record<string, number>)?.secondsToShare)
        .filter((s): s is number => typeof s === 'number' && s > 0);
    const avgTTS = seconds.length > 0 ? Math.round(seconds.reduce((a, b) => a + b, 0) / seconds.length) : null;
    const fmtTTS = avgTTS ? (avgTTS < 60 ? `${avgTTS}s` : avgTTS < 3600 ? `${Math.round(avgTTS/60)}min` : `${Math.round(avgTTS/3600)}h`) : "—";

    // Emociones
    const emociones: Record<string, number> = {};
    (emocionesCounts as Array<{ metadata: Record<string, unknown> | null }>).forEach(e => {
        const em = (e.metadata as Record<string, string>)?.emocion;
        if (em) emociones[em] = (emociones[em] || 0) + 1;
    });
    const topEmocion = Object.entries(emociones).sort((a, b) => b[1] - a[1])[0];

    // Veredicto
    const verdict = Number(actRate) >= 30
        ? { text: "ESCALAR", color: "text-green-400", bg: "border-green-500/30 bg-green-500/5" }
        : Number(actRate) >= 15
        ? { text: "OPTIMIZAR", color: "text-yellow-500", bg: "border-yellow-500/30 bg-yellow-500/5" }
        : { text: "CORREGIR ANTES DE ESCALAR", color: "text-red-400", bg: "border-red-500/30 bg-red-500/5" };

    return (
        <main className="min-h-screen bg-[#030305] text-white p-8 md:p-16 space-y-16">
            <header className="space-y-4 border-b border-white/5 pb-8">
                <p className="text-[9px] tracking-[0.7em] uppercase text-gray-600">— FASE 7 — Prestige Engine —</p>
                <h1 className="text-5xl font-mono font-light text-white tracking-tight">Loop Validation Dashboard</h1>
                <p className="text-gray-600 text-sm font-mono">Tiempo real · Solo Soberano Arquitecto</p>
            </header>

            {/* VEREDICTO */}
            <div className={`border rounded p-8 text-center space-y-2 ${verdict.bg}`}>
                <p className="text-[9px] tracking-[0.6em] uppercase text-gray-500">Veredicto Actual</p>
                <p className={`text-4xl font-black tracking-widest uppercase ${verdict.color}`}>{verdict.text}</p>
                <p className="text-[9px] text-gray-600">Basado en activationRate = {actRate}%</p>
            </div>

            {/* KPIs PRINCIPALES */}
            <section className="space-y-4">
                <h2 className="text-[9px] tracking-[0.5em] uppercase text-gray-600">KPIs del Loop</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KPI label="Sellos Mostrados" value={sealShown} sub="seal_shown" />
                    <KPI label="Sellos Compartidos" value={sealShared} sub="seal_shared" />
                    <KPI label="Share Rate" value={`${shareRate}%`} sub="≥40% = excelente" color={Number(shareRate) >= 40 ? "text-green-400" : Number(shareRate) >= 20 ? "text-yellow-400" : "text-red-400"} />
                    <KPI label="Time to Share" value={fmtTTS} sub="promedio" color={avgTTS && avgTTS < 600 ? "text-green-400" : "text-yellow-400"} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KPI label="Referral Clicks" value={referralClicks} sub="referral_click" />
                    <KPI label="Registros" value={referralRegistered} sub="referral_registered" />
                    <KPI label="Registration Rate" value={`${regRate}%`} sub="≥25% = excelente" color={Number(regRate) >= 25 ? "text-green-400" : Number(regRate) >= 15 ? "text-yellow-400" : "text-red-400"} />
                    <KPI label="Arena Activations" value={referralArena} sub="referral_arena" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KPI label="Activation Rate" value={`${actRate}%`} sub="≥30% = escalar" color={Number(actRate) >= 30 ? "text-green-400" : Number(actRate) >= 15 ? "text-yellow-400" : "text-red-400"} />
                    <KPI label="Ranks Unlocked" value={rankUnlocked} sub="rank_unlocked" color="text-yellow-500" />
                    <KPI label="Emoción Dominante" value={topEmocion ? topEmocion[0].replace("_", " ") : "—"} sub={topEmocion ? `${topEmocion[1]} respuestas` : "sin datos"} color="text-purple-400" />
                    <KPI label="Top Invocadores" value={topInvocadores.length} sub="con ≥1 referido" color="text-blue-400" />
                </div>
            </section>

            {/* PLATAFORMA DOMINANTE */}
            {shareByPlatform.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-[9px] tracking-[0.5em] uppercase text-gray-600">Share por Plataforma</h2>
                    <div className="flex flex-wrap gap-4">
                        {shareByPlatform.map(p => (
                            <div key={p.platform} className="border border-white/5 rounded px-6 py-4 bg-[#080810] text-center">
                                <p className="text-2xl font-mono text-white">{p._count.platform}</p>
                                <p className="text-[9px] uppercase tracking-widest text-gray-600 mt-1">{p.platform || "—"}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* TOP INVOCADORES */}
            {topInvocadores.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-[9px] tracking-[0.5em] uppercase text-gray-600">Evangelistas Activos</h2>
                    <div className="space-y-2">
                        {topInvocadores.map((u, i) => (
                            <div key={u.username} className="flex items-center justify-between border border-white/5 rounded px-6 py-3 bg-[#080810]">
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-700 font-mono w-6">{i + 1}</span>
                                    <div>
                                        <p className="font-mono text-white text-sm">{u.username}</p>
                                        <p className="text-[9px] text-gray-600">{u.influenceRank} · ELO {u.elo}</p>
                                    </div>
                                </div>
                                <span className="text-gold font-mono text-xl">{u.successfulReferrals}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* EVENTOS RECIENTES */}
            <section className="space-y-4">
                <h2 className="text-[9px] tracking-[0.5em] uppercase text-gray-600">Eventos Recientes (30)</h2>
                <div className="space-y-1 font-mono text-[10px]">
                    {recentEvents.map(e => (
                        <div key={e.id} className="flex items-center gap-4 text-gray-600 border-b border-white/3 pb-1">
                            <span className="text-gray-800 w-36 shrink-0">{new Date(e.createdAt).toLocaleString("es-MX", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                            <span className={`w-32 shrink-0 ${e.event === 'seal_shared' ? 'text-green-600' : e.event === 'referral_arena' ? 'text-gold' : 'text-gray-600'}`}>{e.event}</span>
                            <span className="text-gray-700">{e.invocador || "—"}</span>
                            {e.platform && <span className="text-purple-700">[{e.platform}]</span>}
                        </div>
                    ))}
                    {recentEvents.length === 0 && <p className="text-gray-700 italic">Aún no hay eventos. La prueba no ha comenzado.</p>}
                </div>
            </section>
        </main>
    );
}
