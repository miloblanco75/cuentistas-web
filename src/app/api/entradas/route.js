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

      const nueva = await prisma.entrada.create({
          data: {
              concursoId,
              userId: session.user.id,
              texto,
              participante: participante || session.user.username,
              puntajeTotal: 0,
              votos: 0
          }
      });

      return NextResponse.json({ ok: true, entrada: nueva }, { status: 201 });
  } catch (e) {
      return NextResponse.json({ ok: false, error: "No se pudo crear la entrada" }, { status: 500 });
  }
}
