const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const config = {
  host: '207.180.253.45',
  port: 22,
  username: 'root',
  password: 'Diego2807'
};

const localFilePath = path.join(__dirname, '../src/app/test-final/page.jsx');
const remoteFilePath = '/root/cuentistas-web/src/app/test-final/page.jsx';

const conn = new Client();

console.log('🚀 Iniciando Ritual de Reparación...');

conn.on('ready', () => {
  console.log('✅ Conexión establecida.');

  conn.sftp((err, sftp) => {
    if (err) throw err;

    console.log('📤 Subiendo parche de Renderizado Dinámico...');
    sftp.fastPut(localFilePath, remoteFilePath, (err) => {
      if (err) {
        console.error('❌ Error al subir el archivo:', err);
        conn.end();
        return;
      }
      console.log('✅ Archivo subido con éxito.');

      console.log('🏗️ Iniciando Construcción Maestra (npm run build)...');
      // Usamos NODE_OPTIONS para evitar OOM y eliminamos .next para limpieza total
      const remoteCommand = 'cd /root/cuentistas-web && rm -rf .next && export NODE_OPTIONS=--max-old-space-size=4096 && npm run build && node fix-maestro.js && pm2 restart all';

      conn.exec(remoteCommand, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          console.log(`\n✨ Ritual Finalizado (Código: ${code}).`);
          conn.end();
        }).on('data', (data) => {
          process.stdout.write('SERVER: ' + data);
        }).stderr.on('data', (data) => {
          process.stderr.write('ERROR: ' + data);
        });
      });
    });
  });
}).on('error', (err) => {
  console.error('❌ Error de conexión:', err.message);
}).connect(config);
