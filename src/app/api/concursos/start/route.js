import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
        }

        const { contestId } = await request.json();
        const userId = session.user.id;

        // 1. Verificar si el concurso existe y está activo
        const concurso = await prisma.concurso.findUnique({
            where: { id: contestId },
            include: { entradas: { select: { id: true } } }
        });

        if (!concurso) {
            return NextResponse.json({ ok: false, error: "Cónclave no encontrado" }, { status: 404 });
        }

        if (concurso.status !== "active") {
            return NextResponse.json({ ok: false, error: "Las puertas del Cónclave aún están selladas" }, { status: 403 });
        }

        // ESCASED: Check max participants
        if (concurso.maxParticipants && concurso.entradas.length >= concurso.maxParticipants) {
            return NextResponse.json({ ok: false, error: "El Cónclave está lleno. No quedan cupos para este certamen." }, { status: 403 });
        }

        // 2. Buscar o crear Draft para registrar el inicio
        let draft = await prisma.draft.findUnique({
            where: { userId_concursoId: { userId, concursoId: contestId } }
        });

        if (!draft) {
            // RIESGO: Deduct Tinta if applicable
            if (concurso.costoTinta > 0) {
                const user = await prisma.user.findUnique({ where: { id: userId } });
                if (user.tinta < concurso.costoTinta) {
                    return NextResponse.json({ ok: false, error: "No tienes suficiente Tinta para entrar a este desafío." }, { status: 400 });
                }

                // Descuento de Tinta y Aumento de Premio (Pool)
                await prisma.$transaction([
                    prisma.user.update({
                        where: { id: userId },
                        data: { tinta: { decrement: concurso.costoTinta } }
                    }),
                    prisma.concurso.update({
                        where: { id: contestId },
                        data: { prizePool: { increment: concurso.costoTinta } }
                    })
                ]);
            }

            // Crear el draft con el timestamp de inicio
            draft = await prisma.draft.create({
                data: {
                    userId,
                    concursoId: contestId,
                    username: session.user.username || session.user.name,
                    texto: "",
                    startedAt: new Date()
                }
            });
        } else if (!draft.startedAt) {
            // Si el draft existía pero no tenía inicio, lo marcamos ahora
            draft = await prisma.draft.update({
                where: { id: draft.id },
                data: { startedAt: new Date() }
            });
        }

        return NextResponse.json({ 
            ok: true, 
            startedAt: draft.startedAt,
            duration: concurso.duration,
            costoTinta: concurso.costoTinta,
            prizePool: concurso.prizePool
        });

    } catch (error) {
        console.error("Error starting conclave:", error);
        return NextResponse.json({ ok: false, error: "Fallo en la conexión con el Tribunal" }, { status: 500 });
    }
}
