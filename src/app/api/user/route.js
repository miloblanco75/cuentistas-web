import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// V80: Hardening del flujo de datos del usuario
// Centralización de roles y prevención de fallos estructurales

export async function GET() {
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
                },
                inventory: {
                    include: { storeItem: true, tiendaItem: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
        }

        // V9: Sincronización de referido al primer login/visita
        if (!user.referredBy) {
            const { cookies } = await import("next/headers");
            const cookieStore = cookies();
            const referrer = cookieStore.get("referrer")?.value;
            if (referrer && referrer !== user.username) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { referredBy: referrer }
                });
            }
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

        // Forzado de roles y normalización de datos (V9 Hardening)
        const isMaster = user.email.toLowerCase().trim() === adminEmail.toLowerCase().trim();
        
        const userData = {
            id: user.id,
            email: user.email,
            nombre: user.nombre || user.name || "Nómada",
            username: user.username,
            image: user.image,
            rol: isMaster ? "ARCHITECT" : (user.rol || "CUENTISTA"),
            tinta: user.tinta ?? 0,
            nivel: isMaster ? "Soberano Arquitecto" : (user.nivel || "Iniciado"),
            casa: isMaster ? (user.casa || "Cónclave") : (user.casa || null),
            streak: user.streak || 0,
            puntos: user.puntos || 0,
            puntosCasa: user.puntosCasa || 0,
            hasPerformedFirstAction: isMaster ? true : (user.hasPerformedFirstAction || false),
            lastParticipation: user.lastParticipation || null,
            activeBoost: user.activeBoost || 0,
            boostExpiresAt: user.boostExpiresAt || null,
            referredBy: user.referredBy || null,
            referralRewardClaimed: user.referralRewardClaimed || false,
            activeFrameId: user.activeFrameId,
            activeBadgeId: user.activeBadgeId,
            activeTitleId: user.activeTitleId,
            inventory: user.inventory || [],
            misiones: user.misiones || []
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
            // Reintento breve por latencia de sesión
            await new Promise(resolve => setTimeout(resolve, 800));
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
    if (action === "joinHouse" || action === "completeOnboarding") updateData.hasPerformedFirstAction = true;
    
    // V10: BLOQUEO COMERCIAL (PROTECCIÓN BACKEND)
    if (action === "buy") {
        return NextResponse.json({ 
            ok: false, 
            error: "Módulo de pagos deshabilitado en Modo Beta" 
        }, { status: 501 });
    }

    try {
        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: updateData,
            include: { misiones: { include: { mision: true } } }
        });
        
        const isMaster = user.email && user.email.toLowerCase().trim() === "ermiloblanco75@gmail.com";
        
        // V9 Hardening: Hidratación Total e Idéntica a GET
        return NextResponse.json({ 
            ok: true, 
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre || user.name || "Nómada",
                username: user.username,
                image: user.image,
                rol: isMaster ? "ARCHITECT" : (user.rol || "CUENTISTA"),
                tinta: user.tinta ?? 0,
                nivel: isMaster ? "Soberano Creador" : (user.nivel || "Iniciado"),
                casa: isMaster ? (user.casa || "Cónclave") : (user.casa || null),
                streak: user.streak || 0,
                puntos: user.puntos || 0,
                puntosCasa: user.puntosCasa || 0,
                hasPerformedFirstAction: isMaster ? true : (user.hasPerformedFirstAction || false),
                lastParticipation: user.lastParticipation || null,
                activeBoost: user.activeBoost || 0,
                boostExpiresAt: user.boostExpiresAt || null,
                referredBy: user.referredBy || null,
                referralRewardClaimed: user.referralRewardClaimed || false,
                activeFrameId: user.activeFrameId,
                activeBadgeId: user.activeBadgeId,
                activeTitleId: user.activeTitleId,
                inventory: user.inventory || [],
                misiones: user.misiones || []
            } 
        });
    } catch (dbError) {
        console.error("❌ Error handleUpdate:", dbError.message);
        return NextResponse.json({ ok: false, error: "Error de sincronización" }, { status: 500 });
    }
}
