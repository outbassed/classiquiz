// E2E 4: preservação de dados antigos (localStorage de v1.2.2 → v2.0.0, com backup lógico e migração idempotente) e layout em celular/tablet.
const fs = require('fs'), path = require('path'); const L = require('./lib'), P = require('./play');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const FIX = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'legacy-seeds.json'), 'utf8'));
const row = re => FIX.rows.find(r => r.ok && re.test(r.seed));
(async () => {
  const S = L.suite('E2E migração e mobile');
  // ---------- dados antigos ----------
  const legacy = [row(/^CQ1-B1-T-25-XYZ789/), row(/^CQ1-B3-M-25-XYZ789/), row(/^CQ1-B5-H-25-XYZ789/)];
  const lib = legacy.map((r, i) => ({seed: r.seed, profile: r.seed.split('-')[2], count: 25, bank: r.seed.split('-')[1], createdAt: 1700000000000 + i, name: 'Minha antiga ' + (i + 1), favorite: i !== 1, best: 7 + i}));
  const store = {
    'classiquiz.v1.library': JSON.stringify(lib),
    'classiquiz.v1.achievements': JSON.stringify({unlocked: {fav10: 1700000001000}, stats: {correct: 321, favorites: 2}}),
    'classiquiz.v1.records': JSON.stringify({trails: {best: 33}, ultra: {}, totals: {}}),
    'classiquiz.v1.rewards': JSON.stringify({coins: 77, owned: {}, earned: 150}),
    'classiquiz.v1.preferences': JSON.stringify({sound: false, legadoDesconhecido: 'mantido'})
  };
  const t = await L.start({storage: store}); await L.boot(t); const p = t.page;
  const snap = () => p.evaluate(() => ({meta: JSON.parse(localStorage.getItem('classiquiz.v1.meta') || 'null'), backup: localStorage.getItem('classiquiz.v1.backup.pre-v2'), lib: JSON.parse(localStorage.getItem('classiquiz.v1.library') || '[]'), ach: JSON.parse(localStorage.getItem('classiquiz.v1.achievements') || 'null'), rec: JSON.parse(localStorage.getItem('classiquiz.v1.records') || 'null'), rew: JSON.parse(localStorage.getItem('classiquiz.v1.rewards') || 'null'), pref: JSON.parse(localStorage.getItem('classiquiz.v1.preferences') || 'null')}));
  const a = await snap();
  S.ok(a.meta && a.meta.schema === 2 && a.meta.app === '2.0.0', 'migração marca schema 2 / v2.0.0: ' + JSON.stringify(a.meta));
  S.ok(!!a.backup, 'backup lógico pré-v2 criado'); const bk = a.backup && JSON.parse(a.backup);
  S.ok(bk && bk.library.length === 3 && bk.library.map(x => x.seed).join() === legacy.map(r => r.seed).join(), 'backup guarda as 3 seeds antigas'); S.ok(bk && bk.achievements && bk.achievements.unlocked.fav10 === 1700000001000, 'backup guarda as conquistas antigas');
  S.ok(a.lib.length === 3 && a.lib.every((g, i) => g.seed === lib[i].seed && g.name === lib[i].name && g.favorite === lib[i].favorite && g.best === lib[i].best), 'Biblioteca antiga preservada (seeds, nomes, favoritas, recordes)');
  S.ok(a.ach.unlocked.fav10 === 1700000001000 && a.ach.stats.correct === 321 && a.ach.stats.favorites === 2, 'conquistas e estatísticas antigas preservadas');
  S.ok(a.rec.trails.best === 33 && a.rew.coins === 77 && a.rew.earned === 150, 'recordes e Fichas antigas preservados'); S.ok(a.pref.sound === false && a.pref.legadoDesconhecido === 'mantido', 'preferências antigas (inclusive chaves desconhecidas) preservadas');
  // idempotência: recarregar várias vezes não muda nada
  for (let i = 0; i < 3; i++) { await p.reload(); await L.boot(t); } const b = await snap();
  S.ok(b.backup === a.backup && b.meta.migratedAt === a.meta.migratedAt, 'migração idempotente: backup e carimbo não mudam ao recarregar 3×'); S.ok(JSON.stringify(b.lib) === JSON.stringify(a.lib) && JSON.stringify(b.rew) === JSON.stringify(a.rew) && JSON.stringify(b.rec) === JSON.stringify(a.rec), 'nenhum dado duplicado/alterado após recarregar');
  // seeds antigas geram exatamente as mesmas questões que a v1.2.2 original
  await p.evaluate(() => { CQ.os.open('library'); }); await p.waitForSelector('.cq-win[data-win="library"]'); await sleep(300);
  const txt = await p.locator('.cq-win[data-win="library"]').innerText(); S.ok(legacy.every(r => txt.includes(r.seed)) && /Minha antiga 1/.test(txt), 'Minhas Trilhas lista as seeds antigas'); await L.shot(t, 'minhas-trilhas-legado');
  for (const r of legacy) {
    await p.evaluate(() => { CQ.os.open('library'); }); await p.waitForSelector('.cq-win[data-win="library"]'); await sleep(250);
    await p.locator(`.cq-win[data-win="library"] [data-act="play-saved"][data-seed="${r.seed}"]`).click(); await sleep(900);
    for (let k = 0; k < 4 && await p.$('#modal-layer button'); k++) { await p.locator('#modal-layer button', {hasText: /Substituir|Continuar|Iniciar|Jogar|OK/}).first().click().catch(() => {}); await sleep(300); }
    const got = await p.evaluate(() => CQ.game.state.generation && CQ.game.state.generation.stages.slice(0, 8).map(s => s.id).join(','));
    S.ok(got === r.head, `seed antiga ${r.seed}: 8 primeiras etapas idênticas à v1.2.2 (${got === r.head ? 'ok' : got + ' ≠ ' + r.head})`);
  }
  S.ok(t.errs.length === 0, 'sem erros de console/rede (migração): ' + t.errs.join(' | ')); await t.close();

  // ---------- celular e tablet ----------
  for (const dev of [{n: 'celular 375×812', w: 375, h: 812, mobile: true, touch: true}, {n: 'celular pequeno 320×568', w: 320, h: 568, mobile: true, touch: true}, {n: 'tablet 768×1024', w: 768, h: 1024, mobile: true, touch: true}]) {
    const u = await L.start({viewport: {width: dev.w, height: dev.h}, mobile: dev.mobile, touch: dev.touch}); await L.boot(u); const q = u.page;
    const over = () => q.evaluate(() => ({sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, w: innerWidth, h: innerHeight, scale: CQ.os.scale()}));
    let o = await over(); S.ok(o.sw <= o.w + 1 && o.sh <= o.h + 1, `${dev.n}: área de trabalho sem rolagem da página (${o.sw}×${o.sh} em ${o.w}×${o.h}, escala ${o.scale})`); await L.shot(u, 'mobile-' + dev.w + '-desktop');
    const sc = await q.evaluate(() => [...document.querySelectorAll('.desktop-shortcut')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= innerHeight + 1; }).length); S.ok(sc >= 9, `${dev.n}: os 9 atalhos cabem na tela (${sc})`);
    const cut = await q.evaluate(() => [...document.querySelectorAll('.desktop-shortcut .sc-label')].filter(l => { const w = l.style.overflowWrap; l.style.overflowWrap = 'normal'; const bad = l.scrollWidth > l.clientWidth + 1; l.style.overflowWrap = w; return bad; }).map(l => l.textContent)); S.ok(cut.length === 0, `${dev.n}: nenhum rótulo de atalho é quebrado no meio da palavra ${JSON.stringify(cut)}`);
    await q.evaluate(() => { CQ.os.open('library'); }); await sleep(400); o = await over(); S.ok(o.sw <= o.w + 1, `${dev.n}: janela aberta sem rolagem horizontal da página`);
    const win = await q.evaluate(() => { const r = document.querySelector('.cq-win[data-win="library"]').getBoundingClientRect(); return {l: r.left, r: r.right, t: r.top, b: r.bottom, w: innerWidth, h: innerHeight}; }); S.ok(win.l >= -1 && win.r <= win.w + 1 && win.t >= -1, `${dev.n}: janela cabe na tela`);
    await q.evaluate(() => { CQ.os.wm.close('library'); });
    // iniciar uma Trilha e responder com toque
    await q.evaluate(() => { CQ.game.startCampaign(1); }); await q.waitForSelector('.cq-win[data-win="game"] .game-stage, .game-stage'); await sleep(500); o = await over(); S.ok(o.sw <= o.w + 1, `${dev.n}: tela de jogo sem rolagem horizontal`); await L.shot(u, 'mobile-' + dev.w + '-jogo');
    {
      let tapped = false; for (let g = 0; g < 12 && !tapped; g++) { const c = await P.cur(q); if (c.done) break; if (['standard', 'extended', 'story', 'show', 'memory'].includes(c.s.kind) && !c.solved) { await q.locator(`${P.G} [data-act="answer"][data-i="${c.s.answer}"]`).tap(); await sleep(400); tapped = (await P.cur(q)).solved; break; } if (!c.solved) await P.solveStage(q, c.s); await P.focusGame(q); await P.click(q, `${P.G} [data-act="advance"]`); }
      S.ok(tapped, `${dev.n}: toque (tap) em uma opção correta resolve a etapa`);
    }
    // limites de escala: 175% num celular não pode estourar a tela
    await q.evaluate(() => { CQ.sys.set('scale', 175); CQ.os.applyScale && CQ.os.applyScale(); window.dispatchEvent(new Event('resize')); }); await sleep(300); o = await over(); S.ok(o.sw <= o.w + 1 && o.sh <= o.h + 1 && o.scale <= Math.max(1, o.w / 300) + .01, `${dev.n}: escala 175% é limitada ao espaço disponível (aplicada ${o.scale.toFixed(2)})`);
    S.ok(u.errs.length === 0, `${dev.n}: sem erros de console/rede: ` + u.errs.join(' | ')); await u.close();
  }
  // ---------- teclado / foco / reduzir movimento ----------
  const k = await L.start(); await L.boot(k); const kp = k.page;
  await kp.keyboard.press('Tab'); await kp.keyboard.press('Tab'); const f = await kp.evaluate(() => document.activeElement && document.activeElement.tagName); S.ok(!!f && f !== 'BODY', 'navegação por Tab leva o foco a controles reais (' + f + ')');
  await kp.evaluate(() => { CQ.sys.set({reduceMotion: 'on'}); CQ.os.applyScale(); }); await kp.reload(); await L.boot(k); S.ok(await kp.evaluate(() => document.documentElement.dataset.motion === 'reduce'), 'movimento reduzido ligado persiste após recarregar (data-motion=reduce)');
  S.ok(k.errs.length === 0, 'sem erros de console/rede (teclado): ' + k.errs.join(' | ')); await k.close();
  process.exit(S.done([]));
})().catch(e => { console.error('FALHA', e); process.exit(1); });
