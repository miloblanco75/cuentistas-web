import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const { entradaId, tecnica, creatividad, impacto, mencionHonor, comentario } = await request.json();
    const userId = session.user.id;

    try {
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });
        
        // Solo Jueces, ARCHITECTS o Legendarios (1000+ XP)
        const isEligible = dbUser.rol === "JUDGE" || dbUser.rol === "ARCHITECT" || dbUser.puntos >= 1000;
        
        if (!isEligible) {
            return NextResponse.json({ ok: false, error: "No posees la autoridad para ser Custodio." }, { status: 403 });
        }

        // Registrar Juicio
        await prisma.$transaction(async (tx) => {
            await tx.voto.upsert({
                where: {
                    userId_entradaId_tipo: {
                        userId,
                        entradaId,
                        tipo: "EXPERTO"
                    }
                },
                update: { tecnica, creatividad, impacto, mencionHonor, comentario },
                create: {
                    userId,
                    entradaId,
                    tipo: "EXPERTO",
                    tecnica,
                    creatividad,
                    impacto,
                    mencionHonor,
                    comentario
                }
            });

            // Recalcular Expert_Score (Promedio de todos los jueces capado a 60)
            const allExpertVotes = await tx.voto.findMany({
                where: { entradaId, tipo: "EXPERTO" }
            });

            const sumScores = allExpertVotes.reduce((acc, v) => {
                const totalJudgePoints = (v.tecnica || 0) + (v.creatividad || 0) + (v.impacto || 0);
                // Cada juez da máx 30. Para llegar a máx 60 según fórmula, multiplicamos x 2
                return acc + (totalJudgePoints * 2);
            }, 0);

            const expertScore = sumScores / allExpertVotes.length;

            const entrada = await tx.entrada.findUnique({ where: { id: entradaId } });
            
            await tx.entrada.update({
                where: { id: entradaId },
                data: { 
                    expertScore,
                    puntajeTotal: (entrada.popularScore || 0) + expertScore
                }
            });

            // Notificación al autor
            await tx.mensaje.create({
                data: {
                    userId: entrada.userId,
                    texto: `🔔 Un Custodio ha emitido su juicio sobre tu Legado: "${entrada.concursoId}". Revisa tu obra en la Gran Galería.`
                }
            });
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Judgment failure:", error);
        return NextResponse.json({ ok: false, error: "Error al emitir juicio" }, { status: 500 });
    }
}
