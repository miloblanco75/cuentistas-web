import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
      const entradas = await prisma.entrada.findMany({
          include: {
              concurso: { select: { titulo: true } },
              user: { select: { username: true } }
          },
          orderBy: { puntajeTotal: 'desc' }
      });

      const ranking = entradas.map((e) => ({
        ...e,
        concursoTitulo: e.concurso?.titulo || "Sin concurso",
        autorUsername: e.user?.username || e.participante
      }));

      return NextResponse.json(
        {
          ok: true,
          total: ranking.length,
          ranking
        },
        { status: 200 }
      );
  } catch (error) {
      return NextResponse.json({ ok: false, error: "Error de DB" }, { status: 500 });
  }
}
