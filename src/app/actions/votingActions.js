"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function castLaurelVote(entradaId) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        throw new Error("Autorización requerida");
    }

    const userId = session.user.id;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const now = new Date();
        const lastReset = user.ultimoVotoReset || new Date(0);
        const diffHours = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
        
        let votosHoy = user.votosHoy;
        if (diffHours >= 24) {
            votosHoy = 0;
            await prisma.user.update({
                where: { id: userId },
                data: { votosHoy: 0, ultimoVotoReset: now }
            });
        }

        if (votosHoy >= 5) {
            throw new Error("Tinta de Voto agotada por hoy (Máx 5)");
        }

        // Transacción Atómica
        await prisma.$transaction(async (tx) => {
            await tx.voto.create({
                data: { userId, entradaId, tipo: "POPULAR" }
            });

            const entrada = await tx.entrada.findUnique({ where: { id: entradaId } });
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

            await tx.user.update({
                where: { id: userId },
                data: { votosHoy: votosHoy + 1 }
            });
        });

        revalidatePath("/biblioteca");
        return { ok: true };
    } catch (e) {
        if (e.code === 'P2002') return { ok: false, error: "Ya has emitido tu voto" };
        return { ok: false, error: e.message };
    }
}

export async function castJudgeJudgment(data) {
    const { entradaId, tecnica, creatividad, impacto, mencionHonor, comentario } = data;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("No autorizado");

    const userId = session.user.id;

    try {
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });
        const isEligible = dbUser.rol === "JUDGE" || dbUser.rol === "ARCHITECT" || dbUser.puntos >= 1000;
        
        if (!isEligible) throw new Error("Solo los Eruditos pueden emitir juicios.");

        await prisma.$transaction(async (tx) => {
            await tx.voto.upsert({
                where: { userId_entradaId_tipo: { userId, entradaId, tipo: "EXPERTO" } },
                update: { tecnica, creatividad, impacto, mencionHonor, comentario },
                create: { userId, entradaId, tipo: "EXPERTO", tecnica, creatividad, impacto, mencionHonor, comentario }
            });

            const allExpertVotes = await tx.voto.findMany({ where: { entradaId, tipo: "EXPERTO" } });
            const sumScores = allExpertVotes.reduce((acc, v) => acc + ((v.tecnica + v.creatividad + v.impacto) * 2), 0);
            const expertScore = sumScores / allExpertVotes.length;

            const entrada = await tx.entrada.findUnique({ where: { id: entradaId } });
            await tx.entrada.update({
                where: { id: entradaId },
                data: { expertScore, puntajeTotal: (entrada.popularScore || 0) + expertScore }
            });

            // Notificación (opcional aquí, ya registrada en Prisma)
        });

        revalidatePath("/biblioteca");
        revalidatePath(`/autor/${session.user.username}`);
        return { ok: true };
    } catch (e) {
        return { ok: false, error: e.message };
    }
}
