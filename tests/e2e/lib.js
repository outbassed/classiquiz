// Utilitários dos testes de ponta a ponta (E2E): Playwright (playwright-core) + Google Chrome real.
// Requisitos: Node 18+, `npm i playwright-core` (em qualquer pasta; use NODE_PATH) e Chrome instalado (CHROME_PATH opcional).
const path = require('path'), fs = require('fs');
let chromium; try { ({chromium} = require('playwright-core')); } catch { ({chromium} = require('playwright')); } const {serve} = require('./server');
const ROOT = path.resolve(__dirname, '..', '..'); const SHOTS = path.join(ROOT, 'tests', 'capturas');
const CHROME = process.env.CHROME_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p => fs.existsSync(p));
fs.mkdirSync(SHOTS, {recursive: true});
exports.SHOTS = SHOTS;
exports.start = async function (opts = {}) {
  const s = await serve(ROOT, 0); const browser = await chromium.launch({executablePath: CHROME, headless: true, args: ['--no-sandbox']});
  const ctx = await browser.newContext({viewport: opts.viewport || {width: 1280, height: 800}, hasTouch: !!opts.touch, isMobile: !!opts.mobile, deviceScaleFactor: 1, acceptDownloads: true});
  if (opts.storage) await ctx.addInitScript(st => { if (!sessionStorage.getItem('__seeded')) { sessionStorage.setItem('__seeded', '1'); for (const [k, v] of Object.entries(st)) localStorage.setItem(k, v); } }, opts.storage);
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message)); page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  page.on('request', r => { try { const u = new URL(r.url()); if (!['127.0.0.1', 'localhost'].includes(u.hostname) && !/^(blob|data|about):/.test(u.protocol)) errs.push('REQUISIÇÃO EXTERNA ' + r.url()); } catch {} });
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url())); page.on('response', r => { if (r.status() >= 400) errs.push('HTTP' + r.status() + ' ' + r.url()); });
  return {s, browser, ctx, page, errs, keepTutorial: !!opts.keepTutorial, url: `http://127.0.0.1:${s.port}/index.html`, close: async () => { await browser.close(); s.close(); }};
};
exports.boot = async function (t) {
  if (!t.noGoto) await t.page.goto(t.url); await t.page.waitForFunction(() => window.CQ && CQ.os && CQ.game, null, {timeout: 20000});
  for (let k = 0; k < 200; k++) {
    const st = await t.page.evaluate(() => ({hidden: document.getElementById('power-layer').hidden, go: !!document.getElementById('welcome-go')}));
    if (st.go) await t.page.evaluate(() => document.getElementById('welcome-go')?.click());
    if (st.hidden && !st.go) break; await t.page.waitForTimeout(150);
  }
  await t.page.waitForSelector('.desktop-shortcut', {state: 'visible', timeout: 20000}); await t.page.waitForTimeout(250);
  // v26nov16: a 1ª inicialização abre o tutorial "Primeiros passos" (400 ms depois do desktop). Os testes o dispensam, a menos que opts.keepTutorial.
  if (!t.keepTutorial) { await t.page.waitForTimeout(600); await t.page.evaluate(() => { if (CQ.os.wm.isOpen('tutorial')) CQ.os.wm.close('tutorial'); }); }
};
exports.shot = (t, name) => t.page.screenshot({path: path.join(SHOTS, name + '.png')});
// coletor de verificações
exports.suite = function (title) {
  const r = {title, pass: 0, fail: 0, items: []};
  r.ok = (c, msg) => { if (c) r.pass++; else { r.fail++; r.items.push(msg); console.log('  FALHOU:', msg); } return !!c; };
  r.done = errs => { if (errs && errs.length) { r.fail += errs.length; errs.forEach(e => { r.items.push('erro de console/rede: ' + e); console.log('  ERRO:', e); }); } console.log(`${title}: ${r.pass} verificações ok, ${r.fail} falhas`); return r.fail ? 1 : 0; };
  return r;
};
