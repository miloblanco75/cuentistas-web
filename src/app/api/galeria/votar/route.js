import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const { entradaId } = await request.json();
    const userId = session.user.id;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        
        // Reset votosHoy si ha pasado un día
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
            return NextResponse.json({ ok: false, error: "Tinta de Voto agotada por hoy (Máx 5)" }, { status: 429 });
        }

        // Registrar Voto
        await prisma.$transaction(async (tx) => {
            await tx.voto.create({
                data: {
                    userId,
                    entradaId,
                    tipo: "POPULAR"
                }
            });

            const entrada = await tx.entrada.findUnique({ where: { id: entradaId } });
            const newVotos = (entrada.votos || 0) + 1;
            // PopularScore: Suma capada a 40 para el ranking híbrido
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

        return NextResponse.json({ ok: true });
    } catch (error) {
        if (error.code === 'P2002') {
            return NextResponse.json({ ok: false, error: "Ya has ofrecido tu laurel a esta obra." }, { status: 400 });
        }
        return NextResponse.json({ ok: false, error: "Error al procesar voto" }, { status: 500 });
    }
}
