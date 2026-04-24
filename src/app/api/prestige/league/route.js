import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { COMBAT_FLAGS } from "@/lib/flags";

/**
 * 👑 PRESTIGE LEAGUE ENGINE (PHASE 17)
 * Clasifica a los usuarios en las 7 ligas sagradas según su ELO.
 */

const LEAGUES = [
    { name: "Ceniza", min: 0, max: 800, color: "#4B5563" },
    { name: "Bronce", min: 801, max: 1100, color: "#92400E" },
    { name: "Plata", min: 1101, max: 1400, color: "#94A3B8" },
    { name: "Oro", min: 1401, max: 1700, color: "#F59E0B" },
    { name: "Obsidiana", min: 1701, max: 2000, color: "#111827" },
    { name: "Corona", min: 2001, max: 2400, color: "#8B5CF6" },
    { name: "Trono", min: 2401, max: 9999, color: "#EF4444" }
];

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || !COMBAT_FLAGS.league_system_enabled) {
        return NextResponse.json({ ok: false }, { status: 403 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { elo: true, currentLeague: true }
        });

        const elo = user.elo || 500;
        const league = LEAGUES.find(l => elo >= l.min && elo <= l.max) || LEAGUES[0];
        
        let status = "STABLE";
        if (user.currentLeague && user.currentLeague !== league.name) {
            status = elo > (LEAGUES.find(l => l.name === user.currentLeague)?.max || 0) ? "ASCENDED" : "DESCENDED";
            
            // Actualizar en DB para evitar repetición de ceremonia
            await prisma.user.update({
                where: { id: session.user.id },
                data: { currentLeague: league.name }
            });
        }

        return NextResponse.json({
            ok: true,
            elo,
            league: league.name,
            leagueColor: league.color,
            status,
            ceremonyRequired: status !== "STABLE"
        });

    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
