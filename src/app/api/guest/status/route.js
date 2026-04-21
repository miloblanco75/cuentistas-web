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

export async function GET(request) {
    try {
        const cookieStore = cookies();
        let guestId = cookieStore.get("guestId")?.value;
        const deviceHash = getDeviceHash(request);

        let session;

        if (guestId) {
            session = await prisma.guestSession.findUnique({
                where: { guestId }
            });
        }

        if (!session) {
            guestId = uuidv4();
            session = await prisma.guestSession.create({
                data: {
                    guestId,
                    deviceHash,
                    interactionCount: 0
                }
            });
            
            cookieStore.set("guestId", guestId, { 
                maxAge: 30 * 24 * 60 * 60,
                path: "/",
                httpOnly: true,
                sameSite: "lax"
            });
        }

        // V9 Hardening: Autoritative Limit Check
        const now = new Date();
        const firstActivity = new Date(session.firstActivityAt);
        const elapsedMs = now.getTime() - firstActivity.getTime();
        const maxMs = 5 * 60 * 1000;
        
        const remainingTime = Math.max(0, Math.floor((maxMs - elapsedMs) / 1000));
        const timeExpired = elapsedMs >= maxMs;
        const interactionLimit = session.interactionCount >= 3;
        
        const limitReached = timeExpired || interactionLimit;

        return NextResponse.json({
            ok: true,
            guestId: session.guestId,
            interactions: session.interactionCount,
            remainingTime,
            limitReached,
            reason: timeExpired ? "time_expired" : (interactionLimit ? "interaction_limit" : null),
            deviceHash: session.deviceHash
        });

    } catch (error) {
        console.error("❌ [GuestStatus] Error:", error.message);
        return NextResponse.json({ ok: false, error: "Error de sesión" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const cookieStore = cookies();
        const guestId = cookieStore.get("guestId")?.value;
        const body = await request.json();
        const { action } = body;

        if (!guestId) return NextResponse.json({ ok: false }, { status: 400 });

        const session = await prisma.guestSession.findUnique({ where: { guestId } });
        if (!session) return NextResponse.json({ ok: false }, { status: 404 });

        const now = new Date();
        const elapsedMs = now.getTime() - new Date(session.firstActivityAt).getTime();
        const maxMs = 5 * 60 * 1000;

        if (session.interactionCount >= 3 || elapsedMs >= maxMs) {
            return NextResponse.json({ 
                ok: false, 
                limitReached: true, 
                reason: session.interactionCount >= 3 ? "interaction_limit" : "time_expired" 
            });
        }

        const updated = await prisma.guestSession.update({
            where: { guestId },
            data: { 
                interactionCount: { increment: 1 },
                arenaDwellStart: action === 'arena_start' ? now : undefined
            }
        });

        // Consistent Auth Response
        return NextResponse.json({ 
            ok: true, 
            interactions: updated.interactionCount,
            limitReached: false
        });
        
    } catch (error) {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
