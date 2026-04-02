import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
      if (id) {
        const concurso = await prisma.concurso.findUnique({ where: { id } });
        if (!concurso) {
          return NextResponse.json(
            { ok: false, error: "Concurso no encontrado" },
            { status: 404 }
          );
        }
        return NextResponse.json({ ok: true, concurso }, { status: 200 });
      }

      const concursos = await prisma.concurso.findMany({
          orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json(
        {
          ok: true,
          total: concursos.length,
          concursos
        },
        { status: 200 }
      );
  } catch (error) {
      return NextResponse.json(
        { ok: false, error: "Error de base de datos" },
        { status: 500 }
      );
  }
}
