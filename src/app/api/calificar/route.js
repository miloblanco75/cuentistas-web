import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { withTransactionRetry } from "@/lib/resilientDb";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
          return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
      }

      const body = await request.json();
      const { id, score } = body || {};

      if (!id || score === undefined || score === null) {
        return Response.json(
          { message: "Faltan datos para calificar." },
          { status: 400 }
        );
      }

      // PHASE HOTFIX 9: RESILIENT ATOMIC UPDATE
      const actualizada = await withTransactionRetry(async (tx) => {
          return await tx.entrada.update({
              where: { id },
              data: {
                  votos: { increment: 1 },
                  puntajeTotal: { increment: Number(score) }
              }
          });
      }, { maxRetries: 3, timeout: 15000 });

      return Response.json(
        {
          message: `Calificación registrada (${score}).`,
          entrada: actualizada
        },
        { status: 200 }
      );
  } catch (error) {
      console.error("❌ Calificar Error (Hotfix 9):", error);
      return Response.json(
        { message: "El Tribunal está saturado o la obra no existe. Reintenta." },
        { status: 503 }
      );
  }
}
