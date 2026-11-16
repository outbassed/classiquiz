/* ClaQui OS — jogos simples de Mais opções: Campo Minado, Jogo da Velha, Cobrinha e Pong. Licença: MIT.
   Pendente declarado: Paciência (não implementada; nenhum ícone falso foi criado). */
(() => {
'use strict';
const CQ = window.CQ, E = CQ.E, OS = CQ.os, WM = OS.wm, A = CQ.apps, G = CQ.game ? window.CQ_GEN : window.CQ_GEN;
const statApp = k => CQ.game?.statApp?.(k);
const reduced = () => OS.reducedMotion();

// =============== Campo Minado ===============
const LEVELS = {facil: {name: 'Fácil', w: 8, h: 8, m: 9}, medio: {name: 'Médio', w: 10, h: 10, m: 16}, dificil: {name: 'Difícil', w: 12, h: 12, m: 28}};
const ms = {lvl: 'facil', b: null, flagMode: false, timer: 0, t0: 0, secs: 0, over: false, won: false, started: false};
const nb = (L, i) => { const x = i % L.w, y = Math.floor(i / L.w), out = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < L.w && Y < L.h) out.push(Y * L.w + X); } return out; };
// Solucionador lógico simples (regra do número + subconjuntos). Usado para evitar tabuleiros que exijam chute.
function solvable(L, mines, first) {
  const n = L.w * L.h, cnt = Array(n).fill(0); for (const m of mines) for (const q of nb(L, m)) cnt[q]++;
  const known = new Array(n).fill(0); /* 0=?,1=aberta,2=mina */ const open = i => { const st = [i]; while (st.length) { const c = st.pop(); if (known[c]) continue; known[c] = 1; if (cnt[c] === 0) for (const q of nb(L, c)) if (!known[q] && !mines.has(q)) st.push(q); } };
  open(first); let prog = true;
  while (prog) {
    prog = false; const cons = [];
    for (let i = 0; i < n; i++) if (known[i] === 1 && cnt[i] > 0) { const un = nb(L, i).filter(q => known[q] !== 1), fl = un.filter(q => known[q] === 2).length, rem = cnt[i] - fl, free = un.filter(q => known[q] === 0); if (free.length) cons.push({free, rem}); }
    for (const c of cons) { if (c.rem === 0) { for (const q of c.free) if (!known[q]) { open(q); prog = true; } } else if (c.rem === c.free.length) { for (const q of c.free) if (known[q] === 0) { known[q] = 2; prog = true; } } }
    if (!prog) for (const a of cons) for (const b of cons) { if (a === b || a.free.length >= b.free.length) continue; if (!a.free.every(q => b.free.includes(q))) continue; const diff = b.free.filter(q => !a.free.includes(q)), dr = b.rem - a.rem; if (dr === 0) { for (const q of diff) if (known[q] === 0) { open(q); prog = true; } } else if (dr === diff.length) { for (const q of diff) if (known[q] === 0) { known[q] = 2; prog = true; } } }
  }
  for (let i = 0; i < n; i++) if (!mines.has(i) && known[i] !== 1) return false; return true;
}
function msBuild(first) {
  const L = LEVELS[ms.lvl], n = L.w * L.h; const safe = new Set([first, ...nb(L, first)]); let best = null;
  for (let tries = 0; tries < 60; tries++) {
    const rng = G.rngFrom(`ms-${ms.lvl}-${Date.now()}-${tries}-${Math.random()}`), cells = G.shuffle(Array.from({length: n}, (_, i) => i).filter(i => !safe.has(i)), rng), mines = new Set(cells.slice(0, L.m)); best = mines;
    if (solvable(L, mines, first)) break;
  }
  const cnt = Array(n).fill(0); for (const m of best) for (const q of nb(L, m)) cnt[q]++;
  ms.b = {mines: best, cnt, st: new Array(n).fill(0) /* 0 fechada 1 aberta 2 bandeira */, left: L.m};
}
function msReveal(i) {
  const L = LEVELS[ms.lvl], b = ms.b; if (b.st[i] !== 0) return; const stack = [i];
  while (stack.length) { const c = stack.pop(); if (b.st[c] !== 0) continue; b.st[c] = 1; if (b.cnt[c] === 0 && !b.mines.has(c)) for (const q of nb(L, c)) if (b.st[q] === 0) stack.push(q); }
}
function msClick(w, i, flag) {
  if (ms.over) return; const L = LEVELS[ms.lvl];
  if (!ms.b) { if (flag) return; msBuild(i); ms.started = true; ms.t0 = CQ.mono(); startMsTimer(w); }
  const b = ms.b;
  if (flag) { if (b.st[i] === 0) { b.st[i] = 2; b.left--; } else if (b.st[i] === 2) { b.st[i] = 0; b.left++; } }
  else if (b.st[i] === 0) { if (b.mines.has(i)) { ms.over = true; b.hit = i; for (const m of b.mines) if (b.st[m] !== 2) b.st[m] = 1; clearInterval(ms.timer); CQ.tone(180, 200); } else { msReveal(i); const closed = b.st.filter((s, k) => s !== 1 && !b.mines.has(k)).length; if (!closed) { ms.over = true; ms.won = true; clearInterval(ms.timer); CQ.tone(720, 140); statApp('minesWins'); } } }
  else if (b.st[i] === 1 && b.cnt[i] > 0) { const ns = nb(L, i), fl = ns.filter(q => b.st[q] === 2).length; if (fl === b.cnt[i]) for (const q of ns) if (b.st[q] === 0) msClick(w, q, false); }
  msDraw(w);
}
function startMsTimer(w) { clearInterval(ms.timer); ms.timer = setInterval(() => { if (ms.over || !ms.started) return; ms.secs = Math.floor((CQ.mono() - ms.t0) / 1000); const t = w.body.querySelector('#ms-time'); if (t) t.textContent = ms.secs; }, 500); }
function msDraw(w) {
  const L = LEVELS[ms.lvl], b = ms.b; const cells = [];
  for (let i = 0; i < L.w * L.h; i++) { const s = b ? b.st[i] : 0; let txt = '', cls = 'mc'; if (s === 1) { cls += ' open'; if (b.mines.has(i)) { txt = '✹'; cls += i === b.hit ? ' boom' : ' mine'; } else if (b.cnt[i]) { txt = b.cnt[i]; cls += ' n' + b.cnt[i]; } } else if (s === 2) { txt = '⚑'; cls += ' flag'; }
    cells.push(`<button type="button" class="${cls}" data-act="ms-cell" data-i="${i}" aria-label="Casa ${i % L.w + 1},${Math.floor(i / L.w) + 1}${s === 2 ? ', bandeira' : s === 0 ? ', fechada' : txt ? ', ' + txt : ', vazia'}" ${ms.over && s !== 2 ? 'disabled' : ''}>${txt}</button>`); }
  w.body.innerHTML = `<div class="mines"><div class="ms-bar"><span>Minas: <b id="ms-left">${b ? b.left : L.m}</b></span><span class="ms-face" role="status">${ms.over ? (ms.won ? 'Vitória!' : 'Boom!') : 'Jogando'}</span><span>Tempo: <b id="ms-time">${ms.secs}</b></span></div><div class="ms-opts">${Object.entries(LEVELS).map(([k, v]) => `<button type="button" class="chrome-button tiny ${ms.lvl === k ? 'primary' : ''}" data-act="ms-lvl" data-lvl="${k}" aria-pressed="${ms.lvl === k}">${v.name}</button>`).join('')}<button type="button" class="chrome-button tiny ${ms.flagMode ? 'primary' : ''}" data-act="ms-flagmode" aria-pressed="${ms.flagMode}">Bandeira</button><button type="button" class="chrome-button tiny" data-act="ms-new">Novo jogo</button></div><div class="ms-grid" style="grid-template-columns:repeat(${L.w},1fr);--n:${L.w}" role="grid">${cells.join('')}</div><p class="muted">Clique abre • botão direito ou toque longo (ou modo Bandeira) marca • tabuleiros sem chute obrigatório quando possível.</p></div>`;
  w.setTitle('Campo Minado'); w.setStatus(ms.over ? (ms.won ? 'Você venceu!' : 'Você atingiu uma mina.') : 'Primeiro clique é sempre seguro.', LEVELS[ms.lvl].name);
}
function msReset(w) { clearInterval(ms.timer); Object.assign(ms, {b: null, over: false, won: false, started: false, secs: 0}); msDraw(w); }
A.mines = {title: 'Campo Minado', icon: 'assets/icons/campo-minado.svg', bodyClass: 'page', maxDefault: false, w: 560, h: 680, persistent: true,
  render(w) {
    if (!w._bound) { w._bound = true; let lp = null;
      w.body.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; if (lp?.fired) { lp = null; return; } const a = b.dataset.act;
        if (a === 'ms-cell') msClick(w, Number(b.dataset.i), ms.flagMode); else if (a === 'ms-lvl') { ms.lvl = b.dataset.lvl; msReset(w); } else if (a === 'ms-flagmode') { ms.flagMode = !ms.flagMode; msDraw(w); } else if (a === 'ms-new') msReset(w); });
      w.body.addEventListener('contextmenu', e => { const c = e.target.closest('.mc'); if (c) { if (e.ctrlKey) return; e.preventDefault(); msClick(w, Number(c.dataset.i), true); } });
      w.body.addEventListener('pointerdown', e => { const c = e.target.closest('.mc'); if (!c || e.pointerType !== 'touch') return; lp = {fired: false, id: e.pointerId, t: setTimeout(() => { lp.fired = true; msClick(w, Number(c.dataset.i), true); try { navigator.vibrate?.(12); } catch {} }, 450)}; });
      for (const ev of ['pointerup', 'pointercancel', 'pointermove']) w.body.addEventListener(ev, e => { if (lp && e.pointerId === lp.id && (ev !== 'pointermove' || false)) { clearTimeout(lp.t); if (ev === 'pointercancel') lp = null; else setTimeout(() => { lp = null; }, 50); } });
    }
    msDraw(w); if (ms.started && !ms.over) startMsTimer(w);
  },
  onHide() { /* o relógio do jogo continua sendo medido pelo tempo monotônico; não afeta missões */ },
  onClose() { clearInterval(ms.timer); Object.assign(ms, {b: null, over: false, won: false, started: false, secs: 0}); }
};

