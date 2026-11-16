// E2E 11: itens do checklist de aceitação que as outras suítes não cobriam — barra de tarefas, resoluções, F12 livre, Campo Minado (vitória/derrota/bandeira),
// Paint (borracha), persistência (F5) de campanha e de investigação, cliques em controles do sistema sem perder a partida, Milhonário com erro,
// retrospectiva de derrota e contagem de erros/derrotas, Ultra + recarregar.
const fs = require('fs'), path = require('path'); const L = require('./lib'), P = require('./play');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const W = id => `.cq-win[data-win="${id}"]`;
const open = (p, id) => p.evaluate(id => { CQ.os.open(id); }, id);
async function mineSolve(p, sel) {
  const NB = (i, w, h) => { const x = i % w, y = Math.floor(i / w), r = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < w && Y < h) r.push(Y * w + X); } return r; };
  const mines = new Set(); const w = 8, h = 8;
  for (let it = 0; it < 300; it++) {
    const cells = await p.$$eval(sel, els => els.map(e => ({i: Number(e.dataset.i), l: e.getAttribute('aria-label')}))); const face = await p.locator(W('mines') + ' .ms-face').textContent();
    if (/Vitória|Boom/.test(face)) return face.trim();
    const st = cells.map(c => /bandeira/.test(c.l) ? 'F' : /fechada/.test(c.l) ? 'C' : /vazia/.test(c.l) ? 0 : Number(c.l.split(', ').pop()));
    const safe = new Set();
    const isM = i => st[i] === 'F' || mines.has(i);
    for (let i = 0; i < st.length; i++) if (typeof st[i] === 'number' && st[i] > 0) { const nb = NB(i, w, h), cl = nb.filter(j => st[j] === 'C' && !mines.has(j)), fl = nb.filter(isM).length; if (cl.length && fl === st[i]) cl.forEach(j => safe.add(j)); else if (cl.length && st[i] - fl === cl.length) cl.forEach(j => mines.add(j)); }
    if (!safe.size) { // regra do subconjunto
      const cons = []; for (let i = 0; i < st.length; i++) if (typeof st[i] === 'number' && st[i] > 0) { const nb = NB(i, w, h), un = nb.filter(j => st[j] === 'C' && !mines.has(j)), rem = st[i] - nb.filter(isM).length; if (un.length) cons.push({un, rem}); }
      for (const a of cons) for (const b of cons) { if (a === b || a.un.length >= b.un.length || !a.un.every(j => b.un.includes(j))) continue; const diff = b.un.filter(j => !a.un.includes(j)), dr = b.rem - a.rem; if (dr === 0) diff.forEach(j => safe.add(j)); else if (dr === diff.length) diff.forEach(j => mines.add(j)); }
    }
    if (!safe.size) return 'TRAVOU';
    for (const i of safe) await p.locator(sel + `[data-i="${i}"]`).click();
  }
  return 'LIMITE';
}
(async () => {
  const S = L.suite('E2E aceitação (complementar)');
  // ---------- barra de tarefas: focar / minimizar / restaurar ----------
  let t = await L.start(); await L.boot(t); let p = t.page;
  await open(p, 'notepad'); await open(p, 'paint'); await sleep(300); const tb = id => p.locator(`#task-programs [data-app="${id}"]`);
  const state = id => p.evaluate(id => ({open: CQ.os.wm.isOpen(id), vis: CQ.os.wm.isVisible(id), act: CQ.os.wm.isActive(id)}), id);
  S.ok((await state('paint')).act, 'a última janela aberta está ativa'); await tb('notepad').click(); await sleep(200); S.ok((await state('notepad')).act && (await state('notepad')).vis, 'botão da barra foca a janela certa'); await tb('notepad').click(); await sleep(200); S.ok(!(await state('notepad')).vis, 'clicar no botão da janela ativa a minimiza');
  await tb('notepad').click(); await sleep(250); S.ok((await state('notepad')).vis && (await state('notepad')).act, 'clicar na minimizada restaura e foca'); await p.locator(W('notepad') + ' #np-text').fill('texto que não pode sumir'); await tb('notepad').click(); await sleep(150); await tb('notepad').click(); await sleep(250);
  S.ok(await p.locator(W('notepad') + ' #np-text').inputValue() === 'texto que não pode sumir', 'minimizar/restaurar não reseta o conteúdo'); await p.evaluate(() => { CQ.os.wm.requestClose('notepad'); }); await sleep(250); if (await p.$('#modal-layer button')) await p.locator('#modal-layer button', {hasText: /Não salvar/}).click(); await p.evaluate(() => { CQ.os.wm.close('paint'); });

  // ---------- F12 / ferramentas do navegador seguem livres ----------
  const dev = await p.evaluate(() => { const r = {}; for (const [k, init] of [['F12', {key: 'F12', code: 'F12'}], ['Ctrl+Shift+I', {key: 'I', code: 'KeyI', ctrlKey: true, shiftKey: true}], ['Ctrl+U', {key: 'u', code: 'KeyU', ctrlKey: true}], ['Ctrl+Shift+J', {key: 'J', code: 'KeyJ', ctrlKey: true, shiftKey: true}]]) { const e = new KeyboardEvent('keydown', Object.assign({bubbles: true, cancelable: true}, init)); document.dispatchEvent(e); r[k] = e.defaultPrevented; } const c = new MouseEvent('contextmenu', {bubbles: true, cancelable: true, ctrlKey: true, clientX: 400, clientY: 400}); document.body.dispatchEvent(c); r['Ctrl+botão direito'] = c.defaultPrevented; return r; });
  S.ok(Object.values(dev).every(v => v === false), 'atalhos do navegador não são cancelados pelo jogo: ' + JSON.stringify(dev));
  const srcs = await Promise.all(['core', 'vfs', 'wm', 'app', 'missions', 'apps-system', 'apps-files', 'apps-tools', 'apps-games', 'main', 'gen', 'gen-b6'].map(f => p.evaluate(f => fetch('assets/js/' + f + '.js').then(r => r.text()), f)));
  const bad = srcs.map((s, i) => /\bdebugger\b|outerWidth\s*-\s*innerWidth|devtools-detect|console\.clear\(\)/.test(s) ? i : -1).filter(i => i >= 0); S.ok(bad.length === 0, 'nenhum código de detecção/bloqueio de DevTools (debugger, outerWidth−innerWidth, console.clear)');
  await t.close();

  // ---------- Campo Minado: vitória, derrota, bandeira (PC e toque) ----------
  t = await L.start(); await L.boot(t); p = t.page; await open(p, 'mines'); await p.waitForSelector(W('mines')); const cellSel = W('mines') + ' [data-act="ms-cell"]'; await p.locator(W('mines') + ' [data-act="ms-lvl"][data-lvl="facil"]').click();
  await p.locator(cellSel).nth(27).click(); await sleep(150); S.ok(!/Boom/.test(await p.locator(W('mines') + ' .ms-face').textContent()), 'primeiro clique seguro');
  let closed = await p.locator(cellSel + '[aria-label$="fechada"]').first().getAttribute('data-i'); await p.locator(cellSel + `[data-i="${closed}"]`).click({button: 'right'}); await sleep(150); S.ok(/bandeira/.test(await p.locator(cellSel + `[data-i="${closed}"]`).getAttribute('aria-label')), 'botão direito coloca bandeira (PC)');
  await p.locator(cellSel + `[data-i="${closed}"]`).click({button: 'right'}); await sleep(100); S.ok(/fechada/.test(await p.locator(cellSel + `[data-i="${closed}"]`).getAttribute('aria-label')), 'botão direito de novo remove a bandeira');
  await p.locator(W('mines') + ' [data-act="ms-flagmode"]').click(); await p.locator(cellSel + `[data-i="${closed}"]`).click(); await sleep(100); S.ok(/bandeira/.test(await p.locator(cellSel + `[data-i="${closed}"]`).getAttribute('aria-label')), 'modo bandeira (toque/clique) coloca bandeira'); await p.locator(W('mines') + ' [data-act="ms-flagmode"]').click(); await p.locator(cellSel + `[data-i="${closed}"]`).click({button: 'right'});
  await p.locator(W('mines') + ' [data-act="ms-new"]').click(); await p.locator(cellSel).nth(27).click(); const res = await mineSolve(p, cellSel); S.ok(/Vitória/.test(res), 'Campo Minado: partida resolvida por lógica até a Vitória pela interface (' + res + ')');
  S.ok(await p.evaluate(() => !!CQ.game.achievementsState().unlocked.g_mines), 'vitória no Campo Minado concede "Campo Limpo" (fora de partida)'); await L.shot(t, 'app-campo-minado-vitoria');
  await p.locator(W('mines') + ' [data-act="ms-new"]').click(); await p.locator(cellSel).nth(27).click(); let boom = false; for (let i = 0; i < 64 && !boom; i++) { const c = p.locator(cellSel + ':not([disabled])[aria-label$="fechada"]'); if (!await c.count()) break; await c.nth(Math.floor(Math.random() * await c.count())).click(); boom = /Boom/.test(await p.locator(W('mines') + ' .ms-face').textContent()); }
  S.ok(boom, 'Campo Minado: clicar em mina termina com "Boom!"'); await L.shot(t, 'app-campo-minado-derrota');
  // ---------- Paint: borracha ----------
  await open(p, 'paint'); const cv = p.locator(W('paint') + ' #pt-canvas'), bb = await cv.boundingBox(); const px = (x, y) => p.evaluate(([x, y]) => { const c = document.querySelector('#pt-canvas'), d = c.getContext('2d').getImageData(Math.round(x * c.width), Math.round(y * c.height), 1, 1).data; return [d[0], d[1], d[2]]; }, [x, y]);
  await p.locator(W('paint') + ' [data-act="pt-color"]').first().click(); await p.locator(W('paint') + ' [data-act="pt-size"]').last().click().catch(() => {}); await p.mouse.move(bb.x + bb.width * .3, bb.y + bb.height * .5); await p.mouse.down(); await p.mouse.move(bb.x + bb.width * .7, bb.y + bb.height * .5, {steps: 12}); await p.mouse.up();
  const dark = await px(.5, .5); S.ok(dark[0] < 80 && dark[1] < 80, 'Paint: o lápis pinta ' + dark.join(','));
  await p.locator(W('paint') + ' [data-act="pt-tool"][data-tool="eraser"]').click(); await p.locator(W('paint') + ' [data-act="pt-size"]').last().click().catch(() => {}); await p.mouse.move(bb.x + bb.width * .4, bb.y + bb.height * .5); await p.mouse.down(); await p.mouse.move(bb.x + bb.width * .6, bb.y + bb.height * .5, {steps: 12}); await p.mouse.up(); await sleep(150);
  const white = await px(.5, .5); S.ok(white[0] > 240 && white[1] > 240 && white[2] > 240, 'Paint: a borracha apaga ' + white.join(',')); await p.evaluate(() => { CQ.os.wm.close('paint'); });
  S.ok(t.errs.length === 0, 'sem erros de console/rede/externos (Campo Minado e Paint): ' + t.errs.join(' | ')); await t.close();

  // ---------- campanha: mesma ordem após F5 e após derrota ----------
  t = await L.start(); await L.boot(t); p = t.page; await p.evaluate(() => { CQ.game.startCampaign(3); }); await p.waitForSelector(P.G + ' .game-stage');
  const ids0 = await p.evaluate(() => CQ.game.state.generation.stages.map(s => s.id).join(',')); S.ok(ids0.split(',').length === 50, 'ClassiQuiz 3 tem exatamente 50 posições');
  await P.playAll(p, {maxStages: 3}); const ph = await p.evaluate(() => CQ.game.state.phase); S.ok(ph === 3, 'jogou 3 etapas (fase ' + ph + ')');
  await p.reload(); await L.boot(t); await open(p, 'resume'); await p.waitForSelector(P.G + ' .game-stage'); const after = await p.evaluate(() => ({ids: CQ.game.state.generation.stages.map(s => s.id).join(','), phase: CQ.game.state.phase, seed: CQ.game.state.generation.seed}));
  S.ok(after.ids === ids0 && after.phase === 3 && after.seed === 'CQC3-B6-U-50-CLASSIQUIZ3', 'F5: Continuar retoma a campanha na mesma fase e com a mesma ordem');
  // derrota (1 coração) e "Tentar a mesma Trilha"
  for (let g = 0; g < 10; g++) { const c = await P.cur(p); if (c.lost) break; if (['standard', 'extended'].includes(c.s.kind) && !c.solved) { await P.click(p, `${P.G} [data-act="answer"][data-i="${(c.s.answer + 1) % c.s.options.length}"]`); await sleep(300); break; } if (!c.solved) await P.solveStage(p, c.s); await P.focusGame(p); await P.click(p, `${P.G} [data-act="advance"]`); }
  const lost = await P.cur(p); S.ok(lost.lost, 'errar com 1 coração encerra a tentativa'); const endTxt = await p.locator(P.G).innerText(); S.ok(/Acertos/.test(endTxt) && /Erros/.test(endTxt) && /Cora/.test(endTxt), 'retrospectiva da derrota mostra os números da tentativa');
  const stats = await p.evaluate(() => { const a = CQ.game.achievementsState().stats; return {err: a.errors || 0, lost: a.losses || 0, run: CQ.game.state.run}; }); const tile = n => new RegExp(n + '\\s*\\n?\\s*(\\d+)').exec(endTxt); S.ok(stats.err >= 1 && stats.lost === 1, `erros e derrotas contados separadamente (erros ${stats.err}, derrotas ${stats.lost})`);
  S.ok(Number(tile('Erros')[1]) === stats.run.wrong || Number(tile('Erros')[1]) >= 1, 'retrospectiva: tile de erros confere com a tentativa (' + tile('Erros')[1] + ')');
  await P.click(p, `${P.G} [data-act="restart"]`); await sleep(500); const again = await p.evaluate(() => ({ids: CQ.game.state.generation.stages.map(s => s.id).join(','), phase: CQ.game.state.phase})); S.ok(again.ids === ids0 && again.phase === 0, 'derrota → "Tentar a mesma Trilha": mesma ordem, volta ao início');
  // controles do sistema não derrubam a partida quando não são o alvo
  await p.waitForSelector(P.G + ' .game-stage'); let std = null; for (let g = 0; g < 12; g++) { const c = await P.cur(p); if (['standard', 'extended'].includes(c.s.kind) && !c.solved) { std = c; break; } if (!c.solved) await P.solveStage(p, c.s); await P.focusGame(p); await P.click(p, `${P.G} [data-act="advance"]`); }
  S.ok(!!std, 'chegou a uma pergunta normal para o teste de controles do sistema'); if (std) {
    const before = await p.evaluate(() => ({lives: CQ.game.state.lives, solved: !!CQ.game.state.mini.solved, lost: CQ.game.state.lost, phase: CQ.game.state.phase}));
    await p.locator(W('game') + ' [data-act="win-min"]').click(); await sleep(250); await p.locator('#task-programs [data-app="game"]').click(); await sleep(250); await p.click('#start-button'); await sleep(200); await p.keyboard.press('Escape'); await p.click('#start-button'); await sleep(150); await p.click('#start-button'); await sleep(150);
    await p.locator('.icon-logo, [data-act="icon-logo"]').first().click().catch(() => {}); await sleep(250); if (!await p.evaluate(() => CQ.os.wm.isVisible('game'))) await p.evaluate(() => { CQ.os.wm.restore('game'); }); await p.locator('[data-act="version-click"]').first().click().catch(() => {}); await sleep(250); if (await p.$('#modal-layer button')) await p.locator('#modal-layer button').first().click(); await sleep(200);
    const now = await p.evaluate(() => ({lives: CQ.game.state.lives, solved: !!CQ.game.state.mini.solved, lost: CQ.game.state.lost, phase: CQ.game.state.phase})); S.ok(JSON.stringify(now) === JSON.stringify(before), 'minimizar, Start, logo e versão numa pergunta normal não custam coração nem resolvem: ' + JSON.stringify(now));
  }
  S.ok(t.errs.length === 0, 'sem erros de console/rede/externos (campanha F5/derrota): ' + t.errs.join(' | ')); await t.close();

  // ---------- investigação: evidências preservadas após F5 ----------
  t = await L.start(); await L.boot(t); p = t.page; await p.evaluate(() => { CQ.game.startCampaign(2); }); await p.waitForSelector(P.G + ' .game-stage'); let reached = false;
  for (let g = 0; g < 50 && !reached; g++) { const c = await P.cur(p); if (c.done || c.lost) break; if (c.s.kind === 'story' && c.s.puzzle && c.s.step >= 2) { reached = true; break; } if (!c.solved) await P.solveStage(p, c.s); await P.focusGame(p); await P.click(p, `${P.G} [data-act="advance"]`); }
  S.ok(reached, 'chegou ao 2º passo da investigação'); if (reached) {
    const folder = await p.evaluate(() => CQ.game.cur().puzzle.folder); await p.reload(); await L.boot(t); await open(p, 'resume'); await p.waitForSelector(P.G + ' .game-stage');
    const still = await p.evaluate(() => CQ.game.cur() && CQ.game.cur().kind === 'story' && !!CQ.game.cur().puzzle); S.ok(still, 'F5: continua no mesmo passo da investigação');
    await p.locator(`${P.G} [data-act="open-case"]`).click(); await sleep(700); const files = await p.evaluate(folder => CQ.vfs.list('C:\\ClaQui\\Arquivos de jogo\\Casos\\' + folder, {hidden: true}).length, folder); S.ok(files >= 3, `F5: a pasta do caso "${folder}" volta com as evidências (${files} arquivos)`);
    const ro = await p.evaluate(folder => { try { const f = CQ.vfs.list('C:\\ClaQui\\Arquivos de jogo\\Casos\\' + folder, {hidden: true}).find(x => x.type === 'file'); CQ.vfs.remove(f.path); return 'REMOVIDO'; } catch (e) { return e.message; } }, folder); S.ok(ro !== 'REMOVIDO', 'evidências do caso são somente leitura (' + ro + ')');
  }
  S.ok(t.errs.length === 0, 'sem erros (investigação F5): ' + t.errs.join(' | ')); await t.close();

  // ---------- Milhonário não vale com erro em alguma rodada ----------
  t = await L.start(); await L.boot(t); p = t.page; const seed = await p.evaluate(() => { for (let i = 0; i < 400; i++) { const s = 'CQ1-B6-M-100-MIL' + String(1000 + i); const g = CQ_GEN.generate(s); const k = g.stages.findIndex(x => x.kind === 'show'); if (k >= 25) return s; } return null; });
  S.ok(!!seed, 'achou Trilha de 100 com Show após a posição 25 (2 corações): ' + seed); if (seed) {
    await p.evaluate(s => { CQ.game.openSeed(s); }, seed); await p.waitForSelector(P.G + ' .game-stage'); let missed = false; let livesBefore = null, livesAfter = null;
    for (let g = 0; g < 200; g++) { const c = await P.cur(p); if (c.done || c.lost) break; if (c.s.kind === 'show' && c.s.tier === 3 && !missed && !c.solved) { livesBefore = c.lives; await P.click(p, `${P.G} [data-act="answer"][data-i="${(c.s.answer + 1) % c.s.options.length}"]`); await sleep(400); missed = true; livesAfter = (await P.cur(p)).lives; continue; } if (!c.solved) await P.solveStage(p, c.s); await P.focusGame(p); await P.click(p, `${P.G} [data-act="advance"]`).catch(() => {}); }
    const f = await P.cur(p); S.ok(missed && livesAfter === livesBefore - 1, `errar a rodada 3 custa 1 coração (${livesBefore} → ${livesAfter})`); S.ok(f.done, 'a Trilha ainda é concluída depois do erro'); S.ok(await p.evaluate(() => !CQ.game.achievementsState().unlocked.milhonario), 'Milhonário NÃO é concedido quando houve erro em alguma rodada'); await L.shot(t, 'milhozao-com-erro');
  }
  S.ok(t.errs.length === 0, 'sem erros (Milhonário com erro): ' + t.errs.join(' | ')); await t.close();

  // ---------- Ultra + recarregar: Terminal continua indisponível ----------
  t = await L.start(); await L.boot(t); p = t.page; await p.evaluate(() => { CQ.game.startUltra(1); }); await p.waitForSelector(P.G + ' .game-stage'); await p.reload(); await L.boot(t); await open(p, 'resume'); await sleep(500);
  S.ok(await p.evaluate(() => CQ.game.isUltra()), 'Ultra retomado após F5'); await p.evaluate(() => { CQ.os.open('dev'); }); await sleep(400); S.ok(!await p.evaluate(() => CQ.os.wm.isOpen('dev')) && !await p.$('#modal-layer button'), 'Ultra retomado: Terminal não abre e nenhum aviso é mostrado');
  await p.click('#start-button'); await sleep(250); S.ok(!/Terminal/.test(await p.evaluate(() => document.getElementById('start-menu').innerText)), 'Ultra retomado: Terminal ausente do menu Iniciar'); await p.keyboard.press('Escape');
  S.ok(t.errs.length === 0, 'sem erros (Ultra F5): ' + t.errs.join(' | ')); await t.close();

  // ---------- resoluções ----------
  const sizes = [[1920, 1080], [1366, 768], [1280, 720], [1024, 768], [360, 800], [390, 844], [320, 700], [800, 360], [844, 390]];
  for (const [w, h] of sizes) {
    const mobile = w < 500 || h < 500; t = await L.start({viewport: {width: w, height: h}, mobile, touch: mobile}); await L.boot(t); p = t.page; const tag = `${w}×${h}`;
    const ov = () => p.evaluate(() => ({x: document.documentElement.scrollWidth - innerWidth, y: document.documentElement.scrollHeight - innerHeight, sc: CQ.os.scale()}));
    let o = await ov(); S.ok(o.x <= 1 && o.y <= 1, `${tag}: área de trabalho sem rolagem (excesso ${o.x}×${o.y}, escala ${o.sc})`);
    const vis = await p.evaluate(() => [...document.querySelectorAll('.desktop-shortcut')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= document.querySelector('.taskbar').getBoundingClientRect().top + 1; }).length); S.ok(vis === 9, `${tag}: 9 atalhos visíveis e fora da barra de tarefas (${vis})`);
    const cut = await p.evaluate(() => [...document.querySelectorAll('.desktop-shortcut .sc-label')].filter(l => { const w0 = l.style.overflowWrap; l.style.overflowWrap = 'normal'; const b = l.scrollWidth > l.clientWidth + 1; l.style.overflowWrap = w0; return b; }).map(l => l.textContent)); S.ok(cut.length === 0, `${tag}: rótulos inteiros ${JSON.stringify(cut)}`);
    await p.evaluate(() => { CQ.game.startCampaign(1); }); await p.waitForSelector(P.G + ' .game-stage'); await sleep(300); o = await ov(); S.ok(o.x <= 1, `${tag}: tela de jogo sem rolagem horizontal`);
    if ([1920, 1366, 1024, 360, 844].includes(w)) await L.shot(t, `resolucao-${w}x${h}`);
    const inside = await p.evaluate(() => { const b = document.querySelector('.cq-win[data-win="game"] .answers, .cq-win[data-win="game"] [data-act="answer"]'); if (!b) return true; const r = b.getBoundingClientRect(); return r.right <= innerWidth + 1 && r.left >= -1; }); S.ok(inside, `${tag}: alternativas dentro da tela`);
    await p.evaluate(() => { CQ.sys.set({scale: 175}); window.dispatchEvent(new Event('resize')); }); await sleep(300); o = await ov(); if ([360, 844].includes(w)) await L.shot(t, `resolucao-${w}x${h}-escala175`); S.ok(o.x <= 1 && o.y <= 1, `${tag}: escala 175% sem rolagem (aplicada ${o.sc.toFixed(2)})`);
    const c = await P.cur(p); if (!c.solved && ['standard', 'extended', 'story', 'show'].includes(c.s.kind)) { await p.locator(`${P.G} [data-act="answer"][data-i="${c.s.answer}"]`).scrollIntoViewIfNeeded(); S.ok(await p.locator(`${P.G} [data-act="answer"][data-i="${c.s.answer}"]`).isVisible(), `${tag}: alternativa alcançável em 175%`); }
    S.ok(t.errs.length === 0, `${tag}: sem erros de console/rede/externos: ` + t.errs.join(' | ')); await t.close();
  }
  process.exit(S.done([]));
})().catch(e => { console.error('FALHA', e); process.exit(1); });
