const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const c = await prisma.concurso.findUnique({ where: { id: 'retiro-eterno' } });
    console.log('CONCURSO:', JSON.stringify(c, null, 2));
    process.exit(0);
}

check();
