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

    const { winnerId, contestId } = await req.json();
    const userId = session.user.id;

    try {
        await prisma.$transaction(async (tx) => {
            const isWinner = userId === winnerId;

            // 1. Actualizar Rachas
            const user = await tx.user.findUnique({ where: { id: userId } });
            
            let newWinStreak = isWinner ? (user.winStreak || 0) + 1 : 0;
            let newLossStreak = !isWinner ? (user.lossStreak || 0) + 1 : 0;

            // 2. Registrar Némesis (Si alguien te gana 2 veces)
            let currentNemesis = user.nemesisId;
            if (!isWinner && winnerId) {
                if (user.lastRivalId === winnerId) {
                    currentNemesis = winnerId;
                }
            }

            await tx.user.update({
                where: { id: userId },
                data: {
                    winStreak: newWinStreak,
                    lossStreak: newLossStreak,
                    lastRivalId: isWinner ? null : winnerId,
                    nemesisId: currentNemesis
                }
            });
        });

        return NextResponse.json({ ok: true, message: "Memoria de Arena actualizada" });
    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
