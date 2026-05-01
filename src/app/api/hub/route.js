import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
        const dbItems = await prisma.tiendaItem.findMany({
            where: { disponible: true },
            orderBy: { createdAt: "desc" }
        });

        const libros = dbItems.filter(i => i.tipo === 'libro');
        const merch = dbItems.filter(i => i.tipo === 'objeto');
        const tintaItems = dbItems.filter(i => i.tipo === 'tinta');

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
            const { suspicious, tabSwitches } = body;

            // 1. Persistencia en DB (Para Reporte de Integridad)
            const now = new Date();
            const currentDraft = await prisma.draft.findUnique({
                where: { userId_concursoId: { userId, concursoId } }
            });

            // Reconstruir o actualizar el Timeline
            let integrityTimeline = [];
            if (currentDraft?.integrityData && typeof currentDraft.integrityData === 'object') {
                integrityTimeline = currentDraft.integrityData.timeline || [];
            }

            // Añadir snapshot actual al timeline (limitado para no saturar)
            // Solo añadimos si es el primer registro o si han pasado más de 10 segundos
            const lastEntry = integrityTimeline[integrityTimeline.length - 1];
            const lastTime = lastEntry ? new Date(lastEntry.t).getTime() : 0;
            
            if (!lastEntry || (now.getTime() - lastTime > 10000) || suspicious || (tabSwitches > (currentDraft?.tabSwitches || 0))) {
                integrityTimeline.push({
                    t: now.toISOString(),
                    l: texto.length,
                    s: !!suspicious,
                    ts: tabSwitches || 0
                });
            }

            // Upsert del Draft
            await prisma.draft.upsert({
                where: { userId_concursoId: { userId, concursoId } },
                update: {
                    texto,
                    suspicious: !!suspicious,
                    tabSwitches: tabSwitches || 0,
                    integrityData: { timeline: integrityTimeline },
                    updatedAt: now
                },
                create: {
                    userId,
                    concursoId,
                    texto,
                    username: session.user.username,
                    suspicious: !!suspicious,
                    tabSwitches: tabSwitches || 0,
                    integrityData: { timeline: integrityTimeline },
                    updatedAt: now,
                    startedAt: now
                }
            });

            // 2. Memoria Temporal (Retrocompatibilidad y Velocidad)
            if (!global.drafts[concursoId]) global.drafts[concursoId] = [];
            const idx = global.drafts[concursoId].findIndex(d => d.userId === userId);
            const payload = { userId, username: session.user.username, texto, suspicious, tabSwitches };
            
            if (idx >= 0) {
                global.drafts[concursoId][idx] = payload;
            } else {
                global.drafts[concursoId].push(payload);
            }

            // 3. Emitir evento por Pusher
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
