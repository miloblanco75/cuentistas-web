import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.rol !== "ARCHITECT") {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
        }

        const [intents, users, recentPurchases] = await Promise.all([
            prisma.purchaseIntent.findMany({
                include: { user: { select: { streak: true, totalSpent: true } } }
            }),
            prisma.user.findMany({
                where: { totalSpent: { gt: 0 } },
                select: { id: true, totalSpent: true, name: true, email: true, lastParticipation: true, updatedAt: true }
            }),
            prisma.inventory.findMany({
                where: { tiendaItem: { tipo: "tinta" }, adquiridoEl: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) } },
                include: { user: { select: { id: true, name: true, entradas: { take: 1, orderBy: { timestamp: 'desc' } } } } }
            })
        ]);

        const totalRevenue = users.reduce((sum, u) => sum + u.totalSpent, 0);
        const arpu = users.length > 0 ? totalRevenue / users.length : 0;
        const whales = users.filter(u => u.totalSpent >= 500).sort((a, b) => b.totalSpent - a.totalSpent);
        
        // Churn Risk: Bought ink in last 48h but no new entries since then
        const churnRisks = recentPurchases.filter(p => {
             const lastEntry = p.user.entradas[0];
             return !lastEntry || lastEntry.timestamp < p.adquiridoEl;
        }).map(p => ({ id: p.user.id, name: p.user.name }));

        const summary = {
            revenue: {
                total: totalRevenue,
                arpu: arpu.toFixed(2),
                whaleCount: whales.length
            },
            interaction: {
                totalIntents: intents.length,
                notifications: intents.filter(i => i.wantsNotification).length,
                segments: {
                    RED: intents.filter(i => i.intentLevel >= 4 || i.user.streak >= 3).length,
                    YELLOW: intents.filter(i => i.intentLevel >= 2 && i.intentLevel < 4).length,
                    GREEN: intents.filter(i => i.intentLevel < 2).length
                }
            },
            whales: whales.slice(0, 5), // Top 5
            churnWarning: churnRisks.length
        };

        return NextResponse.json({ 
            ok: true, 
            summary,
            recommendation: summary.revenue.whaleCount > 0 
                ? "🐋 WHALE ALERT: Tienes usuarios de alto valor. Considera eventos VIP." 
                : "🚀 CRECIMIENTO: El ARPU está en desarrollo. Enfócate en la primera conversión."
        });

    } catch (error) {
        return NextResponse.json({ ok: false, error: "Error de servidor" }, { status: 500 });
    }
}
