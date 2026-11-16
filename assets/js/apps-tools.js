/* ClaQui OS — Bloco de Notas, Paint, Calculadora, Calendário, Relógio e Reprodutor. Licença: MIT. */
(() => {
'use strict';
const CQ = window.CQ, E = CQ.E, OS = CQ.os, WM = OS.wm, V = CQ.vfs, A = CQ.apps;
const DOCS = 'C:\\Meu Dispositivo\\Documentos';

// =============== Bloco de Notas ===============
const np = {path: null, saved: '', name: 'Sem título'};
const npText = w => w.body.querySelector('#np-text')?.value ?? np.cache ?? '';
const npDirty = () => { const w = WM.get('notepad'); return !!w && npText(w) !== np.saved; };
async function npSave(w, as = false) {
  let path = np.path;
  if (!path || as) {
    const name = await CQ.ui.prompt('Salvar como', 'Nome do arquivo (será salvo em Documentos):', np.path ? V.baseOf(np.path) : 'Nota.txt'); if (!name) return false;
    path = V.joinP(DOCS, /\.txt$/i.test(name.trim()) ? name.trim() : name.trim() + '.txt');
    if (V.get(path) && V.key(path) !== V.key(np.path || '')) { const ok = await CQ.ui.confirm('Substituir arquivo', `<p>Já existe <b>${E(V.baseOf(path))}</b>. Substituir?</p>`, 'Substituir', 'Cancelar', true); if (!ok) return false; }
  }
  try { const text = npText(w); V.writeText(path, text); np.path = path; np.saved = text; npHead(w); CQ.notify('Arquivo salvo.'); return true; } catch (e) { CQ.ui.alert('Não foi possível salvar', `<p>${E(e.message)}</p>`); return false; }
}
function npHead(w) { w.setTitle((npDirty() ? '*' : '') + (np.path ? V.baseOf(np.path) : 'Sem título') + ' - Bloco de Notas'); w.setStatus(np.path ? np.path : 'Documento novo (não salvo)', npDirty() ? 'Alterações não salvas' : 'Salvo'); }
async function npLoad(w, path) {
  if (npDirty()) { const r = await npAskDirty(w); if (r === 'cancel') return; }
  const t = V.readText(path); if (t === null) return CQ.notify('Arquivo não encontrado.');
  np.path = V.norm(path); np.saved = t; np.cache = t; const el = w.body.querySelector('#np-text'); if (el) el.value = t; npHead(w);
}
async function npAskDirty(w) {
  const r = await CQ.ui.modal({title: 'Bloco de Notas', body: `<p>Salvar alterações em <b>${E(np.path ? V.baseOf(np.path) : 'Sem título')}</b>?</p>`, dismiss: 'cancel', buttons: [{label: 'Cancelar', value: 'cancel'}, {label: 'Não salvar', value: 'discard', danger: true}, {label: 'Salvar', value: 'save', primary: true}]});
  if (r === 'save') { const ok = await npSave(w); return ok ? 'ok' : 'cancel'; } return r === 'discard' ? 'discard' : 'cancel';
}
A.notepad = {title: 'Bloco de Notas', icon: 'assets/icons/bloco-de-notas.svg', bodyClass: 'flush', maxDefault: false, w: 680, h: 500, persistent: true,
  render(w, p) {
    w.body.innerHTML = `<div class="np"><div class="menubar"><button type="button" class="mb" data-act="np-new">Novo</button><button type="button" class="mb" data-act="np-open">Abrir…</button><button type="button" class="mb" data-act="np-save">Salvar</button><button type="button" class="mb" data-act="np-saveas">Salvar como…</button></div><textarea id="np-text" class="np-text selectable" spellcheck="false" aria-label="Texto do documento" autocomplete="off">${E(np.cache ?? '')}</textarea></div>`;
    if (!w._bound) { w._bound = true;
      w.body.addEventListener('input', e => { if (e.target.id === 'np-text') { np.cache = e.target.value; npHead(w); } });
      w.body.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); npSave(w); } });
      w.body.addEventListener('click', async e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
        if (a === 'np-save') npSave(w); else if (a === 'np-saveas') npSave(w, true);
        else if (a === 'np-new') { if (npDirty() && (await npAskDirty(w)) === 'cancel') return; np.path = null; np.saved = ''; np.cache = ''; w.body.querySelector('#np-text').value = ''; npHead(w); }
        else if (a === 'np-open') { const files = V.allFiles().filter(n => n.kind === 'text' && !n.hidden); const pick = await CQ.ui.modal({title: 'Abrir arquivo', body: `<div class="pick-list">${files.map(n => `<button type="button" class="pick-item" data-modal-value="${E(JSON.stringify(n.path))}"><img src="assets/icons/f-txt.svg" alt=""> ${E(n.path)}</button>`).join('') || '<p>Nenhum documento de texto.</p>'}</div>`, dismiss: null, buttons: [{label: 'Cancelar', value: null}]}); if (pick) npLoad(w, pick); }
      });
    }
    if (p?.path) npLoad(w, p.path); else npHead(w);
    setTimeout(() => w.body.querySelector('#np-text')?.focus({preventScroll: true}), 30);
  },
  onParams(w, p) { if (p?.path) npLoad(w, p.path); },
  onShow(w) { setTimeout(() => w.body.querySelector('#np-text')?.focus({preventScroll: true}), 30); },
  isDirty: () => npDirty(), dirtyLabel: () => 'Bloco de Notas: ' + (np.path ? V.baseOf(np.path) : 'Sem título'), save: w => npSave(w),
  async beforeClose(w) { if (!npDirty()) return true; const r = await npAskDirty(w); return r !== 'cancel'; },
  onClose() { np.path = null; np.saved = ''; np.cache = ''; }
};

