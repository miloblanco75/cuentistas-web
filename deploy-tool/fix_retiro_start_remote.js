const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const remoteCommand = `cd /root/cuentistas-web && cat << 'EOF' > fix_retiro_start.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.concurso.update({
    where: { id: 'retiro-eterno' },
    data: { 
      startTime: new Date(),
      status: 'active',
      duration: 999999999
    }
  });
  console.log('Retiro-eterno startTime updated successfully.');
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
EOF
node fix_retiro_start.js && pm2 restart all`;

  conn.exec(remoteCommand, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end()).on('data', (d) => process.stdout.write(d)).stderr.on('data', (d) => process.stderr.write(d));
  });
}).connect({host: '207.180.253.45', port: 22, username: 'root', password: 'Diego2807'});
