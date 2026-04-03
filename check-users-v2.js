const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const email = "ermiloblanco75@gmail.com";
    try {
        const users = await prisma.user.findMany({
            where: { email },
            include: { accounts: true }
        });
        
        console.log(`RESULTADO_INICIO`);
        console.log(`TOTAL_USUARIOS: ${users.length}`);
        
        users.forEach((u, i) => {
            console.log(`USUARIO_${i}: ID=${u.id}, ROL=${u.rol}, NOMBRE=${u.nombre || u.name}, CUENTAS=${u.accounts.map(a => a.provider).join(",")}`);
        });
        console.log(`RESULTADO_FIN`);
    } catch (err) {
        console.error("ERROR_SQL:", err.message);
    }
}

main().finally(() => prisma.$disconnect());