// =============== Jogo da Velha ===============
const TTT = window.CQ_TTT;
const TTT_KEY = 'classiquiz.v1.ttt';
function tttReadScore() {
  const saved = CQ.store.read(TTT_KEY, null);
  const get = k => Number.isSafeInteger(saved?.[k]) && saved[k] >= 0 ? saved[k] : 0;
  if (saved && typeof saved === 'object') return {x: get('x'), o: get('o'), d: get('d')};
  // A v2.0.0 não salvava o placar, mas registrava vitórias nas estatísticas
  // de conquistas. Recuperamos o que for possível; derrotas/empates não
  // eram persistidos e não podem ser reconstruídos.
  const oldWins = CQ.game?.achievementsState?.()?.stats?.tttWins;
  return {x: Number.isSafeInteger(oldWins) && oldWins > 0 ? oldWins : 0, o: 0, d: 0};
}
const ttt = {b: Array(9).fill(''), over: false, res: '', score: tttReadScore(), line: null,
  mode: '', cheat: null, contested: false};
function tttSave() { CQ.store.write(TTT_KEY, ttt.score); }
function tttNew() {
  Object.assign(ttt, {b: Array(9).fill(''), over: false, res: '', line: null,
    cheat: null, contested: false, mode: TTT.rollMode(ttt.score.x)});
}
tttNew();
function tttEnd() {
  const wX = TTT.win(ttt.b, 'X'), wO = TTT.win(ttt.b, 'O');
  if (wX) { ttt.over = true; ttt.res = 'Você venceu!'; ttt.score.x++; ttt.line = wX; statApp('tttWins'); }
  else if (wO) { ttt.over = true; ttt.res = 'O computador venceu.'; ttt.score.o++; ttt.line = wO; }
  else if (ttt.b.every(v => v)) { ttt.over = true; ttt.res = 'Deu velha!'; ttt.score.d++; }
  if (ttt.over) tttSave();
}
function tttComputer() {
  if (ttt.mode === 'ladrao' && !ttt.contested && ttt.score.x >= 1) {
    const stolen = TTT.makeFraud(ttt.b);
    if (stolen !== -1) {
      ttt.cheat = stolen; ttt.over = true; ttt.res = 'O computador venceu.';
      ttt.score.o++; tttSave(); statApp('tttCheated'); CQ.tone(190, 160);
      return;
    }
  }
  const mode = ttt.contested && ttt.mode === 'ladrao' ? 'medio' : ttt.mode;
  const m = TTT.choose(mode, ttt.b);
  if (m >= 0) ttt.b[m] = 'O';
  tttEnd();
}
function tttDraw(w) {
  const cheat = ttt.cheat;
  const ghost = cheat ? `<button type="button" class="ttt-ghost" data-act="ttt-fake" style="left:${(cheat.outer.x + 1) * 20}%;top:${(cheat.outer.y + 1) * 20}%" aria-label="O fora do tabuleiro" title="O fora do tabuleiro">O</button>` : '';
  const stroke = cheat ? (() => {
    const a = cheat.pair[0], b = cheat.pair[1];
    const pts = [[a % 3 + .5, Math.floor(a / 3) + .5], [b % 3 + .5, Math.floor(b / 3) + .5], [cheat.outer.x + .5, cheat.outer.y + .5]];
    const dx = pts[1][0] - pts[0][0], dy = pts[1][1] - pts[0][1];
    pts.sort((x,y) => (x[0] * dx + x[1] * dy) - (y[0] * dx + y[1] * dy));
    const from = pts[0], to = pts[2];
    return `<svg class="ttt-cheat-line" aria-hidden="true" viewBox="-1 -1 5 5" preserveAspectRatio="none"><line x1="${from[0]}" y1="${from[1]}" x2="${to[0]}" y2="${to[1]}" stroke="#d33848" stroke-width=".085" stroke-linecap="round" /></svg>`;
  })() : '';
  const cells = ttt.b.map((v, i) => `<button type="button" class="tc ${v} ${ttt.line?.includes(i) || cheat?.pair.includes(i) ? 'win' : ''}" data-act="ttt-cell" data-i="${i}" ${v || ttt.over ? 'disabled' : ''} aria-label="Casa ${i + 1}${v ? ': ' + v : ''}">${v}</button>`).join('');
  w.body.innerHTML = `<div class="ttt"><p class="ttt-status" role="status">${ttt.over ? E(ttt.res) : 'Sua vez (X)'}</p>
    <div class="ttt-stage ${cheat ? 'cheated' : ''}"><div class="ttt-grid" role="grid">${cells}</div>${stroke}${ghost}</div>
    <p class="muted">Você ${ttt.score.x} • Computador ${ttt.score.o} • Velhas ${ttt.score.d}</p>
    <div class="actions"><button type="button" class="chrome-button primary" data-act="ttt-new">Nova partida</button><button type="button" class="chrome-button" data-act="ttt-reset">Resetar</button></div></div>`;
  w.setTitle('Jogo da Velha'); w.setStatus(ttt.over ? ttt.res : 'Você joga com X.', '');
}
async function tttContest(w) {
  if (!ttt.cheat) return;
  const yes = await CQ.ui.confirm('Contestar resultado',
    '<p>O computador colocou um O fora do tabuleiro. Anular essa vitória e passar a vez para você?</p>',
    'Contestar resultado', 'Deixar como está');
  if (!yes || !ttt.cheat) return;
  ttt.score.o = Math.max(0, ttt.score.o - 1);
  Object.assign(ttt, {cheat: null, over: false, res: '', line: null, contested: true});
  tttSave(); tttDraw(w);
}
async function tttReset(w) {
  const yes = await CQ.ui.confirm('Resetar o Jogo da Velha',
    '<p>Zerar as vitórias, derrotas e empates e começar uma nova partida?</p><p>As conquistas já desbloqueadas não serão apagadas.</p>',
    'Sim, resetar placar', 'Cancelar', true);
  if (!yes) return;
  ttt.score = {x: 0, o: 0, d: 0}; tttSave(); tttNew(); tttDraw(w);
}
A.ttt = {title: 'Jogo da Velha', icon: 'assets/icons/jogo-da-velha.svg', bodyClass: 'page', maxDefault: false, w: 420, h: 590, persistent: true,
  render(w) {
    if (!w._bound) {
      w._bound = true;
      w.body.addEventListener('click', e => {
        const b = e.target.closest('[data-act]'); if (!b) return;
        const act = b.dataset.act;
        if (act === 'ttt-new') { tttNew(); tttDraw(w); }
        else if (act === 'ttt-reset') void tttReset(w);
        else if (act === 'ttt-fake') void tttContest(w);
        else if (act === 'ttt-cell') {
          const i = Number(b.dataset.i);
          if (ttt.over || ttt.b[i] || !Number.isInteger(i) || i < 0 || i > 8) return;
          ttt.b[i] = 'X'; CQ.tone(520, 50); tttEnd();
          if (!ttt.over) tttComputer();
          tttDraw(w);
        }
      });
    }
    tttDraw(w);
  }
};

