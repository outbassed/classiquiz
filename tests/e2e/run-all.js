// Executa todas as suítes E2E em sequência (cada uma abre o Chrome real). Uso: node tests/e2e/run-all.js [--longos]
// Requer: Node 18+, `npm i playwright-core` (use NODE_PATH se instalar fora do projeto) e Google Chrome instalado (CHROME_PATH opcional).
const {spawnSync} = require('child_process'); const path = require('path');
const suites = ['01-campanhas.js', '02-sistema.js', '03-programas.js', '04-migracao-mobile.js', '05-trilhas-ultra.js', '07-boot-explorador-energia.js', '08-capturas.js', '09-papel-de-parede.js', '10-terminal-tentativa.js', '11-aceitacao.js'];
const longos = process.argv.includes('--longos') ? [['06-longos.js', 'ultra'], ['06-longos.js', 't400']] : [];
let fail = 0; const t0 = Date.now();
for (const s of [...suites.map(x => [x]), ...longos]) { console.log('\n=== ' + s.join(' ') + ' ==='); const r = spawnSync(process.execPath, [path.join(__dirname, s[0]), ...s.slice(1)], {stdio: 'inherit', env: process.env}); if (r.status !== 0) { fail++; console.log('>>> FALHOU: ' + s.join(' ')); } }
console.log(`\nResumo: ${fail ? fail + ' suíte(s) com falha' : 'todas as suítes passaram'} em ${Math.round((Date.now() - t0) / 1000)} s`); process.exit(fail ? 1 : 0);
