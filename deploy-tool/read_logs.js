const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    console.log('🔗 Conectado para leer logs...');
    conn.exec('pm2 logs cuentistas --lines 50 --no-daemon', (err, stream) => {
        if (err) throw err;
        stream.on('data', (data) => {
            console.log(data.toString());
            // Detener después de ver algunos logs
            if (data.toString().includes('ready') || data.toString().includes('started') || data.toString().includes('Error')) {
                // No cerramos inmediatamente para capturar todo el bloque
            }
        });
        // Esperar 10 segundos y cerrar
        setTimeout(() => {
            conn.end();
        }, 10000);
    });
}).connect({
    host: '207.180.253.45',
    port: 22,
    username: 'root',
    password: 'Diego2807'
});
