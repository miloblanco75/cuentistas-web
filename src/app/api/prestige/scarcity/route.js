import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { COMBAT_FLAGS } from "@/lib/flags";

/**
 * 🥀 SCARCITY ENGINE (PHASE 18)
 * Gestiona la decadencia de prestigio y la obligación de defensa de corona.
 */

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || !COMBAT_FLAGS.scarcity_law_enabled) {
        return NextResponse.json({ ok: false }, { status: 403 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { 
                elo: true, 
                currentLeague: true, 
                lastDefendedAt: true,
                crownStatus: true 
            }
        });

        const now = new Date();
        const lastDefense = user.lastDefendedAt ? new Date(user.lastDefendedAt) : now;
        const daysSinceDefense = Math.floor((now - lastDefense) / (1000 * 60 * 60 * 24));

        let state = "ACTIVE";
        let message = null;
        let visualAtrophy = false;

        // Reglas de Escasez para Ligas Altas (Oro+)
        const HIGH_TIERS = ["Oro", "Obsidiana", "Corona", "Trono"];
        
        if (HIGH_TIERS.includes(user.currentLeague)) {
            if (daysSinceDefense >= 4 && daysSinceDefense < 7) {
                state = "WARNING";
                message = "El Tribunal empieza a olvidar tu nombre.";
            } else if (daysSinceDefense >= 7) {
                state = "DECAYING";
                message = "Tu influencia se desvanece. El olvido te reclama.";
                visualAtrophy = true;
            }
        }

        return NextResponse.json({
            ok: true,
            daysSinceDefense,
            state,
            message,
            visualAtrophy,
            mustDefend: daysSinceDefense >= 5
        });

    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
