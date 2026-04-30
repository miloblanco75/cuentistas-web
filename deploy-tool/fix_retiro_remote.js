const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const remoteCommand = `cd /root/cuentistas-web && cat << 'EOF' > fix_retiro.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.concurso.upsert({
    where: { id: 'retiro-eterno' },
    update: { status: 'active', tipo: 'entrenamiento' },
    create: {
      id: 'retiro-eterno',
      titulo: 'El Retiro',
      descripcion: 'El Santuario donde se forjan los peligrosos.',
      status: 'active',
      tipo: 'entrenamiento',
      temaGeneral: 'Escritura Libre',
      temaExacto: 'Santuario de Práctica',
      costoTinta: 0,
      duration: 999999999,
      minElo: 0,
      maxElo: 9999,
      esParaNovatos: false
    }
  });
  console.log('Retiro-eterno seeded successfully.');
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
EOF
node fix_retiro.js && pm2 restart all`;

  conn.exec(remoteCommand, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end()).on('data', (d) => process.stdout.write(d)).stderr.on('data', (d) => process.stderr.write(d));
  });
}).connect({host: '207.180.253.45', port: 22, username: 'root', password: 'Diego2807'});
