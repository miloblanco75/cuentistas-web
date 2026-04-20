export const dynamic = 'force-dynamic';

import prisma from "@/lib/db";
import { redirect } from "next/navigation";

export default async function TestFinalPage() {
    // 1. Encontrar el concurso activo más reciente para probar
    const concurso = await prisma.concurso.findFirst({
        where: { status: "active" },
        orderBy: { createdAt: "desc" }
    });

    if (!concurso) {
        // Si no hay concurso activo, redirigir al panel para que lo activen
        redirect("/panel/architect");
    }

    // 2. Redirigir directamente a la arena real
    // Esto garantiza que todos los hooks (useParams, etc) funcionen perfectamente
    redirect(`/concursos/live/${concurso.id}?test=true`);

    return null;
}