// =============== Calculadora ===============
const CALC_ZERO_KEY = 'classiquiz.v1.calc.divideZeroSeen';
const calc = {cur: '0', acc: null, op: null, fresh: true, hadOp: false, hist: [], warning: '', zeroSeen: CQ.store.read(CALC_ZERO_KEY, false) === true};
const calcFmt = n => { if (!isFinite(n)) return 'Erro'; const r = Math.round(n * 1e10) / 1e10; return String(r).replace('.', ','); };
const calcNum = s => Number(String(s).replace(',', '.'));
function calcApply(a, op, b) { return op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : op === '÷' ? (b === 0 ? NaN : a / b) : b; }
function calcError(expr, dividingByZero) {
  Object.assign(calc, {cur: 'Erro', acc: null, op: null, fresh: true, hadOp: false});
  calc.hist.unshift(expr + ' = erro'); calc.hist = calc.hist.slice(0, 6);
  if (!dividingByZero) { calc.warning = 'Operação inválida.'; return; }
  // Guardado antes de abrir a tela azul, inclusive se a janela for fechada.
  const first = !calc.zeroSeen && CQ.store.read(CALC_ZERO_KEY, false) !== true;
  calc.zeroSeen = true;
  if (first) CQ.store.write(CALC_ZERO_KEY, true);
  CQ.bus.emit('calc:divide-zero', {first, expression: expr});
  if (first || Math.random() < 0.5) {
    calc.warning = '';
    OS.bsod({cause: 'division-by-zero'});
  } else {
    calc.warning = 'Erro fatal de matemática: não é possível dividir por zero.';
    CQ.tone(180, 135, 'sawtooth');
  }
}
function calcKey(k) {
  if (calc.cur === 'Erro' && k !== 'C') { calc.cur = '0'; calc.fresh = true; }
  calc.warning = '';
  if (/^[0-9]$/.test(k)) { calc.cur = calc.fresh || calc.cur === '0' ? k : calc.cur + k; calc.fresh = false; }
  else if (k === ',') { if (calc.fresh) { calc.cur = '0,'; calc.fresh = false; } else if (!calc.cur.includes(',')) calc.cur += ','; }
  else if (k === 'C') { Object.assign(calc, {cur: '0', acc: null, op: null, fresh: true, hadOp: false}); }
  else if (k === '⌫') { calc.cur = calc.cur.length > 1 && !calc.fresh ? calc.cur.slice(0, -1) : '0'; if (calc.cur === '-') calc.cur = '0'; }
  else if (['+', '−', '×', '÷'].includes(k)) {
    if (calc.op && !calc.fresh) {
      const b = calcNum(calc.cur), expr = `${calcFmt(calc.acc)} ${calc.op} ${calcFmt(b)}`, badDiv = calc.op === '÷' && b === 0;
      const r = calcApply(calc.acc, calc.op, b);
      if (!isFinite(r)) { calcError(expr, badDiv); return; }
      calc.acc = r; calc.cur = calcFmt(r); calc.hadOp = true;
    } else calc.acc = calcNum(calc.cur);
    calc.op = k; calc.fresh = true;
  } else if (k === '=') {
    if (!calc.op) return;
    const b = calcNum(calc.cur), expr = `${calcFmt(calc.acc)} ${calc.op} ${calcFmt(b)}`, badDiv = calc.op === '÷' && b === 0;
    const r = calcApply(calc.acc, calc.op, b);
    if (!isFinite(r)) { calcError(expr, badDiv); return; }
    calc.cur = calcFmt(r); calc.hist.unshift(`${expr} = ${calc.cur}`); calc.hist = calc.hist.slice(0, 6); calc.acc = null; calc.op = null; calc.fresh = true;
    CQ.bus.emit('calc:result', {value: r, expr, hadOp: true}); calc.hadOp = false;
  }
}
function calcDraw(w) {
  const d = w.body.querySelector('#calc-disp'); if (d) d.textContent = calc.cur;
  const h = w.body.querySelector('#calc-hist'); if (h) h.innerHTML = calc.hist.map(x => `<li>${E(x)}</li>`).join('');
  const o = w.body.querySelector('#calc-op'); if (o) o.textContent = calc.op && calc.acc !== null ? `${calcFmt(calc.acc)} ${calc.op}` : ' ';
  const warn = w.body.querySelector('#calc-warning'); if (warn) { warn.textContent = calc.warning; warn.hidden = !calc.warning; }
  const ui = w.body.querySelector('.calc'); if (ui) { ui.classList.remove('calc-glitch'); if (calc.warning) { void ui.offsetWidth; ui.classList.add('calc-glitch'); } }
}
const CALC_KEYS = [['C', 'fn'], ['⌫', 'fn'], ['÷', 'op'], ['×', 'op'], ['7'], ['8'], ['9'], ['−', 'op'], ['4'], ['5'], ['6'], ['+', 'op'], ['1'], ['2'], ['3'], ['=', 'eq', 2], ['0'], [','], ];
A.calc = {title: 'Calculadora', icon: 'assets/icons/calculadora.svg', bodyClass: 'flush', maxDefault: false, w: 340, h: 520, persistent: true,
  render(w) {
    w.body.innerHTML = `<div class="calc" tabindex="0" aria-label="Calculadora"><div class="calc-op" id="calc-op"> </div><div class="calc-disp" id="calc-disp" role="status" aria-live="polite">${E(calc.cur)}</div><div id="calc-warning" class="calc-warning" role="alert" hidden></div><div class="calc-keys">${CALC_KEYS.map(([k, c, span]) => `<button type="button" class="ck ${c || ''}" ${span ? `style="grid-row:span ${span}"` : ''} data-act="calc-key" data-k="${k}" aria-label="${{'⌫': 'Apagar', '÷': 'Dividir', '×': 'Multiplicar', '−': 'Subtrair', '+': 'Somar', '=': 'Igual', ',': 'Vírgula', C: 'Limpar'}[k] || k}">${k}</button>`).join('')}</div><ol class="calc-hist" id="calc-hist" aria-label="Histórico"></ol></div>`;
    calcDraw(w); w.setTitle('Calculadora'); w.setStatus('Teclado: números, + - * / Enter Esc', '');
    if (!w._bound) { w._bound = true;
      w.body.addEventListener('click', e => { const b = e.target.closest('[data-act="calc-key"]'); if (b) { calcKey(b.dataset.k); calcDraw(w); } });
      w.body.addEventListener('keydown', e => { const m = {'*': '×', '/': '÷', '-': '−', '+': '+', Enter: '=', '=': '=', Escape: 'C', Backspace: '⌫', ',': ',', '.': ','}; const k = /^[0-9]$/.test(e.key) ? e.key : m[e.key]; if (k) { e.preventDefault(); calcKey(k); calcDraw(w); } });
    }
    setTimeout(() => w.body.querySelector('.calc')?.focus({preventScroll: true}), 30);
  },
  onShow(w) { setTimeout(() => w.body.querySelector('.calc')?.focus({preventScroll: true}), 30); },
  onClose() { Object.assign(calc, {cur: '0', acc: null, op: null, fresh: true, hadOp: false, warning: ''}); }
};

