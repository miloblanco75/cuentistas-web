const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanTest() {
    console.log("🧹 Limpiando y Resetatndo para la Prueba Definitiva...");

    try {
        const user = await prisma.user.findFirst({ where: { email: "ermiloblanco75@gmail.com" } });
        
        // 1. Resetear estadísticas del Maestro
        await prisma.user.update({
            where: { id: user.id },
            data: { tinta: 60, puntos: 0, victorias: 0 }
        });

        // 2. Buscar el concurso de prueba y resetearlo
        const contest = await prisma.concurso.findFirst({
            where: { titulo: "Certamen de Prueba Final: El Amanecer del Cónclave" }
        });

        if (contest) {
            await prisma.concurso.update({
                where: { id: contest.id },
                data: { processed: false }
            });
        }

        console.log("✅ Sistema reseteado. (Tinta: 60, XP: 0, Victorias: 0)");
        console.log("🚀 Ejecutando La Cosecha...");

        // 3. Llamar al CRON
        const CRON_SECRET = "cuentistas-token-secreto-arcaico";
        const response = await fetch("http://localhost:3000/api/cron", {
            headers: { "Authorization": `Bearer ${CRON_SECRET}` }
        });
        const data = await response.json();

        // 4. Verificación Final
        const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
        const updatedContest = await prisma.concurso.findUnique({ where: { id: contest.id } });
        const msg = await prisma.mensaje.findFirst({ 
            where: { texto: { contains: "¡LA COSECHA HA TERMINADO!" } },
            orderBy: { timestamp: 'desc' }
        });

        console.log("-------------------");
        console.log(`📊 Respuesta Cron:`, JSON.stringify(data));
        console.log(`🏆 Concurso Procesado: ${updatedContest.processed ? 'SÍ ✅' : 'NO ❌'}`);
        console.log(`💰 Tinta Resultante: ${updatedUser.tinta} (Esperado: 560)`);
        console.log(`✨ XP Resultante: ${updatedUser.puntos} (Esperado: 100)`);
        console.log(`💬 Mensaje Comunidad: ${msg ? 'Emitido ✅' : 'Fallido ❌'}`);
        console.log("-------------------");

        if (updatedContest.processed && updatedUser.tinta === 560 && msg) {
            console.log("🌟 ¡PRUEBA FINAL EXITOSA! El Autómata del Cónclave es LEGIT.");
        }

    } catch (e) {
        console.error("❌ Error en la prueba limpia:", e);
    } finally {
        await prisma.$disconnect();
    }
}

cleanTest();
