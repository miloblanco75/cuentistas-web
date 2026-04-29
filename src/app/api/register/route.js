import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, nombre, password, escritor, genero, casa } = body;

        if (!username || !password || !nombre) {
            return NextResponse.json({ ok: false, error: "Datos incompletos" }, { status: 400 });
        }

        // Verificar si existe
        const existingUser = await prisma.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            return NextResponse.json({ ok: false, error: "El pseudónimo ya está tomado" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                name: nombre,
                email: `${username}@ejemplo.com`,
                password: hashedPassword,
                escritorFavorito: escritor,
                generoFavorito: genero,
                casa: casa,
                rol: "Escritor",
                tinta: 15,
                puntos: 0,
                nivel: "Principiante"
            }
        });

        return NextResponse.json({ ok: true, user: { username: newUser.username } });

    } catch (error) {
        console.error("Error en registro:", error);
        return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
    }
}
