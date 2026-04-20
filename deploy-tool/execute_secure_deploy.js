const { Client } = require('ssh2');
const conn = new Client();

const config = {
  host: '207.180.253.45',
  port: 22,
  username: 'root',
  password: 'Diego2807'
};

console.log('🚀 Iniciando conexión segura para DEPLOY CONTROLADO...');

conn.on('ready', () => {
  console.log('✅ Conexión establecida. Iniciando Fase 1...');
  
  // Usamos un script que verifica el éxito de cada paso
  const remoteCommand = `
    cd /root/cuentistas-web && \\
    echo "--- 0. PRE-PULL CLEANUP ---" && \\
    rm -f deploy-tool/package.json deploy-tool/package-lock.json src/app/test-final/page.jsx src/components/UserContext.jsx && \\
    echo "--- 1. GIT PULL ---" && git pull origin main && \\
    echo "--- 2. NPM INSTALL ---" && npm install && \\
    echo "--- 3. NPM BUILD ---" && npm run build && \\
    echo "--- 4. PM2 RESTART ---" && pm2 restart cuentistas
  `;

  conn.exec(remoteCommand, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      if (code === 0) {
        console.log(`\n✨ Fase 1 Completada con éxito (Código: ${code}).`);
      } else {
        console.error(`\n❌ ERROR en Fase 1 (Código: ${code}). El despliegue se detuvo.`);
      }
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
