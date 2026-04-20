import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.rol !== "ARCHITECT") {
            return NextResponse.json({ ok: false, error: "Acceso denegado al Trono" }, { status: 403 });
        }

        const { action, contestId, userId, details } = await request.json();

        // 1. Registrar Acción en AuditLog
        await prisma.auditLog.create({
            data: {
                adminId: session.user.id,
                action: `ARENA_CONTROL_${action.toUpperCase()}`,
                targetId: contestId || userId,
                details: JSON.stringify({ contestId, userId, details })
            }
        });

        // 2. Ejecutar Acciones de Control
        if (action === "pause") {
            await prisma.concurso.update({
                where: { id: contestId },
                data: { status: "paused" }
            });
            await pusherServer.trigger(`concurso-${contestId}`, "arena-control", { type: "PAUSE", msg: "El Cónclave ha pausado el tiempo." });
        }

        if (action === "resume") {
            await prisma.concurso.update({
                where: { id: contestId },
                data: { status: "active" }
            });
            await pusherServer.trigger(`concurso-${contestId}`, "arena-control", { type: "RESUME", msg: "El tiempo vuelve a fluir." });
        }

        if (action === "banish") {
            // Expulsar usuario de la sala mediante Pusher
            await pusherServer.trigger(`concurso-${contestId}`, "arena-control", { 
                type: "BANISH", 
                userId, 
                msg: "Has sido desterrado de esta sala por orden del Arquitecto." 
            });
        }

        if (action === "global_event") {
            const { multiplier, name } = details;
            await prisma.globalSettings.upsert({
                where: { id: "singleton" },
                update: { 
                    gloriaMultiplier: multiplier, 
                    isEventActive: true, 
                    eventName: name 
                },
                create: { 
                    id: "singleton", 
                    gloriaMultiplier: multiplier, 
                    isEventActive: true, 
                    eventName: name 
                }
            });
            await pusherServer.trigger("global", "event-start", { multiplier, name });
        }

        return NextResponse.json({ ok: true, message: "Comando ejecutado con éxito" });

    } catch (error) {
        console.error("Arena Control Error:", error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.rol !== "Maestro") {
            return NextResponse.json({ ok: false, error: "Acceso denegado" }, { status: 403 });
        }

        const activeContests = await prisma.concurso.findMany({
            where: { status: { in: ["active", "waiting", "paused"] } },
            include: {
                _count: { select: { entradas: true } }
            }
        });

        return NextResponse.json({ ok: true, contests: activeContests });
    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
