import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  const isMaster = session?.user?.rol === "Maestro" || session?.user?.rol === "ARCHITECT";
  
  if (!isMaster) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
  }

  const { id, status } = await request.json();

  try {
      const updateData = { status };
      if (status === "active") {
          updateData.startTime = new Date();
      }

      const concurso = await prisma.concurso.update({
          where: { id },
          data: updateData
      });

      return NextResponse.json({ ok: true, concurso });
  } catch (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

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
