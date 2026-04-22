import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16"
});

export async function POST(req) {
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
        console.error("❌ [Webhook] Sin firma en headers");
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event;

    try {
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        // Validación criptográfica estricta (SIN BYPASS)
        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err) {
        console.error(`❌ Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // IDEMPOTENCIA: Verificar si el evento ya fue procesado
    try {
        const existingEvent = await prisma.stripeEvent.findUnique({
            where: { eventId: event.id }
        });

        if (existingEvent) {
            console.log(`⚠️ [Webhook] Evento ya procesado: ${event.id}`);
            return NextResponse.json({ received: true, note: "Already processed" });
        }

        // Registrar evento ANTES de procesar lógica de negocio
        await prisma.stripeEvent.create({
            data: { eventId: event.id }
        });
    } catch (e) {
        console.error("❌ [Webhook] Error en capa de idempotencia:", e.message);
        return NextResponse.json({ error: "Idempotency check failed" }, { status: 500 });
    }

    // FULFILLMENT LOGIC
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { userId, tintaAmount } = session.metadata;
        
        console.log(`[Stripe] Procesando fulfillment para sesión: ${session.id}`);

        try {
            if (userId && tintaAmount) {
                // Inyectar tinta al usuario con validación de existencia
                const user = await prisma.user.update({
                    where: { id: userId },
                    data: {
                        tinta: { increment: parseInt(tintaAmount, 10) }
                    }
                });
                
                console.log(`✅ [Stripe Webhook] Tinta inyectada: ${tintaAmount} gotas -> Usuario: ${user.username} (${userId})`);
            } else {
                console.error("❌ [Stripe Webhook] Metadata faltante (userId o tintaAmount)");
            }
        } catch (e) {
            console.error("❌ [Stripe Webhook] Fallo en base de datos:", e.message);
            // NOTA: No borramos el StripeEvent aquí para evitar bucles de reintento infinitos si el error es de lógica
            return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
