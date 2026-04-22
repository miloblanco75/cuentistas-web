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

        const { inventoryId } = await request.json();

        if (!inventoryId) {
            return NextResponse.json({ ok: false, error: "ID de inventario requerido" }, { status: 400 });
        }

        // 1. Obtener el item del inventario y verificar propiedad
        const itemInInventory = await prisma.inventory.findUnique({
            where: { id: inventoryId, userId: session.user.id },
            include: { storeItem: true }
        });

        if (!itemInInventory || !itemInInventory.storeItem) {
            return NextResponse.json({ ok: false, error: "Objeto no encontrado en tu inventario" }, { status: 404 });
        }

        const itemType = itemInInventory.storeItem.type;

        // 2. Transacción Atómica: Desequipar anterior del mismo tipo y equipar nuevo
        await prisma.$transaction([
            // Desequipar todos los del mismo tipo
            prisma.inventory.updateMany({
                where: { 
                    userId: session.user.id, 
                    storeItem: { type: itemType },
                    equipped: true 
                },
                data: { equipped: false }
            }),
            // Equipar el nuevo
            prisma.inventory.update({
                where: { id: inventoryId },
                data: { equipped: true, equippedAt: new Date() }
            }),
            // Actualizar el User model para acceso rápido
            prisma.user.update({
                where: { id: session.user.id },
                data: {
                    [itemType === 'frame' ? 'activeFrameId' : 
                     itemType === 'badge' ? 'activeBadgeId' : 
                     itemType === 'title' ? 'activeTitleId' : 'id']: itemInInventory.storeItem.id
                }
            })
        ]);

        return NextResponse.json({ 
            ok: true, 
            message: `${itemInInventory.storeItem.name} equipado correctamente.` 
        });

    } catch (error) {
        console.error("Equip Error:", error);
        return NextResponse.json({ ok: false, error: "Error al equipar el objeto" }, { status: 500 });
    }
}
