import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

/**
 * RITUAL DE ASCENSIÓN SOBERANA
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json({ ok: false, message: "Inicia sesión con Google primero." }, { status: 401 });
        }

        // Actualización forzada
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                rol: "ARCHITECT",
                casa: "Cónclave",
                hasPerformedFirstAction: true,
                hasCompletedOnboarding: true,
                tinta: { increment: 100 }
            }
        });

        return NextResponse.json({ 
            ok: true, 
            message: "RITUAL COMPLETADO. Eres el ARQUITECTO.",
            instructions: "Vuelve al Hub y pulsa F5."
        });
    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
