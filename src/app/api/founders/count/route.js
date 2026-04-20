import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const count = await prisma.user.count({
            where: { isFounder: true }
        });

        const remaining = Math.max(0, 100 - count);

        return NextResponse.json({ 
            ok: true, 
            count, 
            remaining,
            isFull: count >= 100 
        });
    } catch (e) {
        return NextResponse.json({ ok: false, error: "Error en el Cónclave" }, { status: 500 });
    }
}
