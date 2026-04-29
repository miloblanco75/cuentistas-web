import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ ok: false, error: "No session" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                entradasTotales: true,
                lastParticipation: true,
                lastReactivationAt: true,
                elo: true
            }
        });

        if (!user) {
            return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
        }

        const now = new Date();

        // VALIDACIÓN 1: El usuario debe tener al menos una entrada (NO SPAMEAR A LOS QUE SOLO CREARON CUENTA Y SE FUERON SIN HACER NADA NUNCA)
        if (user.entradasTotales === 0 || !user.lastParticipation) {
            return NextResponse.json({ ok: false, reason: "NOT_ELIGIBLE" });
        }

        // VALIDACIÓN 2: Debe llevar ausente al menos 7 días
        const daysSinceLastParticipation = (now - new Date(user.lastParticipation)) / (1000 * 60 * 60 * 24);
        if (daysSinceLastParticipation < 7) {
            return NextResponse.json({ ok: false, reason: "ACTIVE_USER" });
        }

        // VALIDACIÓN 3: Cooldown anti-abuso (14 días desde la última reactivación)
        if (user.lastReactivationAt) {
            const daysSinceLastReactivation = (now - new Date(user.lastReactivationAt)) / (1000 * 60 * 60 * 24);
            if (daysSinceLastReactivation < 14) {
                return NextResponse.json({ ok: false, reason: "ON_COOLDOWN" });
            }
        }

        // Aprobado para Reactivación
        // DETERMINAR SEGMENTO Y MENSAJE
        let mensaje = "";
        let tipo = "GENERAL";

        if (user.elo > 1200) {
            mensaje = "Tu rango está siendo cuestionado. El Tribunal exige que defiendas tu posición en la Arena.";
            tipo = "ELITE";
        } else if (user.entradasTotales > 10) {
            mensaje = "El vacío de tu pluma fue notado en la Ciudadela. La Arena te convoca nuevamente.";
            tipo = "VETERAN";
        } else if (user.entradasTotales <= 1) {
            mensaje = "El Oráculo registró tu ausencia. Aún tienes que demostrar que mereces estar aquí.";
            tipo = "ROOKIE";
        } else {
            mensaje = "El Tribunal detectó tu silencio. Tu Casa perdió territorio durante tu ausencia.";
            tipo = "STANDARD";
        }

        // APLICAR RECOMPENSA Y MARCAR REACTIVACIÓN ATÓMICAMENTE
        await prisma.user.update({
            where: { id: user.id },
            data: {
                tinta: { increment: 3 },
                lastReactivationAt: now
            }
        });

        return NextResponse.json({
            ok: true,
            reactivated: true,
            mensaje,
            tipo,
            recompensa: 3
        });

    } catch (error) {
        console.error("Reactivate Error:", error);
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
    }
}
