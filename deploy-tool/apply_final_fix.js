const { Client } = require('ssh2');
const conn = new Client();

const password = 'qN2kwNPhJBrioRqI';
const googleSecret = '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';

conn.on('ready', () => {
    console.log('🔗 Conectado al servidor. Aplicando pulso de identidad definitivo...');
    
    const commands = [
        `sed -i 's|^DATABASE_URL=.*|DATABASE_URL="postgresql://postgres.uizjjqxgqsyomogcvjum:${password}@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"|' /root/cuentistas-web/.env`,
        `sed -i 's|^DIRECT_URL=.*|DIRECT_URL="postgresql://postgres.uizjjqxgqsyomogcvjum:${password}@aws-0-us-west-2.pooler.supabase.com:5432/postgres"|' /root/cuentistas-web/.env`,
        `sed -i 's|^GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET="${googleSecret}"|' /root/cuentistas-web/.env`,
        'pm2 restart cuentistas --update-env'
    ];

    const finalCmd = commands.join(' && ');

    conn.exec(finalCmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code) => {
            console.log(`✅ Sincronización final completada (Código: ${code}). El velo se ha levantado.`);
            conn.end();
        }).on('data', (data) => {
            console.log(data.toString());
        }).stderr.on('data', (data) => {
            console.log('ERR: ' + data.toString());
        });
    });
}).connect({
    host: '207.180.253.45',
    port: 22,
    username: 'root',
    password: 'Diego2807'
});
