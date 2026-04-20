const { Client } = require('ssh2');
const conn = new Client();

const config = {
  host: '207.180.253.45',
  port: 22,
  username: 'root',
  password: '5Vrg#07KFfmpnmzd'
};

console.log('🚑 Iniciando Operación de Rescate en la Ciudadela...');

conn.on('ready', () => {
  console.log('✅ Conexión de Rescate establecida.');
  
  // Comando para reparar el acceso permanente
  // 1. Montar disco (asumimos /dev/vda1)
  // 2. Cambiar clave de root en el sistema montado
  // 3. Habilitar PasswordAuthentication en sshd_config
  const rescueCommand = `
    mkdir -p /mnt/repair &&
    mount /dev/sda1 /mnt/repair &&
    echo "root:Diego2807" | chroot /mnt/repair chpasswd &&
    sed -i "s/^#\?PasswordAuthentication.*/PasswordAuthentication yes/g" /mnt/repair/etc/ssh/sshd_config &&
    sed -i "s/^#\?PermitRootLogin.*/PermitRootLogin yes/g" /mnt/repair/etc/ssh/sshd_config &&
    sync && 
    umount /mnt/repair &&
    echo "--- REPARACIÓN COMPLETADA ---"
  `;

  conn.exec(rescueCommand, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`\n🚑 Cirugía finalizada (Código: ${code}).`);
      console.log('👉 Maestro, ahora ve al panel de Contabo y dale a "REBOOT" o "STOP RESCUE" para volver al modo normal.');
      conn.end();
    }).on('data', (data) => {
      process.stdout.write('RESCUE: ' + data);
    }).stderr.on('data', (data) => {
      process.stderr.write('ERROR: ' + data);
    });
  });
}).on('error', (err) => {
  console.error('❌ Falló la conexión de rescate:', err.message);
}).connect(config);
