const { Client } = require('ssh2');
const conn = new Client();

const config = {
  host: '207.180.253.45',
  port: 22,
  username: 'root',
  password: 'Diego2807'
};

conn.on('ready', () => {
  console.log('🔗 Conectado para PROTOCOLO DE RESCATE...');
  
  // Reconstrucción total de la rama para purgar historial con secretos
  const remoteCommand = 'cd /root/cuentistas-web && git checkout main && git branch -D recovery/server-state || true && git checkout -b recovery/server-state && git add src/ prisma/ package.json package-lock.json && git commit -m "recovery: backup of server-only code (safe, no secrets)" && git push origin recovery/server-state --force';

  conn.exec(remoteCommand, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log(`\n✅ Protocolo Finalizado (Código: ${code}).`);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      process.stderr.write('ERROR: ' + data.toString());
    });
  });
}).on('error', (err) => {
  console.error('❌ Error de conexión:', err.message);
}).connect(config);
