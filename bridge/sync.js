const { Client } = require('ssh2');
const conn = new Client();

const config = {
  host: '207.180.253.45',
  port: 22,
  username: 'root',
  password: '3CM0'
};

console.log('🚀 DRON DE DESPLIEGUE: Conectando con la Ciudadela...');

conn.on('ready', () => {
  console.log('✅ Conexión establecida. Iniciando Ritual de Sincronización...');
  
  // Script de actualización en el servidor
  const remoteCommand = 'cd /root/cuentistas-web && git pull origin main && npm run build && pm2 restart all';

  conn.exec(remoteCommand, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log(`\n✨ Sincronización Finalizada (Código: ${code}).`);
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
