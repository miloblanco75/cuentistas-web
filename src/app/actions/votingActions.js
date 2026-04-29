"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

import crypto from "crypto";

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

            // V9: GROWTH ENGINE - LÓGICA DE RECOMPENSAS
            if (user.referredBy && !user.referralRewardClaimed) {
                // V9: Obtener deviceHash para fortalecer idempotencia
                const { cookies } = await import("next/headers");
                const guestId = cookies().get("guestId")?.value;
                let deviceHash = "no-hw-sig";
                
                if (guestId) {
                    const gSession = await tx.guestSession.findUnique({ where: { guestId } });
                    if (gSession) deviceHash = gSession.deviceHash;
                }

                // Generar RewardKey para idempotencia (ID + Fecha para evitar duplicidad diaria por IP/Device)
                const dayKey = now.toISOString().split('T')[0];
                const inviter = await tx.user.findUnique({ where: { username: user.referredBy } });
                
                if (inviter) {
                    const rewardKey = crypto.createHash('sha256')
                        .update(`${inviter.id}-${userId}-${deviceHash}-${dayKey}`)
                        .digest('hex');

                    try {
                        // El RewardLog.create fallará si la key ya existe (idempotencia real)
                        await tx.rewardLog.create({ data: { rewardKey } });

                        // Otorgar Recompensas (Invitador)
                        await tx.user.update({
                            where: { id: inviter.id },
                            data: { 
                                tinta: { increment: 5 },
                                activeBoost: 0.05,
                                boostExpiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                            }
                        });

                        // Otorgar Recompensas (Invitado)
                        await tx.user.update({
                            where: { id: userId },
                            data: { 
                                tinta: { increment: 5 },
                                activeBoost: 0.05,
                                boostExpiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                                referralRewardClaimed: true
                            }
                        });

                        console.log(`✅ [GrowthEngine] Recompensa otorgada por referido: ${user.referredBy} -> ${user.username}`);
                    } catch (err) {
                        // P2002 es error de duplicado en Prisma, lo ignoramos (idempotencia exitosa)
                        if (err.code !== 'P2002') {
                            console.error("❌ [GrowthEngine] Error al procesar recompensa:", err.message);
                        }
                    }
                }
            }
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
                data: { 
                    expertScore, 
                    puntajeTotal: (entrada.popularScore || 0) + expertScore
                }
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
