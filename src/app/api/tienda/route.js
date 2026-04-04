import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const items = await prisma.tiendaItem.findMany({
            where: { disponible: true },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json({ ok: true, items });
    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
