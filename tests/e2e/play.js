// Solver de etapas do ClassiQuiz pela interface real (cliques, teclado, arrastar) — usado nos testes E2E.
const G = '.cq-win[data-win="game"]';
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function focusGame(page) { await page.evaluate(() => { const W = CQ.os.wm; if (W.get('game')?.minimized) W.restore('game'); W.focus('game'); }); await sleep(60); }
async function click(page, sel, opts) { await page.locator(sel).first().click({timeout: 6000, ...(opts || {})}); }
async function clickModal(page, label) { const b = page.locator('#modal-layer button', {hasText: label}).first(); await b.click({timeout: 5000}); await sleep(120); }
async function cur(page) { return page.evaluate(() => { const S = CQ.game.state, s = CQ.game.cur(); return {phase: S.phase, done: S.done, lost: S.lost, solved: !!S.mini.solved, lives: S.lives, s: s ? JSON.parse(JSON.stringify(s)) : null, mini: S.mini}; }); }

async function solveChoice(page, s) { await click(page, `${G} [data-act="answer"][data-i="${s.answer}"]`); }

async function solveTrick(page, s) {
  const m = s.mode;
  if (['click-red', 'click-dot', 'click-word', 'word-target', 'fourth-word'].includes(m)) return click(page, `${G} .question-word-button`);
  if (m === 'click-number') return click(page, `${G} .phase-number.as-target`);
  if (['drag-cover', 'drag-window'].includes(m)) {
    const b = await page.locator(`${G} [data-drag]`).boundingBox(); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.mouse.move(b.x + b.width / 2 + 40, b.y + b.height / 2 + 10, {steps: 4}); await page.mouse.move(b.x + b.width / 2 + 100, b.y + b.height / 2 + 20, {steps: 6}); await page.mouse.up(); await sleep(150);
    return click(page, `${G} [data-act="drag-ans"][data-value="42"]`);
  }
  if (m === 'double-tap') return page.locator(`${G} [data-act="double-tap"]`).dblclick();
  if (m === 'hover' || m === 'hover-target') { const b = await page.locator(`${G} [data-mouse-target]`).boundingBox(); await page.mouse.move(5, 5); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, {steps: 5}); return; }
  if (m.startsWith('right-click')) return page.locator(`${G} [data-mouse-target]`).click({button: 'right'});
  if (m === 'hold-universal') { const b = await page.locator(`${G} [data-universal-hold]`).boundingBox(); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await sleep(1150); await page.mouse.up(); return; }
  if (['confirm-no', 'blank-button', 'fake-popup', 'save-trap', 'color-words', 'big-button'].includes(m)) return click(page, `${G} [data-act="trick-win"]`);
  if (m === 'count-hearts') { const n = await page.evaluate(() => { const S = CQ.game.state; return CQ.game.maxLives(S.phase); }); return click(page, `${G} [data-act="trick-count"][data-value="${n}"]`); }
  if (m === 'title-close') return click(page, `${G} [data-act="win-close"]`);
  if (m === 'title-minimize') { await click(page, `${G} [data-act="win-min"]`); await sleep(200); return; }
  if (m === 'title-maximize') return click(page, `${G} [data-act="win-max"]`);
  if (m === 'logo-symbol') return click(page, '[data-act="icon-logo"]');
  if (m === 'taskbar-start') return click(page, '#start-button');
  if (m === 'version-click') return click(page, '[data-act="version-click"]');
  if (m === 'context-properties') { const b = await page.locator(`${G} .game-stage`).boundingBox(); await page.mouse.click(b.x + 30, b.y + 30, {button: 'right'}); await sleep(150); await page.locator('#cq-context [role="menuitem"]', {hasText: 'Propriedades'}).first().click(); return; }
  if (m === 'touch-hold') throw Error('touch-hold exige toque');
  throw Error('modo de pegadinha não coberto: ' + m);
}
async function solveMini(page, s) {
  const mi = (await cur(page)).mini, m = s.mode;
  if (m === 'order' || m === 'path') { const n = mi.sequence.length; for (let v = 1; v <= n; v++) await click(page, `${G} [data-act="mini-step"][data-value="${v}"]`); return; }
  if (m === 'find' || m === 'bug') return click(page, `${G} [data-act="mini-find"][data-i="${mi.target}"]`);
  if (m === 'count') return click(page, `${G} [data-act="mini-count"][data-value="${mi.count}"]`);
  if (m === 'pairs') { const by = {}; mi.cards.forEach((c, i) => (by[c] ||= []).push(i)); for (const k of Object.keys(by)) { for (const i of by[k]) { await click(page, `${G} [data-act="mini-pair"][data-i="${i}"]`); await sleep(60); } await sleep(250); } return; }
  if (m === 'color') { for (let i = 0; i < mi.colors.length; i++) if (mi.colors[i] === 'green') await click(page, `${G} [data-act="mini-color"][data-i="${i}"]`); return; }
  if (m === 'arrows') { await click(page, `${G} [data-act="mini-hide"]`); for (const n of mi.sequence) await click(page, `${G} [data-act="mini-arrow"][data-value="${n}"]`); return; }
  if (m === 'maze') { for (const d of ['right', 'right', 'right', 'down', 'down', 'down']) await click(page, `${G} [data-act="mini-move"][data-value="${d}"]`); return; }
  if (m === 'target') { for (let k = 0; k < 8; k++) { const c = await cur(page); if (c.solved) return; await click(page, `${G} [data-act="mini-target"][data-i="${c.mini.target}"]`); await sleep(80); } return; }
  if (m === 'lights') {
    const lights = mi.lights, n = lights.length; let sol = null;
    for (let mask = 0; mask < 1 << n && sol === null; mask++) { const l = lights.slice(); for (let i = 0; i < n; i++) if (mask >> i & 1) for (const k of [i - 1, i, i + 1]) if (k >= 0 && k < n) l[k] = !l[k]; if (l.every(x => !x)) sol = mask; }
    for (let i = 0; i < n; i++) if (sol >> i & 1) await click(page, `${G} [data-act="mini-light"][data-i="${i}"]`); return;
  }
  if (m === 'reaction') { for (let k = 0; k < 60; k++) { const ready = await page.evaluate(() => Date.now() >= CQ.game.state.mini.readyAt); if (ready) break; await sleep(100); } await sleep(150); return click(page, `${G} [data-act="mini-reaction"]`); }
  if (m === 'wait20') { await page.waitForFunction(() => !document.querySelector('[data-act="mini-wait-done"]')?.disabled, null, {timeout: 30000}); return click(page, `${G} [data-act="mini-wait-done"]`); }
  // click60: a partir do 22º clique surge a isca "Finalizar agora" no centro do quadrado; o solver clica no canto do quadrado.
  if (m === 'click60') { for (let i = 0; i < 60; i++) await page.locator(`${G} [data-act="mini-click60"]`).click({position: {x: 10, y: 10}});; return; }
  throw Error('minigame não coberto: ' + m);
}
// ----- missões -----
async function closeApp(page, id) { await page.evaluate(id => { CQ.os.wm.close(id); }, id); await sleep(250); if (await page.$('#modal-layer [role="dialog"], #modal-layer .modal-card')) { const b = page.locator('#modal-layer button', {hasText: /Não salvar|Cancelar|OK/}).first(); await b.click().catch(() => {}); await sleep(150); } }
async function solveMission(page, s) {
  const m = s.mission; await click(page, `${G} [data-act="mission-open"]`); await sleep(500);
  const W = id => `.cq-win[data-win="${id}"]`;
  if (m.type === 'notepad-text') {
    await page.locator(`${W('notepad')} #np-text`).fill(m.phrase); await page.locator(`${W('notepad')} [data-act="np-save"]`).click(); await sleep(250);
    const name = 'missao-' + Date.now() % 100000 + '.txt'; const inp = page.locator('#modal-layer input.text-input'); if (await inp.count()) { await inp.fill(name); await clickModal(page, 'OK'); }
    await sleep(500); await closeApp(page, 'notepad');
  } else if (m.type === 'calc-result') {
    const T = String(m.target); const expr = {144: ['1', '2', '×', '1', '2'], 625: ['2', '5', '0', '+', '3', '7', '5'], 125: ['1', '0', '0', '0', '÷', '8']}[m.target];
    for (const k of expr) await page.locator(`${W('calc')} [data-act="calc-key"][data-k="${k}"]`).click(); await page.locator(`${W('calc')} [data-act="calc-key"][data-k="="]`).click(); await sleep(400); await closeApp(page, 'calc');
  } else if (m.type === 'paint-fill') {
    await page.locator(`${W('paint')} [data-act="pt-tool"][data-tool="fill"]`).click(); await page.locator(`${W('paint')} [data-act="pt-color"][data-color="${m.color}"]`).click(); await sleep(150);
    const cv = page.locator(`${W('paint')} #pt-canvas`), b = await cv.boundingBox(); await page.mouse.click(b.x + b.width * m.region.cx, b.y + b.height * m.region.cy); await sleep(500); await closeApp(page, 'paint');
  } else if (m.type === 'keep-open') {
    await sleep((m.seconds + 1.5) * 1000); await page.evaluate(id => { CQ.os.wm.close(id); }, m.app); await sleep(300);
  } else if (m.type === 'explorer-open') {
    const BS = String.fromCharCode(92), base = ['C:', 'ClaQui', 'Arquivos de jogo', 'Casos', m.puzzle.folder].join(BS), rel = m.path.slice(base.length + 1).split(BS);
    if (m.puzzle.files.some(f => f.hidden)) { await page.locator(W('explorer') + ' [data-act="ex-menu"][data-menu="exibir"]').click(); await sleep(100); await page.locator(W('explorer') + ' [data-act="ex-hidden"]').click(); await sleep(200); }
    let acc = base; for (const part of rel) { acc += BS + part; await page.locator(W('explorer') + ' .ex-item[data-path="' + acc.split(BS).join(BS + BS) + '"]').dblclick(); await sleep(350); }
    await sleep(400); await closeApp(page, 'explorer'); await closeApp(page, 'notepad');
  } else if (m.type === 'trash-restore') {
    const id = await page.evaluate(n => CQ.vfs.trashList().find(t => t.name === n).id, m.name);
    await page.locator(`${W('trash')} [data-act="tr-restore"][data-id="${id}"]`).click(); await sleep(400); await closeApp(page, 'trash');
  } else if (m.type === 'viewer-answer') {
    await sleep(500); await focusGame(page); await page.locator(`${G} #mission-answer`).fill(m.answer); await click(page, `${G} [data-act="mission-submit"]`); await sleep(200); await closeApp(page, 'viewer');
  }
  await focusGame(page);
}
async function solveStage(page, s) {
  await focusGame(page);
  if (['standard', 'extended', 'story', 'show', 'memory', 'skip-memory'].includes(s.kind)) return solveChoice(page, s);
  if (s.kind === 'trick') return solveTrick(page, s);
  if (s.kind === 'mini') return solveMini(page, s);
  if (s.kind === 'mission') return solveMission(page, s);
  throw Error('tipo de etapa não coberto: ' + s.kind);
}
// joga até o fim; retorna {played, kinds, errors}
async function playAll(page, {log = () => {}, maxStages = 2000, skipKinds = [], onStage} = {}) {
  const kinds = {}, errors = []; let played = 0;
  for (let guard = 0; guard < maxStages; guard++) {
    const c = await cur(page); if (c.done || c.lost) return {played, kinds, errors, done: c.done, lost: c.lost};
    const s = c.s; kinds[s.kind] = (kinds[s.kind] || 0) + 1; if (onStage) await onStage(c);
    try {
      if (!c.solved) { if (skipKinds.includes(s.kind)) throw Error('pulada pelo teste: ' + s.kind); await solveStage(page, s); await sleep(60); }
      const after = await cur(page); if (after.lost) { errors.push(`etapa ${c.phase + 1} (${s.kind}/${s.mode || ''} ${s.id}): perdeu vida`); return {played, kinds, errors, done: false, lost: true}; }
      if (s.mode === 'wait20' && (after.done || after.phase > c.phase)) { played++; continue; }   // "Aguarde 20 s": o próprio botão já avança (comportamento original da v1.2.2)
      if (!after.solved) throw Error('não foi marcada como resolvida');
      await focusGame(page); await click(page, `${G} [data-act="advance"]`); played++;
    } catch (e) { errors.push(`etapa ${c.phase + 1} (${s.kind}/${s.mode || ''} ${s.id}): ${e.message.split('\n')[0]}`); return {played, kinds, errors, done: false, lost: false, stuck: true}; }
  }
  return {played, kinds, errors};
}
module.exports = {G, sleep, focusGame, click, clickModal, cur, solveStage, playAll, closeApp};
