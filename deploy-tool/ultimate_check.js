const { Client } = require('ssh2');
const conn = new Client();

const passwords = ['DIEGO_blanco_2807', 'qN2kwNPhJBrioRqI'];

conn.on('ready', () => {
    console.log('🔗 Conectado. Iniciando escaneo de llaves arcaicas...');
    
    let index = 0;
    
    function testNext() {
        if (index >= passwords.length) {
            console.log('❌ Ninguna contraseña funcionó.');
            conn.end();
            return;
        }
        
        const p = passwords[index];
        const dbUrl = `postgresql://postgres.uizjjqxgqsyomogcvjum:${p}@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true`;
        
        console.log(`Testing Password: ${p}...`);
        
        const cmd = `export DATABASE_URL="${dbUrl}" && cd /root/cuentistas-web && node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.user.findFirst().then(u => { console.log('MATCH_FOUND'); process.exit(0); }).catch(e => { console.log('FAIL'); process.exit(1); })"`;
        
        conn.exec(cmd, (err, stream) => {
            if (err) {
                console.error(err);
                index++;
                testNext();
                return;
            }
            
            let result = '';
            stream.on('data', d => result += d.toString());
            stream.on('close', (code) => {
                if (result.includes('MATCH_FOUND')) {
                    console.log(`✅ ¡LLAVE ENCONTRADA! La contraseña es: ${p}`);
                    conn.end();
                } else {
                    console.log(`❌ La contraseña ${p} falló.`);
                    index++;
                    testNext();
                }
            });
        });
    }
    
    testNext();
}).connect({
    host: '207.180.253.45',
    port: 22,
    username: 'root',
    password: 'Diego2807'
});
