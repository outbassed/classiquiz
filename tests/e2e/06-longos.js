// E2E 6 (longo, ~10–20 min): Ultra COMPLETO com 1 coração e Trilha Aleatória B6 de 400 posições, jogados pela interface real do Chrome.
// Uso: node 06-longos.js ultra | node 06-longos.js t400
const L = require('./lib'), P = require('./play');
(async () => {
  const which = process.argv[2] || 'ultra'; const S = L.suite('E2E longo: ' + which); const t = await L.start(); await L.boot(t); const p = t.page; const t0 = Date.now();
  if (which === 'ultra') {
    await p.evaluate(() => { CQ.game.startUltra(1); }); await p.waitForSelector(P.G + ' .game-stage');
    const n = await p.evaluate(() => CQ.game.state.generation.count); const r = await P.playAll(p, {maxStages: 5000});
    S.ok(r.done && !r.lost && !r.stuck, `Ultra (1 coração, ${n} posições) concluído pela interface (${r.errors.join('; ')}) — jogou ${r.played}, tipos ${JSON.stringify(r.kinds)}`);
    const a = await p.evaluate(() => ({u: Object.keys(CQ.game.achievementsState().unlocked).filter(k => k.startsWith('u')), best: CQ.game.achievementsState().stats.ultraBest, wins: CQ.game.achievementsState().stats.ultraWins, rec: JSON.parse(localStorage.getItem('classiquiz.v1.records')).ultra}));
    for (const id of ['u25', 'u50', 'u100', 'u150', 'u200', 'u300', 'u90', 'u100p']) S.ok(a.u.includes(id), 'conquista do Ultra: ' + id); S.ok(a.wins >= 1, 'vitórias do Ultra registradas: ' + a.wins); S.ok(Object.keys(a.rec).length === 1, 'recorde do Ultra salvo: ' + JSON.stringify(a.rec)); await L.shot(t, 'ultra-concluido');
  } else {
    await p.evaluate(() => { CQ.game.state.selectedCount = 400; CQ.game.startNew(); }); await p.waitForSelector(P.G + ' .game-stage');
    const g = await p.evaluate(() => ({seed: CQ.game.state.generation.seed, n: CQ.game.state.generation.count})); S.ok(g.n === 400 && /^CQ1-B6-M-400-/.test(g.seed), 'Trilha Aleatória B6 de 400: ' + g.seed);
    const r = await P.playAll(p, {maxStages: 5000}); S.ok(r.done && !r.lost && !r.stuck, `Trilha de 400 concluída pela interface (${r.errors.join('; ')}) — jogou ${r.played}, tipos ${JSON.stringify(r.kinds)}`); await L.shot(t, 'trilha-400-concluida');
  }
  console.log('tempo: ' + Math.round((Date.now() - t0) / 1000) + ' s'); S.ok(t.errs.length === 0, 'sem erros de console/rede: ' + t.errs.slice(0, 5).join(' | ')); await t.close(); process.exit(S.done([]));
})().catch(e => { console.error('FALHA', e); process.exit(1); });