// =============== Paint ===============
const PAL = ['#000000', '#7f7f7f', '#ffffff', '#d33848', '#f08a24', '#f2c744', '#2e9a56', '#2c5db8', '#6a3db0', '#8b5a2b'];
const pt = {tool: 'pencil', color: '#000000', size: 4, mission: null, dirty: false, undo: []};
const CW = 640, CH = 400;
function hexRgb(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); }
function paintCheck(ctx) {
  return (region, color, coverage) => {
    const r = region || {cx: .5, cy: .5, r: .28}; const cx = r.cx * CW, cy = r.cy * CH, rad = Math.min(r.r * CH, r.r * CW) * .8; const tgt = hexRgb(color);
    const x0 = Math.max(0, Math.floor(cx - rad)), y0 = Math.max(0, Math.floor(cy - rad)), w = Math.min(CW - x0, Math.ceil(rad * 2)), h = Math.min(CH - y0, Math.ceil(rad * 2));
    const d = ctx.getImageData(x0, y0, w, h).data; let tot = 0, ok = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const dx = x0 + x - cx, dy = y0 + y - cy; if (dx * dx + dy * dy > rad * rad) continue; tot++; const i = (y * w + x) * 4; if (Math.abs(d[i] - tgt[0]) + Math.abs(d[i + 1] - tgt[1]) + Math.abs(d[i + 2] - tgt[2]) < 60) ok++; }
    const ratio = tot ? ok / tot : 0; return {ok: ratio >= coverage, ratio};
  };
}
function floodFill(ctx, x, y, hex) {
  const img = ctx.getImageData(0, 0, CW, CH), d = img.data, idx = (px, py) => (py * CW + px) * 4; x = Math.max(0, Math.min(CW - 1, Math.floor(x))); y = Math.max(0, Math.min(CH - 1, Math.floor(y)));
  const t = [d[idx(x, y)], d[idx(x, y) + 1], d[idx(x, y) + 2]], n = hexRgb(hex); if (Math.abs(t[0] - n[0]) + Math.abs(t[1] - n[1]) + Math.abs(t[2] - n[2]) < 6) return;
  const same = i => Math.abs(d[i] - t[0]) + Math.abs(d[i + 1] - t[1]) + Math.abs(d[i + 2] - t[2]) < 60; const stack = [[x, y]]; const seen = new Uint8Array(CW * CH);
  while (stack.length) { const [px, py] = stack.pop(); if (px < 0 || py < 0 || px >= CW || py >= CH || seen[py * CW + px]) continue; const i = idx(px, py); if (!same(i)) continue; seen[py * CW + px] = 1; d[i] = n[0]; d[i + 1] = n[1]; d[i + 2] = n[2]; d[i + 3] = 255; stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]); }
  ctx.putImageData(img, 0, 0);
}
function paintTemplate(ctx, m) {
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, CW, CH); const r = m.region || {cx: .5, cy: .5, r: .28};
  ctx.strokeStyle = '#000'; ctx.lineWidth = 5; ctx.beginPath(); if ((m.shape || 'circle') === 'circle') ctx.arc(r.cx * CW, r.cy * CH, r.r * CH, 0, Math.PI * 2); else ctx.rect(r.cx * CW - r.r * CH, r.cy * CH - r.r * CH, r.r * CH * 2, r.r * CH * 2); ctx.stroke();
}
A.paint = {title: 'Paint', icon: 'assets/icons/paint.svg', bodyClass: 'flush', maxDefault: false, w: 760, h: 620, persistent: true,
  render(w, p) {
    pt.mission = p?.mission || pt.mission;
    w.body.innerHTML = `<div class="paint"><div class="pt-tools" role="toolbar" aria-label="Ferramentas"><div class="pt-group">${[['pencil', 'Lápis'], ['eraser', 'Borracha'], ['line', 'Linha'], ['rect', 'Retângulo'], ['fill', 'Balde']].map(([k, n]) => `<button type="button" class="chrome-button tiny ${pt.tool === k ? 'primary' : ''}" data-act="pt-tool" data-tool="${k}" aria-pressed="${pt.tool === k}">${n}</button>`).join('')}</div><div class="pt-group pal" role="group" aria-label="Cores">${PAL.map(c => `<button type="button" class="sw ${pt.color === c ? 'on' : ''}" style="background:${c}" data-act="pt-color" data-color="${c}" aria-label="Cor ${c}" aria-pressed="${pt.color === c}"></button>`).join('')}</div><label class="pt-size">Tamanho <input type="range" min="1" max="24" value="${pt.size}" data-act="pt-size" aria-label="Tamanho do pincel"></label><div class="pt-group"><button type="button" class="chrome-button tiny" data-act="pt-undo">Desfazer</button><button type="button" class="chrome-button tiny" data-act="pt-clear">Limpar</button><button type="button" class="chrome-button tiny" data-act="pt-save">Salvar</button><button type="button" class="chrome-button tiny" data-act="pt-export">Exportar PNG</button></div></div><div class="pt-wrap"><canvas id="pt-canvas" width="${CW}" height="${CH}" aria-label="Área de desenho"></canvas></div></div>`;
    const cv = w.body.querySelector('#pt-canvas'), ctx = cv.getContext('2d', {willReadFrequently: true});
    if (pt.saved) ctx.putImageData(pt.saved, 0, 0); else if (pt.mission) paintTemplate(ctx, pt.mission); else { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, CW, CH); }
    w._ctx = ctx; w.setTitle('Paint'); w.setStatus(pt.mission ? 'Missão: preencha a forma com o balde.' : 'Desenhe com o mouse ou o dedo.', pt.dirty ? 'Alterações não salvas' : '');
    if (!w._bound) { w._bound = true; bindPaint(w); }
    bindCanvas(w, cv, ctx);
  },
  onParams(w, p) { if (p?.mission) { pt.mission = p.mission; pt.saved = null; WM.get('paint') && A.paint.render(w, p); } },
  isDirty: () => pt.dirty, dirtyLabel: () => 'Paint: desenho não salvo', save: w => paintSave(w),
  async beforeClose(w) { if (!pt.dirty) return true; const r = await CQ.ui.modal({title: 'Paint', body: '<p>Salvar o desenho antes de fechar?</p>', dismiss: 'cancel', buttons: [{label: 'Cancelar', value: 'cancel'}, {label: 'Não salvar', value: 'discard', danger: true}, {label: 'Salvar', value: 'save', primary: true}]}); if (r === 'save') return (await paintSave(w)) !== false; return r === 'discard'; },
  onClose() { pt.saved = null; pt.mission = null; pt.dirty = false; pt.undo = []; }
};
async function paintSave(w) {
  const name = await CQ.ui.prompt('Salvar desenho', 'Nome do arquivo PNG (será salvo em Imagens):', 'Desenho.png'); if (!name) return false;
  const path = V.joinP('C:\\ClaQui\\Imagens', /\.png$/i.test(name.trim()) ? name.trim() : name.trim() + '.png');
  const blob = await new Promise(res => w.body.querySelector('#pt-canvas').toBlob(res, 'image/png'));
  try { await V.writeBlob(path, blob, 'image/png'); pt.dirty = false; w.setStatus('Salvo em ' + path, ''); CQ.notify('Desenho salvo em Imagens.'); return true; } catch (e) { CQ.ui.alert('Não foi possível salvar', `<p>${E(e.message)}</p>`); return false; }
}
function bindPaint(w) {
  w.body.addEventListener('click', async e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act, ctx = w._ctx;
    if (a === 'pt-tool') { pt.tool = b.dataset.tool; pt.saved = ctx.getImageData(0, 0, CW, CH); WM.get('paint') && A.paint.render(w); }
    else if (a === 'pt-color') { pt.color = b.dataset.color; pt.saved = ctx.getImageData(0, 0, CW, CH); A.paint.render(w); }
    else if (a === 'pt-undo') { const u = pt.undo.pop(); if (u) { ctx.putImageData(u, 0, 0); pt.saved = u; } }
    else if (a === 'pt-clear') { pt.undo.push(ctx.getImageData(0, 0, CW, CH)); if (pt.mission) paintTemplate(ctx, pt.mission); else { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, CW, CH); } pt.dirty = true; }
    else if (a === 'pt-save') paintSave(w);
    else if (a === 'pt-export') { const url = w.body.querySelector('#pt-canvas').toDataURL('image/png'); const l = document.createElement('a'); l.href = url; l.download = 'desenho.png'; document.body.append(l); l.click(); l.remove(); CQ.notify('PNG exportado.'); }
  });
  w.body.addEventListener('input', e => { if (e.target.dataset.act === 'pt-size') pt.size = Number(e.target.value); });
}
function bindCanvas(w, cv, ctx) {
  let down = null; const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * CW / r.width, (e.clientY - r.top) * CH / r.height]; };
  const notify = () => { pt.dirty = true; pt.saved = ctx.getImageData(0, 0, CW, CH); CQ.bus.emit('paint:draw', {check: paintCheck(ctx)}); w.setStatus(w.el.querySelector('.s-left').textContent, 'Alterações não salvas'); };
  cv.addEventListener('pointerdown', e => {
    e.preventDefault(); const [x, y] = pos(e); pt.undo.push(ctx.getImageData(0, 0, CW, CH)); if (pt.undo.length > 12) pt.undo.shift();
    if (pt.tool === 'fill') { floodFill(ctx, x, y, pt.color); notify(); return; }
    down = {x, y, id: e.pointerId, base: ctx.getImageData(0, 0, CW, CH)}; try { cv.setPointerCapture(e.pointerId); } catch {}
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = pt.size; ctx.strokeStyle = pt.tool === 'eraser' ? '#ffffff' : pt.color;
    if (pt.tool === 'pencil' || pt.tool === 'eraser') { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + .01, y + .01); ctx.stroke(); }
  });
  cv.addEventListener('pointermove', e => {
    if (!down || e.pointerId !== down.id) return; const [x, y] = pos(e);
    if (pt.tool === 'pencil' || pt.tool === 'eraser') { ctx.beginPath(); ctx.moveTo(down.x, down.y); ctx.lineTo(x, y); ctx.stroke(); down.x = x; down.y = y; }
    else { ctx.putImageData(down.base, 0, 0); ctx.beginPath(); if (pt.tool === 'line') { ctx.moveTo(down.x, down.y); ctx.lineTo(x, y); } else ctx.rect(down.x, down.y, x - down.x, y - down.y); ctx.stroke(); }
  });
  const up = e => { if (!down || e.pointerId !== down.id) return; down = null; notify(); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
}

