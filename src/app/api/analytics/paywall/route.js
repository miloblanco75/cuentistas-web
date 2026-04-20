import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/analytics/paywall
// Registra eventos de comportamiento en el Paywall emocional.
// Eventos: paywall_viewed | paywall_clicked | paywall_dismissed
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await request.json();
        const { event, contestId, tintaMissing, variantShown, itemId, context } = body;

        const userId = session?.user?.id || "anonymous";

        // Guardar en PurchaseIntent si es un evento con intención real
        if (event === "paywall_viewed" || event === "paywall_clicked") {
            if (userId !== "anonymous") {
                // Upsert la intención de compra para este concurso
                const existing = await prisma.purchaseIntent.findFirst({
                    where: { userId, contestId: contestId || undefined }
                });

                if (existing) {
                    await prisma.purchaseIntent.update({
                        where: { id: existing.id },
                        data: {
                            intentLevel: { increment: event === "paywall_clicked" ? 2 : 1 },
                            tintaMissing: tintaMissing || existing.tintaMissing,
                            contexto: {
                                ...((existing.contexto) || {}),
                                lastEvent: event,
                                variantShown,
                                context,
                                timestamp: new Date().toISOString(),
                            }
                        }
                    });
                } else {
                    await prisma.purchaseIntent.create({
                        data: {
                            userId,
                            contestId: contestId || null,
                            itemId: itemId || null,
                            tintaMissing: tintaMissing || 0,
                            intentLevel: event === "paywall_clicked" ? 2 : 1,
                            contexto: {
                                firstEvent: event,
                                variantShown,
                                context,
                                timestamp: new Date().toISOString(),
                            }
                        }
                    });
                }
            }
        }

        // Siempre devolver OK — no bloquear la UI por analytics
        return NextResponse.json({ ok: true });

    } catch (error) {
        // Analytics nunca debe romper el flujo principal
        console.error("[Analytics/Paywall] Error:", error.message);
        return NextResponse.json({ ok: true });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/paywall
// Devuelve métricas agregadas del paywall para el panel de Arquitecto.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.rol !== "ARCHITECT") {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
        }

        // Últimos 30 días
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const intents = await prisma.purchaseIntent.findMany({
            where: { timestamp: { gte: since } },
            select: {
                intentLevel: true,
                tintaMissing: true,
                contexto: true,
                timestamp: true,
                contestId: true,
            }
        });

        // Agrupar por variante mostrada
        const byVariant = {};
        let totalViews = 0;
        let totalClicks = 0;

        for (const intent of intents) {
            const ctx = intent.contexto || {};
            const variant = ctx.variantShown || "unknown";
            if (!byVariant[variant]) byVariant[variant] = { views: 0, clicks: 0 };

            if (ctx.lastEvent === "paywall_viewed" || ctx.firstEvent === "paywall_viewed") {
                byVariant[variant].views++;
                totalViews++;
            }
            if (ctx.lastEvent === "paywall_clicked" || intent.intentLevel >= 2) {
                byVariant[variant].clicks++;
                totalClicks++;
            }
        }

        const variants = Object.entries(byVariant).map(([variant, data]) => ({
            variant,
            views: data.views,
            clicks: data.clicks,
            ctr: data.views > 0 ? ((data.clicks / data.views) * 100).toFixed(1) + "%" : "0%"
        })).sort((a, b) => b.clicks - a.clicks);

        const avgTintaMissing = intents.length > 0
            ? Math.round(intents.reduce((acc, i) => acc + i.tintaMissing, 0) / intents.length)
            : 0;

        return NextResponse.json({
            ok: true,
            summary: {
                totalViews,
                totalClicks,
                overallCTR: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) + "%" : "0%",
                avgTintaMissing,
                periodDays: 30,
            },
            variants
        });

    } catch (error) {
        console.error("[Analytics/Paywall] GET Error:", error.message);
        return NextResponse.json({ ok: false, error: "Error de servidor" }, { status: 500 });
    }
}
