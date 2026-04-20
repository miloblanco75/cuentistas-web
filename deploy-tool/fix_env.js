const { Client } = require('ssh2');
const conn = new Client();

const newEnvVars = {
    GOOGLE_CLIENT_SECRET: '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',
    DATABASE_URL: 'postgresql://postgres.uizjjqxgqsyomogcvjum:DIEGO_blanco_2807@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
    DIRECT_URL: 'postgresql://postgres.uizjjqxgqsyomogcvjum:DIEGO_blanco_2807@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
    STRESS_TEST_ENABLED: 'true'
};

conn.on('ready', () => {
    console.log('🔗 Conectado al servidor para depuración de identidad...');
    
    let commands = Object.entries(newEnvVars).map(([key, value]) => {
        return `sed -i 's|^${key}=.*|${key}="${value}"|' /root/cuentistas-web/.env`;
    });
    
    // También reiniciar PM2
    commands.push('pm2 restart cuentistas');

    const finalCmd = commands.join(' && ');

    conn.exec(finalCmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log(`✅ Sincronización completada (Código: ${code}). El pulso de identidad debería haberse fortalecido.`);
            conn.end();
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).connect({
    host: '207.180.253.45',
    port: 22,
    username: 'root',
    password: 'Diego2807'
});
