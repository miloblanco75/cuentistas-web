import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16"
});

export async function POST(req) {
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event;

    try {
        // Validación de firma (Por ahora lo evaluamos crudo, pero en producción deberías configurar STRIPE_WEBHOOK_SECRET)
        // const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        // event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
        
        event = JSON.parse(rawBody); // Fallback si no hay webhook secret configurado aún
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        try {
            const { userId, tintaAmount } = session.metadata;
            
            if (userId && tintaAmount) {
                // Inyectar tinta al usuario oficial
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        tinta: { increment: parseInt(tintaAmount, 10) }
                    }
                });
                console.log(`[Stripe Webhook] 💧 Transacción exitosa. Se inyectaron ${tintaAmount} gotas a ${userId}`);
            }
        } catch (e) {
            console.error("[Stripe Webhook] Prisma Error:", e.message);
        }
    }

    return NextResponse.json({ received: true });
}
