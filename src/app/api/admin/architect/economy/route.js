import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.rol !== "ARCHITECT") {
            return NextResponse.json({ ok: false, error: "Control denegado al Tesoro" }, { status: 403 });
        }

        const { action, amount, targetId, details } = await request.json();

        // 1. Registro Auditor
        await prisma.auditLog.create({
            data: {
                adminId: session.user.id,
                action: `ECONOMY_${action.toUpperCase()}`,
                targetId: targetId || "GLOBAL",
                details: JSON.stringify({ amount, details })
            }
        });

        // 2. Ejecución Económica
        if (action === "airdrop") {
            if (targetId === "ALL") {
                // Airdrop masivo
                await prisma.user.updateMany({
                    data: { tinta: { increment: amount } }
                });
            } else {
                // Airdrop específico
                await prisma.user.update({
                    where: { id: targetId },
                    data: { tinta: { increment: amount } }
                });
            }
        }

        if (action === "update_price") {
            const { itemId, newPrice } = details;
            await prisma.tiendaItem.update({
                where: { id: itemId },
                data: { precio: newPrice }
            });
        }

        return NextResponse.json({ ok: true, message: "Ajuste económico realizado" });

    } catch (error) {
        console.error("Economy Control Error:", error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.rol !== "ARCHITECT") {
            return NextResponse.json({ ok: false, error: "Sin acceso al Tesoro Imperial" }, { status: 403 });
        }

        // Obtener ingresos de registros de Stripe (opcional, por ahora mostramos items y balance de tinta global)
        const items = await prisma.tiendaItem.findMany();
        const totalInk = await prisma.user.aggregate({ _sum: { tinta: true } });
        const userCount = await prisma.user.count();

        return NextResponse.json({ 
            ok: true, 
            inventory: items,
            stats: { 
                totalInkCirculation: totalInk._sum.tinta,
                averageInkPerUser: Math.round(totalInk._sum.tinta / userCount)
            }
        });

    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
