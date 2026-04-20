const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

const config = {
  host: '207.180.253.45',
  port: 22,
  username: 'root',
  password: 'Diego2807'
};

conn.on('ready', () => {
  console.log('🔗 Conectado para extraer lista de archivos rastreados...');
  conn.exec('cd /root/cuentistas-web && git ls-tree -r HEAD --name-only', (err, stream) => {
    if (err) throw err;
    let data = '';
    stream.on('data', (chunk) => {
      data += chunk;
    }).on('close', () => {
      fs.writeFileSync('scratch/vps_tracked_files.txt', data);
      console.log('✅ Lista de archivos rastreados guardada localmente.');
      conn.end();
    });
  });
}).connect(config);
