import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
    try {
        const { id } = params;

        const entrada = await prisma.entrada.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        username: true,
                        nombre: true,
                        image: true
                    }
                },
                concurso: {
                    select: {
                        titulo: true,
                        temaGeneral: true
                    }
                }
            }
        });

        if (!entrada) {
            return NextResponse.json({ ok: false, error: "Relato no encontrado" }, { status: 404 });
        }

        // Incrementar vistas de forma asíncrona (no bloqueante para UX)
        prisma.entrada.update({
            where: { id },
            data: { vistas: { increment: 1 } }
        }).catch(err => console.warn("⚠️ [PublicStory] Fallo al incrementar vistas:", err.message));

        return NextResponse.json({
            ok: true,
            entrada: {
                id: entrada.id,
                texto: entrada.texto,
                expertScore: entrada.expertScore,
                popularScore: entrada.popularScore,
                puntajeTotal: entrada.puntajeTotal,
                autor: entrada.user?.nombre || entrada.user?.username || entrada.participante,
                concurso: entrada.concurso?.titulo,
                tema: entrada.concurso?.temaGeneral,
                puesto: entrada.isFeatured ? "Destacado" : "Participante"
            }
        });

    } catch (error) {
        return NextResponse.json({ ok: false, error: "Error en el Tribunal" }, { status: 500 });
    }
}
