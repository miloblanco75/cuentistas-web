import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
      // 🔱 PRESTIGE RANKING (PHASE 14)
      // Obtenemos el Top 100 de Ciudadanos por ELO
      const users = await prisma.user.findMany({
          where: {
              NOT: { username: null }
          },
          select: {
              id: true,
              username: true,
              elo: true,
              rank: true,
              casa: true,
              image: true,
              puntosCasa: true
          },
          orderBy: { elo: 'desc' },
          take: 100
      });

      return NextResponse.json(
        {
          ok: true,
          total: users.length,
          ranking: users
        },
        { status: 200 }
      );
  } catch (error) {
      console.error("❌ Error en API Ranking:", error.message);
      return NextResponse.json({ ok: false, error: "Error de DB" }, { status: 500 });
  }
}
