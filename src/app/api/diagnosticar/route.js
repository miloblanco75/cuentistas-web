import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        let dbUser = null;
        if (session?.user?.email) {
            dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
        }
        return NextResponse.json({ 
            status: "Pulse Check",
            serverTime: new Date().toISOString(),
            session: { email: session?.user?.email || "No detectado" },
            database: dbUser ? { email: dbUser.email, rol: dbUser.rol } : "No encontrado"
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
