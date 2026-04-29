import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/analytics/referral-loop
// Registra eventos del loop viral para medir el Prestige Engine en el mundo real.
// Llamado desde el cliente en momentos clave: sello mostrado, compartir, etc.
// NO requiere autenticación — permite tracking de usuarios anónimos también.
//
// Eventos válidos:
//   "seal_shown"         → Prestige Seal apareció
//   "seal_shared"        → El usuario hizo click en compartir (incluye plataforma)
//   "referral_click"     → Alguien llegó desde un ?ref= link
//   "referral_registered"→ Alguien que llegó por referral se registró
//   "referral_arena"     → El referido entró a su primera Arena (Proof of Action)
//   "rank_unlocked"      → El invocador desbloqueó un nuevo influenceRank

export async function POST(req) {
    try {
        const body = await req.json();
        const { event, invocador, referido, platform, entradaId, metadata } = body;

        const VALID_EVENTS = [
            "seal_shown", "seal_shared", "referral_click",
            "referral_registered", "referral_arena", "rank_unlocked"
        ];

        if (!event || !VALID_EVENTS.includes(event)) {
            return NextResponse.json({ ok: false, error: "Invalid event" }, { status: 400 });
        }

        await prisma.referralEvent.create({
            data: {
                event,
                invocador: invocador || null,
                referido: referido || null,
                platform: platform || null,
                entradaId: entradaId || null,
                metadata: metadata || null,
            }
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        // Falla silenciosa — el tracking nunca debe interrumpir el UX principal
        console.error("referral-loop tracking error:", err.message);
        return NextResponse.json({ ok: true }); // 200 igual para no bloquear cliente
    }
}

// GET /api/analytics/referral-loop — Dashboard de métricas en tiempo real
// Solo accesible para ARCHITECT
export async function GET(req) {
    try {
        const { getServerSession } = await import("next-auth/next");
        const { authOptions } = await import("@/lib/auth");
        const session = await getServerSession(authOptions);

        // Solo admin puede ver las métricas brutas
        const adminEmail = process.env.ADMIN_EMAIL || "ermiloblanco75@gmail.com";
        if (!session || session.user.email !== adminEmail) {
            return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
        }

        const [
            sealShown,
            sealShared,
            referralClicks,
            referralRegistered,
            referralArena,
            rankUnlocked,
            shareByPlatform,
            recentEvents,
            topInvocadores
        ] = await Promise.all([
            prisma.referralEvent.count({ where: { event: "seal_shown" } }),
            prisma.referralEvent.count({ where: { event: "seal_shared" } }),
            prisma.referralEvent.count({ where: { event: "referral_click" } }),
            prisma.referralEvent.count({ where: { event: "referral_registered" } }),
            prisma.referralEvent.count({ where: { event: "referral_arena" } }),
            prisma.referralEvent.count({ where: { event: "rank_unlocked" } }),
            // Share por plataforma
            prisma.referralEvent.groupBy({
                by: ["platform"],
                where: { event: "seal_shared" },
                _count: { platform: true },
                orderBy: { _count: { platform: "desc" } }
            }),
            // Últimos 20 eventos
            prisma.referralEvent.findMany({
                orderBy: { createdAt: "desc" },
                take: 20
            }),
            // Top invocadores por impacto
            prisma.user.findMany({
                where: { successfulReferrals: { gte: 1 } },
                select: { username: true, successfulReferrals: true, influenceRank: true },
                orderBy: { successfulReferrals: "desc" },
                take: 10
            })
        ]);

        // KPIs calculados
        const shareRate = sealShown > 0 ? ((sealShared / sealShown) * 100).toFixed(1) : 0;
        const registrationRate = referralClicks > 0 ? ((referralRegistered / referralClicks) * 100).toFixed(1) : 0;
        const activationRate = referralRegistered > 0 ? ((referralArena / referralRegistered) * 100).toFixed(1) : 0;

        return NextResponse.json({
            ok: true,
            kpis: {
                sealShown,
                sealShared,
                shareRate: `${shareRate}%`,
                referralClicks,
                referralRegistered,
                registrationRate: `${registrationRate}%`,
                referralArena,
                activationRate: `${activationRate}%`,
                rankUnlocked,
            },
            shareByPlatform,
            topInvocadores,
            recentEvents,
            decision: activationRate >= 30
                ? "ESCALAR — El loop está vivo. Más del 30% de referidos entran a Arena."
                : "CORREGIR — El loop necesita optimización antes de escalar."
        });
    } catch (err) {
        console.error("referral-loop GET error:", err);
        return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
    }
}