// =============== Cobrinha ===============
const SN = {W: 20, H: 20, C: 18};
const sn = {snake: [], dir: [1, 0], next: [1, 0], food: null, score: 0, best: 0, over: false, paused: true, timer: 0, wall: CQ.store.read('classiquiz.v1.snake.wall',true) !== false};
function snReset() { sn.snake = [[10, 10], [9, 10], [8, 10]]; sn.dir = [1, 0]; sn.next = [1, 0]; sn.score = 0; sn.over = false; sn.paused = true; snFood(); }
function snFood() { let p; do { p = [Math.floor(Math.random() * SN.W), Math.floor(Math.random() * SN.H)]; } while (sn.snake.some(s => s[0] === p[0] && s[1] === p[1])); sn.food = p; }
function snStep(w) {
  if (sn.paused || sn.over) return; sn.dir = sn.next; const h = [sn.snake[0][0] + sn.dir[0], sn.snake[0][1] + sn.dir[1]];
  const outside = h[0] < 0 || h[1] < 0 || h[0] >= SN.W || h[1] >= SN.H;
  if (outside && !sn.wall) { h[0] = (h[0] + SN.W) % SN.W; h[1] = (h[1] + SN.H) % SN.H; statApp('snakeWraps'); }
  const eat = h[0] === sn.food[0] && h[1] === sn.food[1];
  // Seguir a antiga ponta da cauda é válido quando ela vai se mover nesta mesma rodada.
  const hit = sn.snake.some((s,i) => i < sn.snake.length - (eat ? 0 : 1) && s[0] === h[0] && s[1] === h[1]);
  if ((outside && sn.wall) || hit) { sn.over = true; sn.best = Math.max(sn.best, sn.score); CQ.tone(160, 220); snDraw(w); return; }
  sn.snake.unshift(h); if (eat) { sn.score++; CQ.tone(700, 50); if (sn.score === 10) statApp('snake10'); if (sn.score === 25) statApp('snake25'); if (sn.score === 100) statApp('snake100'); if (sn.snake.length === SN.W * SN.H) { sn.over = true; sn.best = Math.max(sn.best,sn.score); } else snFood(); } else sn.snake.pop(); snDraw(w);
}
function snDraw(w) {
  const cv = w.body.querySelector('#sn-cv'); if (!cv) return; const c = cv.getContext('2d'), S = SN.C; c.fillStyle = '#10223d'; c.fillRect(0, 0, SN.W * S, SN.H * S);
  c.fillStyle = '#f2c744'; c.fillRect(sn.food[0] * S + 3, sn.food[1] * S + 3, S - 6, S - 6); sn.snake.forEach((s, i) => { c.fillStyle = i ? '#3fb36b' : '#8fe6a8'; c.fillRect(s[0] * S + 1, s[1] * S + 1, S - 2, S - 2); });
  const sc = w.body.querySelector('#sn-score'); if (sc) sc.textContent = `Pontos: ${sn.score} • Recorde: ${Math.max(sn.best, sn.score)}`; const st = w.body.querySelector('#sn-state'); if (st) st.textContent = sn.over ? 'Fim de jogo. Pressione Reiniciar.' : sn.paused ? 'Pausado. Use as setas, WASD ou os botões para começar.' : 'Jogando';
}
function snDir(w, d) { const o = sn.dir; if (d[0] === -o[0] && d[1] === -o[1]) return; sn.next = d; if (sn.paused && !sn.over) { sn.paused = false; } }
A.snake = {title: 'Cobrinha', icon: 'assets/icons/cobrinha.svg', bodyClass: 'page', maxDefault: false, w: 470, h: 640, persistent: true,
  render(w) {
    if (!sn.snake.length) snReset();
    w.body.innerHTML = `<div class="snake" tabindex="0"><p id="sn-score" class="ms-bar"></p><canvas id="sn-cv" width="${SN.W * SN.C}" height="${SN.H * SN.C}" aria-label="Campo da Cobrinha"></canvas><p id="sn-state" class="muted" role="status"></p><div class="dpad" aria-label="Controles"><button type="button" data-act="sn-d" data-d="0,-1" aria-label="Para cima">↑</button><div><button type="button" data-act="sn-d" data-d="-1,0" aria-label="Para a esquerda">←</button><button type="button" data-act="sn-d" data-d="0,1" aria-label="Para baixo">↓</button><button type="button" data-act="sn-d" data-d="1,0" aria-label="Para a direita">→</button></div></div><label class="snake-wall-setting"><input type="checkbox" data-act="sn-wall" ${sn.wall ? 'checked' : ''}> Colisão com as paredes</label><div class="actions"><button type="button" class="chrome-button" data-act="sn-pause">Pausar/Continuar</button><button type="button" class="chrome-button primary" data-act="sn-new">Reiniciar</button></div></div>`;
    w.setTitle('Cobrinha'); w.setStatus('Setas ou WASD • Espaço pausa', '');
    if (!w._bound) { w._bound = true;
      w.body.addEventListener('change', e => { if (e.target.dataset.act === 'sn-wall') { sn.wall = !!e.target.checked; CQ.store.write('classiquiz.v1.snake.wall',sn.wall); CQ.notify(sn.wall ? 'Colisão ativada.' : 'Paredes atravessáveis ativadas.'); } });
      w.body.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act; if (a === 'sn-d') snDir(w, b.dataset.d.split(',').map(Number)); else if (a === 'sn-pause') { if (!sn.over) sn.paused = !sn.paused; snDraw(w); } else if (a === 'sn-new') { snReset(); snDraw(w); } });
      w.body.addEventListener('keydown', e => { const m = {ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0]}[e.key]; if (m) { e.preventDefault(); snDir(w, m); } else if (e.key === ' ') { e.preventDefault(); if (!sn.over) sn.paused = !sn.paused; snDraw(w); } });
      let sw = null; w.body.addEventListener('pointerdown', e => { if (e.target.closest('#sn-cv')) sw = {x: e.clientX, y: e.clientY}; }); w.body.addEventListener('pointerup', e => { if (!sw) return; const dx = e.clientX - sw.x, dy = e.clientY - sw.y; sw = null; if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return; snDir(w, Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]); });
    }
    clearInterval(sn.timer); sn.timer = setInterval(() => { if (!w.minimized) snStep(w); }, reduced() ? 150 : 120); snDraw(w);
    setTimeout(() => w.body.querySelector('.snake')?.focus({preventScroll: true}), 30);
  },
  onHide() { sn.paused = true; }, onClose() { clearInterval(sn.timer); sn.snake = []; }
};

