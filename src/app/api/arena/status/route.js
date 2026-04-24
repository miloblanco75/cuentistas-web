import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { COMBAT_FLAGS } from "@/lib/flags";

/**
 * 👁️ ARENA STATUS ENGINE (PHASE 15)
 * Motor de lectura de borradores en vivo para el Combat HUD.
 */

export async function GET(req) {
    const session = await getServerSession(authOptions);
    
    // 🛡️ SECURITY GATE 1: Feature Flag
    if (!COMBAT_FLAGS.live_combat_enabled) {
        return NextResponse.json({ ok: false, error: "Arena desincronizada" }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const contestId = searchParams.get("contestId");

    if (!contestId) {
        return NextResponse.json({ ok: false, error: "Falta ID del certamen" }, { status: 400 });
    }

    try {
        // Obtenemos borradores activos del certamen
        const drafts = await prisma.draft.findMany({
            where: { concursoId: contestId },
            include: { User: { select: { username: true, casa: true, image: true, elo: true, rank: true } } },
            orderBy: { updatedAt: 'desc' }
        });

        const now = new Date();
        
        const contestants = drafts.map(d => {
            const isMe = d.userId === session?.user?.id;
            const wordCount = d.texto.trim() === "" ? 0 : d.texto.trim().split(/\s+/).length;
            const lastActive = (now - new Date(d.updatedAt)) / 1000;

            // 🔱 ALGORITMO DE PRESIÓN RECALIBRADO
            const pressure = Math.min(100, (wordCount / 500) * 50 + (lastActive < 10 ? 50 : 0));

            return {
                userId: d.userId,
                username: d.User?.username || "Nómada Silencioso",
                casa: d.User?.casa || "Cónclave",
                // 🔐 PROTECCIÓN CRÍTICA: wordCount solo para uno mismo
                wordCount: isMe ? wordCount : null, 
                status: lastActive < 15 ? "Poseído" : "Estancado",
                pressureScore: pressure,
                isMe
            };
        });

        return NextResponse.json({
            ok: true,
            contestants,
            timestamp: now.toISOString()
        });

    } catch (error) {
        console.error("❌ Arena Status Error:", error.message);
        return NextResponse.json({ ok: false, error: "Error de lectura mística" }, { status: 500 });
    }
}
