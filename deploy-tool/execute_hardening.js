const { Client } = require('ssh2');
const conn = new Client();

const config = {
  host: '207.180.253.45',
  port: 22,
  username: 'root',
  password: 'Diego2807'
};

conn.on('ready', () => {
  console.log('🔗 Conectado para HARDENING DE PRODUCCIÓN...');
  
  const remoteCommand = `
    # 1. PM2 Hardening (Memory limit 300M & Autorestart verified)
    pm2 delete cuentistas || true
    cd /root/cuentistas-web && pm2 start npm --name cuentistas --max-memory-restart 300M -- start
    pm2 save
    
    # 2. PM2 Modules
    pm2 install pm2-logrotate
    pm2 set pm2-logrotate:max_size 10M
    pm2 set pm2-logrotate:retain 7
    
    # 3. Directories
    mkdir -p /root/backups
    
    # 4. CRONTAB Setup
    # Healthcheck Monitor (Every 1 min)
    # Daily Backup (3:00 AM)
    # Cleanup (Daily 4:00 AM)
    (crontab -l 2>/dev/null; echo "* * * * * curl -f http://localhost:3000/api/health || pm2 restart cuentistas") | crontab -
    (crontab -l 2>/dev/null; echo "0 3 * * * tar -czf /root/backups/cuentistas-\\$(date +%F).tar.gz /root/cuentistas-web") | crontab -
    (crontab -l 2>/dev/null; echo "0 4 * * * find /root/backups -mtime +7 -delete") | crontab -
    
    # 5. Nginx Fallback Page
    echo "<html><body style='background:#050508;color:#d4af37;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;text-transform:uppercase;letter-spacing:0.5em;'><h1>502_SYSTEM_RESTORE_IN_PROGRESS</h1></body></html>" > /var/www/html/502.html
  `;

  conn.exec(remoteCommand, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log(`\n✅ Hardening de Infraestructura Finalizado (Código: ${code}).`);
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
