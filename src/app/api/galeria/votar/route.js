import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { withTransactionRetry } from "@/lib/resilientDb";

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const { entradaId } = await request.json();
    const userId = session.user.id;

    try {
        // PHASE HOTFIX 9: MASTER RESILIENT VOTING
        await withTransactionRetry(async (tx) => {
            const user = await tx.user.findUnique({ 
                where: { id: userId },
                select: { votosHoy: true, ultimoVotoReset: true }
            });
            
            const now = new Date();
            const lastReset = user.ultimoVotoReset || new Date(0);
            const diffHours = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
            
            let currentVotosHoy = user.votosHoy;
            if (diffHours >= 24) {
                currentVotosHoy = 0;
            }

            if (currentVotosHoy >= 5) {
                throw new Error("LIMIT_REACHED");
            }

            // UNICA OPERACIÓN DE CREACIÓN
            await tx.voto.create({
                data: { userId, entradaId, tipo: "POPULAR" }
            });

            // ACTUALIZACIÓN DE ENTRADA (CÁLCULO ATÓMICO)
            const entrada = await tx.entrada.findUnique({ where: { id: entradaId }, select: { votos: true, expertScore: true } });
            const newVotos = (entrada.votos || 0) + 1;
            const newPopularScore = Math.min(newVotos, 40);

            await tx.entrada.update({
                where: { id: entradaId },
                data: { 
                    votos: newVotos,
                    popularScore: newPopularScore,
                    puntajeTotal: newPopularScore + (entrada.expertScore || 0)
                }
            });

            // ACTUALIZACIÓN DE USUARIO (RECOMPENSA)
            await tx.user.update({
                where: { id: userId },
                data: { 
                    votosHoy: currentVotosHoy + 1,
                    ultimoVotoReset: diffHours >= 24 ? now : undefined,
                    tinta: { increment: 1 }, // Recompensa por juicio
                    puntos: { increment: 5 } // Recompensa de Experiencia
                }
            });
        }, {
            maxRetries: 3,
            timeout: 25000
        });

        return Response.json({ ok: true });
    } catch (error) {
        console.error("❌ Voting Error (Hotfix 9):", error);
        if (error.message === "LIMIT_REACHED") {
            return Response.json({ ok: false, error: "Tinta de Voto agotada por hoy (Máx 5)" }, { status: 429 });
        }
        if (error.code === 'P2002') {
            return Response.json({ ok: false, error: "Ya has ofrecido tu laurel a esta obra." }, { status: 400 });
        }
        return Response.json({ ok: false, error: "El Tribunal está saturado. Reintenta en breve." }, { status: 503 });
    }
}
