import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// V80: Hardening del flujo de datos del usuario
// Centralización de roles y prevención de fallos estructurales

export async function GET() {
    // --- CHAOS MODE INJECTION (V85) ---
    const isChaosEnabled = process.env.CHAOS_MODE === "true";
    if (isChaosEnabled && Math.random() < 0.1) {
        const chaosType = Math.floor(Math.random() * 3);
        
        // 1. Latencia aleatoria (1s - 5s)
        if (chaosType === 0) {
            const delay = Math.floor(Math.random() * 4000) + 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            // Después del delay, puede fallar o seguir (preferimos seguir para ver "Signal débil")
        } 
        // 2. Error 500
        else if (chaosType === 1) {
            return NextResponse.json({ ok: false, error: "CHAOS_INJECTED_500" }, { status: 500 });
        }
        // 3. Error 503
        else {
            return NextResponse.json({ ok: false, error: "CHAOS_INJECTED_503" }, { status: 503 });
        }
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ ok: false, error: "No session" }, { status: 401 });
        }

        const adminEmail = process.env.ADMIN_EMAIL || "ermiloblanco75@gmail.com";

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                entradas: {
                    include: { concurso: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
        }

        // --- ASIGNACIÓN DE MANDATOS DIARIOS ---
        // V81: Importación dinámica protegida para evitar crashes si el archivo falta
        try {
            const mandatosLib = await import("@/lib/mandatos").catch(() => null);
            if (mandatosLib && mandatosLib.asignarMandatos) {
                await mandatosLib.asignarMandatos(user.id);
            }
        } catch (e) {
            console.error("⚠️ Fallo en mandatos:", e.message);
        }

        // Forzado de roles para el administrador central
        const isMaster = user.email.toLowerCase().trim() === adminEmail.toLowerCase().trim();
        
        const userData = {
            ...user,
            rol: isMaster ? "ARCHITECT" : user.rol,
            nivel: isMaster ? "Soberano Arquitecto" : user.nivel
        };

        return NextResponse.json({ ok: true, user: userData });
    } catch (error) {
        console.error("❌ Error en API User:", error);
        return NextResponse.json({ ok: false, error: "Critical server error" }, { status: 500 });
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
