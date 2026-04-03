const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const email = "ermiloblanco75@gmail.com";
    
    console.log(`🔱 Iniciando Ritmo de Ascensión para: ${email}...`);
    
    const user = await prisma.user.update({
        where: { email },
        data: { rol: "Maestro" }
    });
    
    console.log(`✅ ¡El usuario ya posee el rango de Maestro!`);
    console.log(`ID: ${user.id}`);
    console.log(`Rol: ${user.rol}`);
    console.log(`\nMaestro, por favor cierre sesión y vuelva a entrar para que el cambio se refleje.`);
}

main()
    .catch(e => {
        console.error("❌ Error en la ascensión (¿El usuario ya existe?):", e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
