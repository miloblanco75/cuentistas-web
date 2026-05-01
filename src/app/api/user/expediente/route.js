import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
        }

        const userId = session.user.id;

        const expediente = await prisma.entrada.findMany({
            where: { userId: userId },
            include: {
                concurso: {
                    select: {
                        titulo: true,
                        temaExacto: true,
                        isExamen: true,
                        startTime: true
                    }
                }
            },
            orderBy: { timestamp: 'desc' }
        });

        // Filtrar y formatear para el alumno
        const historial = expediente.map(e => ({
            id: e.id,
            concurso: e.concurso?.titulo || "Arena Clasificatoria",
            mandato: e.concurso?.temaExacto || "Libre",
            fecha: e.timestamp,
            texto: e.texto,
            calificacion: e.calificacion,
            feedback: e.feedback,
            isExamen: e.concurso?.isExamen || false,
            integridad: {
                tabSwitches: e.tabSwitches,
                suspicious: e.suspicious,
                data: e.integrityData
            }
        }));

        return NextResponse.json({ 
            ok: true, 
            historial 
        });

    } catch (e) {
        console.error("Error al obtener expediente:", e);
        return NextResponse.json({ ok: false, error: "Error al consultar el archivo" }, { status: 500 });
    }
}
