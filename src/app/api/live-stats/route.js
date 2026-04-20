import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const activeHumansCount = await prisma.user.count({
            where: {
                updatedAt: { gte: new Date(Date.now() - 1000 * 60 * 60) }
            }
        });

        const displayCount = Math.max(activeHumansCount, 15 + Math.floor(Math.random() * 8));

        return NextResponse.json({
            ok: true,
            stats: {
                activeHumans: displayCount,
                activeContest: "Cónclave Permanente",
                activeContestId: "arena-activa-default",
                hasActiveLive: false,
                topHouse: "lobo", // House with most activity for the Ticker
                serverTime: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error("[live-stats] Error:", error);
        return NextResponse.json({
            ok: true,
            stats: {
                activeHumans: 17,
                activeContest: "Cónclave Permanente",
                activeContestId: "arena-activa-default",
                hasActiveLive: false,
                topHouse: "lobo"
            }
        });
    }
}
