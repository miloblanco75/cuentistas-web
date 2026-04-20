const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();

const localBase = 'c:\\Users\\jkwon\\OneDrive\\Documentos\\cuentistas-web';
const remoteBase = '/root/cuentistas-web';

const filesToUpload = [
    { local: 'src/lib/api.js', remote: 'src/lib/api.js' },
    { local: 'src/lib/mandatos.js', remote: 'src/lib/mandatos.js' },
    { local: 'src/components/UserContext.jsx', remote: 'src/components/UserContext.jsx' },
    { local: 'src/components/Utils/ErrorBoundary.jsx', remote: 'src/components/Utils/ErrorBoundary.jsx' },
    { local: 'src/components/Utils/StatusBanner.jsx', remote: 'src/components/Utils/StatusBanner.jsx' },
    { local: 'src/components/Providers.jsx', remote: 'src/components/Providers.jsx' },
    { local: 'src/lib/auth.js', remote: 'src/lib/auth.js' },
    { local: 'src/app/api/user/route.js', remote: 'src/app/api/user/route.js' },
    { local: 'src/app/api/debug/stress/route.js', remote: 'src/app/api/debug/stress/route.js' },
    { local: 'src/app/layout.tsx', remote: 'src/app/layout.tsx' }
];

const newEnvVars = {
    GOOGLE_CLIENT_SECRET: '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',
    DATABASE_URL: 'postgresql://postgres.uizjjqxgqsyomogcvjum:DIEGO_blanco_2807@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
    DIRECT_URL: 'postgresql://postgres.uizjjqxgqsyomogcvjum:DIEGO_blanco_2807@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
    STRESS_TEST_ENABLED: 'true'
};

conn.on('ready', () => {
    console.log('🚀 Iniciando sincronización de Hardening Crítico...');
    
    conn.sftp((err, sftp) => {
        if (err) throw err;

        let uploadedCount = 0;

        const uploadFile = (file) => {
            const localPath = path.join(localBase, file.local);
            const remotePath = path.join(remoteBase, file.remote);
            const remoteDir = path.dirname(remotePath);

            // Asegurar que el directorio remoto existe
            conn.exec(`mkdir -p ${remoteDir}`, (err, stream) => {
                if (err) throw err;
                stream.on('close', () => {
                    sftp.fastPut(localPath, remotePath, (err) => {
                        if (err) {
                            console.error(`❌ Error subiendo ${file.local}:`, err.message);
                        } else {
                            console.log(`✅ Subido: ${file.local}`);
                        }
                        uploadedCount++;
                        if (uploadedCount === filesToUpload.length) {
                            finishDeploy();
                        }
                    });
                });
            });
        };

        const finishDeploy = () => {
            console.log('⚙️ Configurando .env y reiniciando servidor...');
            const adminEmail = 'ermiloblanco75@gmail.com';
            const commands = [
                `grep -q "ADMIN_EMAIL" /root/cuentistas-web/.env || echo 'ADMIN_EMAIL="${adminEmail}"' >> /root/cuentistas-web/.env`,
                `sed -i 's|^ADMIN_EMAIL=.*|ADMIN_EMAIL="${adminEmail}"|' /root/cuentistas-web/.env`,
                `grep -q "STRESS_TEST_ENABLED" /root/cuentistas-web/.env || echo 'STRESS_TEST_ENABLED="true"' >> /root/cuentistas-web/.env`,
                `sed -i 's|^STRESS_TEST_ENABLED=.*|STRESS_TEST_ENABLED="true"|' /root/cuentistas-web/.env`,
                'cd /root/cuentistas-web && npm run build',
                'pm2 restart cuentistas'
            ];

            conn.exec(commands.join(' && '), (err, stream) => {
                if (err) throw err;
                stream.on('close', (code) => {
                    console.log(`✨ Despliegue completado con código ${code}`);
                    conn.end();
                }).on('data', (data) => {
                    process.stdout.write(data.toString());
                }).stderr.on('data', (data) => {
                    process.stderr.write(data.toString());
                });
            });
        };

        filesToUpload.forEach(uploadFile);
    });
}).connect({
    host: '207.180.253.45',
    port: 22,
    username: 'root',
    password: 'Diego2807'
});
