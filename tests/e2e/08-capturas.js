// E2E 8: capturas de tela reais (Chrome) de todos os programas e de etapas especiais; também funciona como teste de fumaça (todos os apps abrem sem erros).
const L = require('./lib'), P = require('./play');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const S = L.suite('E2E capturas e fumaça de todos os programas'); let t = await L.start(); await L.boot(t); let p = t.page;
  const ids = await p.evaluate(() => Object.keys(CQ.apps)); S.ok(ids.length >= 28, `${ids.length} programas registrados`);
  const skip = new Set(['game', 'dev', 'resume']);
  for (const id of ids) {
    if (skip.has(id)) continue;
    await p.evaluate(id => { CQ.os.open(id); }, id); await sleep(450); const ok = await p.evaluate(id => CQ.os.wm.isOpen(id), id);
    S.ok(ok, 'abre: ' + id); if (ok) { await L.shot(t, 'app-' + id); await p.evaluate(id => { CQ.os.wm.close(id); }, id); await sleep(120); }
    if (await p.$('#modal-layer button')) { await p.keyboard.press('Escape'); await sleep(100); }
  }
  S.ok(t.errs.length === 0, 'sem erros de console/rede ao abrir todos os programas: ' + t.errs.join(' | ')); await t.close();

  // Campanha 1: Show do Milhozão (rodadas 1 e 7), pegadinha de arrastar, minijogo, missão
  const taken = new Set(); const shotOnce = async (name) => { if (!taken.has(name)) { taken.add(name); await L.shot(t, name); } };
  t = await L.start(); await L.boot(t); p = t.page; await p.evaluate(() => { CQ.game.startCampaign(1); }); await p.waitForSelector(P.G + ' .game-stage'); await L.shot(t, 'campanha-1-inicio');
  let r = await P.playAll(p, {onStage: async c => { const s = c.s; if (s.kind === 'show' && s.tier === 1) { await sleep(300); await shotOnce('show-milhozao-rodada-1'); } if (s.kind === 'show' && s.tier === 7) { await sleep(300); await shotOnce('show-milhozao-rodada-7'); } if (s.kind === 'trick' && /^drag/.test(s.mode || '')) { await sleep(200); await shotOnce('pegadinha-arrastar'); } if (s.kind === 'mini') { await sleep(200); await shotOnce('minijogo-' + s.mode); } if (s.kind === 'mission') { await sleep(200); await shotOnce('missao-' + s.mission.type); } if (s.kind === 'story' && s.step === 1) { await sleep(200); await shotOnce('historia-' + (s.group || 'a')); } }});
  S.ok(r.done && !r.lost, 'campanha 1 concluída durante as capturas (' + r.errors.join('; ') + ')'); S.ok(t.errs.length === 0, 'sem erros (campanha 1 com capturas): ' + t.errs.join(' | ')); await t.close();

  // Campanha 2: investigação com pasta do caso aberta no Explorador
  t = await L.start(); await L.boot(t); p = t.page; await p.evaluate(() => { CQ.game.startCampaign(2); }); await p.waitForSelector(P.G + ' .game-stage'); let caseShot = false;
  r = await P.playAll(p, {onStage: async c => { const s = c.s; if (s.puzzle && !caseShot && s.kind === 'story' && !c.solved) { caseShot = true; await sleep(300); await L.shot(t, 'caso-investigacao-pergunta'); await p.locator(`${P.G} [data-act="open-case"]`).click(); await sleep(700); await L.shot(t, 'caso-investigacao-pasta'); await p.evaluate(() => { CQ.os.wm.close('explorer'); }); await P.focusGame(p); } }});
  S.ok(caseShot, 'investigação com pasta do caso capturada'); S.ok(r.done && !r.lost, 'campanha 2 concluída (' + r.errors.join('; ') + ')'); S.ok(t.errs.length === 0, 'sem erros (campanha 2 com capturas): ' + t.errs.join(' | ')); await t.close();

  // Tela inicial do jogo e Loja
  t = await L.start(); await L.boot(t); p = t.page; await p.evaluate(() => { CQ.os.open('new'); }); await sleep(500); await L.shot(t, 'modo-de-jogo'); await p.evaluate(() => { CQ.os.wm.close('new'); CQ.os.open('rewards'); }); await sleep(500); await L.shot(t, 'recompensas-loja');
  S.ok(t.errs.length === 0, 'sem erros (modo de jogo e loja): ' + t.errs.join(' | ')); await t.close();
  process.exit(S.done([]));
})().catch(e => { console.error('FALHA', e); process.exit(1); });
