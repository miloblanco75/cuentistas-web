import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !['ARCHITECT', 'Maestro'].includes(session.user.rol)) {
            return NextResponse.json({ ok: false, error: "No autorizado para calificar" }, { status: 401 });
        }

        const { entradaId, calificacion, feedback } = await request.json();

        if (!entradaId) {
            return NextResponse.json({ ok: false, error: "ID de entrada requerido" }, { status: 400 });
        }

        const updated = await prisma.entrada.update({
            where: { id: entradaId },
            data: {
                calificacion: parseFloat(calificacion),
                feedback
            }
        });

        return NextResponse.json({ 
            ok: true, 
            message: "Calificación asentada correctamente",
            entrada: updated
        });

    } catch (e) {
        console.error("Error al calificar:", e);
        return NextResponse.json({ ok: false, error: "Error interno del Tribunal" }, { status: 500 });
    }
}
