const { Client } = require('ssh2');
const conn = new Client();

const config = {
  host: '207.180.253.45',
  port: 22,
  username: 'root',
  password: 'Diego2807'
};

const CHART_COMPONENT_PATH = '/root/cuentistas-web/src/components/admin/ArchitectCharts.jsx';
const PAGE_PATH = '/root/cuentistas-web/src/app/panel/architect/page.jsx';

conn.on('ready', () => {
  console.log('🔗 Conectado para FIX de Recharts...');
  
  // 1. Aplicar "ssr: false" en los componentes de gráficos
  const fixCharts = `sed -i 's/export function HouseDistributionChart/export function HouseDistributionChart(props) { if (typeof window === "undefined") return null; const { data } = props;/g' ${CHART_COMPONENT_PATH} && sed -i 's/export function ActivityChart/export function ActivityChart(props) { if (typeof window === "undefined") return null; const { data } = props;/g' ${CHART_COMPONENT_PATH}`;
  
  // 2. Modificar la página para usar dynamic imports
  // Nota: Esto es complejo con sed, así que usaremos un enfoque de sobreescritura controlada o un script de Node remoto.
  
  const fixPage = `node -e '
    const fs = require(\"fs\");
    let content = fs.readFileSync(\"${PAGE_PATH}\", \"utf8\");
    const dynamicImport = \"import dynamic from \\\"next/dynamic\\\";\\nconst HouseDistributionChart = dynamic(() => import(\\\"@/components/admin/ArchitectCharts\\\").then(m => m.HouseDistributionChart), { ssr: false });\\nconst ActivityChart = dynamic(() => import(\\\"@/components/admin/ArchitectCharts\\\").then(m => m.ActivityChart), { ssr: false });\";
    content = content.replace(/import { HouseDistributionChart, ActivityChart } from \\\"@\\/components\\/admin\\/ArchitectCharts\\\";/g, dynamicImport);
    fs.writeFileSync(\"${PAGE_PATH}\", content);
  '`;

  conn.exec(`${fixCharts} && ${fixPage}`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('✅ Fix aplicado quirúrgicamente.');
      conn.end();
    });
  });
}).on('error', (err) => {
  console.error('❌ Error de conexión:', err.message);
}).connect(config);
