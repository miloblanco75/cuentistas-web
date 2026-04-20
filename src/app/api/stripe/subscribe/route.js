import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16"
});

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
        }

        const { priceId, itemId } = await request.json();

        let finalPriceId = priceId;

        if (itemId) {
            const item = await prisma.tiendaItem.findUnique({ where: { id: itemId } });
            if (item && item.stripePriceId) {
                finalPriceId = item.stripePriceId;
            }
        }

        if (!finalPriceId || finalPriceId === "placeholder_id") {
            return NextResponse.json({ ok: false, error: "Price ID oficial de Stripe requerido. Por favor, configúralo en el panel admin." }, { status: 400 });
        }

        // Obtener o crear Customer de Stripe
        let user = await prisma.user.findUnique({ where: { id: session.user.id } });
        let stripeCustomerId = user.stripeCustomerId;

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: session.user.email,
                name: session.user.name || session.user.username,
                metadata: { userId: session.user.id }
            });
            stripeCustomerId = customer.id;
            await prisma.user.update({
                where: { id: session.user.id },
                data: { stripeCustomerId }
            });
        }

        // Crear Sesión de Suscripción
        const stripeSession = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                }
            ],
            success_url: `${process.env.NEXTAUTH_URL}/hub?subscribed=true`,
            cancel_url: `${process.env.NEXTAUTH_URL}/mercado?canceled=true`,
            metadata: {
                userId: session.user.id,
                subscriptionType: "ROYAL_LINEAGE"
            }
        });

        return NextResponse.json({ ok: true, url: stripeSession.url });

    } catch (e) {
        console.error("Error en Stripe Subscription:", e);
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}
