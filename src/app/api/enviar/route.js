import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request) {
  try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
          return NextResponse.json({ message: "No autorizado" }, { status: 401 });
      }

      const body = await request.json();
      const { id, texto } = body || {};

      if (!id || !texto || !texto.trim()) {
        return NextResponse.json(
          { message: "Faltan datos para enviar el cuento." },
          { status: 400 }
        );
      }

      const concurso = await prisma.concurso.findUnique({ where: { id } });
      if (!concurso) {
        return NextResponse.json(
          { message: "El concurso no existe." },
          { status: 404 }
        );
      }

      const entrada = await prisma.entrada.create({
          data: {
              concursoId: id,
              userId: session.user.id,
              texto: texto.trim(),
              participante: session.user.username,
              puntajeTotal: 0,
              votos: 0
          }
      });

      return NextResponse.json(
        {
          message: "Tu cuento fue enviado correctamente ✨",
          entrada
        },
        { status: 200 }
      );
  } catch (error) {
      return NextResponse.json({ message: "Error interno DB." }, { status: 500 });
  }
}
