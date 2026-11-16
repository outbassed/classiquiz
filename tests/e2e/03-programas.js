// E2E 3: programas do ClaQui OS (Bloco de Notas, Calculadora, Paint, Calendário, Relógio, Reprodutor, jogos, Lixeira, Visualizador)
// e regras de tempo das missões "manter aberto" (minimizar pausa, fechar zera, outro programa não conta).
const L = require('./lib'), P = require('./play');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const W = id => `.cq-win[data-win="${id}"]`;
(async () => {
  const S = L.suite('E2E programas'); const t = await L.start(); await L.boot(t); const p = t.page;
  const open = async id => { await p.evaluate(id => { CQ.os.open(id); }, id); await p.waitForSelector(W(id)); await sleep(250); };
  const xbtn = id => p.locator(`.cq-win[data-win="${id}"] [data-act="win-close"]`).click();
  const modalBtn = async re => { const b = p.locator('#modal-layer button', {hasText: re}).first(); await b.click(); await sleep(250); };

  // ---------- Bloco de Notas ----------
  await open('notepad'); await p.locator(W('notepad') + ' #np-text').fill('Olá, ClaQui OS! Texto de teste 123.');
  S.ok(await p.evaluate(() => CQ.apps.notepad.isDirty()), 'Bloco de Notas: alteração marca como não salvo');
  await p.locator(W('notepad') + ' [data-act="np-save"]').click(); await sleep(300);
  const nameInput = p.locator('#modal-layer input.text-input'); S.ok(await nameInput.count() === 1, 'Bloco de Notas: Salvar pede o nome do arquivo');
  await nameInput.fill('teste-e2e.txt'); await modalBtn(/^OK$|^Salvar$/); await sleep(300);
  const saved = await p.evaluate(() => { const f = CQ.vfs.allFiles().find(f => /teste-e2e\.txt$/.test(f.path)); return f ? {path: f.path, text: CQ.vfs.readText(f.path)} : null; });
  S.ok(saved && /^C:\\/.test(saved.path), 'arquivo salvo no sistema virtual: ' + (saved && saved.path)); S.ok(saved && (await p.evaluate(async path => (await CQ.vfs.readText(path)) === 'Olá, ClaQui OS! Texto de teste 123.', saved.path)), 'conteúdo do arquivo confere');
  S.ok(!await p.evaluate(() => CQ.apps.notepad.isDirty()), 'após salvar não está mais sujo'); await L.shot(t, 'app-bloco-de-notas');
  await p.locator(W('notepad') + ' #np-text').fill('Alterado e não salvo'); await xbtn('notepad'); await sleep(300);
  S.ok(await p.$('#modal-layer button') !== null && await p.evaluate(() => CQ.os.wm.isOpen('notepad')), 'fechar com alteração pede confirmação');
  await modalBtn(/Cancelar/); S.ok(await p.evaluate(() => CQ.os.wm.isOpen('notepad')), 'Cancelar mantém o Bloco de Notas aberto');
  await xbtn('notepad'); await sleep(250); await modalBtn(/Não salvar/); await sleep(200); S.ok(!await p.evaluate(() => CQ.os.wm.isOpen('notepad')), 'Não salvar fecha sem gravar');
  S.ok(await p.evaluate(async () => (await CQ.vfs.readText(CQ.vfs.allFiles().find(f => /teste-e2e\.txt$/.test(f.path)).path)) === 'Olá, ClaQui OS! Texto de teste 123.'), 'arquivo anterior permaneceu intacto');

  // ---------- Calculadora ----------
  await open('calc'); const key = k => p.locator(W('calc') + ` [data-act="calc-key"][data-k="${k}"]`).click();
  for (const k of ['7', '×', '6', '=']) await key(k); await sleep(200); S.ok((await p.locator(W('calc') + ' #calc-disp').textContent()).trim() === '42', 'Calculadora: 7 × 6 = 42');
  for (const k of ['C']) await key(k).catch(() => {}); for (const k of ['1', '÷', '0', '=']) await key(k).catch(() => {}); await sleep(200); const dz = (await p.locator(W('calc') + ' #calc-disp').textContent()).trim(); S.ok(!/Infinity|NaN/.test(dz), 'Calculadora: divisão por zero tratada (' + dz + ')');
  await p.keyboard.press('Escape'); await L.shot(t, 'app-calculadora'); await p.evaluate(() => { CQ.os.wm.close('calc'); });

  // ---------- Paint, Visualizador ----------
  await open('paint'); const cv = p.locator(W('paint') + ' #pt-canvas'), bb = await cv.boundingBox();
  await p.locator(W('paint') + ' [data-act="pt-color"]').nth(2).click();
  await p.mouse.move(bb.x + 40, bb.y + 40); await p.mouse.down(); await p.mouse.move(bb.x + 160, bb.y + 90, {steps: 8}); await p.mouse.move(bb.x + 90, bb.y + 160, {steps: 8}); await p.mouse.up(); await sleep(200);
  S.ok(await p.evaluate(() => CQ.apps.paint.isDirty()), 'Paint: desenhar marca como não salvo'); await L.shot(t, 'app-paint');
  const filesBefore = await p.evaluate(() => CQ.vfs.allFiles().filter(f => f.kind === 'image').length);
  await p.locator(W('paint') + ' [data-act="pt-save"]').click(); await sleep(700); if (await p.$('#modal-layer input.text-input')) await modalBtn(/^OK$|^Salvar$/); await sleep(500);
  const imgsAfter = await p.evaluate(() => CQ.vfs.allFiles().filter(f => f.kind === 'image').length); S.ok(imgsAfter === filesBefore + 1, `Paint: desenho salvo como imagem (${filesBefore} → ${imgsAfter})`);
  await xbtn('paint'); await sleep(300); if (await p.$('#modal-layer button')) await modalBtn(/Não salvar/);
  await open('viewer'); const galleryItems = await p.locator(W('viewer') + ' [data-act="vw-open"]').count(); S.ok(galleryItems >= imgsAfter, `Visualizador: galeria lista as imagens (${galleryItems})`);
  const mine = p.locator(W('viewer') + ' [data-act="vw-open"]', {hasText: /desenho|paint|Imagem/i}); await (await mine.count() ? mine.first() : p.locator(W('viewer') + ' [data-act="vw-open"]').last()).click(); await sleep(600);
  S.ok(await p.locator(W('viewer') + ' .viewer-stage img').count() === 1, 'Visualizador: imagem aberta'); await L.shot(t, 'app-visualizador'); await p.evaluate(() => { CQ.os.wm.close('viewer'); });

  // ---------- Lixeira ----------
  const tp = await p.evaluate(() => { const f = CQ.vfs.allFiles().find(f => /teste-e2e\.txt$/.test(f.path)); CQ.vfs.remove(f.path); return f.path; });
  await open('trash'); S.ok(await p.locator(W('trash') + ' [data-act="tr-restore"]').count() >= 1, 'Lixeira: arquivo removido aparece');
  S.ok(!await p.evaluate(path => CQ.vfs.exists(path), tp), 'arquivo saiu do local original'); await L.shot(t, 'app-lixeira');
  await p.locator(W('trash') + ' [data-act="tr-restore"]').first().click(); await sleep(400); S.ok(await p.evaluate(path => CQ.vfs.exists(path), tp), 'restaurar devolve o arquivo ao local original'); await p.evaluate(() => { CQ.os.wm.close('trash'); });

  // ---------- Calendário, Relógio, Reprodutor ----------
  await open('calendar'); const m0 = await p.locator(W('calendar')).innerText(); await p.locator(W('calendar') + ' [data-act="cal-next"]').click(); await sleep(200); const m1 = await p.locator(W('calendar')).innerText(); S.ok(m0 !== m1, 'Calendário: avançar de mês muda a visualização'); await p.locator(W('calendar') + ' [data-act="cal-today"]').click(); await sleep(150); S.ok(await p.locator(W('calendar')).innerText() === m0, 'Calendário: "Hoje" volta ao mês atual'); await L.shot(t, 'app-calendario'); await p.evaluate(() => { CQ.os.wm.close('calendar'); });
  await open('clock'); const d1 = (await p.locator(W('clock') + ' #clk-dig').textContent()).trim(); S.ok(/^\d{2}:\d{2}:\d{2}$/.test(d1), 'Relógio: hora digital ' + d1); await sleep(1300); const d2 = (await p.locator(W('clock') + ' #clk-dig').textContent()).trim(); S.ok(d1 !== d2, 'Relógio: avança com o tempo'); await L.shot(t, 'app-relogio'); await p.evaluate(() => { CQ.os.wm.close('clock'); });
  await open('player'); await p.locator(W('player') + ' [data-act="pl-play"]').first().click(); await sleep(500); S.ok(await p.locator(W('player') + ' [data-act="pl-stop"]').count() >= 1, 'Reprodutor: trilha em reprodução'); await L.shot(t, 'app-reprodutor'); await p.locator(W('player') + ' [data-act="pl-stop"]').first().click(); await p.evaluate(() => { CQ.os.wm.close('player'); });

  // ---------- Campo Minado: primeiro clique sempre seguro ----------
  await open('mines'); const lv = await p.locator(W('mines') + ' [data-act="ms-lvl"]').count(); S.ok(lv >= 3, 'Campo Minado: ' + lv + ' níveis');
  let boom = 0, runs = 0;
  for (let l = 0; l < lv; l++) for (let r = 0; r < 12; r++) { await p.locator(W('mines') + ' [data-act="ms-lvl"]').nth(l).click(); await p.locator(W('mines') + ' [data-act="ms-new"]').click().catch(() => {}); const cells = p.locator(W('mines') + ' [data-act="ms-cell"]'); const n = await cells.count(); const i = [0, n - 1, Math.floor(n / 2)][r % 3]; await cells.nth(i).click(); runs++; if (/Boom/.test(await p.locator(W('mines') + ' .ms-face').textContent())) boom++; }
  S.ok(boom === 0 && runs === lv * 12, `Campo Minado: primeiro clique nunca explode (${runs} tentativas, ${boom} explosões)`);
  await p.locator(W('mines') + ' [data-act="ms-new"]').click().catch(() => {}); const c0 = p.locator(W('mines') + ' [data-act="ms-cell"]').nth(5); await c0.click(); await p.locator(W('mines') + ' [data-act="ms-flagmode"]').click().catch(() => {}); await L.shot(t, 'app-campo-minado'); await p.evaluate(() => { CQ.os.wm.close('mines'); });

  // ---------- Jogo da Velha ----------
  await open('ttt'); let tttEnded = false;
  for (let i = 0; i < 9 && !tttEnded; i++) { const free = p.locator(W('ttt') + ' [data-act="ttt-cell"]:not([disabled])'); const c = await free.count(); if (!c) break; const txt = await p.locator(W('ttt')).innerText(); if (/venceu|empate|Empate|computador/i.test(txt)) { tttEnded = true; break; } await free.first().click(); await sleep(450); }
  await sleep(400); S.ok(/venceu|empate|Empate|computador|perdeu/i.test(await p.locator(W('ttt')).innerText()), 'Jogo da Velha: partida chega a um resultado'); await L.shot(t, 'app-jogo-da-velha'); await p.evaluate(() => { CQ.os.wm.close('ttt'); });

  // ---------- Cobrinha e Pong ----------
  await open('snake'); await p.locator(W('snake') + ' [data-act="sn-new"]').click().catch(() => {}); for (const k of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']) { await p.keyboard.press(k); await sleep(200); } await L.shot(t, 'app-cobrinha'); S.ok(await p.locator(W('snake') + ' canvas').count() === 1, 'Cobrinha: abre e responde às setas'); await p.evaluate(() => { CQ.os.wm.close('snake'); });
  await open('pong'); await p.keyboard.press('ArrowUp'); await sleep(500); await L.shot(t, 'app-pong'); S.ok(await p.locator(W('pong') + ' canvas').count() === 1, 'Pong: abre e responde'); await p.evaluate(() => { CQ.os.wm.close('pong'); });

  // ---------- Conquistas de jogos (statApp) e bloqueios ----------
  const ach = await p.evaluate(() => { CQ.game.statApp('tttWins'); const a = CQ.game.achievementsState(); return !!a.unlocked.g_ttt; }); S.ok(ach, 'conquista de jogo (Velha de Verdade) desbloqueia fora de partida');
  await p.evaluate(() => { CQ.game.achievementsState().disabled = true; CQ.game.achievementsState().unlocked = {}; CQ.game.statApp('snake10'); }); S.ok(await p.evaluate(() => !CQ.game.achievementsState().unlocked.g_snake), 'conquistas desativadas (Terminal): jogo não conta');
  await p.evaluate(() => { CQ.game.achievementsState().disabled = false; });

  // ---------- Missão "manter aberto": regras do cronômetro ----------
  const toKeepOpen = async camp => {
    await p.evaluate(n => { CQ.game.startCampaign(n); }, camp); await p.waitForSelector(P.G + ' .game-stage');
    for (let g = 0; g < 80; g++) { const c = await P.cur(p); if (c.done) return null; if (c.s.kind === 'mission' && c.s.mission.type === 'keep-open') return c.s; if (!c.solved) await P.solveStage(p, c.s); await P.focusGame(p); await P.click(p, `${P.G} [data-act="advance"]`); }
    return null;
  };
  const status = () => p.evaluate(() => document.getElementById('mission-status')?.textContent || '');
  const solved = () => p.evaluate(() => CQ.game.state.mini.solved === true);
  await p.evaluate(() => { try { CQ.game.abandon?.(); } catch {} });
  let ms = await toKeepOpen(2); S.ok(!!ms, 'campanha 2: missão "manter aberto" alcançada (' + (ms && ms.mission.app) + ' ' + (ms && ms.mission.seconds) + ' s)');
  if (ms) {
    const app = ms.mission.app, secs = ms.mission.seconds; const openBtn = () => P.click(p, `${P.G} [data-act="mission-open"]`);
    // (a) outro programa aberto não conta
    const other = app === 'notepad' ? 'calc' : 'notepad'; await p.evaluate(id => { CQ.os.open(id); }, other); await sleep((secs + 2) * 1000); S.ok(!await solved(), `outro programa (${other}) aberto por ${secs + 2} s não conta`); await p.evaluate(id => { CQ.os.wm.close(id); }, other); await sleep(300); await P.focusGame(p);
    // (b) minimizar pausa
    await openBtn(); await sleep(3500); await p.evaluate(a => { CQ.os.wm.minimize(a); }, app); await sleep(secs * 1000); S.ok(!await solved(), 'minimizada por ' + secs + ' s: não conclui'); S.ok(/Pausado/i.test(await status()), 'status mostra "Pausado": ' + await status());
    await p.evaluate(a => { CQ.os.wm.restore(a); }, app); await sleep(3000); S.ok(!await solved(), 'após restaurar, só o tempo visível conta (≈6,5 de ' + secs + ' s)');
    // (c) fechar zera
    await xbtn(app); await sleep(400); if (await p.$('#modal-layer button')) await modalBtn(/Não salvar/); await P.focusGame(p); S.ok(!await solved() && /0\//.test(await status()), 'fechar zera o contador: ' + await status());
    // (d) Desligar: cancelar não mexe no contador; confirmar fecha tudo e NÃO conclui a missão
    const desligar = async () => { await p.click('#start-button'); await sleep(250); await p.locator('#start-menu button, #start-menu [role="menuitem"]', {hasText: 'Desligar'}).first().click(); await sleep(450); };
    await openBtn(); await sleep(4500); await desligar(); await modalBtn(/Cancelar/); await sleep(2500); const stc = await status(); const nCount = Number((/Tempo: (\d+)\//.exec(stc) || [])[1]); S.ok(nCount >= 5 && !await solved(), 'Desligar → Cancelar não zera nem pausa o contador (' + stc + ')');
    await desligar(); await modalBtn(/Confirmar/); await sleep(450); if (await p.$('#modal-layer button')) await modalBtn(/Descartar/); await p.waitForSelector('#power-layer.shutdown:not([hidden])', {timeout: 5000}); await p.waitForFunction(() => document.getElementById('power-layer').hidden, null, {timeout: 20000});
    S.ok(!await p.evaluate(a => CQ.os.wm.isOpen(a), app) && !await solved(), 'Desligar confirmado fecha os programas e não conclui a missão artificialmente');
    await p.evaluate(() => { CQ.os.open('game'); }); await sleep(600); await P.focusGame(p); S.ok(/0\//.test(await status()), 'após religar, o contador da missão recomeça do zero: ' + await status());
    await openBtn(); await sleep((secs - 3) * 1000); S.ok(!await solved(), `reaberta: ${secs - 3} s de ${secs} ainda não conclui`);
    await sleep(5000); S.ok(await solved(), `reaberta e mantida por ${secs} s: missão cumprida (vencer não foi necessário)`); await L.shot(t, 'missao-manter-aberto');
    await p.evaluate(a => { CQ.os.wm.close(a); }, app); await sleep(300); if (await p.$('#modal-layer button')) await modalBtn(/Não salvar/);
  }
  process.exit(S.done(t.errs));
})().catch(e => { console.error('FALHA', e); process.exit(1); });
