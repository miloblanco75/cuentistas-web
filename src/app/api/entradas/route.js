import { NextResponse } from "next/server";
import prisma from "@/lib/db";
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

      const { concursoId, texto, participante } = await request.json();

      if (!concursoId || !texto) {
        return NextResponse.json({ ok: false, error: "Datos incompletos" }, { status: 400 });
      }

      const userId = session.user.id;

      // PHASE HOTFIX 6: RACE-SAFE TRANSACTIONAL IDEMPOTENCY
      const result = await prisma.$transaction(async (tx) => {
          const existing = await tx.entrada.findUnique({
              where: {
                  userId_concursoId: { userId, concursoId }
              },
              select: { id: true, boostApplied: true }
          });

          let action;
          let entry;

          if (existing) {
              entry = await tx.entrada.update({
                  where: { id: existing.id },
                  data: { texto }
              });
              action = "updated";
          } else {
              entry = await tx.entrada.create({
                  data: {
                      concursoId,
                      userId,
                      texto,
                      participante: participante || "Anónimo",
                      puntajeTotal: 0,
                      votos: 0,
                      boostApplied: false // Se aplica debajo si procede
                  }
              });
              action = "created";
          }

          // LOCK-GUARDED BOOST CONSUMPTION
          let boostAppliedNow = false;
          if (action === "created") {
              const user = await tx.user.findUnique({ 
                  where: { id: userId },
                  select: { activeBoost: true, boostExpiresAt: true }
              });

              const isBoostActive = user?.activeBoost && user.activeBoost > 0 && 
                                   user.boostExpiresAt && new Date(user.boostExpiresAt) > new Date();

              if (isBoostActive) {
                  await tx.entrada.update({
                      where: { id: entry.id },
                      data: { boostApplied: true }
                  });
                  await tx.user.update({
                      where: { id: userId },
                      data: { activeBoost: 0, boostExpiresAt: null }
                  });
                  boostAppliedNow = true;
              }
          }

          return { entry, action, boostAppliedNow };
      });

      return NextResponse.json({ 
          ok: true, 
          action: result.action,
          entradaId: result.entry.id,
          boostApplied: result.boostAppliedNow,
          message: result.action === "created" 
            ? "Tu manuscrito ha sido enviado al Tribunal 🔱" 
            : "Tu manuscrito fue actualizado correctamente 🔱"
      }, { status: result.action === "created" ? 201 : 200 });

  } catch (error) {
      console.error("❌ Submission Error:", error);
      if (error.code === 'P2002') {
          return NextResponse.json({ ok: false, error: "Ya existe una entrada para este concurso" }, { status: 409 });
      }
      return NextResponse.json({ ok: false, error: "Error interno del servidor" }, { status: 500 });
  }
}
