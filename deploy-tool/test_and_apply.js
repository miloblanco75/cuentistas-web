const { Client } = require('ssh2');
const conn = new Client();

const testPassword = 'qN2kwNPhJBrioRqI';
const dbUrl = `postgresql://postgres.uizjjqxgqsyomogcvjum:${testPassword}@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true`;

conn.on('ready', () => {
    console.log('🔗 Conectado para prueba de base de datos...');
    
    // Probamos la conexión con prisma db pull para ver si las credenciales son válidas
    conn.exec(`export DATABASE_URL="${dbUrl}" && cd /root/cuentistas-web && npx prisma db pull --print`, (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('data', (data) => {
            output += data.toString();
        }).on('close', (code) => {
            if (output.includes('Authentication failed')) {
                console.log('❌ P2 (' + testPassword + ') también falló.');
            } else if (output.includes('model User')) {
                console.log('✅ P2 (' + testPassword + ') es CORRECTA.');
                
                // Si es correcta, aplicamos a .env y reiniciamos
                const googleSecret = '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';
                const applyCmd = [
                    `sed -i 's|^DATABASE_URL=.*|DATABASE_URL="${dbUrl}"|' /root/cuentistas-web/.env`,
                    `sed -i 's|^DIRECT_URL=.*|DIRECT_URL="postgresql://postgres.uizjjqxgqsyomogcvjum:${testPassword}@aws-0-us-west-2.pooler.supabase.com:5432/postgres"|'`,
                    `sed -i 's|^GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET="${googleSecret}"|'`,
                    'pm2 restart cuentistas'
                ].join(' && ');

                console.log('🚀 Aplicando credenciales y reiniciando...');
                conn.exec(applyCmd, (err2, stream2) => {
                    stream2.on('close', () => {
                        console.log('🎉 Todo listo. Servidor restablecido.');
                        conn.end();
                    });
                });
            } else {
                console.log('❓ Resultado inesperado:', output);
                conn.end();
            }
        });
    });
}).connect({
    host: '207.180.253.45',
    port: 22,
    username: 'root',
    password: 'Diego2807'
});
