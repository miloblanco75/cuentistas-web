import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// POST /api/user/share-claimed
// Marca una entrada como "sello compartido" para evitar popups repetidos.
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ ok: false, error: "No session" }, { status: 401 });
        }

        const { entradaId } = await req.json();
        if (!entradaId) {
            return NextResponse.json({ ok: false, error: "Missing entradaId" }, { status: 400 });
        }

        // Verificar que la entrada pertenece a este usuario
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, username: true }
        });

        if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

        const entrada = await prisma.entrada.findFirst({
            where: { id: entradaId, userId: user.id }
        });

        if (!entrada) {
            return NextResponse.json({ ok: false, error: "Entrada not found or not yours" }, { status: 403 });
        }

        await prisma.entrada.update({
            where: { id: entradaId },
            data: { shareClaimed: true }
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("share-claimed error:", err);
        return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
    }
}
