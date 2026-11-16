// E2E 10: Terminal × conquistas × tentativa. O consentimento desativa conquistas; o reset reativa, mas a tentativa em que o Terminal foi usado
// continua inelegível (sem conquistas, recordes e Fichas) até uma nova tentativa limpa.
const L = require('./lib'), P = require('./play');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const S = L.suite('E2E Terminal e tentativa'); const t = await L.start(); await L.boot(t); const p = t.page;
  const st = () => p.evaluate(() => { const a = CQ.game.achievementsState(); return {locked: a.disabled, canEarn: CQ.game.canEarn(), correct: a.stats.correct || 0, qual: a.stats.qualifiedCorrect || 0, coins: CQ.game.rew().coins, unlocked: Object.keys(a.unlocked).length, dev: CQ.game.state.dev}; });
  await p.evaluate(() => { CQ.game.startNew(); }); await p.waitForSelector(P.G + ' .game-stage');
  // 1ª questão (ou etapa) jogada limpa: conta
  let c = await P.cur(p); if (!c.solved) await P.solveStage(p, c.s); await P.focusGame(p); let s0 = await st(); S.ok(s0.canEarn && !s0.locked && s0.coins > 0, `tentativa limpa: elegível e ganhou Fichas (${s0.coins})`);
  await P.click(p, `${P.G} [data-act="advance"]`);
  // abre o Terminal pelo Start, aceita o UAC e usa SOLVE
  await p.click('#start-button'); await sleep(250); await p.locator('#start-menu button, #start-menu [role="menuitem"]', {hasText: 'Terminal'}).first().click(); await sleep(400); await p.locator('#modal-layer button', {hasText: /^Sim$/}).click(); await sleep(600);
  await p.locator('.cq-win[data-win="dev"] #term-cmd').fill('SOLVE'); await p.keyboard.press('Enter'); await sleep(500);
  let s1 = await st(); S.ok(s1.locked && !s1.canEarn && s1.dev, 'Terminal usado: conquistas desativadas e tentativa marcada como de teste ' + JSON.stringify(s1));
  const coins1 = s1.coins; await p.evaluate(() => { CQ.os.wm.close('dev'); }); await sleep(300); await P.focusGame(p); c = await P.cur(p); S.ok(c.solved, 'SOLVE resolveu a etapa atual'); await P.click(p, `${P.G} [data-act="advance"]`);
  c = await P.cur(p); if (!c.solved) await P.solveStage(p, c.s); await sleep(200); let s2 = await st(); S.ok(s2.coins === coins1 && s2.unlocked === s1.unlocked && s2.qual === s1.qual, 'acertos na tentativa de teste não dão Fichas, conquistas nem acertos qualificados ' + JSON.stringify([s1, s2]));
  // resetar conquistas (Configurações) → reativa, mas a tentativa atual continua inelegível
  await p.evaluate(() => { CQ.os.open('settings', {tab: 'conquistas'}); }); await p.waitForSelector('.cq-win[data-win="settings"]'); await sleep(300); await p.locator('.cq-win[data-win="settings"] [data-act="reset-ach"]').click(); await sleep(300); await p.locator('#modal-layer button', {hasText: /Resetar|Confirmar|Sim|Apagar/}).first().click(); await sleep(500);
  let s3 = await st(); S.ok(!s3.locked && s3.unlocked === 0, 'reset reativa as conquistas e zera as desbloqueadas'); S.ok(!s3.canEarn && s3.dev, 'a tentativa em que o Terminal foi usado continua inelegível após o reset');
  await p.evaluate(() => { CQ.os.wm.close('settings'); }); await P.focusGame(p); await P.click(p, `${P.G} [data-act="advance"]`).catch(() => {}); c = await P.cur(p); if (!c.solved && !c.done) await P.solveStage(p, c.s); await sleep(200); let s4 = await st(); S.ok(s4.coins === coins1 && s4.unlocked === 0, 'continuar a mesma tentativa após o reset ainda não rende conquistas/Fichas');
  // nova tentativa limpa → volta a valer
  await p.evaluate(() => { CQ.game.startNew(); }); await sleep(500); if (await p.$('#modal-layer button')) await p.locator('#modal-layer button', {hasText: /Substituir/}).click(); await sleep(700); await p.waitForSelector(P.G + ' .game-stage');
  let s5 = await st(); S.ok(s5.canEarn && !s5.dev && !s5.locked, 'nova tentativa limpa volta a ser elegível'); c = await P.cur(p); if (!c.solved) await P.solveStage(p, c.s); await sleep(200); const s6 = await st(); S.ok(s6.coins > s5.coins && s6.correct > s5.correct, `nova tentativa limpa volta a render Fichas (${s5.coins} → ${s6.coins}) e estatísticas`);
  // o Terminal fica fora de qualquer puzzle/missão: não há atalho para ele no jogo nem na área de trabalho
  S.ok(await p.evaluate(() => !document.querySelector('.desktop-shortcut[data-app="dev"], #game [data-app="dev"]')), 'não há atalho do Terminal na área de trabalho nem dentro das etapas');
  S.ok(t.errs.length === 0, 'sem erros de console/rede: ' + t.errs.join(' | ')); await t.close(); process.exit(S.done([]));
})().catch(e => { console.error('FALHA', e); process.exit(1); });
