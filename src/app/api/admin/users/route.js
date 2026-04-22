import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.rol !== "Maestro" && session.user.rol !== "ARCHITECT")) {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                nombre: true,
                name: true,
                email: true,
                rol: true,
                nivel: true,
                tinta: true,
                puntosCasa: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        const stats = {
            total: users.length,
            maestros: users.filter(u => u.rol === 'Maestro').length,
            recientes: users.filter(u => {
                const date = new Date(u.createdAt);
                const now = new Date();
                return (now - date) < 24 * 60 * 60 * 1000;
            }).length
        };

        return NextResponse.json({ ok: true, users, stats });
    } catch (error) {
        return NextResponse.json({ ok: false, error: "Error en DB" }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.rol !== "Maestro" && session.user.rol !== "ARCHITECT")) {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
        }

        const { userId, newRol } = await request.json();

        if (!userId || !newRol) {
            return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { rol: newRol }
        });

        return NextResponse.json({ ok: true, user: updatedUser });
    } catch (error) {
        console.error("Error al actualizar rol:", error);
        return NextResponse.json({ ok: false, error: "Error al actualizar privilegio" }, { status: 500 });
    }
}
