import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { COMBAT_FLAGS } from "@/lib/flags";

/**
 * 💀 AFTERMATH ENGINE (PHASE 16)
 * Procesa rivalidades, rachas y disparadores de revancha.
 */

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || !COMBAT_FLAGS.aftermath_enabled) {
        return NextResponse.json({ ok: false }, { status: 403 });
    }

    const { winnerId, contestId, margin } = await req.json();
    const userId = session.user.id;

    try {
        const result = await prisma.$transaction(async (tx) => {
            const isWinner = userId === winnerId;
            const user = await tx.user.findUnique({ where: { id: userId } });
            
            let newWinStreak = isWinner ? (user.winStreak || 0) + 1 : 0;
            let newLossStreak = !isWinner ? (user.lossStreak || 0) + 1 : 0;

            // 🔱 LÓGICA DE ESTRATEGIA (PSICOLOGÍA)
            let strategy = "STANDARD";
            if (!isWinner && margin < 5) strategy = "NEAR_MISS";
            if (!isWinner && margin >= 15) strategy = "CRUSHING";
            
            // 2. Registrar Némesis y Marcador
            let currentNemesis = user.nemesisId;
            let scoreVsRival = user.scoreVsLastRival || 0; // Ejemplo simplificado

            if (!isWinner && winnerId) {
                if (user.lastRivalId === winnerId) {
                    currentNemesis = winnerId;
                    scoreVsRival--; // Vas perdiendo contra él
                    strategy = "NEMESIS_FIGHT";
                } else {
                    scoreVsRival = -1; // Primer encuentro perdido
                }
            } else if (isWinner && user.lastRivalId) {
                 // Si ganaste contra tu rival anterior
                 scoreVsRival++;
            }

            const updated = await tx.user.update({
                where: { id: userId },
                data: {
                    winStreak: newWinStreak,
                    lossStreak: newLossStreak,
                    lastRivalId: isWinner ? (user.lastRivalId) : winnerId,
                    nemesisId: currentNemesis,
                    scoreVsLastRival: scoreVsRival
                }
            });

            return { strategy, scoreVsLastRival: scoreVsRival, winStreak: newWinStreak, lossStreak: newLossStreak };
        });

        return NextResponse.json({ ok: true, ...result });
    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