// =============== Calendário ===============
const cal = {y: null, m: null, sel: null};
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const dkey = (y, m, d) => `${y}-${CQ.pad2(m + 1)}-${CQ.pad2(d)}`;
A.calendar = {title: 'Calendário', icon: 'assets/icons/calendario.svg', bodyClass: 'page', maxDefault: false, w: 700, h: 600, persistent: true,
  render(w) {
    const now = (() => { const p = CQ.clock.parts(); return {getFullYear: () => p.y, getMonth: () => p.mo, getDate: () => p.d}; })(); if (cal.y === null) { cal.y = now.getFullYear(); cal.m = now.getMonth(); cal.sel = dkey(cal.y, cal.m, now.getDate()); }
    const notes = CQ.store.read(CQ.KEYS.CAL, {}); const first = new Date(cal.y, cal.m, 1).getDay(), days = new Date(cal.y, cal.m + 1, 0).getDate();
    const cells = []; for (let i = 0; i < first; i++) cells.push('<span class="cd empty"></span>'); for (let d = 1; d <= days; d++) { const k = dkey(cal.y, cal.m, d), today = k === dkey(now.getFullYear(), now.getMonth(), now.getDate()); cells.push(`<button type="button" class="cd ${k === cal.sel ? 'on' : ''} ${today ? 'today' : ''} ${notes[k] ? 'has' : ''}" data-act="cal-day" data-key="${k}" aria-label="${d} de ${MESES[cal.m]}${notes[k] ? ', com nota' : ''}" aria-pressed="${k === cal.sel}">${d}</button>`); }
    w.body.innerHTML = `<div class="cal"><div class="cal-head"><button type="button" class="chrome-button tiny" data-act="cal-prev" aria-label="Mês anterior">←</button><h2>${MESES[cal.m]} de ${cal.y}</h2><button type="button" class="chrome-button tiny" data-act="cal-next" aria-label="Próximo mês">→</button><button type="button" class="chrome-button tiny" data-act="cal-today">Hoje</button></div><div class="cal-grid" role="grid">${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(x => `<span class="cw">${x}</span>`).join('')}${cells.join('')}</div><label class="cal-note">Nota para ${cal.sel.split('-').reverse().join('/')}<textarea id="cal-text" class="np-text selectable" rows="4" maxlength="500">${E(notes[cal.sel] || '')}</textarea></label></div>`;
    w.setTitle('Calendário'); w.setStatus('Notas guardadas apenas neste navegador.', '');
    if (!w._bound) { w._bound = true;
      w.body.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act; if (a === 'cal-prev') { cal.m--; if (cal.m < 0) { cal.m = 11; cal.y--; } } else if (a === 'cal-next') { cal.m++; if (cal.m > 11) { cal.m = 0; cal.y++; } } else if (a === 'cal-today') { cal.y = null; } else if (a === 'cal-day') cal.sel = b.dataset.key; else return; A.calendar.render(w); });
      w.body.addEventListener('input', e => { if (e.target.id === 'cal-text') { const n = CQ.store.read(CQ.KEYS.CAL, {}); if (e.target.value.trim()) n[cal.sel] = e.target.value; else delete n[cal.sel]; CQ.store.write(CQ.KEYS.CAL, n); } });
    }
  }
};

