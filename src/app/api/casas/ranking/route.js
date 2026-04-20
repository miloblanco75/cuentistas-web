import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Obtenemos todos los usuarios que pertenecen a una casa y tienen puntos
        const users = await prisma.user.findMany({
            where: {
                casa: { not: null },
                puntosCasa: { gt: 0 }
            },
            select: {
                casa: true,
                puntosCasa: true
            }
        });

        // Agregamos puntos por casa
        const houseRanking = users.reduce((acc, user) => {
            const casaId = user.casa.toLowerCase();
            if (!acc[casaId]) {
                acc[casaId] = 0;
            }
            acc[casaId] += user.puntosCasa;
            return acc;
        }, {});

        // Convertimos a array y ordenamos
        const ranking = Object.entries(houseRanking)
            .map(([id, puntos]) => ({ id, puntos }))
            .sort((a, b) => b.puntos - a.puntos);

        return NextResponse.json({ ok: true, ranking });
    } catch (error) {
        console.error("House Ranking Error:", error);
        return NextResponse.json({ ok: false, error: "Fallo al consultar el Gran Libro de Casas" }, { status: 500 });
    }
}
