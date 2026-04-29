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

        const userId = session.user.id;
        const { texto } = await request.json();

        if (!texto || texto.length < 50) {
            return NextResponse.json({ 
                ok: false, 
                error: "El Oráculo rechaza ofrendas vacías. Escribe al menos 50 caracteres." 
            }, { status: 400 });
        }

        // Asegurar que exista la "Arena" eterna del Retiro para cumplir integridad referencial
        const retiroId = "retiro-eterno";
        await prisma.concurso.upsert({
            where: { id: retiroId },
            update: {},
            create: {
                id: retiroId,
                titulo: "El Retiro",
                descripcion: "El Santuario donde se forjan los peligrosos.",
                status: "training",
                tipo: "entrenamiento",
                costoTinta: 0,
                duration: 999999
            }
        });

        const user = await prisma.user.findUnique({ where: { id: userId } });

        // Guardar la obra como Entrenamiento y dar XP
        await prisma.$transaction(async (tx) => {
            await tx.entrada.create({
                data: {
                    concursoId: retiroId,
                    userId,
                    texto,
                    participante: user.username || user.nombre || "Anónimo",
                    isTraining: true
                }
            });

            // Recompensa de Disciplina (XP, pero no Elo ni Tinta)
            await tx.user.update({
                where: { id: userId },
                data: {
                    puntos: { increment: 15 }, // 15 XP por disciplina
                    lastParticipation: new Date() // FASE 6: Tracking estructural
                }
            });
        });

        // Respuestas de Feedback Mítico Aleatorias
        const oraculoFeedback = [
            "El Oráculo detecta progreso. Tu pluma es más afilada hoy.",
            "El Tribunal aún no te mira... pero pronto lo hará.",
            "La tensión narrativa fluye mejor. Sigue forjando.",
            "Tu apertura tiene potencial peligroso. Descansa y vuelve mañana.",
            "La constancia es la única magia real. El santuario reconoce tu esfuerzo."
        ];
        const feedback = oraculoFeedback[Math.floor(Math.random() * oraculoFeedback.length)];

        return NextResponse.json({ 
            ok: true, 
            message: feedback 
        });

    } catch (error) {
        console.error("Retiro Error:", error);
        return NextResponse.json({ ok: false, error: "El santuario está colapsando." }, { status: 500 });
    }
}
