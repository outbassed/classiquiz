/* ClaQui OS — touchpad virtual opcional e customizável (celular e tablet). Licença: MIT.
   Formatos, tamanho, posição (esquerda/centro/direita/arrastável), opacidade, sensibilidade, aceleração, botões integrados ou em barra,
   toque para clicar, clique direito, rolagem com dois dedos, segurar e arrastar, recolher e perfis salvos. Desativado por padrão. */
(() => {
'use strict';
const CQ = window.CQ, app = () => document.getElementById('app');
const touchDevice = () => matchMedia('(pointer:coarse)').matches || /Android|iPad|iPhone|Mobile|Tablet/i.test(navigator.userAgent);
const SHAPES = {classico: ['Clássico retangular', 220, 140], arredondado: ['Arredondado', 220, 140], quadrado: ['Quadrado', 170, 170], circular: ['Circular', 170, 170], panoramico: ['Panorâmico', 300, 96], flutuante: ['Flutuante', 190, 120]};
const LIM = {w: [120, 340], h: [70, 230]};
const CFG_KEYS = ['touchpadShape', 'touchpadW', 'touchpadH', 'touchpadPosition', 'touchpadX', 'touchpadY', 'touchpadOpacity', 'touchpadSensitivity', 'touchpadAccel', 'touchpadTapClick', 'touchpadButtons'];
let x = innerWidth * .48, y = innerHeight * .42, held = false, downTarget = null, lastHover = null, moved = false;
const pointers = new Map();
const el = document.createElement('div'); el.id = 'cq-touchpad'; el.hidden = true; el.setAttribute('role', 'group'); el.setAttribute('aria-label', 'Touchpad virtual ClaQui OS');
el.innerHTML = `<div class="cq-touchpad-title" data-tp="handle" title="Arraste para mover o touchpad"><span>▣ TOUCHPAD</span><button type="button" data-tp="fold" title="Recolher touchpad" aria-label="Recolher touchpad">−</button></div>
<div class="cq-touchpad-body"><div class="cq-touchpad-surface" data-tp="surface" aria-label="Mova o dedo para controlar o ponteiro. Toque para clicar."><div class="cq-touchpad-int"><button type="button" data-tp="left" aria-label="Botão esquerdo">Esq.</button><button type="button" data-tp="right" aria-label="Botão direito">Dir.</button></div></div>
<div class="cq-touchpad-buttons"><button type="button" data-tp="left">Esquerdo</button><button type="button" data-tp="hold" aria-pressed="false">Segurar</button><button type="button" data-tp="right">Direito</button></div></div>`;
const dot = document.createElement('img'); dot.id = 'cq-touch-cursor'; dot.alt = ''; dot.src = 'assets/cursors/classico-normal-32.png'; dot.setAttribute('aria-hidden', 'true'); dot.hidden = true;
const holdBtn = () => el.querySelector('[data-tp="hold"]');
function targetAt() { const hidden = dot.hidden; dot.hidden = true; const t = document.elementFromPoint(x, y); dot.hidden = hidden; return t?.closest?.('#cq-touchpad') ? null : t; }
function pointer(t, name, button = 0, buttons = held ? 1 : 0) { if (!t) return; t.dispatchEvent(new PointerEvent(name, {bubbles: true, cancelable: true, composed: true, pointerId: 909, pointerType: 'mouse', isPrimary: true, clientX: x, clientY: y, button, buttons})); }
function updateHover() { const t = targetAt(); if (!t) return; if (lastHover !== t) { if (lastHover) { pointer(lastHover, 'pointerout'); pointer(lastHover, 'pointerleave'); } pointer(t, 'pointerover'); pointer(t, 'pointerenter'); lastHover = t; } pointer(t, 'pointermove'); }
function updateDot() { x = Math.min(innerWidth - 12, Math.max(10, x)); y = Math.min(innerHeight - 12, Math.max(10, y)); dot.style.left = x + 'px'; dot.style.top = y + 'px'; const scheme = CQ.sys.get('mouseScheme') || 'classico', size = CQ.sys.get('mouseSize') || 32; dot.src = `assets/cursors/${scheme}-normal-${size}.png`; dot.style.width = size + 'px'; updateHover(); }
function pointerDown() { const t = targetAt(); downTarget = t; pointer(t, 'pointerdown'); t?.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, buttons: 1})); }
function pointerUp(click = true) { const t = targetAt(); if (!t) return; pointer(t, 'pointerup'); t.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, clientX: x, clientY: y, button: 0, buttons: 0})); if (click && downTarget === t) t.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, buttons: 0, detail: 1})); downTarget = null; }
function releaseHold() { if (held) { pointerUp(false); held = false; holdBtn().setAttribute('aria-pressed', 'false'); return true; } return false; }
function left() { if (releaseHold()) return; pointerDown(); pointerUp(true); }
function right() { releaseHold(); const t = targetAt(); if (!t) return; t.dispatchEvent(new MouseEvent('contextmenu', {bubbles: true, cancelable: true, clientX: x, clientY: y, button: 2, buttons: 2})); }
function toggleHold() { held = !held; holdBtn().setAttribute('aria-pressed', String(held)); if (held) pointerDown(); else pointerUp(false); }
function scrollUnder(dy) { let node = targetAt(); for (; node && node !== document.body; node = node.parentElement) { const cs = getComputedStyle(node); if (/auto|scroll/.test(cs.overflowY) && node.scrollHeight > node.clientHeight + 2) { node.scrollTop += dy; return; } } }

