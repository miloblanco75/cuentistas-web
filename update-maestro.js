const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const email = "ermiloblanco75@gmail.com";
    try {
        const updated = await prisma.user.update({
            where: { email },
            data: { rol: "Maestro" }
        });
        console.log(`✅ ASCENSIÓN COMPLETADA: Usuario ${updated.email} ahora tiene rango ${updated.rol}`);
    } catch (err) {
        console.error("❌ ERROR EN LA ASCENSIÓN:", err.message);
    }
}

main().finally(() => prisma.$disconnect());
