const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const remoteCommand = `cd /root/cuentistas-web && cat << 'EOF' > check_retiro.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.concurso.findUnique({ where: { id: 'retiro-eterno' } });
  console.log('RETIRO_DATA:', JSON.stringify(c));
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
EOF
node check_retiro.js`;

  conn.exec(remoteCommand, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end()).on('data', (d) => process.stdout.write(d)).stderr.on('data', (d) => process.stderr.write(d));
  });
}).connect({host: '207.180.253.45', port: 22, username: 'root', password: 'Diego2807'});
