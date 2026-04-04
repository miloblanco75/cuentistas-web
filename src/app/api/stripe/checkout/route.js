import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
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

        const body = await request.json();
        const { itemId, itemName, itemPrice, itemTintaAmount } = body;

        if (!itemName || !itemPrice || !itemTintaAmount) {
            return NextResponse.json({ ok: false, error: "Información de producto incompleta" }, { status: 400 });
        }

        // Crear una sesión oficial de Stripe Checkout
        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            customer_email: session.user.email,
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: itemName,
                            description: `Adquisición de ${itemTintaAmount} gotas de tinta para la Arena.`,
                            images: ["https://i.imgur.com/gO1XF2C.png"] // Placeholder de imagen elegante
                        },
                        unit_amount: itemPrice * 100, // Stripe usa centavos (ej: $5.00 son 500 centavos)
                    },
                    quantity: 1,
                }
            ],
            // Agregamos metadata crucial para inyectar la tinta después en el Webhook
            metadata: {
                userId: session.user.id,
                tintaAmount: itemTintaAmount.toString()
            },
            success_url: `${process.env.NEXTAUTH_URL}/mercado?success=true&tinta=${itemTintaAmount}`,
            cancel_url: `${process.env.NEXTAUTH_URL}/mercado?canceled=true`
        });

        return NextResponse.json({ ok: true, url: stripeSession.url });

    } catch (e) {
        console.error("Error en Stripe Checkout:", e);
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}
