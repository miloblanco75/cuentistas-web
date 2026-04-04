import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

      // Cálculos de Racha (Streak)
      const dbUser = await prisma.user.findUnique({ 
          where: { id: session.user.id },
          select: { lastParticipation: true, streak: true }
      });

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let newStreak = dbUser.streak || 0;

      if (dbUser.lastParticipation) {
          const lastPart = new Date(dbUser.lastParticipation);
          const lastDate = new Date(lastPart.getFullYear(), lastPart.getMonth(), lastPart.getDate());
          const diffTime = today.getTime() - lastDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
              newStreak += 1;
          } else if (diffDays > 1) {
              newStreak = 1;
          }
      } else {
          newStreak = 1;
      }

      // Transacción para asegurar integridad
      const [entrada] = await prisma.$transaction([
          prisma.entrada.create({
              data: {
                  concursoId: id,
                  userId: session.user.id,
                  texto: texto.trim(),
                  participante: session.user.name || "Escritor Anónimo",
                  puntajeTotal: 0,
                  votos: 0
              }
          }),
          prisma.user.update({
              where: { id: session.user.id },
              data: { 
                  lastParticipation: now,
                  streak: newStreak
              }
          })
      ]);

      return NextResponse.json(
        {
          message: "Tu cuento fue enviado correctamente y tu racha ha sido actualizada ✨",
          streak: newStreak,
          entrada
        },
        { status: 200 }
      );
  } catch (error) {
      return NextResponse.json({ message: "Error interno DB." }, { status: 500 });
  }
}
