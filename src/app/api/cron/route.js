import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import nodemailer from "nodemailer";

export async function GET(req) {
    // Protección rudimentaria para el endpoint de cron
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();

        // 1. Simulación y Envío de Correos
        // Busca concursos que inician en aproximadamente 1 hora
        const upcoming = await prisma.concurso.findMany({
            where: {
                status: 'waiting',
                scheduledTime: {
                    gte: new Date(now.getTime() + 55 * 60 * 1000), // En 55 minutos
                    lte: new Date(now.getTime() + 65 * 60 * 1000)  // A 65 minutos maximo
                }
            }
        });
        
        let correosEnviados = 0;

        if (upcoming.length > 0) {
            console.log("[CRON] 🔍 Detectados concursos próximos. Iniciando envío masivo...");
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_APP_PASSWORD
                }
            });

            for (const c of upcoming) {
                const mailOptions = {
                    from: `"Tribunal Cuentistas" <${process.env.EMAIL_USER}>`,
                    to: process.env.EMAIL_USER,
                    subject: `¡La tinta te llama! Faltan 60 min para: ${c.titulo}`,
                    html: `
                        <div style="font-family: serif; background: #050505; color: white; padding: 40px; text-align: center;">
                            <h2 style="color: #D4AF37; font-style: italic; font-weight: 300;">El llamado final</h2>
                            <p style="font-size: 16px; opacity: 0.8;">Alista tu pluma, escritor. El concurso <strong>${c.titulo}</strong> está a punto de aperturarse.</p>
                            <hr style="border-color: #333; margin: 30px 0;" />
                            <p style="font-size: 12px; font-family: sans-serif; color: gray; letter-spacing: 2px; text-transform: uppercase;">Gran Tribunal Cuentistas</p>
                        </div>
                    `
                };
                
                await transporter.sendMail(mailOptions);
                console.log(`[CRON] ✅ Correo real de aviso despachado para: ${c.titulo}`);
                correosEnviados++;
            }
        } else {
            console.log("[CRON] 🔍 No hay concursos próximos. Enviando correo de prueba de conexión...");
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD }
            });
            
            try {
                await transporter.sendMail({
                    from: `"Sistema Cuentistas" <${process.env.EMAIL_USER}>`,
                    to: process.env.EMAIL_USER,
                    subject: `El Cronómetro funciona correctamente - Cuentistas`,
                    html: `<p style="font-family: serif; background: #050505; color: white; padding: 20px; text-align: center;">El servidor ha sido enlazado a tu correo de forma limpia y exitosa.</p>`
                });
                console.log(`[CRON] ✅ Correo de prueba de conexión despachado a ${process.env.EMAIL_USER}.`);
                correosEnviados++;
            } catch (mailErr) {
                console.error("[CRON] 🔥 Error crítico enviando el correo:", mailErr);
                throw mailErr;
            }
        }

        // 2. Iniciar Automáticamente los concursos que ya llegaron a la hora (Mock Automatización)
        const startingNow = await prisma.concurso.findMany({
            where: {
                status: 'waiting',
                scheduledTime: { lte: now } // Si la cita programada ya pasó o es ahora
            }
        });

        for (const c of startingNow) {
            console.log(`[CRON] 🚀 Iniciando automáticamente concurso: ${c.titulo}`);
            await prisma.concurso.update({
                where: { id: c.id },
                data: {
                    status: 'active',
                    startTime: now
                }
            });
            // Opcional: Emitir por Pusher que el concurso ha empezado
        }

        return NextResponse.json({ ok: true, remindersSent: correosEnviados, autoStarted: startingNow.length });
    } catch(e) {
        console.error("Cron Error:", e);
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}
