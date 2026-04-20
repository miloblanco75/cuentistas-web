// Usamos la librería ssh2 para la conexión remota
const { Client } = require('ssh2');
const conn = new Client();

const config = {
  host: '207.180.253.45',
  port: 22,
  username: 'root',
  password: 'Diego2807'
};

console.log('🚀 Iniciando conexión segura con la Ciudadela (Contabo)...');

conn.on('ready', () => {
  console.log('✅ Conexión establecida. Iniciando Sincronización Maestra...');
  
  // Script de actualización en el servidor
  const remoteCommand = 'cd /root/cuentistas-web && git pull origin main && npm run build && node fix-maestro.js && pm2 restart all';

  conn.exec(remoteCommand, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log(`\n✨ Ritual de Sincronización Finalizado (Código: ${code}).`);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write('SERVER: ' + data);
    }).stderr.on('data', (data) => {
      process.stderr.write('ERROR: ' + data);
    });
  });
}).on('error', (err) => {
  console.error('❌ Error de conexión:', err.message);
}).connect(config);
