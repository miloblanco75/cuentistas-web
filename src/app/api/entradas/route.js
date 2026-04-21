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
        return NextResponse.json(
          { ok: false, error: "Datos incompletos" },
          { status: 400 }
        );
      }

      const userId = session.user.id;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const now = new Date();
      const isBoostActive = user.activeBoost > 0 && user.boostExpiresAt && new Date(user.boostExpiresAt) > now;

      const nueva = await prisma.$transaction(async (tx) => {
          const entry = await tx.entrada.create({
              data: {
                  concursoId,
                  userId,
                  texto,
                  participante: participante || user.username || "Anónimo",
                  puntajeTotal: 0,
                  votos: 0,
                  boostApplied: isBoostActive
              }
          });

          if (isBoostActive) {
              await tx.user.update({
                  where: { id: userId },
                  data: { activeBoost: 0, boostExpiresAt: null }
              });
          }

          return entry;
      });

      return NextResponse.json({ 
          ok: true, 
          entrada: nueva,
          boostApplied: isBoostActive,
          message: isBoostActive ? "Tu +5% Boost fue aplicado a esta participación" : null
      }, { status: 201 });
  } catch (e) {
      return NextResponse.json({ ok: false, error: "No se pudo crear la entrada" }, { status: 500 });
  }
}
