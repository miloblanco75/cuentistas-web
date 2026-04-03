import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const SECRET = "hechizo-maestro-2026";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const promote = searchParams.get("promote");

    if (key !== SECRET) {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    try {
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

        // Listar todos los usuarios (máximo 100)
        const users = await prisma.user.findMany({
            select: { email: true, name: true, rol: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 100,
        });

        if (users.length === 0) {
            return NextResponse.json({
                ok: true,
                mensaje: "La base de datos está vacía. ¡Debes entrar al sitio con Google al menos una vez para que tu alma aparezca en los registros!",
                login_url: "https://cuentistas-web-qjd5.vercel.app/login"
            });
        }

        return NextResponse.json({
            ok: true,
            total: users.length,
            users,
            nota: "Si no ves tu correo, entra a /login con Google y luego refresca esta página."
        });
    } catch (e) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}
