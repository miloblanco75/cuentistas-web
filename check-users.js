const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const email = "ermiloblanco75@gmail.com";
    console.log(`📜 Buscando todos los registros para: ${email}...`);
    
    const users = await prisma.user.findMany({
        where: { email },
        include: { accounts: true }
    });
    
    console.log(`👥 Usuarios encontrados: ${users.length}`);
    users.forEach((u, i) => {
        console.log(`\n--- Usuario ${i+1} ---`);
        console.log(`ID: ${u.id}`);
        console.log(`Rol: ${u.rol}`);
        console.log(`Cuentas vinculadas: ${u.accounts.map(a => a.provider).join(", ") || "Ninguna"}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