// =============== Relógio ===============
let clockTimer = 0;
A.clock = {title: 'Relógio', icon: 'assets/icons/relogio.svg', bodyClass: 'page', maxDefault: false, w: 520, h: 520, persistent: true,
  render(w) {
    w.data.off ??= 0;
    w.body.innerHTML = `<div class="clockapp"><svg viewBox="-60 -60 120 120" class="analog" role="img" aria-label="Relógio analógico"><circle r="56" fill="#fff" stroke="#172b51" stroke-width="3"/>${Array.from({length: 12}, (_, i) => `<line x1="0" y1="-50" x2="0" y2="-46" stroke="#172b51" stroke-width="2" transform="rotate(${i * 30})"/>`).join('')}<line id="h-h" y2="-28" stroke="#172b51" stroke-width="4" stroke-linecap="round"/><line id="h-m" y2="-40" stroke="#172b51" stroke-width="3" stroke-linecap="round"/><line id="h-s" y2="-44" stroke="#d33848" stroke-width="1.5"/></svg><div class="digital" id="clk-dig" role="timer" aria-live="off">--:--:--</div><div class="clk-date" id="clk-date"></div><fieldset class="clk-sim"><legend>Relógio simulado (não altera o seu aparelho)</legend><label>Deslocamento: <b id="off-v">${w.data.off}</b> h<input type="range" min="-12" max="12" step="1" value="${w.data.off}" data-act="clk-off" aria-label="Deslocamento em horas"></label></fieldset></div>`;
    w.setTitle('Relógio'); w.setStatus('Hora do sistema (' + (CQ.clock.isManual() ? 'manual' : 'dispositivo') + ')', '');
    if (!w._bound) { w._bound = true; w.body.addEventListener('input', e => { if (e.target.dataset.act === 'clk-off') { w.data.off = Number(e.target.value); w.body.querySelector('#off-v').textContent = w.data.off; tick(w); } }); }
    clearInterval(clockTimer); tick(w); clockTimer = setInterval(() => tick(w), 500);
  },
  onClose() { clearInterval(clockTimer); }
};
function tick(w) {
  const ts = CQ.clock.now() + (w.data.off || 0) * 3600000, p = CQ.clock.parts(ts), s = p.S + (((ts % 1000) + 1000) % 1000) / 1000, m = p.M + s / 60, h = p.H % 12 + m / 60;
  const set = (id, a) => { const el = w.body.querySelector(id); if (el) el.setAttribute('transform', `rotate(${a})`); }; set('#h-h', h * 30); set('#h-m', m * 6); set('#h-s', s * 6);
  const dig = w.body.querySelector('#clk-dig'); if (dig) dig.textContent = CQ.clock.fmtTime(ts, true); const dt = w.body.querySelector('#clk-date'); if (dt) dt.textContent = CQ.clock.fmtLong(ts);
}

