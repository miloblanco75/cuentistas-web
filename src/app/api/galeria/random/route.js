import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        // Fetch entries that users can judge in the Arena
        // Priority: Entries with boost, or entries with few votes
        let entries = await prisma.entrada.findMany({
            where: {
                // If user is logged in, exclude their own entries
                NOT: userId ? { userId } : {}
            },
            include: {
                concurso: { select: { titulo: true } },
                user: { select: { nombre: true, username: true, casa: true } }
            },
            orderBy: [
                { boostApplied: "desc" },
                { popularScore: "asc" } // Prioritize those with fewer votes
            ],
            take: 20
        });

        if (entries.length === 0) {
            return NextResponse.json({ ok: false, error: "No hay entradas disponibles en la Arena" }, { status: 404 });
        }

        // Return a random one from the batch
        const randomEntry = entries[Math.floor(Math.random() * entries.length)];

        return NextResponse.json({ ok: true, entry: randomEntry });
        
    } catch (error) {
        console.error("Random Entry Error:", error);
        return NextResponse.json({ ok: false, error: "Error de servidor" }, { status: 500 });
    }
}
