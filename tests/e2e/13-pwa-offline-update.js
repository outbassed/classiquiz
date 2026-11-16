// E2E 13 (26nov16): PWA 100% offline, atualização real entre duas releases, falha no meio do download e limpeza dos caches antigos.
// O servidor serve uma pasta que o teste troca no meio (release A -> B), exatamente como um novo deploy.
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http'), {spawnSync} = require('child_process');
let chromium; try { ({chromium} = require('playwright-core')); } catch { ({chromium} = require('playwright')); }
const L = require('./lib'); const ROOT = path.resolve(__dirname, '..', '..'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const S = L.suite('E2E PWA offline + update'); const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const MIME = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain'};
function release(dest, version, extra) {            // cópia do jogo + carimbo de uma release nova com tools/build.js
  fs.rmSync(dest, {recursive: true, force: true}); fs.mkdirSync(dest, {recursive: true});
  for (const f of ['index.html', 'offline.html', 'manifest.webmanifest', 'sw.js', 'version.json']) fs.copyFileSync(path.join(ROOT, f), path.join(dest, f));
  fs.cpSync(path.join(ROOT, 'assets'), path.join(dest, 'assets'), {recursive: true}); fs.mkdirSync(path.join(dest, 'tools')); fs.copyFileSync(path.join(ROOT, 'tools/build.js'), path.join(dest, 'tools/build.js'));
  if (extra) extra(dest);
  const r = spawnSync(process.execPath, [path.join(dest, 'tools/build.js'), '--version', version, '--build', version === '26nov16' ? '16112026.100000' : '16112026.' + (version.endsWith('.1') ? '120000' : '130000'), '--summary', 'Release de teste ' + version], {encoding: 'utf8'}); if (r.status) throw Error(r.stderr);
}
function server(getRoot) {
  return new Promise(res => { const srv = http.createServer((req, rs) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(getRoot(), p); fs.readFile(f, (e, b) => { if (e) { rs.writeHead(404); return rs.end('404'); } rs.writeHead(200, {'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store'}); rs.end(b); }); }); srv.listen(0, '127.0.0.1', () => res({srv, port: srv.address().port})); });
}
const cacheInfo = p => p.evaluate(async () => { const keys = await caches.keys(); const out = {}; for (const k of keys) out[k] = (await (await caches.open(k)).keys()).length; return out; });
async function waitFor(p, fn, arg, ms = 40000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await p.evaluate(fn, arg)) return true; } catch {} await sleep(300); } return false; }

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cq-pwa-')); const A = path.join(tmp, 'A'), B = path.join(tmp, 'B'), C = path.join(tmp, 'C');
  release(A, '26nov16'); release(B, '26nov16.1'); release(C, '26nov16.2', d => { fs.appendFileSync(path.join(d, 'assets/js/clock.js'), '\n// alterado depois do manifesto\n'); });
  // C: o manifesto foi gerado ANTES de alterar um arquivo => hash não confere (simula download corrompido)
  const cj = path.join(C, 'assets/js/clock.js'); fs.writeFileSync(cj, fs.readFileSync(cj, 'utf8') + '// corrompido\n');
  let cur = A; const {srv, port} = await server(() => cur); const url = `http://127.0.0.1:${port}/index.html`;
  const browser = await chromium.launch({executablePath: CHROME, headless: true, args: ['--no-sandbox']});
  const ctx = await browser.newContext({viewport: {width: 1280, height: 800}}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  // ---- legado: um cache cq-offline-2.0.9 e saves de usuário já existem antes da nova release instalar ----
  await p.goto(`http://127.0.0.1:${port}/offline.html`); await p.evaluate(async () => { await caches.open('cq-offline-2.0.9').then(c => c.put('/offline.html', new Response('velho'))); localStorage.setItem('classiquiz.v1.records', JSON.stringify({trails: {best: 77}})); localStorage.setItem('classiquiz.v1.achievements', JSON.stringify({unlocked: {secret1: 123}, stats: {correct: 9}})); localStorage.setItem('classiquiz.v1.runner', JSON.stringify({best: 4321, played: 3})); localStorage.setItem('classiquiz.v1.snake.wall', 'false'); });
  // ================= instalação inicial (release A) =================
  await p.goto(url); await p.waitForFunction(() => window.CQ && CQ.os && CQ.game, null, {timeout: 20000});
  S.ok(await waitFor(p, async () => { const r = await navigator.serviceWorker.getRegistration(); return !!(r && r.active && r.active.state === 'activated' && navigator.serviceWorker.controller); }), 'Service Worker instalado e controlando a página');
  const man = JSON.parse(fs.readFileSync(path.join(A, 'asset-manifest.json'), 'utf8'));
  let info = await cacheInfo(p); const names = Object.keys(info);
  S.ok(names.length === 1 && names[0] === 'classiquiz-cache-16112026.100000', 'um único cache ativo, nomeado pela compilação: ' + names);
  S.ok(info[names[0]] >= man.count, `todos os ${man.count} arquivos do manifesto no cache (${info[names[0]]})`);
  S.ok(!names.some(n => n.startsWith('cq-offline-')), 'cache legado cq-offline-* removido na ativação');
  S.ok(await p.evaluate(() => JSON.parse(localStorage.getItem('classiquiz.v1.records')).trails.best === 77 && JSON.parse(localStorage.getItem('classiquiz.v1.runner')).best === 4321), 'saves legados intactos depois da limpeza de cache');
  await L.boot({page: p, noGoto: true}); await p.evaluate(() => CQ.sys.set({fastEffects: true}));
  const marker = await p.evaluate(() => { CQ.sys.set({wallpaper: 'nuvens', mouseScheme: 'xp'}); localStorage.setItem('marcador-usuario', 'preservar'); return CQ.BUILD; }); S.ok(marker === '16112026.100000', 'release A em uso: ' + marker);
  // ================= A) modo avião: iniciar do zero, apps, jogos, navegador, imagens =================
  await ctx.setOffline(true); await p.reload(); await p.waitForFunction(() => window.CQ && CQ.os && CQ.game, null, {timeout: 20000}); await L.boot({page: p, noGoto: true});
  S.ok(await p.evaluate(() => CQ.sys.get('wallpaper') === 'nuvens' && CQ.sys.get('mouseScheme') === 'xp'), 'iniciou offline do zero com as preferências salvas'); await p.evaluate(() => CQ.sys.set({fastEffects: true}));
  S.ok(await p.evaluate(() => !document.querySelector('.offline-box')) && !!(await p.$('.desktop-shortcut')), 'sem a tela offline global: o ClaQui OS abriu');
  const apps = ['new', 'library', 'achievements', 'settings', 'calendar', 'clock', 'calc', 'notepad', 'paint', 'explorer', 'viewer', 'player', 'stats', 'rewards', 'mines', 'ttt', 'snake', 'desvio', 'pong', 'solitaire', 'datetime', 'netconfig', 'about', 'tutorial', 'updates', 'browser'];
  for (const a of apps) { await p.evaluate(x => { CQ.os.wm.list().forEach(w => CQ.os.wm.close(w.id)); CQ.os.open(x); }, a); await sleep(250); S.ok(await p.evaluate(x => CQ.os.wm.isOpen(x) && CQ.os.wm.get(x).body.textContent.trim().length > 10, a), 'offline: abre ' + a); }
  await p.evaluate(() => { CQ.os.wm.list().forEach(w => CQ.os.wm.close(w.id)); CQ.os.open('browser'); }); await sleep(500);
  for (const u of ['www.buscaja.cqo/internet', 'www.jogolandia.cqo', 'www.geocidades.cqo/~zeca', 'www.claquipedia.cqo/wiki/claquim', 'www.tempo.cqo']) { await p.fill('.br-url', u); await p.press('.br-url', 'Enter'); await sleep(250); S.ok(await p.evaluate(() => !document.querySelector('.web-error') && document.querySelectorAll('.web-page').length === 1), 'offline real: site ' + u); }
  await p.fill('.bj-form input[name="q"]', 'x').catch(() => {}); await p.fill('.br-url', 'www.buscaja.cqo'); await p.press('.br-url', 'Enter'); await sleep(250); await p.fill('.bj-form input[name="q"]', 'pipoca'); await p.press('.bj-form input[name="q"]', 'Enter'); await sleep(300); S.ok(await p.evaluate(() => /resultado/i.test(document.querySelector('.br-viewport').textContent)), 'offline real: pesquisa do BuscaJá!');
  S.ok(await p.evaluate(() => [...document.images].filter(i => i.getAttribute('src') && i.complete && i.naturalWidth === 0).length === 0), 'nenhuma imagem quebrada offline');
  const net = await p.evaluate(async () => { const urls = ['assets/css/os.css', 'assets/js/data-b6.js', 'assets/icons/navegador.svg', 'assets/cursors/xp-normal-32.png', 'assets/classiquiz-animado.gif', 'assets/wallpapers/nuvens.svg', 'assets/pwa-512.png', 'offline.html', 'manifest.webmanifest']; const out = []; for (const u of urls) { const r = await fetch(u); out.push(r.ok); } return out; }); S.ok(net.every(Boolean), 'CSS, JS, JSON/dados, ícones, cursores, GIF, papéis de parede e manifest respondem offline');
  await p.evaluate(() => { CQ.os.open('updates'); }); await sleep(200); await p.evaluate(() => CQ.update.check()); await sleep(600);
  S.ok(await p.evaluate(() => CQ.update.state === 'error' && /Sem internet real/.test(CQ.update.error)), 'ClaQui Update informa a falta de internet real sem derrubar o sistema'); S.ok(await p.evaluate(() => CQ.os.wm.isOpen('updates') && !!document.querySelector('.desktop-shortcut')), 'o sistema continua operando');
  await p.evaluate(() => { CQ.os.wm.list().forEach(w => CQ.os.wm.close(w.id)); CQ.net.set(false); CQ.os.open('browser'); }); await sleep(400); await p.click('.br-sad'); await sleep(500); S.ok(await p.evaluate(() => !!document.querySelector('.rn canvas')), 'offline: Runner secreto funciona'); await p.evaluate(() => { CQ.os.wm.close('browser'); CQ.net.set(true); });
  await ctx.setOffline(false);
  // ================= G) atualização real A -> B =================
  cur = B;                                           // "deploy" da release 26nov16.1
  await p.evaluate(() => { CQ.os.wm.list().forEach(w => CQ.os.wm.close(w.id)); CQ.os.open('updates'); }); await sleep(300);
  const t0 = await p.evaluate(() => ({v: CQ.VERSION, b: CQ.BUILD}));
  await p.evaluate(() => CQ.update.check()); S.ok(await waitFor(p, () => CQ.update.state === 'ready', null, 60000), 'nova release baixada, validada e pronta (estado: ' + await p.evaluate(() => CQ.update.state) + ')');
  const lat = await p.evaluate(() => CQ.update.latest); S.ok(lat.version === '26nov16.1' && lat.build === '16112026.120000', 'ClaQui Update mostra versão e compilação publicadas: ' + lat.version + ' / ' + lat.build);
  S.ok(await p.evaluate(() => CQ.BUILD) === t0.b, 'enquanto não confirmar, a versão em uso continua a mesma (sem reinício automático)');
  info = await cacheInfo(p); S.ok(info['classiquiz-cache-16112026.100000'] >= man.count && info['classiquiz-cache-16112026.120000'] >= man.count, 'coexistência temporária: cache atual + novo completo: ' + JSON.stringify(Object.fromEntries(Object.entries(info).map(([k, v]) => [k.slice(-13), v]))));
  const ui = await p.evaluate(() => document.querySelector('.cq-win[data-win="updates"]').innerText); S.ok(/26nov16\.1/.test(ui) && /Atualizar e reiniciar/.test(ui) && /Depois/.test(ui), 'janela mostra versão nova, “Atualizar e reiniciar” e “Depois”');
  S.ok(await p.evaluate(() => !!CQ.update.reg.waiting), 'novo Service Worker aguardando (sem skipWaiting automático)');
  // pausa segura: minijogo aberto => pede confirmação; "Depois" não reinicia
  await p.evaluate(() => CQ.os.open('snake')); await sleep(300); await p.evaluate(() => { window.__marker = 'sem-reload'; window.__applyP = CQ.update.apply(); }); await sleep(400);
  S.ok(await p.evaluate(() => CQ.ui.isModalOpen()) && /minijogo/.test(await p.evaluate(() => document.getElementById('modal-layer').innerText)), 'com minijogo aberto, pede confirmação antes de atualizar');
  await p.click('#modal-layer [data-modal-value="false"]'); await sleep(500); S.ok(await p.evaluate(() => window.__marker === 'sem-reload' && CQ.BUILD) === t0.b, '“Depois”: nada reinicia, versão em uso inalterada');
  await p.evaluate(() => CQ.os.wm.close('snake')); await sleep(200);
  await p.evaluate(() => { CQ.store.write('classiquiz.v1.player', {antes: 'da-atualizacao'}); }); const nav = p.waitForNavigation({timeout: 30000}).catch(() => null);
  await p.evaluate(() => { window.__applyP = CQ.update.apply(); }).catch(() => {}); await nav; await p.waitForFunction(() => window.CQ && CQ.os && CQ.game, null, {timeout: 30000});
  const t1 = await p.evaluate(() => ({v: CQ.VERSION, b: CQ.BUILD})); S.ok(t1.v === '26nov16.1' && t1.b === '16112026.120000', 'após “Atualizar e reiniciar”: versão e compilação novas: ' + JSON.stringify(t1));
  S.ok(await waitFor(p, async () => { const k = await caches.keys(); return k.length === 1 && k[0] === 'classiquiz-cache-16112026.120000'; }, null, 20000), 'cache antigo REMOVIDO depois da transição: ' + JSON.stringify(Object.keys(await cacheInfo(p))));
  S.ok(await p.evaluate(() => localStorage.getItem('marcador-usuario') === 'preservar' && JSON.parse(localStorage.getItem('classiquiz.v1.records')).trails.best === 77 && JSON.parse(localStorage.getItem('classiquiz.v1.achievements')).unlocked.secret1 === 123 && JSON.parse(localStorage.getItem('classiquiz.v1.runner')).best === 4321 && localStorage.getItem('classiquiz.v1.snake.wall') === 'false' && JSON.parse(localStorage.getItem('classiquiz.v1.player')).antes === 'da-atualizacao'), 'saves, recordes, conquistas, preferências e dados do usuário intactos');
  await L.boot({page: p, noGoto: true}); S.ok(await p.evaluate(() => CQ.sys.get('wallpaper') === 'nuvens'), 'preferências do sistema preservadas'); await p.evaluate(() => CQ.sys.set({fastEffects: true}));
  await p.evaluate(() => CQ.update.check()); await sleep(1500); S.ok(await p.evaluate(() => CQ.update.state) === 'uptodate', 'depois de atualizar: “seu ClaQui OS está atualizado”');
  await ctx.setOffline(true); await p.reload(); await p.waitForFunction(() => window.CQ && CQ.os && CQ.game, null, {timeout: 20000}); S.ok(await p.evaluate(() => CQ.BUILD) === '16112026.120000', 'a nova release também funciona 100% offline'); await ctx.setOffline(false);
  // ================= falha no meio: manifesto com hash que não confere =================
  cur = C; const cacheBefore = JSON.stringify(Object.keys(await cacheInfo(p)));
  await p.evaluate(() => CQ.update.check()); S.ok(await waitFor(p, () => CQ.update.state === 'error', null, 60000), 'download com arquivo corrompido é rejeitado (estado: ' + await p.evaluate(() => CQ.update.state) + ')');
  if (await p.evaluate(() => CQ.update.state) !== 'error') console.log('DEBUG', JSON.stringify(await p.evaluate(() => ({st: CQ.update.state, err: CQ.update.error, latest: CQ.update.latest, inst: CQ.update.reg.installing && CQ.update.reg.installing.state, wait: CQ.update.reg.waiting && CQ.update.reg.waiting.state, act: CQ.update.reg.active && CQ.update.reg.active.state}))), JSON.stringify(Object.keys(await cacheInfo(p))));
  for (let i = 0; i < 20; i++) { await sleep(500); if (JSON.stringify(Object.keys(await cacheInfo(p))) === cacheBefore) break; }   // dá tempo de uma tentativa em voo terminar e se limpar
  const after = await cacheInfo(p); console.log('caches depois da falha:', JSON.stringify(after)); S.ok(JSON.stringify(Object.keys(after)) === cacheBefore, 'a versão que funciona NÃO foi apagada e nenhum cache parcial sobrou: ' + JSON.stringify(Object.keys(after)));
  S.ok(await p.evaluate(() => CQ.BUILD) === '16112026.120000' && await p.evaluate(() => !!document.querySelector('.desktop-shortcut')), 'sistema segue na versão anterior, funcionando');
  await ctx.setOffline(true); await p.reload(); await p.waitForFunction(() => window.CQ && CQ.os && CQ.game, null, {timeout: 20000}); S.ok(await p.evaluate(() => CQ.BUILD) === '16112026.120000', 'e ainda abre offline após a falha'); await ctx.setOffline(false);
  S.ok(errs.filter(e => !/net::ERR|Failed to fetch|favicon/.test(e)).length === 0, 'sem erros de página: ' + errs.slice(0, 3));
  await browser.close(); srv.close(); fs.rmSync(tmp, {recursive: true, force: true});
  process.exit(S.done([]));
})().catch(e => { console.error(e); process.exit(1); });
