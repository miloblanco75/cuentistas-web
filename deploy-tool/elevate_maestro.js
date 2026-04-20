const { Client } = require('ssh2');
const conn = new Client();

const email = "ermiloblanco75@gmail.com";

conn.on('ready', () => {
    console.log(`🔱 Iniciando Ritmo de Ascensión para: ${email} en el servidor...`);
    
    const cmd = `cd /root/cuentistas-web && node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); async function run() { try { const user = await prisma.user.update({ where: { email: '${email}' }, data: { rol: 'Maestro' } }); console.log('✅ ASCENSIÓN EXITOSA: ID ' + user.id + ' ahora es ' + user.rol); } catch (e) { console.error('❌ ERROR: ' + e.message); process.exit(1); } finally { await prisma.\\$disconnect(); } } run();"`;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code) => {
            console.log(`Proceso terminado (Código: ${code}).`);
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
          .on('stderr', (data) => console.error(data.toString()));
    });
}).connect({
    host: '207.180.253.45',
    port: 22,
    username: 'root',
    password: 'Diego2807'
});
