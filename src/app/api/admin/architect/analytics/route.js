import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.rol !== "ARCHITECT") {
            return NextResponse.json({ ok: false, error: "Denegado" }, { status: 403 });
        }

        // 1. Usuarios por Casa
        const usersByHouse = await prisma.user.groupBy({
            by: ['casa'],
            _count: { id: true }
        });

        // 2. Tasa de Conversión (Usuarios con UserItem vs Total)
        const totalUsers = await prisma.user.count();
        const buyers = await prisma.userItem.groupBy({
            by: ['userId'],
        });
        const conversionRate = (buyers.length / totalUsers) * 100;

        // 3. Actividad Reciente (Últimas 24h)
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activeToday = await prisma.user.count({
            where: {
                updatedAt: { gte: last24h }
            }
        });

        // 4. Últimos Logs de Auditoría
        const recentLogs = await prisma.auditLog.findMany({
            include: { admin: { select: { username: true } } },
            orderBy: { timestamp: "desc" },
            take: 10
        });

        return NextResponse.json({ 
            ok: true, 
            analytics: {
                houseDistribution: usersByHouse,
                conversionRate: conversionRate.toFixed(2),
                totalUsers,
                activeToday
            },
            recentLogs
        });

    } catch (error) {
        console.error("Analytics API Error:", error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
