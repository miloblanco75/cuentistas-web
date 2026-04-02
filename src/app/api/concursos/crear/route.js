import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.rol !== "Maestro") {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
        }

        const data = await request.json();

        if (!data.titulo || !data.temaGeneral || !data.temaExacto) {
            return NextResponse.json({ ok: false, error: "Faltan campos obligatorios" }, { status: 400 });
        }

        const nuevoConcurso = await prisma.concurso.create({
            data: {
                titulo: data.titulo,
                descripcion: data.descripcion || "",
                temaGeneral: data.temaGeneral,
                temaExacto: data.temaExacto,
                costoTinta: data.costoTinta || 0,
                categoria: data.categoria || "Principiante",
                status: "waiting"
            }
        });

        // Simulación de envío de correos
        const recipients = await prisma.user.findMany({
            select: { email: true, username: true }
        });
        
        console.log(`[EMAIL SYSTEM] Enviando invitaciones para: ${nuevoConcurso.titulo}`);
        recipients.forEach(r => {
            console.log(`[EMAIL] Invitación enviada a ${r.email} (${r.username})`);
        });

        return NextResponse.json({ 
            ok: true, 
            message: "Concurso creado con éxito e invitaciones enviadas", 
            concurso: nuevoConcurso 
        });
    } catch (error) {
        console.error("Error al crear concurso:", error);
        return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
    }
}
