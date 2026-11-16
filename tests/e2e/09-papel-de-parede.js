// E2E 9: papel de parede — presets, 4 ajustes (preencher/ajustar/esticar/repetir), importação com pré-visualização, aplicar, persistência e restauração.
const L = require('./lib');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const W = '.cq-win[data-win="settings"]';
(async () => {
  const S = L.suite('E2E papel de parede'); const t = await L.start(); await L.boot(t); const p = t.page;
  const wall = () => p.evaluate(() => { const e = document.getElementById('wallpaper'); return {img: e.style.backgroundImage, size: e.style.backgroundSize, rep: e.style.backgroundRepeat, sys: CQ.sys.get('wallpaper'), fit: CQ.sys.get('wallpaperFit')}; });
  const prev = () => p.evaluate(() => { const e = document.querySelector('.wp-preview'); return {img: e.style.backgroundImage, size: e.style.backgroundSize, rep: e.style.backgroundRepeat}; });
  await p.evaluate(() => { CQ.os.open('settings', {tab: 'personalizacao'}); }); await p.waitForSelector(W + ' .wp-grid'); await sleep(250);
  const n = await p.locator(W + ' [data-act="wp-pick"]').count(); S.ok(n >= 6, `${n} papéis de parede prontos (presets)`);
  const w0 = await wall(); S.ok(w0.sys === 'classico' && w0.fit === 'fill', 'começa com o fundo original (preencher)'); await L.shot(t, 'papel-de-parede-presets');
  // escolher um preset só pré-visualiza; Aplicar muda de fato
  const ids = await p.locator(W + ' [data-act="wp-pick"]:not([disabled])').evaluateAll(els => els.map(e => e.dataset.id)); const other = ids.find(i => i !== 'classico');
  await p.locator(W + ` [data-act="wp-pick"][data-id="${other}"]`).click(); await sleep(250); const pv = await prev(); S.ok(pv.img.includes(other) || pv.img !== w0.img, `escolher "${other}" atualiza a prévia`); S.ok((await wall()).sys === 'classico', 'antes de Aplicar o fundo real não muda');
  await p.locator(W + ' [data-act="wp-apply"]').click(); await sleep(500); const w1 = await wall(); S.ok(w1.sys === other && w1.img !== w0.img, `Aplicar troca o fundo para "${other}"`);
  // os 4 ajustes
  const exp = {fill: 'cover', fit: 'contain', stretch: '100% 100%', tile: 'auto'};
  for (const [fit, size] of Object.entries(exp)) { await p.locator(W + ' select[data-act="wp-fit"]').selectOption(fit); await sleep(250); const pr = await prev(); S.ok(fit === 'tile' ? pr.rep === 'repeat' : pr.size === size, `prévia no ajuste "${fit}" (${pr.size}/${pr.rep})`); await p.locator(W + ' [data-act="wp-apply"]').click(); await sleep(400); const w = await wall(); S.ok(w.fit === fit && (fit === 'tile' ? w.rep === 'repeat' : w.size === size), `fundo aplicado no ajuste "${fit}" (${w.size}/${w.rep})`); }
  await L.shot(t, 'papel-de-parede-repetir');
  // importar imagem real (PNG 4x4) → prévia → aplicar → persistir
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAEUlEQVR4nGNgYGD4z4AGoAAAHgAB/gKo5wAAAABJRU5ErkJggg==', 'base64');
  await p.locator(W + ' select[data-act="wp-fit"]').selectOption('stretch'); await sleep(200);
  await p.locator(W + ' #wp-file').setInputFiles({name: 'meu-fundo.png', mimeType: 'image/png', buffer: png}); await sleep(700); const pi = await prev(); S.ok(/blob:/.test(pi.img), 'importação mostra prévia da imagem (blob local)'); S.ok(!/blob:/.test((await wall()).img), 'importar sozinho não aplica');
  await L.shot(t, 'papel-de-parede-importado-previa'); await p.locator(W + ' [data-act="wp-apply"]').click(); await sleep(700); const w2 = await wall(); S.ok(w2.sys === 'custom' && /blob:/.test(w2.img) && w2.fit === 'stretch', 'Aplicar usa a imagem importada com o ajuste escolhido');
  await p.reload(); await L.boot(t); await sleep(600); const w3 = await wall(); S.ok(w3.sys === 'custom' && /blob:/.test(w3.img) && w3.fit === 'stretch', 'imagem importada persiste após recarregar (IndexedDB local)');
  // formatos inválidos e grandes são recusados
  await p.evaluate(() => { CQ.os.open('settings', {tab: 'personalizacao'}); }); await p.waitForSelector(W + ' #wp-file', {state: 'attached'}); await sleep(250);
  await p.locator(W + ' #wp-file').setInputFiles({name: 'nao-e-imagem.txt', mimeType: 'text/plain', buffer: Buffer.from('oi')}); await sleep(500); S.ok(/Formato não suportado/.test(await p.evaluate(() => document.body.innerText)), 'arquivo que não é imagem é recusado com aviso');
  // restaurar
  await p.locator(W + ' [data-act="wp-reset"]').click(); await sleep(600); const w4 = await wall(); S.ok(w4.sys === 'classico' && w4.fit === 'fill' && !/blob:/.test(w4.img), 'Restaurar fundo original volta ao padrão'); await L.shot(t, 'papel-de-parede-restaurado');
  S.ok(t.errs.length === 0, 'sem erros de console/rede: ' + t.errs.join(' | ')); await t.close(); process.exit(S.done([]));
})().catch(e => { console.error('FALHA', e); process.exit(1); });
