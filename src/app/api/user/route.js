import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { misiones: { include: { mision: true } } }
        });

        if (!user) {
            return NextResponse.json({ ok: false, error: "Usuario no encontrado" }, { status: 404 });
        }

        // --- ASIGNACIÓN DE MANDATOS DIARIOS ---
        try {
            const { asignarMandatos } = await import("@/lib/mandatos");
            await asignarMandatos(user.id);
        } catch (e) {
            console.error("Error al asignar mandatos:", e);
        }

        // REGLA SUPREMA: El Maestro siempre es ARQUITECTO
        const isMaster = user.email && user.email.toLowerCase().trim() === "ermiloblanco75@gmail.com";

        return NextResponse.json({ 
            ok: true, 
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre || user.name,
                username: user.username,
                image: user.image,
                rol: isMaster ? "ARCHITECT" : (user.rol || "CUENTISTA"),
                tinta: user.tinta || 0,
                nivel: isMaster ? "Soberano Creador" : (!user.hasPerformedFirstAction ? "Visitante" : (user.nivel || "Iniciado")),
                casa: isMaster ? (user.casa || "Cónclave") : (user.casa || null),
                streak: user.streak || 0,
                puntos: user.puntos || 0,
                puntosCasa: user.puntosCasa || 0,
                hasPerformedFirstAction: isMaster ? true : (user.hasPerformedFirstAction || false),
                lastParticipation: user.lastParticipation || null,
                misiones: user.misiones || []
            } 
        });
    } catch (error) {
        console.error("Error en API User:", error);
        return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const reSession = await getServerSession(authOptions);
            if (!reSession?.user?.email) return NextResponse.json({ ok: false, error: "Sesión no sincronizada" }, { status: 401 });
            return handleUpdate(reSession, req);
        }
        return handleUpdate(session, req);
    } catch (error) {
        return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
    }
}

async function handleUpdate(session, req) {
    const body = await req.json();
    const { casa, action } = body;
    let updateData = {};
    if (casa) updateData.casa = casa;
    if (action === "joinHouse" || action === "completeOnboarding") updateData.hasPerformedFirstAction = true;

    try {
        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: updateData,
            include: { misiones: { include: { mision: true } } }
        });
        const isMaster = user.email && user.email.toLowerCase().trim() === "ermiloblanco75@gmail.com";
        return NextResponse.json({ 
            ok: true, 
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre || user.name,
                username: user.username,
                image: user.image,
                rol: isMaster ? "ARCHITECT" : (user.rol || "CUENTISTA"),
                tinta: user.tinta || 0,
                nivel: isMaster ? "Soberano Creador" : (!user.hasPerformedFirstAction ? "Visitante" : (user.nivel || "Iniciado")),
                casa: isMaster ? (user.casa || "Cónclave") : (user.casa || null),
                streak: user.streak || 0,
                puntos: user.puntos || 0,
                puntosCasa: user.puntosCasa || 0,
                hasPerformedFirstAction: isMaster ? true : (user.hasPerformedFirstAction || false),
                lastParticipation: user.lastParticipation || null,
                misiones: user.misiones || []
            } 
        });
    } catch (dbError) {
        return NextResponse.json({ ok: false, error: "Error de sincronización" }, { status: 500 });
    }
}
