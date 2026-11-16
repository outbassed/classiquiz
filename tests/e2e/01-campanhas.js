// E2E 1: joga as três Campanhas inteiras pela interface real (cliques, arrastar, teclado) em Chrome, incluindo missões, Show do Milhozão e histórias.
const L = require('./lib'), P = require('./play');
(async () => {
  const S = L.suite('E2E campanhas'); 
  for (const n of [1, 2, 3]) {
    const t = await L.start(); await L.boot(t); const p = t.page;
    await p.evaluate(n => { CQ.game.startCampaign(n); }, n); await p.waitForSelector(P.G + ' .game-stage');
    const t0 = Date.now(); const r = await P.playAll(p, {});
    S.ok(r.done && !r.lost && !r.stuck, `campanha ${n}: concluída (${r.errors.join('; ')})`);
    S.ok(r.played === 49, `campanha ${n}: 49 etapas jogáveis (50 posições, 1 pulada) — jogou ${r.played}`);
    S.ok((r.kinds.show || 0) === 10 && (r.kinds.mission || 0) === 2 && (r.kinds.story || 0) >= 4, `campanha ${n}: Show 10, missões 2, história >= 4 — ${JSON.stringify(r.kinds)}`);
    const st = await p.evaluate(() => { const a = CQ.game.achievementsState(); return {unlocked: Object.keys(a.unlocked), disabled: a.disabled, rec: JSON.parse(localStorage.getItem('classiquiz.v1.records') || 'null')}; });
    S.ok(st.unlocked.includes('milhonario'), `campanha ${n}: conquista Milhonário desbloqueada (sem erro em nenhuma das 10 rodadas)`);
    S.ok(st.unlocked.includes('mission1'), `campanha ${n}: conquista de missão`);
    await L.shot(t, `campanha-${n}-concluida`); console.log(`campanha ${n}: ${Math.round((Date.now() - t0) / 1000)} s`);
    await t.close(); S.ok(t.errs.length === 0, `campanha ${n}: sem erros de console/rede: ${t.errs.join(' | ')}`);
  }
  process.exit(S.done([]));
})().catch(e => { console.error('FALHA', e); process.exit(1); });
