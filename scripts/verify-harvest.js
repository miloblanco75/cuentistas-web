const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyHarvest() {
    console.log("🔍 Iniciando Verificación de La Cosecha...");

    try {
        // 1. Llamar al endpoint de CRON (Simulando la ejecución)
        const CRON_SECRET = "cuentistas-token-secreto-arcaico";
        const response = await fetch("http://localhost:3000/api/cron", {
            headers: { "Authorization": `Bearer ${CRON_SECRET}` }
        });

        const data = await response.json();
        console.log("📊 Respuesta del Cron:", JSON.stringify(data, null, 2));

        if (!data.ok) {
            console.error("❌ El Cron falló en el servidor.");
            return;
        }

        // 2. Verificar BD
        const user = await prisma.user.findFirst({
            where: { email: "ermiloblanco75@gmail.com" }
        });

        const contest = await prisma.concurso.findFirst({
            where: { titulo: "Certamen de Prueba Final: El Amanecer del Cónclave" }
        });

        const systemMessage = await prisma.mensaje.findFirst({
            where: { texto: { contains: "¡LA COSECHA HA TERMINADO!" } },
            orderBy: { timestamp: 'desc' }
        });

        console.log("-------------------");
        console.log(`🏆 Concurso procesado: ${contest.processed ? 'SÍ ✅' : 'NO ❌'}`);
        console.log(`💰 Tinta del Maestro: ${user.tinta} (Debería haber sumado +500)`);
        console.log(`✨ XP del Maestro: ${user.puntos} (Debería haber sumado +100)`);
        console.log(`🏅 Victorias: ${user.victorias} (Debería haber sumado +1)`);
        console.log(`💬 Mensaje Comunidad: ${systemMessage ? 'Detectado ✅' : 'No encontrado ❌'}`);
        console.log("-------------------");

        if (contest.processed && user.tinta >= 500 && systemMessage) {
            console.log("🎉 VERIFICACIÓN EXITOSA: La Cosecha funciona a la perfección.");
        } else {
            console.warn("⚠️ Algunos valores no coinciden, revisa los logs.");
        }

    } catch (e) {
        console.error("❌ Error verificando:", e);
    } finally {
        await prisma.$disconnect();
    }
}

verifyHarvest();
