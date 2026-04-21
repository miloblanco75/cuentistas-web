import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        // Verificar conexión a DB
        await prisma.$queryRaw`SELECT 1`;
        
        return NextResponse.json({ 
            status: "ok", 
            db: "connected",
            timestamp: new Date().toISOString(),
            version: "Phase 10 Hardened"
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ 
            status: "error", 
            db: "disconnected",
            error: error.message 
        }, { status: 503 });
    }
}