// =============== Pong ===============
const PW = 480, PH = 300, WIN = 7;
const pg = {py: PH / 2, ay: PH / 2, bx: PW / 2, by: PH / 2, vx: 3.2, vy: 2, ps: 0, as: 0, run: false, over: false, raf: 0, msg: 'Toque ou pressione ↑/↓ para começar.', up: false, dn: false};
function pgServe(dir) { pg.bx = PW / 2; pg.by = PH / 2; pg.vx = 3.2 * dir; pg.vy = (Math.random() * 2 - 1) * 2.2; }
function pgReset() { Object.assign(pg, {py: PH / 2, ay: PH / 2, ps: 0, as: 0, over: false, run: false, msg: 'Toque ou pressione ↑/↓ para começar.'}); pgServe(1); }
function pgStep() {
  if (!pg.run || pg.over) return; const P = 56;
  if (pg.up) pg.py -= 5; if (pg.dn) pg.py += 5; pg.py = Math.max(P / 2, Math.min(PH - P / 2, pg.py));
  const tgt = pg.by, d = tgt - pg.ay; pg.ay += Math.max(-3.1, Math.min(3.1, d)) * .9; pg.ay = Math.max(P / 2, Math.min(PH - P / 2, pg.ay));
  pg.bx += pg.vx; pg.by += pg.vy; if (pg.by < 5 || pg.by > PH - 5) { pg.vy *= -1; pg.by = Math.max(5, Math.min(PH - 5, pg.by)); }
  if (pg.vx < 0 && pg.bx <= 24 && pg.bx >= 8 && Math.abs(pg.by - pg.py) <= P / 2 + 5) { pg.vx = Math.min(8, Math.abs(pg.vx) * 1.06); pg.vy += (pg.by - pg.py) * .07; pg.bx = 25; CQ.tone(480, 30); }
  if (pg.vx > 0 && pg.bx >= PW - 24 && pg.bx <= PW - 8 && Math.abs(pg.by - pg.ay) <= P / 2 + 5) { pg.vx = -Math.min(8, Math.abs(pg.vx) * 1.06); pg.vy += (pg.by - pg.ay) * .07; pg.bx = PW - 25; CQ.tone(420, 30); }
  if (pg.bx < -10) { pg.as++; pgServe(1); CQ.tone(200, 80); } else if (pg.bx > PW + 10) { pg.ps++; pgServe(-1); CQ.tone(640, 80); }
  if (pg.ps >= WIN) { pg.over = true; pg.msg = 'Você venceu!'; statApp('pongWins'); } else if (pg.as >= WIN) { pg.over = true; pg.msg = 'O computador venceu.'; }
}
function pgDraw(w) {
  const cv = w.body.querySelector('#pg-cv'); if (!cv) return; const c = cv.getContext('2d'); c.fillStyle = '#0d1d36'; c.fillRect(0, 0, PW, PH);
  c.strokeStyle = '#4a6797'; c.setLineDash([8, 8]); c.beginPath(); c.moveTo(PW / 2, 0); c.lineTo(PW / 2, PH); c.stroke(); c.setLineDash([]);
  c.fillStyle = '#e8eefc'; c.fillRect(10, pg.py - 28, 8, 56); c.fillRect(PW - 18, pg.ay - 28, 8, 56); c.fillStyle = '#f2c744'; c.fillRect(pg.bx - 5, pg.by - 5, 10, 10);
  c.fillStyle = '#e8eefc'; c.font = 'bold 28px monospace'; c.textAlign = 'center'; c.fillText(pg.ps, PW / 2 - 40, 36); c.fillText(pg.as, PW / 2 + 40, 36);
  const m = w.body.querySelector('#pg-msg'); if (m) m.textContent = pg.run && !pg.over ? `Primeiro a ${WIN} pontos vence.` : pg.msg;
}
function pgLoop(w) { cancelAnimationFrame(pg.raf); const f = () => { if (!WM.isOpen('pong')) return; if (!w.minimized) { pgStep(); pgDraw(w); } pg.raf = requestAnimationFrame(f); }; pg.raf = requestAnimationFrame(f); }
A.pong = {title: 'Pong', icon: 'assets/icons/pong.svg', bodyClass: 'page', maxDefault: false, w: 540, h: 560, persistent: true,
  render(w) {
    if (!pg.msg) pgReset();
    w.body.innerHTML = `<div class="pong" tabindex="0"><canvas id="pg-cv" width="${PW}" height="${PH}" aria-label="Campo do Pong" style="touch-action:none"></canvas><p id="pg-msg" class="muted" role="status"></p><div class="dpad row"><button type="button" data-hold="up" aria-label="Raquete para cima">↑ Subir</button><button type="button" data-hold="dn" aria-label="Raquete para baixo">↓ Descer</button></div><div class="actions"><button type="button" class="chrome-button" data-act="pg-pause">Pausar/Continuar</button><button type="button" class="chrome-button primary" data-act="pg-new">Nova partida</button></div></div>`;
    w.setTitle('Pong'); w.setStatus('Arraste na quadra ou use ↑/↓', '');
    if (!w._bound) { w._bound = true;
      w.body.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; if (b.dataset.act === 'pg-new') { pgReset(); pg.run = true; } else if (b.dataset.act === 'pg-pause') pg.run = !pg.run; });
      w.body.addEventListener('keydown', e => { if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); pg.up = true; pg.run = !pg.over; } else if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); pg.dn = true; pg.run = !pg.over; } });
      w.body.addEventListener('keyup', e => { if (e.key === 'ArrowUp' || e.key === 'w') pg.up = false; else if (e.key === 'ArrowDown' || e.key === 's') pg.dn = false; });
      for (const k of ['up', 'dn']) { /* botões segurados */ }
      w.body.addEventListener('pointerdown', e => { const h = e.target.closest('[data-hold]'); if (h) { pg[h.dataset.hold] = true; pg.run = !pg.over; try { h.setPointerCapture(e.pointerId); } catch {} } else if (e.target.id === 'pg-cv') { pg.drag = e.pointerId; pg.run = !pg.over; pgDrag(w, e); try { e.target.setPointerCapture(e.pointerId); } catch {} } });
      w.body.addEventListener('pointermove', e => { if (pg.drag === e.pointerId) pgDrag(w, e); });
      const rel = e => { pg.up = false; pg.dn = false; if (pg.drag === e.pointerId) pg.drag = null; }; w.body.addEventListener('pointerup', rel); w.body.addEventListener('pointercancel', rel);
    }
    pgLoop(w); pgDraw(w);
    setTimeout(() => w.body.querySelector('.pong')?.focus({preventScroll: true}), 30);
  },
  onHide() { pg.run = false; pg.up = pg.dn = false; }, onClose() { cancelAnimationFrame(pg.raf); pg.msg = ''; pgReset(); pg.msg = ''; }
};
function pgDrag(w, e) { const r = w.body.querySelector('#pg-cv').getBoundingClientRect(); pg.py = Math.max(28, Math.min(PH - 28, (e.clientY - r.top) * PH / r.height)); }
})();
