const { Client } = require('ssh2');
const conn = new Client();

const password = 'DIEGO_blanco_2807'; 
const googleSecret = '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';

conn.on('ready', () => {
    console.log('🔗 Conectado al servidor. Buscando rastro de "identidad" en el código...');
    
    // Primero, vamos a buscar el error en las fuentes para entender qué lo dispara
    conn.exec('grep -r "identidad" /root/cuentistas-web/src', (err, stream) => {
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('close', () => {
            console.log('--- REPORTE DE BÚSQUEDA ---');
            console.log(output || 'No se encontró la cadena "identidad" en /src.');
            
            console.log('Restaurando credenciales...');
            const commands = [
                `sed -i 's|^DATABASE_URL=.*|DATABASE_URL="postgresql://postgres.uizjjqxgqsyomogcvjum:${password}@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"|' /root/cuentistas-web/.env`,
                `sed -i 's|^DIRECT_URL=.*|DIRECT_URL="postgresql://postgres.uizjjqxgqsyomogcvjum:${password}@aws-0-us-west-2.pooler.supabase.com:5432/postgres"|' /root/cuentistas-web/.env`,
                `sed -i 's|^GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET="${googleSecret}"|' /root/cuentistas-web/.env`,
                'pm2 restart cuentistas --update-env'
            ];
            
            conn.exec(commands.join(' && '), (err2, stream2) => {
                stream2.on('close', () => {
                    console.log('✅ Restauración completada.');
                    conn.end();
                });
            });
        });
    });
}).connect({
    host: '207.180.253.45',
    port: 22,
    username: 'root',
    password: 'Diego2807'
});
