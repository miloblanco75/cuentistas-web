import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function getDeviceHash(req) {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const ua = req.headers.get("user-agent") || "unknown";
    
    // Normalización IP /24
    const ipSegment = ip.split('.').slice(0, 3).join('.');
    const normalizedUA = ua.toLowerCase().replace(/\s/g, '');
    
    return crypto.createHash('sha256').update(ipSegment + normalizedUA).digest('hex');
}

// HOTFIX 4: Resilience Wrapper
const withTimeout = (promise, ms = 1500) => {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), ms)
        )
    ]);
};

export async function GET(request) {
    try {
        const cookieStore = cookies();
        let guestId = cookieStore.get("guestId")?.value;
        const deviceHash = getDeviceHash(request);

        let session;

        if (guestId) {
            session = await withTimeout(prisma.guestSession.findUnique({
                where: { guestId }
            }), 1500);
        }

        if (!session) {
            guestId = uuidv4();
            session = await withTimeout(prisma.guestSession.create({
                data: {
                    guestId,
                    deviceHash,
                    interactionCount: 0
                }
            }), 1500);
            
            cookieStore.set("guestId", guestId, { 
                maxAge: 30 * 24 * 60 * 60,
                path: "/",
                httpOnly: true,
                sameSite: "lax"
            });
        }

        const nowMs = Date.now();
        const firstActivityMs = new Date(session.firstActivityAt).getTime();
        const elapsedMs = nowMs - firstActivityMs;
        const maxMs = 5 * 60 * 1000;
        const bufferMs = 2000; // 2s tolerance for clock drift
        
        // V9 Hardening: Buffer helps avoid premature expiry on fresh sessions
        const remainingTime = Math.max(0, Math.floor((maxMs + bufferMs - elapsedMs) / 1000));
        const timeExpired = elapsedMs > (maxMs + bufferMs);
        const interactionLimit = session.interactionCount >= 3;
        
        // V13 EMERGENCY: Deshabilitamos el límite temporalmente para permitir configuración total
        const limitReached = false; // timeExpired || interactionLimit;

        return NextResponse.json({
            ok: true,
            guestId: session.guestId,
            interactions: Number(session.interactionCount),
            remainingTime: Number(remainingTime),
            limitReached: Boolean(limitReached),
            reason: timeExpired ? "time_expired" : (interactionLimit ? "interaction_limit" : null),
            deviceHash: session.deviceHash
        });

    } catch (error) {
        console.error("❌ [GuestStatus] Error:", error.message);
        // FAIL-SAFE RESPONSE (HOTFIX 4)
        return NextResponse.json({ 
            ok: true, 
            status: "fallback",
            interactionCount: 0,
            remainingTime: 300,
            limitReached: false,
            reason: null 
        });
    }
}

export async function POST(request) {
    try {
        const cookieStore = cookies();
        const guestId = cookieStore.get("guestId")?.value;
        const body = await request.json();
        const { action } = body;

        if (!guestId) return NextResponse.json({ ok: false }, { status: 400 });

        const session = await withTimeout(prisma.guestSession.findUnique({ where: { guestId } }), 1500);
        if (!session) return NextResponse.json({ ok: false }, { status: 404 });

        const nowMs = Date.now();
        const firstActivityMs = new Date(session.firstActivityAt).getTime();
        const elapsedMs = nowMs - firstActivityMs;
        const maxMs = 5 * 60 * 1000;
        const bufferMs = 2000;

        if (session.interactionCount >= 3 || elapsedMs > (maxMs + bufferMs)) {
            return NextResponse.json({ 
                ok: false, 
                limitReached: true, 
                reason: session.interactionCount >= 3 ? "interaction_limit" : "time_expired" 
            });
        }

        const updated = await withTimeout(prisma.guestSession.update({
            where: { guestId },
            data: { 
                interactionCount: { increment: 1 },
                arenaDwellStart: action === 'arena_start' ? new Date() : undefined
            }
        }), 1500);

        // Consistent Auth Response
        return NextResponse.json({ 
            ok: true, 
            interactions: updated.interactionCount,
            limitReached: false
        });
        
    } catch (error) {
        console.warn("⚠️ [GuestStatus POST] Fallback triggered:", error.message);
        return NextResponse.json({ 
            ok: true, 
            status: "fallback",
            interactions: 0,
            limitReached: false 
        });
    }
}