// ---------- aparência: formato, tamanho, posição ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function dims() {
  const sh = SHAPES[CQ.sys.get('touchpadShape')] || SHAPES.classico, W = app()?.clientWidth || innerWidth, H = app()?.clientHeight || innerHeight;
  let w = Number(CQ.sys.get('touchpadW')) || sh[1], h = Number(CQ.sys.get('touchpadH')) || sh[2];
  w = clamp(w, LIM.w[0], Math.min(LIM.w[1], W - 16)); h = clamp(h, LIM.h[0], Math.min(LIM.h[1], Math.max(LIM.h[0], H * .28)));   // nunca ocupa mais que ~metade da tela com título e botões
  if (CQ.sys.get('touchpadShape') === 'circular' || CQ.sys.get('touchpadShape') === 'quadrado') h = w = Math.min(w, h || w) || w;
  return {w, h};
}
function place() {
  const A = app(); if (!A) return; const pos = CQ.sys.get('touchpadPosition') || 'right', W = A.clientWidth, H = A.clientHeight, tb = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-h')) || 52;
  const bw = el.offsetWidth || 230, bh = el.offsetHeight || 190; let px, py;
  if (pos === 'custom') { px = clamp((Number(CQ.sys.get('touchpadX')) >= 0 ? CQ.sys.get('touchpadX') : .5) * (W - bw), 4, W - bw - 4); py = clamp((Number(CQ.sys.get('touchpadY')) >= 0 ? CQ.sys.get('touchpadY') : 1) * (H - tb - bh), 4, H - tb - bh - 4); }
  else { px = pos === 'left' ? 8 : pos === 'center' ? (W - bw) / 2 : W - bw - 8; py = H - tb - bh - 10; }
  el.style.left = px + 'px'; el.style.top = Math.max(4, py) + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto';
}
function apply() {
  const on = touchDevice() && CQ.sys.get('touchpadEnabled') === true; el.hidden = !on; dot.hidden = !on;
  if (!on) { held = false; downTarget = null; lastHover = null; return; }
  const shape = SHAPES[CQ.sys.get('touchpadShape')] ? CQ.sys.get('touchpadShape') : 'classico', d = dims();
  el.dataset.shape = shape; el.dataset.folded = CQ.sys.get('touchpadFolded') ? 'true' : 'false'; el.dataset.buttons = CQ.sys.get('touchpadButtons') === 'bar' ? 'bar' : 'integrated';
  el.style.setProperty('--tp-opacity', String(CQ.sys.get('touchpadOpacity') ?? .88)); el.style.setProperty('--tp-w', d.w + 'px'); el.style.setProperty('--tp-h', d.h + 'px');
  place(); updateDot();
}
// ---------- gestos na superfície ----------
const panel = el.querySelector('[data-tp="surface"]'); panel.style.touchAction = 'none';
panel.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return; e.preventDefault(); try { panel.setPointerCapture(e.pointerId); } catch {} pointers.set(e.pointerId, {x: e.clientX, y: e.clientY, moved: false, at: Date.now()}); moved = false; });
panel.addEventListener('pointermove', e => {
  const p = pointers.get(e.pointerId); if (!p) return; e.preventDefault(); const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; if (Math.abs(dx) + Math.abs(dy) > 3) { p.moved = true; moved = true; }
  if (pointers.size > 1) { scrollUnder(-dy * 2); return; }
  const sens = Number(CQ.sys.get('touchpadSensitivity')) || 1, accel = Number(CQ.sys.get('touchpadAccel')) || 0, speed = Math.hypot(dx, dy), gain = sens * (1 + accel * clamp(speed / 10, 0, 2));
  x += dx * gain; y += dy * gain; updateDot();
});
function end(e) { const p = pointers.get(e.pointerId); if (!p) return; pointers.delete(e.pointerId); if (CQ.sys.get('touchpadTapClick') !== false && !p.moved && !moved && Date.now() - p.at < 400 && pointers.size === 0) left(); }
panel.addEventListener('pointerup', end); panel.addEventListener('pointercancel', e => pointers.delete(e.pointerId));
el.addEventListener('click', e => { const btn = e.target.closest('[data-tp]'); if (!btn || btn === panel || btn.dataset.tp === 'handle') return; e.stopPropagation(); e.preventDefault(); const act = btn.dataset.tp; if (act === 'left') left(); if (act === 'right') right(); if (act === 'hold') toggleHold(); if (act === 'fold') { CQ.sys.set({touchpadFolded: !CQ.sys.get('touchpadFolded')}); } });
// mover o touchpad: arrastar a barra de título (vira posição personalizada). Nunca sai da tela nem cobre a barra de tarefas.
let mv = null; const handle = el.querySelector('[data-tp="handle"]'); handle.style.touchAction = 'none';
handle.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; mv = {id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: el.offsetLeft, oy: el.offsetTop}; try { handle.setPointerCapture(e.pointerId); } catch {} e.preventDefault(); });
handle.addEventListener('pointermove', e => { if (!mv || e.pointerId !== mv.id) return; const s = CQ.os.scale(), A = app(), tb = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-h')) || 52; const nx = clamp(mv.ox + (e.clientX - mv.sx) / s, 4, A.clientWidth - el.offsetWidth - 4), ny = clamp(mv.oy + (e.clientY - mv.sy) / s, 4, A.clientHeight - tb - el.offsetHeight - 4); el.style.left = nx + 'px'; el.style.top = ny + 'px'; mv.nx = nx; mv.ny = ny; });
const mvEnd = e => { if (!mv || e.pointerId !== mv.id) return; const m = mv; mv = null; if (m.nx == null) return; const A = app(), tb = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-h')) || 52; CQ.sys.set({touchpadPosition: 'custom', touchpadX: A.clientWidth - el.offsetWidth > 0 ? m.nx / (A.clientWidth - el.offsetWidth) : .5, touchpadY: A.clientHeight - tb - el.offsetHeight > 0 ? m.ny / (A.clientHeight - tb - el.offsetHeight) : 1}); };
handle.addEventListener('pointerup', mvEnd); handle.addEventListener('pointercancel', mvEnd);
document.addEventListener('keydown', e => { if (e.key === 'Escape') releaseHold(); });
window.addEventListener('resize', () => { apply(); }); window.addEventListener('orientationchange', () => setTimeout(apply, 150));
app()?.append(el); document.body.append(dot);
// ---------- perfis ----------
const profiles = () => { const p = CQ.sys.get('touchpadProfiles'); return p && typeof p === 'object' ? p : {}; };
function saveProfile(name) { name = String(name || '').trim().slice(0, 24); if (!name) return false; const all = profiles(), cfg = {}; for (const k of CFG_KEYS) cfg[k] = CQ.sys.get(k); const names = Object.keys(all); if (!all[name] && names.length >= 8) delete all[names[0]]; all[name] = cfg; CQ.sys.set({touchpadProfiles: all}); return true; }
function loadProfile(name) { const cfg = profiles()[name]; if (!cfg) return false; const patch = {}; for (const k of CFG_KEYS) if (k in cfg) patch[k] = cfg[k]; CQ.sys.set(patch); return true; }
function deleteProfile(name) { const all = profiles(); if (!all[name]) return false; delete all[name]; CQ.sys.set({touchpadProfiles: all}); return true; }
CQ.touchpad = {apply, left, right, isAvailable: touchDevice, shapes: SHAPES, limits: LIM, profiles, saveProfile, loadProfile, deleteProfile, dims, el};
CQ.bus.on('sys:change', p => { if (Object.keys(p).some(k => k.startsWith('touchpad') || k === 'mouseScheme' || k === 'mouseSize')) apply(); });
CQ.bus.on('os:scale', () => apply());
apply();
})();
