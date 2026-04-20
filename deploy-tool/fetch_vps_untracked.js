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
  console.log('🔗 Conectado para inspección...');
  // Redirigimos la salida a un archivo en el servidor y luego lo leemos o simplemente lo enviamos por partes
  conn.exec('cd /root/cuentistas-web && git ls-files --others --exclude-standard', (err, stream) => {
    if (err) throw err;
    let data = '';
    stream.on('data', (chunk) => {
      data += chunk;
    }).on('close', () => {
      fs.writeFileSync('scratch/vps_untracked_files.txt', data);
      console.log('✅ Lista de archivos guardada localmente.');
      conn.end();
    });
  });
}).connect(config);
