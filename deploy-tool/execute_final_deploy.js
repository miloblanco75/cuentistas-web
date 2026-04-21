const { Client } = require('ssh2');
const conn = new Client();

const config = {
  host: '207.180.253.45',
  port: 22,
  username: 'root',
  password: 'Diego2807'
};

conn.on('ready', () => {
  console.log('🔗 Conectado para DESPLIEGUE FINAL (PROD)...');
  
  const remoteCommand = 'cd /root/cuentistas-web && git fetch origin && git reset --hard && git checkout -f main && git reset --hard origin/main && npm install && pm2 stop cuentistas || true && pm2 delete cuentistas || true && rm -rf .next && npm run build && pm2 start npm --name \"cuentistas\" -- run start';

  conn.exec(remoteCommand, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log(`\n✅ Despliegue de Restauración Total Finalizado (Código: ${code}).`);
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
