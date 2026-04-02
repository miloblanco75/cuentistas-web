import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request) {
  try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
          return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
      }

      const body = await request.json();
      const { id, score } = body || {};

      if (!id || score === undefined || score === null) {
        return NextResponse.json(
          { message: "Faltan datos para calificar." },
          { status: 400 }
        );
      }

      const actualizada = await prisma.entrada.update({
          where: { id },
          data: {
              votos: { increment: 1 },
              puntajeTotal: { increment: Number(score) }
          }
      });

      return NextResponse.json(
        {
          message: `Calificación registrada (${score}).`,
          entrada: actualizada
        },
        { status: 200 }
      );
  } catch (error) {
      return NextResponse.json(
        { message: "No se encontró la entrada o error DB." },
        { status: 404 }
      );
  }
}
