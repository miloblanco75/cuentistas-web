import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.rol !== "Maestro") {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
        }

        const { id, action } = await request.json();

        if (!id) {
            return NextResponse.json({ ok: false, error: "ID de concurso requerido" }, { status: 400 });
        }

        const concurso = await prisma.concurso.findUnique({ where: { id } });
        if (!concurso) {
            return NextResponse.json({ ok: false, error: "Concurso no encontrado" }, { status: 404 });
        }

        if (action === "start") {
            const upd = await prisma.concurso.update({
                where: { id },
                data: { status: "active", startTime: new Date() }
            });
            return NextResponse.json({ ok: true, message: "Concurso iniciado", concurso: upd });
        }

        if (action === "stop") {
            const upd = await prisma.concurso.update({
                where: { id },
                data: { status: "finished" }
            });
            return NextResponse.json({ ok: true, message: "Concurso detenido", concurso: upd });
        }

        return NextResponse.json({ ok: false, error: "Acción no válida" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ ok: false, error: "Error en DB" }, { status: 500 });
    }
}
