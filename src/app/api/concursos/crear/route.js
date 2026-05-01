import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.rol !== "Maestro" && session.user.rol !== "ARCHITECT")) {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
        }

        const data = await request.json();
        const isTraining = data.tipo === "entrenamiento" || data.tipo === "retiro";
        const isExamen = data.isExamen || data.tipo === "examen";

        if (!data.titulo || (!isTraining && !isExamen && (!data.temaGeneral || !data.temaExacto))) {
            return NextResponse.json({ ok: false, error: "Faltan campos obligatorios (Título y Temas)" }, { status: 400 });
        }

        const scheduledTime = data.scheduledTime ? new Date(data.scheduledTime) : null;

        const nuevoConcurso = await prisma.concurso.create({
            data: {
                titulo: data.titulo,
                descripcion: data.descripcion || "",
                temaGeneral: data.temaGeneral || "Examen Académico",
                temaExacto: data.temaExacto || "Evaluación de Competencias",
                preguntas: data.preguntas || null,
                pdfUrl: data.pdfUrl || null,
                isExamen: data.isExamen || false,
                costoTinta: parseInt(data.costoTinta) || 0,
                categoria: data.categoria || "Principiante",
                status: "waiting",
                scheduledTime: scheduledTime,
                duration: parseInt(data.duration) || 5400,
                juezId: data.juezId || null,
                tipo: data.tipo || (data.isExamen ? "examen" : "normal")
            }
        });

        // Invitación masiva (Simulación)
        const recipients = await prisma.user.findMany({
            select: { email: true, username: true }
        });
        
        console.log(`[ATS SYSTEM] Invocación de Cuentistas para: ${nuevoConcurso.titulo}`);
        console.log(`[ATS SYSTEM] Tipo: ${nuevoConcurso.tipo} | Juez ID: ${nuevoConcurso.juezId}`);

        return NextResponse.json({ 
            ok: true, 
            message: "Concurso forjado con éxito", 
            concurso: nuevoConcurso 
        });
    } catch (error) {
        console.error("Error al crear concurso:", error);
        return NextResponse.json({ ok: false, error: "Error interno al forjar el concurso" }, { status: 500 });
    }
}
