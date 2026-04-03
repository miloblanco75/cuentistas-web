import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Endpoint temporal de emergencia — eliminar después de usar
const SECRET = "hechizo-maestro-2026";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key !== SECRET) {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    try {
        const user = await prisma.user.update({
            where: { email: "ermiloblanco75@gmail.com" },
            data: {
                rol: "Maestro",
                tinta: 9999,
                nivel: "Gran Maestro del Conclave",
            },
        });

        return NextResponse.json({
            ok: true,
            mensaje: "¡Hechizo completado! Eres ahora Maestro del Cónclave.",
            email: user.email,
            rol: user.rol,
        });
    } catch (e) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}