// =============== Reprodutor (jingles originais sintetizados) ===============
const N = {C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, _: 0};
const TRACKS = [
  {id: 't1', name: 'Abertura do ClaQui', notes: 'C4 E4 G4 C5 G4 E4 G4 C5 E5 C5 G4 E4 C4 _ G4 C5'.split(' '), bpm: 150},
  {id: 't2', name: 'Pipoca no Domingo', notes: 'E4 E4 G4 E4 A4 G4 E4 D4 C4 D4 E4 G4 A4 G4 E4 _'.split(' '), bpm: 130},
  {id: 't3', name: 'Tela Azul (relaxante)', notes: 'A4 _ E4 _ C4 _ E4 _ D4 F4 A4 F4 D4 _ _ _'.split(' '), bpm: 90}
];
const pl = {cur: null, timer: 0, idx: 0};
function plStop() { clearTimeout(pl.timer); pl.cur = null; pl.idx = 0; }
function plPlay(w, t) {
  plStop(); pl.cur = t.id; const step = 60000 / t.bpm / 2; const loop = () => { if (pl.cur !== t.id) return; const n = t.notes[pl.idx % t.notes.length]; if (N[n]) CQ.tone(N[n], step * .9, 'triangle'); pl.idx++; if (pl.idx >= t.notes.length * 2) { plStop(); if (WM.isOpen('player')) WM.refresh('player'); return; } pl.timer = setTimeout(loop, step); };
  loop(); WM.refresh('player');
}
A.player = {title: 'Reprodutor', icon: 'assets/icons/reprodutor.svg', bodyClass: 'page', maxDefault: false, w: 560, h: 460, persistent: false,
  render(w) {
    if (!w._bound) { w._bound = true; w.body.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const t = TRACKS.find(x => x.id === b.dataset.id); if (b.dataset.act === 'pl-play' && t) { const s = CQ.prefs.sound; if (!s) { CQ.notify('O som está desligado em Configurações.'); return; } plPlay(w, t); } else if (b.dataset.act === 'pl-stop') { plStop(); WM.refresh('player'); } }); }
    w.setTitle('Reprodutor'); w.setStatus(CQ.prefs.sound ? 'Trilhas originais do ClaQui OS' : 'Som desligado', '');
    w.body.innerHTML = `<div class="setup-simple"><h1>Reprodutor</h1><p>Trilhas originais, geradas pelo próprio sistema. Não usa internet nem arquivos de terceiros.</p><div class="library-list">${TRACKS.map(t => `<div class="lib-item"><div><strong>${E(t.name)}</strong><div class="lib-meta">${t.notes.length} notas • ${t.bpm} bpm</div></div><div class="lib-actions">${pl.cur === t.id ? `<button type="button" class="chrome-button tiny" data-act="pl-stop">■ Parar</button>` : `<button type="button" class="chrome-button tiny primary" data-act="pl-play" data-id="${t.id}">▶ Tocar</button>`}</div></div>`).join('')}</div></div>`;
  },
  onClose() { plStop(); }, onHide() {}
};
})();
