import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

      // PHASE HOTFIX 7: RESILIENT UPDATE
      const actualizada = await prisma.entrada.update({
          where: { id },
          data: {
              votos: { increment: 1 },
              puntajeTotal: { increment: Number(score) }
          }
      }).catch(e => {
          console.error("❌ Voting DB Error:", e);
          throw new Error("DB_TIMEOUT_OR_FAILURE");
      });

      return NextResponse.json(
        {
          message: `Calificación registrada (${score}).`,
          entrada: actualizada
        },
        { status: 200 }
      );
  } catch (error) {
      console.error("❌ Calificar Error:", error);
      return NextResponse.json(
        { message: error.message === "DB_TIMEOUT_OR_FAILURE" ? "El Tribunal está saturado, reintenta." : "No se encontró la entrada o error DB." },
        { status: error.message === "DB_TIMEOUT_OR_FAILURE" ? 503 : 404 }
      );
  }
}
