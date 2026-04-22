import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withTransactionRetry } from "@/lib/resilientDb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
      const entradas = await prisma.entrada.findMany({
          include: {
              concurso: { select: { titulo: true } },
              user: { select: { username: true } }
          },
          orderBy: { timestamp: 'desc' }
      });

      const lista = entradas.map((e) => ({
        ...e,
        concursoTitulo: e.concurso?.titulo || "Sin concurso",
        autorUsername: e.user?.username || e.participante
      }));

      return NextResponse.json(
        {
          ok: true,
          total: lista.length,
          entradas: lista
        },
        { status: 200 }
      );
  } catch (error) {
      return NextResponse.json({ ok: false, error: "Error en DB" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
          return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
      }

      const { concursoId, texto, participante, videoUrl } = await request.json();
      const videoStatus = videoUrl ? "pending" : "approved"; // Text only is always approved

      if (!concursoId || !texto) {
        return NextResponse.json({ ok: false, error: "Datos incompletos" }, { status: 400 });
      }

      const userId = session.user.id;

      // PHASE HOTFIX 9: MASTER RESILIENT SUBMISSION
      const { entry, action } = await withTransactionRetry(async (tx) => {
          const existing = await tx.entrada.findUnique({
              where: {
                  userId_concursoId: { userId, concursoId }
              },
              select: { id: true }
          });

          if (existing) {
              const updated = await tx.entrada.update({
                  where: { id: existing.id },
                  data: { 
                      texto,
                      videoUrl: videoUrl || undefined,
                      videoStatus: videoUrl ? videoStatus : undefined
                  }
              });
              return { entry: updated, action: "updated" };
          } else {
              const created = await tx.entrada.create({
                  data: {
                      concursoId,
                      userId,
                      texto,
                      participante: participante || "Anónimo",
                      puntajeTotal: 0,
                      votos: 0,
                      boostApplied: false,
                      videoUrl,
                      videoStatus
                  }
              });
              return { entry: created, action: "created" };
          }
      }, {
          maxRetries: 3,
          timeout: 25000
      });

      // SECONDARY ACTION: DECOUPLED BOOST (If creation succeeded)
      let boostAppliedNow = false;
      if (action === "created") {
          try {
              const user = await prisma.user.findUnique({ 
                  where: { id: userId },
                  select: { activeBoost: true, boostExpiresAt: true }
              });

              const isBoostActive = user?.activeBoost && user.activeBoost > 0 && 
                                   user.boostExpiresAt && new Date(user.boostExpiresAt) > new Date();

              if (isBoostActive) {
                  // Lo hacemos en operaciones separadas para no bloquear el registro principal
                  await prisma.entrada.update({
                      where: { id: entry.id },
                      data: { boostApplied: true }
                  });
                  await prisma.user.update({
                      where: { id: userId },
                      data: { activeBoost: 0, boostExpiresAt: null }
                  });
                  boostAppliedNow = true;
                  console.log("🔱 Boost aplicado (Hotfix 8 Safe Flow)");
              }
          } catch (boostError) {
              console.warn("⚠️ Falló la aplicación de Boost, pero el manuscrito está a salvo:", boostError.message);
          }
      }

      return NextResponse.json({ 
          ok: true, 
          action,
          entradaId: entry.id,
          boostApplied: boostAppliedNow,
          message: action === "created" 
            ? "Tu manuscrito ha sido enviado al Tribunal 🔱" 
            : "Tu manuscrito fue actualizado correctamente 🔱"
      }, { status: action === "created" ? 201 : 200 });

  } catch (error) {
      console.error("❌ Submission Error (Hotfix 8):", error);
      if (error.code === 'P2002') {
          return NextResponse.json({ ok: false, error: "Ya existe una entrada para este concurso" }, { status: 409 });
      }
      return NextResponse.json({ ok: false, error: "Error del Tribunal (Saturación). Reintenta en unos instantes." }, { status: 503 });
  }
}
