import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// POST /api/analytics/prestige-survey
// Registra la respuesta emocional post-Prestige Seal.
// Una sola pregunta: "¿Qué sentiste primero?"
// Opciones válidas: "orgullo" | "curiosidad" | "indiferencia" | "volver_a_competir"
// NO requiere autenticación.

export async function POST(req) {
    try {
        const { username, emocion, entradaId } = await req.json();

        const VALID_EMOCIONES = ["orgullo", "curiosidad", "indiferencia", "volver_a_competir"];
        if (!emocion || !VALID_EMOCIONES.includes(emocion)) {
            return NextResponse.json({ ok: false, error: "Emoción inválida" }, { status: 400 });
        }

        await prisma.referralEvent.create({
            data: {
                event: "seal_shown",
                invocador: username || null,
                entradaId: entradaId || null,
                metadata: { emocion, source: "prestige_survey" }
            }
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        // Silencioso
        return NextResponse.json({ ok: true });
    }
}
