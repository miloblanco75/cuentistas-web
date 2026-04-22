import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
        }

        const { itemId } = await request.json();

        if (!itemId) {
            return NextResponse.json({ ok: false, error: "ID de objeto requerido" }, { status: 400 });
        }

        // 1. Obtener datos frescos
        const [user, item] = await Promise.all([
            prisma.user.findUnique({ where: { id: session.user.id } }),
            prisma.storeItem.findUnique({ where: { id: itemId } })
        ]);

        if (!item || !item.isActive) {
            return NextResponse.json({ ok: false, error: "Objeto no disponible" }, { status: 404 });
        }

        // 2. Validaciones
        if (user.tinta < item.priceTinta) {
            return NextResponse.json({ 
                ok: false, 
                error: "Tinta insuficiente",
                missing: item.priceTinta - user.tinta
            }, { status: 402 });
        }

        // Verificar si ya lo tiene (excepto para Boosts)
        if (item.type !== 'boost') {
            const alreadyOwned = await prisma.inventory.findUnique({
                where: {
                    userId_storeItemId: {
                        userId: user.id,
                        storeItemId: item.id
                    }
                }
            });
            if (alreadyOwned) {
                return NextResponse.json({ ok: false, error: "Ya posees este objeto" }, { status: 400 });
            }
        }

        // 3. Ejecutar Compra (Transacción)
        const result = await prisma.$transaction(async (tx) => {
            // Restar Tinta
            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: { tinta: { decrement: item.priceTinta } }
            });

            // Añadir al Inventario
            const inventory = await tx.inventory.create({
                data: {
                    userId: user.id,
                    storeItemId: item.id,
                    cantidad: 1,
                    status: "active"
                }
            });

            return { updatedUser, inventory };
        });

        return NextResponse.json({ 
            ok: true, 
            message: `Has adquirido ${item.name}`,
            newBalance: result.updatedUser.tinta
        });

    } catch (error) {
        console.error("Store Buy Error:", error);
        return NextResponse.json({ ok: false, error: "Error al procesar la compra" }, { status: 500 });
    }
}
