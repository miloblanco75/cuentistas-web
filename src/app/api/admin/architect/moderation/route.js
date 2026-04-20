import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.rol !== "ARCHITECT") {
            return NextResponse.json({ ok: false, error: "Acceso prohibido" }, { status: 403 });
        }

        const { action, userId, duration, reason } = await request.json();

        // 1. Auditoría
        await prisma.auditLog.create({
            data: {
                adminId: session.user.id,
                action: `MODERATION_${action.toUpperCase()}`,
                targetId: userId,
                details: JSON.stringify({ duration, reason })
            }
        });

        // 2. Sentencia
        if (action === "mute") {
            const until = new Date();
            until.setHours(until.getHours() + (duration || 24));
            
            await prisma.user.update({
                where: { id: userId },
                data: { muteUntil: until }
            });
        }

        if (action === "exile") {
            // Ban permanente
            await prisma.user.update({
                where: { id: userId },
                data: { isBanned: true }
            });
        }

        if (action === "pardon") {
            await prisma.user.update({
                where: { id: userId },
                data: { isBanned: false, muteUntil: null }
            });
        }

        return NextResponse.json({ ok: true, message: `Sentencia de ${action} ejecutada` });

    } catch (error) {
        console.error("Moderation Control Error:", error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.rol !== "Maestro") {
            return NextResponse.json({ ok: false, error: "Denegado" }, { status: 403 });
        }

        // Obtener historial de auditoría (logs recientes) para moderación
        const logs = await prisma.auditLog.findMany({
            where: { action: { startsWith: "MODERATION_" } },
            include: { admin: { select: { username: true } } },
            orderBy: { timestamp: "desc" },
            take: 50
        });

        // Usuarios reportados (simplificado por ahora, en un sistema real habría una tabla de Reportes)
        // Por ahora listamos usuarios baneados
        const bannedUsers = await prisma.user.findMany({
            where: { isBanned: true },
            select: { id: true, username: true, email: true }
        });

        return NextResponse.json({ ok: true, logs, bannedUsers });

    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
