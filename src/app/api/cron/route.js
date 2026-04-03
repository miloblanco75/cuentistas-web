import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import nodemailer from "nodemailer";
import { pusherServer } from "@/lib/pusher";

const PREMIOS = {
  P1: { tinta: 500, xp: 100, victoria: 1 },
  P2: { tinta: 250, xp: 50, victoria: 0 },
  P3: { tinta: 100, xp: 25, victoria: 0 },
  PART: { tinta: 20, xp: 10, victoria: 0 }
};

export async function GET(req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();
        const resultados = {
          remindersSent: 0,
          autoStarted: 0,
          payouts: 0,
          slotsCreated: 0
        };

        // --- 1. PROGRAMACIÓN AUTOMÁTICA (MARTES Y VIERNES) ---
        const day = now.getDay(); // 2 = Martes, 5 = Viernes
        if (day === 2 || day === 5) {
            const hours = [9, 12, 17, 21];
            for (const h of hours) {
                const scheduled = new Date(now);
                scheduled.setHours(h, 0, 0, 0);
                
                // Solo crear si es hoy y la hora aún no ha pasado por mucho
                if (scheduled > now) {
                    const exists = await prisma.concurso.findFirst({
                        where: { scheduledTime: scheduled }
                    });

                    if (!exists) {
                        await prisma.concurso.create({
                            data: {
                                titulo: `Gran Duelo de ${day === 2 ? 'Martes' : 'Viernes'} (${h}:00)`,
                                descripcion: "Torneo reglamentario del Cónclave de Cuentistas.",
                                scheduledTime: scheduled,
                                temaGeneral: "Esperando revelación...",
                                temaExacto: "Tema secreto del Maestro",
                                status: 'waiting'
                            }
                        });
                        resultados.slotsCreated++;
                    }
                }
            }
        }

        // --- 2. RECORDATORIOS (EL HERALDO) ---
        const upcoming = await prisma.concurso.findMany({
            where: {
                status: 'waiting',
                scheduledTime: {
                    gte: new Date(now.getTime() + 10 * 60 * 1000), // En 10-20 min
                    lte: new Date(now.getTime() + 20 * 60 * 1000) 
                }
            }
        });

        if (upcoming.length > 0) {
            for (const c of upcoming) {
                // Notificación Pusher
                await pusherServer.trigger("cuentistas-global", "concurso-proximo", {
                    titulo: c.titulo,
                    minutos: 15
                });
                resultados.remindersSent++;
            }
        }

        // --- 3. INICIO AUTOMÁTICO ---
        const startingNow = await prisma.concurso.findMany({
            where: {
                status: 'waiting',
                scheduledTime: { lte: now }
            }
        });

        for (const c of startingNow) {
            await prisma.concurso.update({
                where: { id: c.id },
                data: { status: 'active', startTime: now }
            });
            await pusherServer.trigger("cuentistas-global", "concurso-iniciado", {
                id: c.id,
                titulo: c.titulo
            });
            resultados.autoStarted++;
        }

        // --- 4. LA COSECHA (REPARTO DE PREMIOS AUTOMÁTICO) ---
        const finishedToProcess = await prisma.concurso.findMany({
            where: {
                status: 'finished',
                processed: false
            },
            include: {
                entradas: {
                    orderBy: { puntajeTotal: 'desc' }
                }
            }
        });

        for (const c of finishedToProcess) {
            console.log(`[HARVEST] Procesando premios para: ${c.titulo}`);
            
            for (let i = 0; i < c.entradas.length; i++) {
                const entrada = c.entradas[i];
                let premio;
                
                if (i === 0) premio = PREMIOS.P1;
                else if (i === 1) premio = PREMIOS.P2;
                else if (i === 2) premio = PREMIOS.P3;
                else premio = PREMIOS.PART;

                // Actualizar Usuario
                await prisma.user.update({
                    where: { id: entrada.userId },
                    data: {
                        tinta: { increment: premio.tinta },
                        puntos: { increment: premio.xp },
                        victorias: { increment: premio.victoria },
                        // Si es batalla de casas, sumar al global de la casa
                        puntosCasa: c.tipo === 'casa' ? { increment: premio.xp } : undefined
                    }
                });
            }

            // Marcar como procesado
            await prisma.concurso.update({
                where: { id: c.id },
                data: { processed: true }
            });

            // Noticia en la comunidad (Simulación via Mensaje)
            if (c.entradas.length > 0) {
              const ganador = c.entradas[0].participante;
              await prisma.mensaje.create({
                  data: {
                      userId: "system", // ID del sistema
                      texto: `🏛️ ¡LA COSECHA HA TERMINADO! El Gran Maestro proclama a ${ganador} como vencedor del certamen: ${c.titulo}.`
                  }
              });
            }

            resultados.payouts++;
        }

        return NextResponse.json({ ok: true, ...resultados });
    } catch(e) {
        console.error("Cron Error:", e);
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}
