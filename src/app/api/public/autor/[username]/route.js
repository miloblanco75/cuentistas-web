import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request, { params }) {
    const { username } = params;

    try {
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                nombre: true,
                username: true,
                nivel: true,
                casa: true,
                victorias: true,
                streak: true,
                puntos: true,
                bio: true,
                entradas: {
                    where: { 
                        concurso: { status: 'finished' } 
                    },
                    select: {
                        texto: true,
                        timestamp: true,
                        concurso: {
                            select: { titulo: true }
                        }
                    },
                    orderBy: { timestamp: 'desc' }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "Autor no encontrado" }, { status: 404 });
        }

        // Formatear obras
        const obras = user.entradas.map(e => ({
            titulo: e.concurso.titulo,
            fecha: new Date(e.timestamp).toLocaleDateString(),
            texto: e.texto
        }));

        return NextResponse.json({ ok:true, autor: { ...user, obras, entradas: undefined } });
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
