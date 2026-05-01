import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withTransactionRetry } from "@/lib/resilientDb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
      const entradas = await prisma.entrada.findMany({
          where: { isTraining: false },
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
          // VALIDATION: Check contest status and time
          const currentContest = await tx.concurso.findUnique({
              where: { id: concursoId },
              select: { status: true, startTime: true, duration: true }
          });
          
          if (!currentContest) {
              throw new Error("Concurso no encontrado");
          }
          
          if (currentContest.status !== "active") {
              throw new Error("El concurso ya no está activo");
          }
          
          if (currentContest.startTime && currentContest.duration) {
              const elapsed = (Date.now() - new Date(currentContest.startTime).getTime()) / 1000;
              // 15 seconds grace period for network latency
              if (elapsed > currentContest.duration + 15) {
                  throw new Error("El tiempo del concurso ha expirado");
              }
          }

          const existing = await tx.entrada.findUnique({
              where: {
                  userId_concursoId: { userId, concursoId }
              },
              select: { id: true }
          });

          // Buscar el borrador para heredar el integrityData
          const draft = await tx.draft.findUnique({
              where: { userId_concursoId: { userId, concursoId } }
          });

          if (existing) {
              const updated = await tx.entrada.update({
                  where: { id: existing.id },
                  data: { 
                      texto,
                      videoUrl: videoUrl || undefined,
                      videoStatus: videoUrl ? videoStatus : undefined,
                      suspicious: draft?.suspicious || false,
                      tabSwitches: draft?.tabSwitches || 0,
                      integrityData: draft?.integrityData || undefined
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
                      videoStatus,
                      suspicious: draft?.suspicious || false,
                      tabSwitches: draft?.tabSwitches || 0,
                      integrityData: draft?.integrityData || undefined
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
      let newInfluenceRankUnlocked = null; // AJUSTE #4: para celebración visible
      if (action === "created") {
          try {
              const user = await prisma.user.findUnique({ 
                  where: { id: userId },
                  select: { activeBoost: true, boostExpiresAt: true }
              });

              // Increment entradasTotales and update lastParticipation
              const updatedUser = await prisma.user.update({
                  where: { id: userId },
                  data: { 
                      entradasTotales: { increment: 1 },
                      lastParticipation: new Date()
                  },
                  select: { entradasTotales: true, referredBy: true }
              });

              // FASE 7: PROOF OF ACTION (Atribución limpia en primera entrada)
              if (updatedUser.entradasTotales === 1 && updatedUser.referredBy) {
                  try {
                      const referrer = await prisma.user.update({
                          where: { username: updatedUser.referredBy },
                          data: { successfulReferrals: { increment: 1 } },
                          select: { successfulReferrals: true }
                      });
                      // Desbloquear influenceRank sin sobreescribir — solo como título disponible
                      const newCount = referrer.successfulReferrals;
                      let newInfluenceRank = null;
                      if (newCount >= 15) newInfluenceRank = "El Heraldo del Tribunal";
                      else if (newCount >= 5) newInfluenceRank = "Portador de Nuevas Plumas";
                      else if (newCount >= 1) newInfluenceRank = "El Invocador";
                      if (newInfluenceRank) {
                          await prisma.user.update({
                              where: { username: updatedUser.referredBy },
                              data: { influenceRank: newInfluenceRank }
                          });
                          newInfluenceRankUnlocked = newInfluenceRank; // Para notificar al cliente
                      }
                      console.log(`🔱 Referido validado: +1 a ${updatedUser.referredBy} (${newCount} total)`);
                  } catch (e) {
                      console.warn("⚠️ Referrer not found or error tracking referral:", e.message);
                  }
              }

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
          newInfluenceRank: newInfluenceRankUnlocked, // AJUSTE #4: para celebración visible
          message: action === "created" 
            ? "Tu manuscrito ha sido enviado al Tribunal 🔱" 
            : "Tu manuscrito fue actualizado correctamente 🔱"
      }, { status: action === "created" ? 201 : 200 });

  } catch (error) {
      console.error("❌ Submission Error (Hotfix 8):", error);
      if (error.code === 'P2002') {
          return NextResponse.json({ ok: false, error: "Ya existe una entrada para este concurso" }, { status: 409 });
      }
      
      const isCustomError = ["Concurso no encontrado", "El concurso ya no está activo", "El tiempo del concurso ha expirado"].includes(error.message);
      
      return NextResponse.json(
          { ok: false, error: isCustomError ? error.message : "Error del Tribunal (Saturación). Reintenta en unos instantes." }, 
          { status: isCustomError ? 400 : 503 }
      );
  }
}
