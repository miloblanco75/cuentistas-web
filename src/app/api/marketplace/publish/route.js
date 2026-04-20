import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
        }

        const { entradaId, precio } = await request.json();

        if (!entradaId || !precio) {
            return NextResponse.json({ ok: false, error: "Datos incompletos" }, { status: 400 });
        }

        // Verificar que la entrada pertenezca al usuario y el concurso esté finalizado
        const entrada = await prisma.entrada.findUnique({
            where: { id: entradaId },
            include: { concurso: true }
        });

        if (!entrada || entrada.userId !== session.user.id) {
            return NextResponse.json({ ok: false, error: "Entrada no encontrada o no autorizada" }, { status: 404 });
        }

        if (entrada.concurso.status !== "finished") {
            return NextResponse.json({ ok: false, error: "El concurso aún no ha finalizado" }, { status: 400 });
        }

        // Crear el TiendaItem (Legado)
        const legado = await prisma.tiendaItem.create({
            data: {
                nombre: `Legado: ${entrada.concurso.titulo} - ${session.user.username}`,
                descripcion: `Obra original forjada en el Cónclave. Autor: ${session.user.username}`,
                precio: parseFloat(precio),
                tipo: "libro",
                categoria: "Legado",
                disponible: true,
                authorId: session.user.id,
                commission: 0.20, // El Diezmo del 20%
                metadata: {
                    originalEntradaId: entradaId,
                    concursoTitulo: entrada.concurso.titulo
                }
            }
        });

        // Marcar la entrada como publicada
        await prisma.entrada.update({
            where: { id: entradaId },
            data: { isPublished: true }
        });

        return NextResponse.json({ ok: true, legado });

    } catch (e) {
        console.error("Error al publicar legado:", e);
        return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
    }
}
