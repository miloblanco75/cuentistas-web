import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const { action, contestId, itemId, tintaMissing, contexto } = body;
        const userId = session.user.id;

        // --- ACCIÓN: NOTIFICAR INTERÉS ---
        if (action === "notify") {
            await prisma.purchaseIntent.updateMany({
                where: { userId },
                data: { wantsNotification: true }
            });
            return NextResponse.json({ ok: true, message: "Interés registrado." });
        }

        // --- CÁLCULO DE SEGMENTACIÓN ---
        // 1. Obtener historial del usuario
        const intents = await prisma.purchaseIntent.findMany({ where: { userId } });
        const totalIntentLevel = intents.reduce((acc, curr) => acc + curr.intentLevel, 0);
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { streak: true } });

        // 2. Definir Segmento
        let segment = "GREEN";
        let narrative = "Recupera tu honor en los duelos diarios.";

        const isHighRisk = contexto?.isGranSello || tintaMissing > 50;
        const isPersistent = totalIntentLevel >= 3;
        
        if (isHighRisk || isPersistent || (user?.streak >= 3)) {
            segment = "RED";
            narrative = "El Consejo pronto abrirá el acceso a tinta directa. Estás listo.";
        } else if (totalIntentLevel >= 1) {
            segment = "YELLOW";
            narrative = "Próximamente podrás reclamar tinta directamente del Cónclave.";
        }

        // Upsert logic: Si ya existe un intento para este concurso/item, incrementar nivel
        const existing = await prisma.purchaseIntent.findFirst({
            where: {
                userId,
                contestId: contestId || null,
                itemId: itemId || null
            }
        });

        if (existing) {
            await prisma.purchaseIntent.update({
                where: { id: existing.id },
                data: { 
                    intentLevel: { increment: 1 },
                    tintaMissing,
                    contexto: contexto || existing.contexto
                }
            });
        } else {
            await prisma.purchaseIntent.create({
                data: {
                    userId,
                    contestId,
                    itemId,
                    tintaMissing,
                    contexto: contexto || {}
                }
            });
        }

        return NextResponse.json({ 
            ok: true, 
            segment,
            narrative,
            message: "Intención de compra registrada.",
            alternatives: {
                dailies: true,
                events: "Próximo evento en 2 horas",
                freeInk: "Revisa tu ritual de resurrección"
            }
        });

    } catch (error) {
        console.error("Error logging intent:", error);
        return NextResponse.json({ ok: false, error: "Error de servidor" }, { status: 500 });
    }
}
