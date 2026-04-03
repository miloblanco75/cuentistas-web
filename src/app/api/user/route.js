import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

const niveles = [
  { nombre: "Principiante", min: 0 },
  { nombre: "Intermedio", min: 100 },
  { nombre: "Avanzado", min: 300 },
  { nombre: "Maestro", min: 600 },
  { nombre: "Legendario", min: 1000 }
];

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            entradas: {
                include: { concurso: true },
                orderBy: { timestamp: 'desc' }
            }
        }
    });

    if (!dbUser) {
        return NextResponse.json({ 
            ok: true, 
            user: {
                nombre: session.user.name || "Espectador",
                rol: "spectator",
                nivel: "Principiante",
                tinta: 0,
                obras: [],
                archivoEvolucion: []
            } 
        });
    }

    const { password, ...user } = dbUser;

    // Poderes de Soberano: Si es Maestro, tiene tinta infinita visualmente
    if (user.rol === "Maestro") {
        user.tinta = 999999;
        user.nivel = "Gran Maestro del Cónclave";
    }

    const userWithObras = {
        ...user,
        streak: user.streak || 0,
        lastParticipation: user.lastParticipation,
        obras: user.entradas.filter(e => e.concurso?.status === 'finished').map(e => ({
            titulo: e.concurso?.titulo || 'Desconocido',
            fecha: new Date(e.timestamp).toLocaleDateString(),
            texto: e.texto
        })),
        archivoEvolucion: user.entradas.map(e => ({
            titulo: e.concurso?.titulo || 'Desconocido',
            fecha: new Date(e.timestamp).toLocaleDateString(),
            texto: e.texto,
            pressure: e.concurso?.status !== 'finished'
        }))
    };

    return NextResponse.json({ ok: true, user: userWithObras });
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const { action, cantidad, concursoId } = await request.json();
    const userId = session.user.id;
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });

    // Bypass Maestro: El Soberano no paga ni tiene restricciones de nivel
    if (dbUser.rol === "Maestro") {
        if (action === "check") {
            return NextResponse.json({ ok: true, access: true, isMaster: true });
        }
        if (action === "pay") {
            return NextResponse.json({ ok: true, tinta: 999999 }); // Gratis
        }
    }

    if (action === "buy") {
        const updated = await prisma.user.update({
            where: { id: userId },
            data: { tinta: { increment: cantidad } }
        });
        return NextResponse.json({ ok: true, tinta: updated.tinta });
    }

    if (action === "pay") {
        if (dbUser.tinta >= cantidad) {
            const updated = await prisma.user.update({
                where: { id: userId },
                data: { tinta: { decrement: cantidad } }
            });
            return NextResponse.json({ ok: true, tinta: updated.tinta });
        }
        return NextResponse.json({ ok: false, error: "Tinta insuficiente" }, { status: 400 });
    }

    if (action === "check") {
        const concurso = await prisma.concurso.findUnique({ where: { id: concursoId } });
        if (!concurso) return NextResponse.json({ ok: true, access: false });

        if (concurso.categoria) {
            const userNivelIdx = niveles.findIndex(n => n.nombre === dbUser.nivel);
            const contestNivelIdx = niveles.findIndex(n => n.nombre === concurso.categoria);
            
            if (userNivelIdx >= contestNivelIdx) {
                return NextResponse.json({ ok: true, access: true });
            }
            if (dbUser.tinta >= concurso.costoTinta) {
                return NextResponse.json({ ok: true, access: "pay" });
            }
            return NextResponse.json({ ok: true, access: false });
        }
        return NextResponse.json({ ok: true, access: true });
    }

    return NextResponse.json({ ok: false, error: "Acción no válida" }, { status: 400 });
}
