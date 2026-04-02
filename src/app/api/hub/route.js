import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// Temporal para drafts
global.drafts = global.drafts || {};

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (type === "drafts") {
        return NextResponse.json({ ok: true, drafts: global.drafts[id] || [] });
    }

    if (type === "comunidad") {
        const msgs = await prisma.mensaje.findMany({
            include: { user: { select: { username: true } } },
            orderBy: { timestamp: 'desc' },
            take: 100
        });
        const mensajesFormat = msgs.reverse().map(m => ({
            id: m.id,
            user: m.user?.username || "Sistema",
            texto: m.texto,
            timestamp: m.timestamp
        }));
        const anuncios = [
            { id: 1, titulo: "Gran Torneo de Primavera anunciado", autor: "Tribunal", fecha: "Hoy" },
            { id: 2, titulo: "El Sello de la Quimera lidera los rankings", autor: "Tribunal", fecha: "Ayer" },
            { id: 3, titulo: "Nuevas runas añadidas al registro histórico", autor: "Tribunal", fecha: "Hace 2 días" }
        ];

        return NextResponse.json({ ok: true, comunidad: { online: 5, mensajes: mensajesFormat, anuncios } });
    }

    if (type === "mercado") {
        const libros = [
            { id: 1, titulo: "Antología del Cónclave", autor: "El Tribunal Supremo", precio: 300, imagen: "📘" },
            { id: 2, titulo: "Tinta y Sangre", autor: "Maestro Errante", precio: 450, imagen: "📕" },
            { id: 3, titulo: "Cantos de la Quimera", autor: "Anónimo", precio: 600, imagen: "📜" }
        ];
        const merch = [
            { id: 1, nombre: "Pluma Real", precio: 25, imagen: "🖋️" },
            { id: 2, nombre: "Relicario", precio: 40, imagen: "🏺" },
            { id: 3, nombre: "Sello de Lacre", precio: 15, imagen: "🕯️" },
            { id: 4, nombre: "Mapa Estelar", precio: 50, imagen: "🗺️" }
        ];
        const tintaItems = [
            { id: 1, nombre: "Frasco Pequeño", cantidad: 100, precio: 5, bg: "from-blue-900/40" },
            { id: 2, nombre: "Tintero Real", cantidad: 500, precio: 20, bg: "from-purple-900/40" },
            { id: 3, nombre: "Manantial de Tinta", cantidad: 1500, precio: 50, bg: "from-gold/20" }
        ];
        return NextResponse.json({ ok: true, mercado: { libros, merch, tintaItems } });
    }

    return NextResponse.json({ ok: false, error: "Tipo no válido" }, { status: 400 });
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const { type, concursoId, texto, msg } = body;

        if (type === "draft") {
            const userId = session.user.id;
            if (!global.drafts[concursoId]) global.drafts[concursoId] = [];
            const idx = global.drafts[concursoId].findIndex(d => d.userId === userId);
            
            const payload = { userId, username: session.user.username, texto };
            if (idx >= 0) {
                global.drafts[concursoId][idx].texto = texto;
            } else {
                global.drafts[concursoId].push(payload);
            }

            // Emitir evento por Pusher
            import("@/lib/pusher").then(({ pusherServer }) => {
                pusherServer.trigger(`concurso-${concursoId}`, "live-draft", payload);
            });

            return NextResponse.json({ ok: true });
        }

        if (type === "chat") {
            const nuevoMensaje = await prisma.mensaje.create({
                data: {
                    userId: session.user.id,
                    texto: msg
                }
            });
            
            const msgPayload = {
                id: nuevoMensaje.id,
                user: session.user.username,
                texto: msg,
                timestamp: nuevoMensaje.timestamp
            };

            // Emitir evento por Pusher
            import("@/lib/pusher").then(({ pusherServer }) => {
                pusherServer.trigger("comunidad", "new-message", msgPayload);
            });

            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ ok: false, error: "Acción no válida" }, { status: 400 });
    } catch(e) {
        return NextResponse.json({ ok: false, error: "Error en Hub" }, { status: 500 });
    }
}
