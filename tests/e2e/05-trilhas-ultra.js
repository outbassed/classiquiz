// E2E 5: Trilha Aleatória (banco B6) jogada pela interface, abertura de seeds (campanha / legado / Ultra), biblioteca (exportar/importar),
// Ultra com 1/2/3 corações (início, bloqueio do Terminal, elegibilidade das conquistas).
const fs = require('fs'), path = require('path'); const L = require('./lib'), P = require('./play');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const newCtx = async o => { const t = await L.start(o); await L.boot(t); return t; };
(async () => {
  const S = L.suite('E2E trilhas e Ultra');
  // ---------- Trilha Aleatória 25 pela interface ----------
  let t = await newCtx(), p = t.page;
  await p.dblclick('.desktop-shortcut[data-app="new"]'); await p.waitForSelector('.cq-win[data-win="new"]'); await sleep(700);
  S.ok(await p.evaluate(() => CQ.os.wm.isOpen('new') && !CQ.os.wm.isOpen('game') && !CQ.game.state.generation), 'duplo clique no atalho abre só a janela (o 2º clique não inicia nada por baixo dela)');
  const sizes = await p.locator('.cq-win[data-win="new"] [data-act="size"]').evaluateAll(els => els.map(e => Number(e.dataset.value))); S.ok(JSON.stringify(sizes) === JSON.stringify([25, 50, 75, 100, 150, 200, 400]) || sizes.length >= 5, 'tamanhos oferecidos para mouse: ' + sizes.join(','));
  S.ok(sizes.includes(25) && sizes.includes(400), 'Trilha Aleatória oferece de 25 até 400 posições');
  await p.locator('.cq-win[data-win="new"] [data-act="size"][data-value="25"]').click(); await p.locator('.cq-win[data-win="new"] [data-act="new-gen"]').click(); await p.waitForSelector(P.G + ' .game-stage');
  const g1 = await p.evaluate(() => ({seed: CQ.game.state.generation.seed, bank: CQ.game.state.generation.bank, n: CQ.game.state.generation.count, prof: CQ.game.state.generation.profile})); S.ok(/^CQ1-B6-M-25-[A-Z0-9]{6,12}$/.test(g1.seed) && g1.bank === 'B6', 'nova Trilha usa o banco B6: ' + g1.seed);
  const r1 = await P.playAll(p, {}); S.ok(r1.done && !r1.lost && !r1.stuck, `Trilha B6 de 25 concluída (${r1.errors.join('; ')}) — etapas ${r1.played}, tipos ${JSON.stringify(r1.kinds)}`); await L.shot(t, 'trilha-aleatoria-concluida');
  // biblioteca
  await p.evaluate(() => { CQ.os.open('library'); }); await p.waitForSelector('.cq-win[data-win="library"]'); await sleep(250); S.ok((await p.locator('.cq-win[data-win="library"]').innerText()).includes(g1.seed), 'Minhas Trilhas guarda a seed jogada');
  await p.locator('.cq-win[data-win="library"] [data-act="fav"]').first().click(); await sleep(200); await p.evaluate(() => { CQ.os.open('favorites'); }); await p.waitForSelector('.cq-win[data-win="favorites"]'); await sleep(250); S.ok((await p.locator('.cq-win[data-win="favorites"]').innerText()).includes(g1.seed), 'Favoritas mostra a Trilha favoritada');
  await p.evaluate(() => { CQ.os.wm.close('favorites'); }); await sleep(200);
  const dl = p.waitForEvent('download'); await p.locator('.cq-win[data-win="library"] [data-act="export-lib"]').click(); const d = await dl; const tmp = path.join(require('os').tmpdir(), 'cq-export-' + Date.now() + '.json'); await d.saveAs(tmp);
  const exported = JSON.parse(fs.readFileSync(tmp, 'utf8')); S.ok(Array.isArray(exported) && exported.some(x => x.seed === g1.seed && x.favorite === true), 'exportação JSON contém a Trilha favorita');
  const withCamp = exported.concat([{seed: 'CQC2-B6-U-50-CLASSIQUIZ2', name: 'não deve entrar'}, {seed: 'lixo', name: 'seed inválida'}, {seed: 'CQ1-B5-H-25-ZZZ999', name: 'legado importado'}]); fs.writeFileSync(tmp, JSON.stringify(withCamp));
  await t.close();
  // importação em contexto novo (sem dados)
  t = await newCtx(); p = t.page; await p.evaluate(() => { CQ.os.open('library'); }); await p.waitForSelector('.cq-win[data-win="library"]'); await sleep(250);
  await p.locator('.cq-win[data-win="library"] #lib-import').setInputFiles(tmp); await sleep(900); let libTxt = await p.locator('.cq-win[data-win="library"]').innerText();
  S.ok(libTxt.includes(g1.seed) && libTxt.includes('CQ1-B5-H-25-ZZZ999'), 'importação adiciona as seeds válidas (B6 e legado B5)'); S.ok(!libTxt.includes('lixo') && !libTxt.includes('CQC2-B6-U-50'), 'importação ignora seed inválida e não guarda campanhas na biblioteca');
  const n1 = await p.evaluate(() => JSON.parse(localStorage.getItem('classiquiz.v1.library')).length); await p.locator('.cq-win[data-win="library"] #lib-import').setInputFiles(tmp); await sleep(700); const n2 = await p.evaluate(() => JSON.parse(localStorage.getItem('classiquiz.v1.library')).length); S.ok(n1 === 2 && n2 === n1, `importar de novo não duplica (${n1} → ${n2})`);
  fs.unlinkSync(tmp); await p.evaluate(() => { CQ.os.wm.close('library'); });
  // ---------- abrir seeds ----------
  await p.evaluate(() => { CQ.os.open('new'); }); await p.waitForSelector('.cq-win[data-win="new"] #seed-entry');
  await p.locator('#seed-entry').fill('cqc2-b6-u-50-classiquiz2'); await p.locator('#seed-entry').press('Enter'); await sleep(900);
  S.ok(await p.evaluate(() => CQ.game.state.generation && CQ.game.state.generation.mode === 'campaign' && CQ.game.state.generation.campaign === 2), 'seed de campanha (CQC2…) abre o ClassiQuiz 2');
  await p.evaluate(() => { CQ.os.open('new'); }); await p.waitForSelector('.cq-win[data-win="new"] #seed-entry'); await p.locator('#seed-entry').fill('CQ1-B3-M-25-XYZ789'); await p.locator('#seed-entry').press('Enter'); await sleep(500); if (await p.$('#modal-layer button')) await p.locator('#modal-layer button', {hasText: /Substituir/}).click(); await sleep(900);
  S.ok(await p.evaluate(() => CQ.game.state.generation.seed === 'CQ1-B3-M-25-XYZ789' && CQ.game.state.generation.bank === 'B3'), 'seed legada B3 continua abrindo (banco B3)');
  S.ok(t.errs.length === 0, 'sem erros de console/rede (trilhas): ' + t.errs.join(' | ')); await t.close();

  // ---------- seeds fixas (regressão): pegadinha "Propriedades" e Trilha B6 de 100 com todos os tipos de etapa ----------
  for (const sd of ['CQ1-B6-M-25-ABC2011', 'CQ1-B6-M-100-E2E0001']) {
    t = await newCtx(); p = t.page; await p.evaluate(s => { CQ.game.openSeed(s); }, sd); await p.waitForSelector(P.G + ' .game-stage');
    const kinds = await p.evaluate(() => { const o = {}; for (const s of CQ.game.state.generation.stages) o[s.kind + (s.mode ? ':' + s.mode : '')] = 1; return Object.keys(o).length; });
    const r = await P.playAll(p, {}); S.ok(r.done && !r.lost && !r.stuck, `seed fixa ${sd} concluída pela interface (${kinds} variações de etapa; ${r.errors.join('; ')}) — ${JSON.stringify(r.kinds)}`);
    S.ok(t.errs.length === 0, `seed fixa ${sd}: sem erros de console/rede: ` + t.errs.join(' | ')); await t.close();
  }
  // ---------- Ultra ----------
  for (const lives of [1, 2, 3]) {
    t = await newCtx(); p = t.page;
    await p.dblclick('.ultra-shortcut'); await p.waitForSelector('.cq-win[data-win="ultra"] [data-act="ultra-start"]'); if (lives === 1) await L.shot(t, 'ultra-setup');
    await p.locator(`.cq-win[data-win="ultra"] [data-act="ultra-lives"][data-value="${lives}"]`).click(); await sleep(250);
    const note = await p.locator('.cq-win[data-win="ultra"] .ultra-note').innerText(); S.ok(lives === 1 ? /habilitadas/i.test(note) : /bloqueadas/i.test(note), `Ultra ${lives} coração(ões): aviso de conquistas — "${note.trim()}"`);
    await p.locator('.cq-win[data-win="ultra"] [data-act="ultra-start"]').click(); await p.waitForSelector(P.G + ' .game-stage');
    const u = await p.evaluate(() => { const s = CQ.game.state, g = s.generation; return {mode: g.mode, seed: g.seed, il: g.initialLives, lives: s.lives, n: g.count, bank: g.bank}; });
    S.ok(u.mode === 'ultra' && u.il === lives && u.lives === lives && u.n > 500 && /^CQU2-B6-M-ALL-/.test(u.seed), `Ultra ${lives}: começa com ${u.lives} coração(ões), ${u.n} posições, seed ${u.seed}`);
    // Terminal indisponível no Ultra
    await p.click('#start-button'); await sleep(250); const st = await p.evaluate(() => document.getElementById('start-menu').innerText); S.ok(!/Terminal/.test(st), `Ultra ${lives}: Terminal some do menu Iniciar`); await p.keyboard.press('Escape');
    await p.evaluate(() => { CQ.os.open('dev'); }); await sleep(300); S.ok(!await p.evaluate(() => CQ.os.wm.isOpen('dev')) && !await p.$('#modal-layer button'), `Ultra ${lives}: Terminal não abre`);
    // joga as 30 primeiras posições e confere a elegibilidade das conquistas
    await P.focusGame(p); const r = await P.playAll(p, {maxStages: 30}); S.ok(r.errors.length === 0 && r.played === 30, `Ultra ${lives}: 30 primeiras posições jogadas pela interface (${r.errors.join('; ')})`);
    const ach = await p.evaluate(() => ({u: Object.keys(CQ.game.achievementsState().unlocked).filter(k => k.startsWith('u')), best: CQ.game.achievementsState().stats.ultraBest || 0}));
    if (lives === 1) { S.ok(ach.u.includes('u25'), `Ultra 1 coração: conquista "Uma Vida Só" (25) desbloqueada após 30 (ultraBest ${ach.best})`); await L.shot(t, 'ultra-1-coracao-jogando'); }
    else S.ok(ach.u.length === 0 && ach.best === 0, `Ultra ${lives} corações: nenhuma conquista do Ultra (${JSON.stringify(ach)})`);
    S.ok(t.errs.length === 0, `Ultra ${lives}: sem erros de console/rede: ` + t.errs.join(' | ')); await t.close();
  }
  // Ultra: errar com 1 coração termina a tentativa
  t = await newCtx(); p = t.page; await p.evaluate(() => { CQ.game.startUltra(1); }); await p.waitForSelector(P.G + ' .game-stage');
  for (let g = 0; g < 8; g++) { const c = await P.cur(p); if (c.lost) break; if (['standard', 'extended', 'show'].includes(c.s.kind) && !c.solved) { const wrong = (c.s.answer + 1) % c.s.options.length; await P.click(p, `${P.G} [data-act="answer"][data-i="${wrong}"]`); await sleep(400); break; } if (!c.solved) await P.solveStage(p, c.s); await P.focusGame(p); await P.click(p, `${P.G} [data-act="advance"]`); }
  S.ok((await P.cur(p)).lost, 'Ultra 1 coração: errar encerra a tentativa'); await L.shot(t, 'ultra-fim-de-jogo'); S.ok(t.errs.length === 0, 'sem erros de console/rede (Ultra derrota): ' + t.errs.join(' | ')); await t.close();
  process.exit(S.done([]));
})().catch(e => { console.error('FALHA', e); process.exit(1); });
