const { Client } = require('ssh2');
const conn = new Client();

const config = {
  host: '207.180.253.45',
  port: 22,
  username: 'root',
  password: 'Diego2807'
};

conn.on('ready', () => {
  console.log('🔗 Conectado para ENSAMBLAJE FINAL DE RESCATE...');
  
  // 1. Asegurar que estamos en el commit restaurado
  // 2. Crear backup temporal fuera del repo
  // 3. Volver a main y limpiar rama fallida
  // 4. Mover archivos de vuelta y hacer el push limpio (solo src/ y prisma/)
  
  const remoteCommand = `
    cd /root/cuentistas-web && \\
    rm -rf /root/ghost-hold && \\
    mkdir -p /root/ghost-hold && \\
    cp -r src /root/ghost-hold/ && \\
    cp -r prisma /root/ghost-hold/ 2>/dev/null || true && \\
    git checkout main && \\
    git branch -D recovery/server-state || true && \\
    git checkout -b recovery/server-state && \\
    cp -r /root/ghost-hold/src/* src/ && \\
    cp -r /root/ghost-hold/prisma/* prisma/ 2>/dev/null || true && \\
    git add src/ prisma/ package.json package-lock.json && \\
    git commit -m "recovery: backup of server-only code (safe, no secrets)" && \\
    git push origin recovery/server-state --force
  `;

  conn.exec(remoteCommand, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log(`\n✅ Protocolo de Rescate Finalizado (Código: ${code}).`);
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
