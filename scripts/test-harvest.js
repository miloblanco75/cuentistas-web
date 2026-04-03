const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function prepareTest() {
    console.log("🛠️ Preparando el escenario para La Cosecha Final...");

    try {
        // 1. Buscar o crear un usuario de prueba (usaremos el tuyo si existe)
        const user = await prisma.user.findFirst({
            where: { email: "ermiloblanco75@gmail.com" }
        });

        if (!user) {
            console.error("❌ No se encontró el usuario Gran Maestro. Asegúrate de que existe.");
            return;
        }

        console.log(`👤 Usuario detectado: ${user.nombre} | Tinta actual: ${user.tinta}`);

        // 2. Crear un concurso simulado que ya terminó
        const concurso = await prisma.concurso.create({
            data: {
                titulo: "Certamen de Prueba Final: El Amanecer del Cónclave",
                descripcion: "Simulación técnica para validar el reparto de recompensas.",
                status: "finished",
                processed: false,
                temaGeneral: "La Eternidad",
                temaExacto: "El susurro de las sombras",
                tipo: "normal"
            }
        });

        console.log(`🏆 Concurso creado: ${concurso.id}`);

        // 3. Crear entradas para este concurso
        await prisma.entrada.create({
            data: {
                concursoId: concurso.id,
                userId: user.id,
                texto: "Este es un relato de prueba para ganar el primer lugar en la Cosecha.",
                participante: user.nombre || user.username || "Gran Maestro",
                puntajeTotal: 95.5 // Primer lugar
            }
        });

        console.log("📝 Entrada de prueba registrada (Ganador simulado).");
        console.log("✅ Escenario listo. Ahora ejecuta el comando de CRON para iniciar La Cosecha.");

    } catch (e) {
        console.error("❌ Error preparando la prueba:", e);
    } finally {
        await prisma.$disconnect();
    }
}

prepareTest();
