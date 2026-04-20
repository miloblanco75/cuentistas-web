const { Client } = require('ssh2');
const conn = new Client();

const config = {
  host: '207.180.253.45',
  port: 22,
  username: 'root',
  password: 'Diego2807'
};

conn.on('ready', () => {
  console.log('🔗 Conectado para inspección de código...');
  
  const remoteCommand = 'head -n 100 /root/cuentistas-web/src/app/panel/architect/page.jsx';

  conn.exec(remoteCommand, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    });
  });
}).on('error', (err) => {
  console.error('❌ Error de conexión:', err.message);
}).connect(config);
