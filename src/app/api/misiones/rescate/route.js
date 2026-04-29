import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
        }

        const userId = session.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ ok: false, error: "Usuario no encontrado" }, { status: 404 });
        }

        // Regla 1: Debe estar pobre (tinta < 5)
        if (user.tinta >= 5) {
            return NextResponse.json({ 
                ok: false, 
                error: "Tu tintero aún tiene tinta. El rescate es solo para los desamparados." 
            }, { status: 400 });
        }

        // Regla 2: Límite Diario (1 vez por día)
        const now = new Date();
        if (user.lastRescueAt) {
            const lastRescue = new Date(user.lastRescueAt);
            if (lastRescue.toDateString() === now.toDateString()) {
                return NextResponse.json({ 
                    ok: false, 
                    error: "El Tribunal ya te ha concedido clemencia hoy. Vuelve mañana." 
                }, { status: 400 });
            }
        }

        // Regla 3: Servicio al Tribunal (Debe haber votado 5 veces hoy)
        // En votingActions, el contador es `votosHoy` y se resetea a las 24 hrs.
        // Verificamos si hizo sus 5 votos.
        let votosRealizadosHoy = user.votosHoy;
        if (user.ultimoVotoReset) {
            const lastReset = new Date(user.ultimoVotoReset);
            const diffHours = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
            if (diffHours >= 24) {
                votosRealizadosHoy = 0; // Se resetearon, no ha votado hoy.
            }
        }

        if (votosRealizadosHoy < 5) {
            return NextResponse.json({ 
                ok: false, 
                error: `Aún no eres digno del rescate. Has emitido ${votosRealizadosHoy}/5 votos hoy. Sirve al Tribunal evaluando obras en la Galería.` 
            }, { status: 400 });
        }

        // Si cumple todas las reglas, ejecutamos el rescate atómico
        await prisma.$transaction(async (tx) => {
            // Re-validar por seguridad concurrente
            const txUser = await tx.user.findUnique({ where: { id: userId } });
            if (txUser.tinta >= 5) throw new Error("Abortado: Ya posees tinta suficiente.");
            if (txUser.lastRescueAt && txUser.lastRescueAt.toDateString() === now.toDateString()) {
                throw new Error("Abortado: Ya fuiste rescatado hoy.");
            }

            await tx.user.update({
                where: { id: userId },
                data: {
                    tinta: { increment: 5 },
                    rescatesUsados: { increment: 1 },
                    lastRescueAt: now
                }
            });
        });

        return NextResponse.json({ 
            ok: true, 
            message: "El Tribunal ha reconocido tu servicio. Recibes 5 gotas de Tinta para continuar tu ascenso." 
        });

    } catch (error) {
        console.error("Rescue Error:", error);
        return NextResponse.json({ ok: false, error: error.message || "Error interno del servidor" }, { status: 500 });
    }
}
