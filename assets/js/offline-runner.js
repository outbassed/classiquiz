/* ClaQui Offline Runner — arcade de pixels original. Segredo do ClaQui Browser (ou da tela offline excepcional). Licença: MIT.
   v26nov16: reescrito para celular e PC. Lógica pura e determinística (createSim, passo fixo de 1/120 s) separada da interface;
   mundo em unidades próprias, escalado para ocupar toda a área disponível (retrato/paisagem/redimensionamento sem reiniciar). */
(function () {
'use strict';
const KEY = 'classiquiz.v1.runner', AK = 'classiquiz.v1.achievements', UIK = 'classiquiz.v1.runner.ui';
const ACH = [['offline_seen', 'Sem internet', 'offlineSeen', 1], ['runner_secret', 'Segredo desconectado', 'runnerSecret', 1], ['runner_first', 'Primeiros passos', 'runner100', 1],
  ['runner_alert', 'Alerta vermelho', 'runnerFlyerDodge', 10], ['runner_1000', 'Sem sinal, sem medo', 'runner1000', 1], ['runner_180', 'Intocável', 'runner180', 1], ['runner_5000', 'Lenda offline', 'runner5000', 1]];
const read = (key, def) => { try { return JSON.parse(localStorage.getItem(key)) || def; } catch { return def; } };
const write = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch {} };
function earn(key) {   // compatível com a versão antiga: com o shell carregado delega ao sistema de conquistas; senão grava direto
  const cq = window.CQ;
  if (cq && cq.game && cq.game.statApp) { cq.game.statApp(key); return; }
  const a = read(AK, {unlocked: {}, stats: {}}); a.stats ||= {}; a.unlocked ||= {}; if (a.disabled) return;
  a.stats[key] = (a.stats[key] || 0) + 1;
  for (const [id, , stat, n] of ACH) if (!a.unlocked[id] && a.stats[stat] >= n) a.unlocked[id] = Date.now();
  write(AK, a);
}
const record = () => read(KEY, {best: 0, played: 0});
function best(score) { const r = record(); if (score > r.best) { r.best = score; write(KEY, r); } return r.best; }

// =============== simulação pura ===============
const P = {STEP: 1 / 120, V0: 250, VMAX: 640, ACC: 3.3, G: 2900, FALL: 1.45, JUMP_V: 780, DUCK_PULL: 2600, BUF: .11,
  PW: 36, PH: 40, DH: 22, HIT_X: 5, HIT_W: 26, MINW: 380, MINH: 210};
const peak = () => P.JUMP_V * P.JUMP_V / (2 * P.G);              // ~105 unidades (a versão antiga chegava a ~68)
const airtime = () => P.JUMP_V / P.G + Math.sqrt(2 * peak() / (P.G * P.FALL));   // ~0,49 s
function createSim(opts = {}) {
  const rnd = opts.rng || Math.random, emit = opts.onEvent || (() => {});
  const st = {t: 0, score: 0, speed: P.V0, y: 0, vy: 0, duck: false, live: true, ob: [], dist: 0, gap: 520, buf: 0, flyers: 0, w: opts.worldW || 480, px: 70, passed: 0, run: 0, flags: {}};
  const rect = () => { const h = st.duck && st.y === 0 ? P.DH : P.PH; return {x: st.px + P.HIT_X, w: P.HIT_W, b: st.y, t: st.y + h}; };
  const nextGap = () => st.speed * (.8 + rnd() * .75) + 130;      // distância (unidades) até o próximo obstáculo: sempre maior que o salto
  function spawn() {
    const flying = st.score > 260 && rnd() < .28, x = st.w + 40;
    if (flying) { const low = rnd() < .5; st.ob.push({type: 'alert', x, w: 34, h: 28, b: low ? 6 : 26, passed: false}); return; }
    const kind = rnd() < .5 ? 'file' : 'signal', h = 30 + Math.floor(rnd() * 22), w = 22 + Math.floor(rnd() * 16);
    st.ob.push({type: kind, x, w, h, b: 0, passed: false});
    if (st.score > 400 && rnd() < .3) st.ob.push({type: kind, x: x + w + 14, w: 22, h: 30 + Math.floor(rnd() * 12), b: 0, passed: false});   // par próximo, ainda saltável
  }
  function doJump() { if (st.y === 0) { st.vy = P.JUMP_V; st.duck = false; emit('jump'); return true; } st.buf = P.BUF; return false; }
  function step(h) {
    if (!st.live) return;
    st.t += h; st.speed = Math.min(P.VMAX, P.V0 + P.ACC * st.t); st.score += (10 + st.speed / 50) * h;
    if (st.buf > 0) st.buf -= h;
    if (st.y > 0 || st.vy > 0) { const g = P.G * (st.vy < 0 ? P.FALL : 1) + (st.duck && st.vy < 0 ? P.DUCK_PULL : 0); st.vy -= g * h; st.y += st.vy * h; if (st.y <= 0) { st.y = 0; st.vy = 0; if (st.buf > 0) { st.buf = 0; doJump(); } } }
    const dx = st.speed * h; st.dist += dx; if (st.dist >= st.gap) { st.dist = 0; spawn(); st.gap = nextGap(); }
    const me = rect();
    for (const o of st.ob) {
      o.x -= dx;
      const a = {x: o.x + 3, w: o.w - 6, b: o.b + 2, t: o.b + o.h - 2};       // folga de justiça de 2-3 unidades nos obstáculos
      if (me.x < a.x + a.w && me.x + me.w > a.x && me.b < a.t && me.t > a.b) { st.live = false; emit('dead'); break; }
      if (!o.passed && o.x + o.w < st.px) { o.passed = true; st.passed++; if (o.type === 'alert') { st.flyers++; emit('flyer'); } }
    }
    st.ob = st.ob.filter(o => o.x + o.w > -60);
    for (const [k, v] of [['runner100', st.score >= 100], ['runner1000', st.score >= 1000], ['runner5000', st.score >= 5000], ['runner180', st.t >= 180]]) if (v && !st.flags[k]) { st.flags[k] = 1; emit('goal', k); }
  }
  return {st, step, jump: doJump, duck(on) { st.duck = !!on; }, rect, layout(w, px) { st.w = w; st.px = px; }};
}

// =============== interface ===============
const CSS = `.rn{position:relative;display:flex;flex-direction:column;width:100%;height:100%;min-height:180px;background:#e7e7e7;border:3px inset #fff;color:#353535;outline:none;touch-action:none;user-select:none;-webkit-user-select:none;font:13px/1.3 system-ui,Arial,sans-serif;box-sizing:border-box}
.rn *{box-sizing:border-box}.rn-head{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:4px 8px;background:#d6d6d9;border-bottom:2px solid #999;font-size:13px}
.rn-head strong{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}.rn-points{margin-left:auto;font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:700}
.rn-btn{flex:0 0 auto;border:2px outset #fff;background:#d9d9dc;color:#333;padding:4px 9px;font:inherit;font-size:12px;font-weight:700;min-height:30px;cursor:pointer}.rn-btn:active,.rn-btn[aria-pressed="true"]{border-style:inset}
.rn-stage{position:relative;flex:1 1 0;min-height:0;overflow:hidden;touch-action:none;cursor:pointer}.rn-canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block;image-rendering:pixelated;touch-action:none}
.rn-over{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;text-align:center;padding:12px}.rn-over[hidden]{display:none}.rn-over div{background:#f4f4f4e6;border:3px outset #fff;padding:12px 18px;max-width:92%;box-shadow:3px 3px #6668}.rn-over b{display:block;font-size:18px;margin-bottom:4px}
.rn-info{flex:0 0 auto;min-height:20px;padding:2px 8px;font-size:12px;font-weight:700;text-align:center;background:#d6d6d9;border-top:1px solid #aaa}
.rn-controls{flex:0 0 auto;display:flex;justify-content:center;gap:6px;padding:5px;background:#cfcfd3}.rn-controls[hidden]{display:none}.rn-controls .rn-btn{flex:1 1 0;max-width:150px;min-height:40px}`;
function injectCss() { if (typeof document === 'undefined' || document.getElementById('cq-runner-css')) return; const s = document.createElement('style'); s.id = 'cq-runner-css'; s.textContent = CSS; document.head.appendChild(s); }

function startGame(host, options = {}) {
  if (!host) return null; injectCss(); const onExit = options.onExit || (() => {});
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer:coarse)').matches; let showCtl; try { showCtl = JSON.parse(localStorage.getItem(UIK)); } catch {} if (typeof showCtl !== 'boolean') showCtl = false;
  host.innerHTML = `<div class="rn" tabindex="0" aria-label="Offline Runner"><div class="rn-head"><strong>ClaQui Offline Runner</strong><span class="rn-points" aria-live="off">Pontos: 0 · Recorde: ${best(0)}</span><button type="button" class="rn-btn" data-run="controls" aria-pressed="${showCtl}" title="Mostrar botões de acessibilidade">⌨ Botões</button><button type="button" class="rn-btn" data-run="close" title="Sair do jogo" aria-label="Sair do jogo">✕</button></div>
    <div class="rn-stage"><canvas class="rn-canvas" aria-label="Jogo de corrida em pixel art. Toque ou pressione espaço para pular, deslize para baixo para abaixar."></canvas><div class="rn-over" hidden></div></div>
    <div class="rn-info" role="status"></div><div class="rn-controls" ${showCtl ? '' : 'hidden'}><button type="button" class="rn-btn" data-run="jump">↑ Pular</button><button type="button" class="rn-btn" data-run="duck">↓ Abaixar</button><button type="button" class="rn-btn" data-run="restart">↻ Reiniciar</button></div></div>`;
  const root = host.querySelector('.rn'), stage = root.querySelector('.rn-stage'), cv = root.querySelector('canvas'), ctx = cv.getContext('2d'), info = root.querySelector('.rn-info'), pts = root.querySelector('.rn-points'), over = root.querySelector('.rn-over');
  let sim, raf = 0, active = true, acc = 0, last = 0, recBest = record().best, deadAt = 0, cw = 0, ch = 0, dpr = 1, scale = 1, worldH = P.MINH, groundY = 160, paused = false, ro = null;
  function layout() {
    const r = stage.getBoundingClientRect(); cw = Math.max(60, Math.floor(r.width)); ch = Math.max(60, Math.floor(r.height)); dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    scale = Math.max(.5, Math.min(cw / P.MINW, ch / P.MINH)); const worldW = cw / scale; worldH = ch / scale; groundY = worldH - Math.max(44, worldH * .2);
    if (sim) sim.layout(worldW, Math.max(46, Math.min(110, worldW * .16)));
    if (!active) return; draw();
  }
  function reset() {
    recBest = best(Math.floor(sim ? sim.st.score : 0)); const rec = record(); rec.played++; write(KEY, rec);
    sim = createSim({onEvent: (ev, k) => { if (ev === 'dead') die(); else if (ev === 'flyer') earn('runnerFlyerDodge'); else if (ev === 'goal') earn(k); }});
    layout(); acc = 0; last = 0; deadAt = 0; over.hidden = true; paused = false;
    info.textContent = 'Toque/espaço: pular • deslize para baixo/↓: abaixar. Desvie dos arquivos e abaixe-se dos alertas!'; root.focus({preventScroll: true});
  }
  function die() { const s = Math.floor(sim.st.score); deadAt = performance.now(); recBest = best(s); over.hidden = false; over.innerHTML = `<div><b>Fim de jogo!</b>${s} pontos • Recorde ${Math.max(recBest, s)}<br><small>Toque, ↑ ou espaço para jogar de novo</small></div>`; info.textContent = `Fim de jogo! Você marcou ${s} pontos.`; try { window.CQ && CQ.tone && CQ.tone(160, 220); } catch {} }
  const jump = () => { if (!sim.st.live) { if (performance.now() - deadAt > 380) reset(); return; } if (sim.jump()) { try { window.CQ && CQ.tone && CQ.tone(520, 40); } catch {} } };
  const duck = on => sim.duck(on);
  // ---- desenho ----
  const mix = (a, b, k) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const x = p(a), y = p(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
  function draw() {
    if (!sim) return; const s = sim.st, night = Math.floor(s.score / 700) % 2 === 1 ? 1 : 0; const k = night;  // dia/noite alternados
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0); const W = cw / scale, H = worldH, bg = mix('#f0f0f0', '#2b2e36', k), fg = mix('#444444', '#dcdcdc', k), soft = mix('#d1d1d1', '#454854', k), mid = mix('#777777', '#a8abb5', k);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = soft; for (let i = 0; i < 9; i++) ctx.fillRect(((i * 97 - s.t * 18) % (W + 120) + W + 120) % (W + 120) - 40, 14 + (i % 4) * Math.max(14, groundY * .12), 34, 3);
    if (H > 300) { ctx.fillStyle = soft; for (let i = 0; i < 6; i++) { const hx = ((i * 190 - s.t * 30) % (W + 240) + W + 240) % (W + 240) - 120; ctx.fillRect(hx, groundY - 28 - (i % 3) * 10, 90, 28 + (i % 3) * 10); } }
    ctx.fillStyle = fg; ctx.fillRect(0, groundY, W, 3); ctx.fillStyle = mid; const off = (s.t * s.speed) % 38; for (let x = -off; x < W; x += 38) ctx.fillRect(x, groundY + 10, 17, 2), ctx.fillRect(x + 21, groundY + 19, 8, 2);
    // jogador: quadradinho triste, com pernas animadas
    const pr = sim.rect(), ducking = s.duck && s.y === 0, px = s.px, py = groundY - s.y - (ducking ? P.DH : P.PH), w = ducking ? 44 : P.PW, h = ducking ? P.DH : P.PH;
    ctx.fillStyle = mix('#353c43', '#e9e9ee', k); ctx.fillRect(px, py, w, h); ctx.fillStyle = mix('#f0f0f0', '#2b2e36', k); ctx.fillRect(px + (ducking ? 26 : 8), py + 6, 4, 5); ctx.fillRect(px + (ducking ? 36 : 22), py + 6, 4, 5);
    ctx.fillStyle = fg; ctx.fillRect(px + (ducking ? 27 : 9), py + 9, 2, 2); ctx.fillRect(px + (ducking ? 37 : 23), py + 9, 2, 2);
    ctx.fillStyle = mix('#d2d2d2', '#454854', k); ctx.fillRect(px + (ducking ? 26 : 9), py + h - 8, 14, 3);
    if (!ducking) { const f = s.y > 0 ? 0 : Math.floor(s.t * 14) % 2; ctx.fillStyle = mix('#222222', '#f0f0f0', k); ctx.fillRect(px + 6 + f * 3, py + h, 6, 5); ctx.fillRect(px + 22 - f * 3, py + h, 6, 5); }
    for (const o of s.ob) {
      const ox = o.x, oy = groundY - o.b - o.h; ctx.fillStyle = mid;
      if (o.type === 'file') { ctx.fillRect(ox, oy, o.w, o.h); ctx.fillStyle = bg; ctx.fillRect(ox + 4, oy + 4, o.w - 8, o.h - 8); ctx.fillStyle = fg; ctx.fillRect(ox + 8, oy + 12, o.w - 16, 4); ctx.fillRect(ox + 8, oy + 19, o.w - 16, 3); }
      else if (o.type === 'signal') { ctx.fillRect(ox, oy, o.w, o.h); ctx.fillStyle = bg; ctx.fillRect(ox + 4, oy + 4, o.w - 8, o.h - 8); ctx.strokeStyle = fg; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ox + o.w / 2, oy + o.h / 2, Math.min(7, o.w / 3), Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); ctx.fillStyle = fg; ctx.fillRect(ox + o.w / 2 - 2, oy + o.h / 2 + 2, 5, 5); }
      else { ctx.fillStyle = '#c0392b'; ctx.fillRect(ox, oy, o.w, o.h); ctx.fillStyle = '#f6f6f6'; ctx.fillRect(ox + 3, oy + 3, o.w - 6, o.h - 6); ctx.fillStyle = '#c0392b'; ctx.fillRect(ox + o.w / 2 - 2, oy + 6, 4, 10); ctx.fillRect(ox + o.w / 2 - 2, oy + 19, 4, 4); ctx.fillStyle = mid; const wing = Math.floor(s.t * 10) % 2; ctx.fillRect(ox - 8, oy + 8 + wing * 4, 8, 3); ctx.fillRect(ox + o.w, oy + 15 - wing * 4, 8, 3); }
    }
  }
  function updateUi() { const s = Math.floor(sim.st.score); pts.textContent = `Pontos: ${s} · Recorde: ${Math.max(recBest, s)}`; }
  function visible() { if (!root.isConnected || root.offsetParent === null || document.hidden) return false; const win = root.closest('.cq-win'); return !win || win.classList.contains('active'); }   // pausa em janela oculta, coberta por outra ou em aba de fundo
  function frame(ts) {
    if (!active) return; raf = requestAnimationFrame(frame);
    if (!visible() || paused) { last = 0; return; }                       // pausa sozinho em aba/janela oculta
    const dt = last ? Math.min(.1, (ts - last) / 1000) : 0; last = ts; acc += dt;
    while (acc >= P.STEP) { sim.step(P.STEP); acc -= P.STEP; }               // passo fixo: mesma física em 30, 60 ou 144 Hz
    draw(); updateUi();
  }
  // ---- entrada ----
  const typing = e => { const t = e.target; return t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || (t && t.isContentEditable); };
  function key(e) {
    if (!active || typing(e) || !visible()) return; const k = e.key;
    if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') { if (!(e.target && e.target.closest && e.target.closest('button,a')) || e.target === root) { e.preventDefault(); if (!e.repeat) jump(); } }
    else if (k === 'ArrowDown' || k === 's' || k === 'S') { e.preventDefault(); duck(true); } else if (k === 'p' || k === 'P') { paused = !paused; info.textContent = paused ? 'Pausado (P para continuar)' : ''; }
  }
  function keyUp(e) { if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') duck(false); }
  let g = null;                                                              // gesto em andamento
  function pDown(e) {
    if (e.target.closest('button')) return; e.preventDefault(); try { stage.setPointerCapture(e.pointerId); } catch {} root.focus({preventScroll: true});
    g = {id: e.pointerId, x: e.clientX, y: e.clientY, mode: 'wait', touch: e.pointerType !== 'mouse'};
    if (!sim.st.live) { jump(); g.mode = 'done'; return; }
    if (g.touch) g.timer = setTimeout(() => { if (g && g.mode === 'wait') { g.mode = 'jumped'; jump(); } }, 55);  // pequena espera para distinguir toque de deslize
    else { g.mode = 'jumped'; jump(); }
  }
  function pMove(e) {
    if (!g || e.pointerId !== g.id) return; const dy = e.clientY - g.y, dx = e.clientX - g.x;
    if (g.mode !== 'duck' && dy > 24 && Math.abs(dy) > Math.abs(dx)) { clearTimeout(g.timer); g.mode = 'duck'; duck(true); }
    else if (g.mode === 'wait' && dy < -24 && Math.abs(dy) > Math.abs(dx)) { clearTimeout(g.timer); g.mode = 'jumped'; jump(); }
  }
  function pUp(e) { if (!g || e.pointerId !== g.id) return; clearTimeout(g.timer); if (g.mode === 'wait') jump(); if (g.mode === 'duck') duck(false); g = null; }
  function press(e) {
    const b = e.target.closest('[data-run]'); if (!b) return; const a = b.dataset.run;
    if (a === 'jump') jump(); else if (a === 'restart') reset(); else if (a === 'close') close();
    else if (a === 'controls') { showCtl = !showCtl; try { localStorage.setItem(UIK, JSON.stringify(showCtl)); } catch {} b.setAttribute('aria-pressed', String(showCtl)); root.querySelector('.rn-controls').hidden = !showCtl; layout(); }
  }
  const duckBtn = root.querySelector('[data-run="duck"]');
  duckBtn.addEventListener('pointerdown', e => { e.preventDefault(); duck(true); }); for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) duckBtn.addEventListener(ev, () => duck(false));
  document.addEventListener('keydown', key); document.addEventListener('keyup', keyUp); root.addEventListener('click', press);
  stage.addEventListener('pointerdown', pDown); stage.addEventListener('pointermove', pMove); stage.addEventListener('pointerup', pUp); stage.addEventListener('pointercancel', pUp);
  if (typeof ResizeObserver === 'function') { ro = new ResizeObserver(() => layout()); ro.observe(stage); } else window.addEventListener('resize', layout);
  function close(silent) {
    if (!active) return; recBest = best(Math.floor(sim ? sim.st.score : 0)); active = false; cancelAnimationFrame(raf); if (ro) ro.disconnect(); else window.removeEventListener('resize', layout);
    document.removeEventListener('keydown', key); document.removeEventListener('keyup', keyUp); host.innerHTML = ''; if (!silent) onExit();
  }
  reset(); raf = requestAnimationFrame(frame);
  return {close, reset, jump: () => jump(), duck, getState: () => ({...sim.st, scale, worldW: cw / scale, worldH, groundY, canvas: {w: cw, h: ch}}), sim: () => sim};
}
window.CQ_RUNNER = {startGame, earn, record, createSim, PARAMS: P, peak, airtime};
})();
