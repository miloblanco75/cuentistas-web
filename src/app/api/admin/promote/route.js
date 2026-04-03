import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const SECRET = "hechizo-maestro-2026";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const promote = searchParams.get("promote"); // email a promover

    if (key !== SECRET) {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    try {
        // Si se pide promover un email específico
        if (promote) {
            const user = await prisma.user.update({
                where: { email: promote },
                data: { rol: "Maestro", tinka: 9999, nivel: "Gran Maestro del Conclave" },
            });
            return NextResponse.json({
                ok: true,
                mensaje: "¡Hechizo completado! Eres Maestro.",
                email: user.email,
                rol: user.rol,
            });
        }

        // Sin parámetro promote: listar todos los usuarios para diagnóstico
        const users = await prisma.user.findMany({
            select: { id: true, email: true, name: true, username: true, rol: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 20,
        });

        return NextResponse.json({
            ok: true,
            total: users.length,
            instruccion: "Copia el email correcto y visita: ?key=hechizo-maestro-2026&promote=TU_EMAIL",
            users,
        });
    } catch (e) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}
