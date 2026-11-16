/* ClaQui OS — Paciência (Klondike, compra 1 carta). Feita para toque: toque para selecionar e mover, toque duplo/toque na selecionada manda para a fundação,
   arraste cartas e sequências; teclado e mouse funcionam igual. Salva a partida automaticamente. Licença: MIT. */
(() => {
'use strict';
const CQ = window.CQ, E = CQ.E, OS = CQ.os, WM = OS.wm, A = CQ.apps;
const SU = ['♠', '♥', '♦', '♣'], SUN = ['espadas', 'copas', 'ouros', 'paus'], RK = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'], KEY = 'classiquiz.v1.solitaire';
const red = c => c.s === 1 || c.s === 2, name = c => `${RK[c.r]} de ${SUN[c.s]}`;
let G = null, sel = null, drag = null, auto = 0;

// ---------- regras (puras) ----------
function deal(rng = Math.random) {
  const deck = []; for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) deck.push({s, r, up: false});
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  const tab = Array.from({length: 7}, () => []); let k = 0;
  for (let c = 0; c < 7; c++) for (let r = 0; r <= c; r++) { const x = deck[k++]; x.up = r === c; tab[c].push(x); }
  return {stock: deck.slice(k).map(c => ({...c, up: false})), waste: [], found: [[], [], [], []], tab, moves: 0, won: false, undo: []};
}
const pileOf = (g, id) => id === 's' ? g.stock : id === 'w' ? g.waste : id[0] === 'f' ? g.found[+id[1]] : g.tab[+id[1]];
function canPlace(g, cards, to) {
  const c = cards[0]; if (!c) return false;
  if (to[0] === 'f') { if (cards.length !== 1) return false; const f = g.found[+to[1]], top = f[f.length - 1]; return top ? top.s === c.s && c.r === top.r + 1 : c.r === 1; }
  if (to[0] === 't') { const t = g.tab[+to[1]], top = t[t.length - 1]; return top ? top.up && red(top) !== red(c) && top.r === c.r + 1 : c.r === 13; }
  return false;
}
const snap = g => JSON.stringify({stock: g.stock, waste: g.waste, found: g.found, tab: g.tab, moves: g.moves});
function pushUndo(g) { g.undo.push(snap(g)); if (g.undo.length > 80) g.undo.shift(); }
function flip(g, id) { const t = pileOf(g, id), top = t[t.length - 1]; if (top && !top.up && id[0] === 't') top.up = true; }
function move(g, from, i, to) {
  const src = pileOf(g, from), cards = src.slice(i); if (!canPlace(g, cards, to) || to === from) return false;
  pushUndo(g); src.splice(i, cards.length); pileOf(g, to).push(...cards); flip(g, from); g.moves++;
  g.won = g.found.every(f => f.length === 13); return true;
}
function drawCard(g) { pushUndo(g); if (g.stock.length) { const c = g.stock.pop(); c.up = true; g.waste.push(c); } else { g.stock = g.waste.reverse().map(c => ({...c, up: false})); g.waste = []; } g.moves++; }
function toFoundation(g, from, i) { const src = pileOf(g, from); if (i !== src.length - 1) return false; for (let f = 0; f < 4; f++) if (move(g, from, i, 'f' + f)) return true; return false; }
function allUp(g) { return !g.stock.length && !g.waste.length && g.tab.every(t => t.every(c => c.up)); }
function undo(g) { const s = g.undo.pop(); if (!s) return false; Object.assign(g, JSON.parse(s)); g.won = false; return true; }
CQ.solitaire = {deal, canPlace, move, drawCard, toFoundation, allUp, undo, pileOf};   // exposto para testes

// ---------- interface ----------
const save = () => { if (G) CQ.store.write(KEY, {stock: G.stock, waste: G.waste, found: G.found, tab: G.tab, moves: G.moves}); };
function load() { const s = CQ.store.read(KEY, null); if (s && s.tab && s.tab.length === 7 && s.found && s.found.length === 4 && s.tab.flat().length + s.stock.length + s.waste.length + s.found.flat().length === 52) return {...s, undo: [], won: false}; return null; }
function layout(w) { const board = w.body.querySelector('.sol'); if (!board) return; const cw = Math.max(34, Math.min(110, (board.clientWidth - 8 * 6) / 7)); board.style.setProperty('--cw', cw + 'px'); board.style.setProperty('--ch', cw * 1.4 + 'px'); board.style.setProperty('--up', cw * .42 + 'px'); board.style.setProperty('--down', cw * .2 + 'px'); }
function cardHtml(c, pile, i, top) {
  const lab = c.up ? name(c) : 'carta virada';
  return `<button type="button" class="sol-card ${c.up ? 'up' : 'down'} ${red(c) ? 'red' : ''} ${isSel(pile, i) ? 'sel' : ''}" data-pile="${pile}" data-i="${i}" style="top:${top}px" aria-label="${E(lab)}" ${c.up ? '' : 'tabindex="-1"'}>${c.up ? `<span class="r">${RK[c.r]}</span><span class="s">${SU[c.s]}</span><span class="big">${SU[c.s]}</span>` : ''}</button>`;
}
const isSel = (pile, i) => sel && sel.pile === pile && i >= sel.i;
function draw(w) {
  const body = w.body.querySelector('.sol-table'); if (!body) return; const cw = parseFloat(w.body.querySelector('.sol').style.getPropertyValue('--cw')) || 48, UP = cw * .42, DN = cw * .2, CH = cw * 1.4;
  const tab = G.tab.map((t, c) => { let y = 0; const html = t.map((x, i) => { const h = cardHtml(x, 't' + c, i, y); y += x.up ? UP : DN; return h; }).join(''); const hgt = Math.max(CH, y - (t.length ? (t[t.length - 1].up ? UP : DN) : 0) + CH); return `<div class="sol-pile tab" data-pile="t${c}" style="min-height:${hgt}px">${html}</div>`; }).join('');
  const found = G.found.map((f, k) => `<div class="sol-pile fnd" data-pile="f${k}"><span class="ph">${SU[k]}</span>${f.length ? cardHtml(f[f.length - 1], 'f' + k, f.length - 1, 0) : ''}</div>`).join('');
  const waste = G.waste.length ? cardHtml(G.waste[G.waste.length - 1], 'w', G.waste.length - 1, 0) : '';
  body.innerHTML = `<div class="sol-top"><div class="sol-pile stock" data-pile="s"><button type="button" class="sol-card ${G.stock.length ? 'down' : 'empty'}" data-pile="s" data-i="0" aria-label="${G.stock.length ? 'Comprar carta (' + G.stock.length + ' no monte)' : 'Monte vazio: reiniciar o monte'}">${G.stock.length ? '' : '↻'}</button></div><div class="sol-pile waste" data-pile="w">${waste}</div><div class="sol-gap"></div>${found}</div><div class="sol-tabs">${tab}</div>`;
  const st = w.body.querySelector('.sol-status'); if (st) st.textContent = `Movimentos: ${G.moves} • Monte: ${G.stock.length}`;
  w.body.querySelector('[data-sol="undo"]').disabled = !G.undo.length; w.body.querySelector('[data-sol="auto"]').hidden = !allUp(G) || G.won;
  w.setStatus(G.won ? 'Você venceu!' : 'Toque numa carta para selecioná-la e toque no destino. Toque de novo na carta para mandá-la à fundação.', G.moves + ' mov.');
}
function after(w) { sel = null; save(); draw(w); if (G.won) win(w); }
function win(w) { CQ.tone(660, 120); CQ.tone(880, 220); CQ.game && CQ.game.statApp && CQ.game.statApp('solitaireWins'); CQ.store.remove(KEY); CQ.ui.confirm('Paciência', `<p><b>Você venceu!</b> Todas as cartas estão nas fundações em ${G.moves} movimentos.</p>`, 'Novo jogo', 'Fechar').then(ok => { if (ok) newGame(w); }); }
function newGame(w) { cancelAnimationFrame(auto); G = deal(); sel = null; CQ.store.remove(KEY); layout(w); draw(w); }
function tapCard(w, pile, i) {
  const c = pileOf(G, pile)[i];
  if (pile === 's') { drawCard(G); return after(w); }
  if (sel) {
    if (sel.pile === pile && sel.i === i) { if (toFoundation(G, pile, i)) after(w); else { sel = null; draw(w); } return; }   // tocar de novo: tenta a fundação
    if (pile[0] !== 'w' && move(G, sel.pile, sel.i, pile)) return after(w);
    if (c && c.up) sel = {pile, i}; else sel = null; draw(w); return;
  }
  if (c && c.up) { sel = {pile, i}; draw(w); }
}
function tapPile(w, pile) { if (!sel) return; if (pile[0] === 'w' || pile === 's') { sel = null; draw(w); return; } if (move(G, sel.pile, sel.i, pile)) after(w); else { sel = null; draw(w); } }
function autoFinish(w) {
  const step = () => { if (!WM.isOpen('solitaire') || G.won) return; let moved = false; for (let c = 0; c < 7 && !moved; c++) { const t = G.tab[c]; if (t.length && toFoundation(G, 't' + c, t.length - 1)) moved = true; } if (moved) { draw(w); auto = requestAnimationFrame(() => setTimeout(step, 70)); if (G.won) { save(); win(w); } } else save(); };
  step();
}
// arrastar (mouse/toque/caneta): move os próprios elementos; o destino é descoberto sob o ponteiro
function dragStart(w, e) {
  const card = e.target.closest('.sol-card.up'); if (!card || e.button > 0) return; const pile = card.dataset.pile, i = +card.dataset.i; if (pile === 's') return;
  const els = [...w.body.querySelectorAll(`.sol-card[data-pile="${pile}"]`)].filter(x => +x.dataset.i >= i);
  drag = {pile, i, id: e.pointerId, x: e.clientX, y: e.clientY, els, moved: false, card};
}
function dragMove(w, e) {
  if (!drag || e.pointerId !== drag.id) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (!drag.moved && Math.hypot(dx, dy) > 7) { drag.moved = true; try { w.body.setPointerCapture(e.pointerId); } catch {} drag.els.forEach(el => { el.classList.add('dragging'); }); }
  if (drag.moved) { const s = OS.scale(); drag.els.forEach(el => { el.style.transform = `translate(${dx / s}px,${dy / s}px)`; }); e.preventDefault(); }
}
function dragEnd(w, e) {
  if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null; try { w.body.releasePointerCapture(e.pointerId); } catch {}
  if (!d.moved) return;                       // foi só um toque: o clique normal trata
  d.els.forEach(el => { el.style.pointerEvents = 'none'; });
  const under = document.elementsFromPoint(e.clientX, e.clientY).map(x => x.closest && x.closest('[data-pile]')).find(x => x && w.body.contains(x) && !d.els.includes(x));
  d.els.forEach(el => { el.style.transform = ''; el.style.pointerEvents = ''; el.classList.remove('dragging'); }); w.data.suppress = performance.now() + 250;
  const to = under && under.dataset.pile; if (to && to !== d.pile && move(G, d.pile, d.i, to)) after(w); else { sel = null; draw(w); }
}
A.solitaire = {title: 'Paciência', icon: 'assets/icons/paciencia.svg', bodyClass: 'page', w: 560, h: 700, persistent: true,
  render(w) {
    G = load() || deal(); sel = null;
    w.body.innerHTML = `<div class="sol" tabindex="0"><div class="sol-bar"><button type="button" class="chrome-button tiny" data-sol="new">Novo jogo</button><button type="button" class="chrome-button tiny" data-sol="undo">↶ Desfazer</button><button type="button" class="chrome-button tiny primary" data-sol="auto" hidden>Completar</button><span class="sol-status muted" role="status"></span></div><div class="sol-table"></div></div>`;
    w.setTitle('Paciência'); layout(w); draw(w);
    w.body.addEventListener('click', e => {
      if (w.data.suppress && performance.now() < w.data.suppress) return;
      const b = e.target.closest('[data-sol]'); if (b) { const k = b.dataset.sol; if (k === 'new') newGame(w); else if (k === 'undo') { if (undo(G)) { sel = null; save(); draw(w); } } else if (k === 'auto') autoFinish(w); return; }
      const c = e.target.closest('.sol-card'); if (c && !c.classList.contains('down') || (c && c.dataset.pile === 's')) { tapCard(w, c.dataset.pile, +c.dataset.i); return; }
      const p = e.target.closest('.sol-pile'); if (p) tapPile(w, p.dataset.pile);
    });
    w.body.addEventListener('dblclick', e => { const c = e.target.closest('.sol-card.up'); if (c && c.dataset.pile !== 's') { if (toFoundation(G, c.dataset.pile, +c.dataset.i)) after(w); } });
    w.body.addEventListener('pointerdown', e => dragStart(w, e)); w.body.addEventListener('pointermove', e => dragMove(w, e)); w.body.addEventListener('pointerup', e => dragEnd(w, e)); w.body.addEventListener('pointercancel', e => { if (drag) { drag.els.forEach(el => { el.style.transform = ''; el.classList.remove('dragging'); }); drag = null; } });
    if (typeof ResizeObserver === 'function') { w._ro = new ResizeObserver(() => { layout(w); draw(w); }); w._ro.observe(w.body.querySelector('.sol')); }
  },
  onResize(w) { layout(w); draw(w); },
  onClose(w) { cancelAnimationFrame(auto); if (w._ro) w._ro.disconnect(); drag = null; sel = null; }
};
})();
