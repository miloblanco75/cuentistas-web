import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request) {
    console.log("📥 Recibida petición en El Retiro");
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            console.warn("❌ No session in Retiro");
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
        }

        const userId = session.user.id;
        const { texto } = await request.json();
        console.log(`✍️ Usuario ${userId} enviando texto de ${texto?.length} chars`);

        if (!texto || texto.length < 50) {
            return NextResponse.json({ 
                ok: false, 
                error: "El Oráculo rechaza ofrendas vacías. Escribe al menos 50 caracteres." 
            }, { status: 400 });
        }

        const retiroId = "retiro-eterno";

        console.log("🔄 Upserting concurso retiro-eterno...");
        await prisma.concurso.upsert({
            where: { id: retiroId },
            update: { status: "active" },
            create: {
                id: retiroId,
                titulo: "El Retiro",
                descripcion: "El Santuario donde se forjan los peligrosos.",
                status: "active",
                tipo: "entrenamiento",
                temaGeneral: "Escritura Libre",
                temaExacto: "Santuario de Práctica",
                costoTinta: 0,
                duration: 999999999
            }
        });

        console.log("🔍 Buscando entrada existente...");
        const existing = await prisma.entrada.findUnique({
            where: {
                userId_concursoId: { userId, concursoId: retiroId }
            }
        });

        console.log(existing ? "📝 Actualizando entrada..." : "🆕 Creando nueva entrada...");
        await prisma.$transaction(async (tx) => {
            if (existing) {
                await tx.entrada.update({
                    where: { id: existing.id },
                    data: { texto, updatedAt: new Date() }
                });
            } else {
                const user = await tx.user.findUnique({ where: { id: userId } });
                await tx.entrada.create({
                    data: {
                        concursoId: retiroId,
                        userId,
                        texto,
                        participante: user.username || user.nombre || "Anónimo",
                        isTraining: true
                    }
                });
            }

            await tx.user.update({
                where: { id: userId },
                data: {
                    puntos: { increment: 15 },
                    lastParticipation: new Date()
                }
            });
        });

        console.log("✅ Retiro guardado con éxito");
        const oraculoFeedback = [
            "Aquí no compites. Aquí perfeccionas.",
            "El Oráculo observa tu constancia. Sigue forjando.",
            "Tu pluma se vuelve más peligrosa con cada palabra.",
            "El santuario reconoce tu disciplina.",
            "La maestría es el único premio que importa aquí."
        ];
        const feedback = oraculoFeedback[Math.floor(Math.random() * oraculoFeedback.length)];

        return NextResponse.json({ ok: true, message: feedback });

    } catch (error) {
        console.error("🔥 Retiro Error Critico:", error);
        return NextResponse.json({ ok: false, error: "El santuario está bajo mantenimiento místico." }, { status: 500 });
    }
}
