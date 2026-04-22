import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const items = await prisma.storeItem.findMany({
            where: { isActive: true },
            orderBy: { priceTinta: "asc" }
        });
        return NextResponse.json({ ok: true, items });
    } catch (error) {
        console.error("Prestige API Error:", error);
        return NextResponse.json({ ok: false, error: "Error de servidor" }, { status: 500 });
    }
}
