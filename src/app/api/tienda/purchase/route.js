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

        const body = await request.json();
        const { itemId } = body;

        if (!itemId) {
            return NextResponse.json({ ok: false, error: "ID de producto requerido" }, { status: 400 });
        }

        // 1. Obtener datos frescos del usuario y el item
        const [user, item] = await Promise.all([
            prisma.user.findUnique({ where: { id: session.user.id } }),
            prisma.tiendaItem.findUnique({ where: { id: itemId } })
        ]);

        if (!item || !item.disponible) {
            return NextResponse.json({ ok: false, error: "Producto no disponible" }, { status: 404 });
        }

        // 2. Validaciones de compra
        if (!item.precioTinta || item.precioTinta <= 0) {
            return NextResponse.json({ ok: false, error: "Este item no se compra con tinta" }, { status: 400 });
        }

        if (user.tinta < item.precioTinta) {
            return NextResponse.json({ ok: false, error: "Tinta insuficiente" }, { status: 400 });
        }

        // Validación de Rango (ej: Pluma de Fénix)
        if (item.rangoRequerido) {
            const ranks = ["Principiante", "Escritor", "Escriba", "Maestro"];
            const userRankIdx = ranks.indexOf(user.rol) !== -1 ? ranks.indexOf(user.rol) : 0;
            const requiredRankIdx = ranks.indexOf(item.rangoRequerido);
            
            if (userRankIdx < requiredRankIdx) {
                return NextResponse.json({ ok: false, error: `Nivel insuficiente. Requiere ${item.rangoRequerido}` }, { status: 403 });
            }
        }

        // Validación de Casa
        if (item.casaRequerida && item.casaRequerida.toLowerCase() !== user.casa?.toLowerCase()) {
            return NextResponse.json({ ok: false, error: "Este objeto pertenece a otra casa" }, { status: 403 });
        }

        // 3. Ejecutar Transacción
        const result = await prisma.$transaction(async (tx) => {
            // Restar Tinta
            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: { tinta: { decrement: item.precioTinta } }
            });

            // Registrar Item en Inventario
            const userItem = await tx.userItem.upsert({
                where: {
                    userId_itemId: {
                        userId: user.id,
                        itemId: item.id
                    }
                },
                update: {
                    cantidad: { increment: 1 }
                },
                create: {
                    userId: user.id,
                    itemId: item.id,
                    cantidad: 1,
                    status: "active"
                }
            });

            return { updatedUser, userItem };
        });

        return NextResponse.json({ 
            ok: true, 
            message: `Has adquirido ${item.nombre}`,
            newBalance: result.updatedUser.tinta
        });

    } catch (error) {
        console.error("Purchase Error:", error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
