import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/entradas/unclaimed-seal
// Devuelve la primera entrada con premios y shareClaimed=false del usuario.
// Controlado: si no hay nada, devuelve null. El Hub lo usa para el Share Moment automático.
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ entrada: null });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) return NextResponse.json({ entrada: null });

        const entrada = await prisma.entrada.findFirst({
            where: {
                userId: user.id,
                shareClaimed: false,
                isTraining: false,
                // Solo si tiene al menos un galardón
                NOT: { premios: { isEmpty: true } }
            },
            select: {
                id: true,
                texto: true,
                premios: true,
                concursoId: true,
                concurso: { select: { titulo: true, status: true, temaExacto: true, temaGeneral: true } }
            },
            orderBy: { timestamp: "desc" }
        });

        // Solo disparar si el concurso está terminado (no mientras compite)
        if (!entrada || entrada.concurso?.status !== "finished") {
            return NextResponse.json({ entrada: null });
        }

        return NextResponse.json({ entrada });
    } catch (err) {
        console.error("unclaimed-seal error:", err);
        return NextResponse.json({ entrada: null });
    }
}
