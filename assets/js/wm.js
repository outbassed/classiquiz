/* ClaQui OS — gerenciador de janelas, barra de tarefas, Start, menu de contexto, escala, papel de parede e energia. Licença: MIT. */
(() => {
'use strict';
const CQ = window.CQ, E = CQ.E, $ = id => document.getElementById(id);
const OS = CQ.os = {interceptors: []};

// =============== aparência: escala, papel de parede, tema ===============
const reduced = () => { const p = CQ.sys.get('reduceMotion'); return p === 'on' || (p === 'auto' && matchMedia('(prefers-reduced-motion: reduce)').matches); };
const mobileLike = () => matchMedia('(pointer: coarse)').matches || innerWidth <= 700;
OS.defaultScale = () => mobileLike() ? 125 : 100;
OS.chosenScale = () => CQ.sys.get('scale') || OS.defaultScale();
OS.scale = () => Math.min(OS.chosenScale() / 100, Math.max(1, innerWidth / 300));
OS.reducedMotion = reduced;
function applyScale() {
  const a = $('app'); if (!a) return; const s = OS.scale(), w = innerWidth / s, h = innerHeight / s;
  a.style.width = w + 'px'; a.style.height = h + 'px';
  if (CSS.supports && CSS.supports('zoom', '1')) { a.style.zoom = s; a.style.transform = ''; } else { a.style.zoom = ''; a.style.transform = `scale(${s})`; a.style.transformOrigin = '0 0'; }
  document.documentElement.dataset.motion = reduced() ? 'reduce' : 'full';
  CQ.bus.emit('os:scale', {scale: s});
}
OS.applyScale = applyScale;
OS.wallpapers = [
  {id: 'classico', name: 'Clássico', src: 'assets/wallpapers/classico.svg'}, {id: 'grade-verde', name: 'Grade verde', src: 'assets/wallpapers/grade-verde.svg'},
  {id: 'por-do-sol', name: 'Pôr do sol', src: 'assets/wallpapers/por-do-sol.svg'}, {id: 'circuito', name: 'Circuito', src: 'assets/wallpapers/circuito.svg'},
  {id: 'nuvens', name: 'Nuvens', src: 'assets/wallpapers/nuvens.svg'},
  {id: 'aurora', name: 'Aurora', src: 'assets/wallpapers/aurora.svg', shop: 'wp-aurora'}, {id: 'milharal', name: 'Milharal', src: 'assets/wallpapers/milharal.svg', shop: 'wp-milharal'},
  {id: 'vinil', name: 'Vinil', src: 'assets/wallpapers/vinil.svg', shop: 'wp-vinil'}];
let wallUrl = null;
OS.applyWallpaper = async function (override) {
  const layer = $('wallpaper'); if (!layer) return;
  const id = override?.id ?? CQ.sys.get('wallpaper'), fit = override?.fit ?? CQ.sys.get('wallpaperFit');
  let url = null;
  if (id === 'custom') { try { const b = override?.blob || await CQ.vfs.kvGet('wallpaper'); if (b) { if (wallUrl) URL.revokeObjectURL(wallUrl); wallUrl = URL.createObjectURL(b); url = wallUrl; } } catch {} }
  if (!url) url = (OS.wallpapers.find(w => w.id === id) || OS.wallpapers[0]).src;
  layer.style.backgroundImage = `url("${url}")`;
  const m = {fill: ['cover', 'no-repeat'], fit: ['contain', 'no-repeat'], stretch: ['100% 100%', 'no-repeat'], tile: ['auto', 'repeat']}[fit] || ['cover', 'no-repeat'];
  layer.style.backgroundSize = m[0]; layer.style.backgroundRepeat = m[1]; layer.style.backgroundPosition = 'center';
  return url;
};
OS.applyTheme = function () {
  const r = document.documentElement; r.dataset.theme = CQ.sys.get('theme'); r.dataset.cursor = CQ.sys.get('cursor'); r.dataset.icons = CQ.sys.get('iconStyle'); CQ.mouse?.apply();
  const order = CQ.sys.get('iconOrder'); const btns = [...document.querySelectorAll('#desktop-launchers .desktop-shortcut')];
  const sorted = [...btns].sort((a, b) => a.textContent.trim().localeCompare(b.textContent.trim(), 'pt-BR'));
  btns.forEach((b, i) => { b.style.order = order === 'sorted' ? sorted.indexOf(b) : i; });
};

// =============== menu de contexto próprio ===============
OS.ctx = {
  show(x, y, items) {
    const m = $('cq-context'); if (!m) return; const s = OS.scale();
    m.innerHTML = items.map((it, i) => it.sep ? '<hr>' : `<button type="button" role="menuitem" data-ctx-i="${i}" ${it.disabled ? 'disabled' : ''}>${it.icon ? `<img src="${E(it.icon)}" alt="">` : '<span></span>'}${E(it.label)}</button>`).join('');
    m._items = items; m.hidden = false; closeStart();
    const w = m.offsetWidth || 220, h = m.offsetHeight || 180, A = $('app'), maxW = A.clientWidth, maxH = A.clientHeight;
    m.style.left = Math.max(2, Math.min(x / s, maxW - w - 4)) + 'px'; m.style.top = Math.max(2, Math.min(y / s, maxH - h - 4)) + 'px';
    m.querySelector('button:not(:disabled)')?.focus({preventScroll: true});
  },
  hide() { const m = $('cq-context'); if (m) { m.hidden = true; m._items = null; } }
};
function defaultContext(e) {
  const A = CQ.apps;
  return [{label: 'Atualizar', icon: 'assets/icons/atualizacoes.svg', run: () => { OS.applyTheme(); CQ.bus.emit('os:refresh', {}); CQ.notify('Área de trabalho atualizada.'); }},
    {label: CQ.sys.get('iconOrder') === 'sorted' ? 'Ícones: ordem original' : 'Organizar ícones (A–Z)', icon: 'assets/icons/mais-opcoes.svg', run: () => { CQ.sys.set({iconOrder: CQ.sys.get('iconOrder') === 'sorted' ? 'default' : 'sorted'}); OS.applyTheme(); CQ.notify('Ícones reorganizados.'); }},
    {sep: true},
    {label: 'Papel de parede…', icon: 'assets/icons/configuracoes.svg', run: () => OS.open('settings', {tab: 'personalizacao'})},
    {label: 'Tamanho da interface…', icon: 'assets/icons/configuracoes.svg', run: () => OS.open('settings', {tab: 'exibicao'})},
    {sep: true},
    {label: 'Propriedades', icon: 'assets/icons/sobre.svg', run: () => { if (CQ.rules.onProperties && CQ.rules.onProperties()) return; OS.open('about'); }}];
}
document.addEventListener('contextmenu', e => {
  if (e.ctrlKey) return;                                     // Ctrl + botão direito: menu nativo do navegador
  if (e.defaultPrevented) return;
  e.preventDefault(); openContextAt(e.clientX, e.clientY, e.target);
});
function openContextAt(x, y, target) {
  if (!target || target.closest('#cq-context')) return;
  const field = target.closest('input,textarea,[contenteditable="true"]');
  if (field) {
    const copy = () => {try { document.execCommand('copy'); } catch {}}, paste = async () => {
      try {const t=await navigator.clipboard.readText();field.focus();if(field.setRangeText)field.setRangeText(t,field.selectionStart,field.selectionEnd,'end');else document.execCommand('insertText',false,t);field.dispatchEvent(new Event('input',{bubbles:true}));} catch {CQ.notify('O navegador não permitiu colar.');}
    };
    OS.ctx.show(x,y,[{label:'Copiar',run:copy},{label:'Colar',run:paste},{label:'Selecionar tudo',run:()=>{field.focus();field.select?.();}}]);return;
  }
  const host = target.closest('[data-ctxapp]'); const def = host && CQ.apps[host.dataset.ctxapp];
  let items = null;
  try { items = def?.contextMenu?.(target, host) || null; } catch (err) { console.error(err); }
  // O menu do desktop nunca deve aparecer dentro de uma janela.
  if(!items && host)items = [
    {label:'Atualizar janela',run:()=>OS.wm.refresh(host.dataset.ctxapp)},
    {label:'Minimizar',run:()=>OS.wm.minimize(host.dataset.ctxapp)},
    {sep:true},{label:'Fechar',run:()=>OS.wm.requestClose(host.dataset.ctxapp)}
  ];
  if(!items && target.closest('#start-menu,#taskbar,.taskbar'))items = [{label:'Mostrar área de trabalho',run:()=>OS.wm.list().forEach(w=>OS.wm.minimize(w.id))}];
  OS.ctx.show(x, y, items || defaultContext());
}
OS.ctx.openAt = openContextAt;
document.addEventListener('click', e => {
  const b = e.target.closest('#cq-context [data-ctx-i]');
  if (b) { const m = $('cq-context'), it = m._items?.[Number(b.dataset.ctxI)]; OS.ctx.hide(); try { it?.run?.(); } catch (err) { console.error(err); } return; }
  if (!e.target.closest('#cq-context')) OS.ctx.hide();
}, true);
document.addEventListener('keydown', e => { if (e.key === 'Escape') OS.ctx.hide(); });
// toque prolongado (~600 ms) abre o mesmo menu; mover/rolar cancela
let lp = null, suppressTapUntil = 0;
document.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'touch' || e.target.closest('input,textarea,select,[contenteditable="true"],[data-no-longpress]')) return;
  const x = e.clientX, y = e.clientY, id = e.pointerId, t = e.target; clearTimeout(lp?.timer);
  lp = {x, y, id, timer: setTimeout(() => { if (!lp || lp.id !== id) return; suppressTapUntil = Date.now() + 700; openContextAt(x, y, t); try { navigator.vibrate?.(15); } catch {} }, 600)};
}, {passive: true});
document.addEventListener('pointermove', e => { if (lp && e.pointerId === lp.id && Math.hypot(e.clientX - lp.x, e.clientY - lp.y) > 11) { clearTimeout(lp.timer); lp = null; } }, {passive: true});
for (const ev of ['pointerup', 'pointercancel']) document.addEventListener(ev, e => { if (lp && e.pointerId === lp.id) { clearTimeout(lp.timer); lp = null; } }, {passive: true});
document.addEventListener('click', e => { if (Date.now() < suppressTapUntil && !e.target.closest('#cq-context')) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);

// =============== gerenciador de janelas ===============
const windows = new Map(); let zTop = 10, activeId = null, hiddenByShowDesktop = [];
const WM = OS.wm = {
  list: () => [...windows.values()], get: id => windows.get(id) || null, isOpen: id => windows.has(id),
  isVisible: id => { const w = windows.get(id); return !!w && !w.minimized; }, isActive: id => activeId === id, get activeId() { return activeId; },
  open(appId, params) {
    const def = CQ.apps[appId]; if (!def) return null;
    let w = windows.get(appId);
    if (w) { if (params !== undefined) def.onParams?.(w, params); w.params = params ?? w.params; if (w.minimized) WM.restore(appId); WM.focus(appId); if (def.refreshOnOpen) WM.refresh(appId); return w; }
    const el = document.createElement('section'); el.className = 'cq-win'; el.dataset.win = appId; el.dataset.ctxapp = appId;
    el.setAttribute('aria-label', def.title || appId);
    el.innerHTML = `<div class="win-title"><div class="title-left"><img class="win-icon" alt=""><span class="win-name"></span></div><div class="window-controls"><button type="button" data-act="win-min" data-win="${appId}" title="Minimizar" aria-label="Minimizar janela"><svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="8" width="7" height="2.2"/></svg></button><button type="button" data-act="win-max" data-win="${appId}" title="Maximizar ou restaurar" aria-label="Maximizar ou restaurar janela"><svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="2" width="8" height="8" fill="none" stroke-width="1.8"/><rect x="2" y="2" width="8" height="2.4"/></svg></button><button type="button" data-act="win-close" data-win="${appId}" title="Fechar janela" aria-label="Fechar janela"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 2.5l7 7m0-7l-7 7" fill="none" stroke-width="2"/></svg></button></div></div><div class="win-body ${def.bodyClass || ''}" tabindex="-1"></div><div class="win-status"${def.noStatus ? ' hidden' : ''}><span class="s-left"></span><span class="s-right"></span></div>`;
    $('windows').appendChild(el);
    w = {id: appId, appId, el, body: el.querySelector('.win-body'), titleEl: el.querySelector('.win-name'), iconEl: el.querySelector('.win-icon'), params, minimized: false, maximized: true, data: {}, openedAt: Date.now(),
      setTitle(t) { this.titleEl.textContent = t; this.el.setAttribute('aria-label', t); updateTaskbar(); }, setStatus(l, r) { const a = el.querySelector('.s-left'), b = el.querySelector('.s-right'); if (l != null) a.textContent = l; if (r != null) b.textContent = r; },
      setIcon(src) { this.iconEl.src = src; }};
    w.setIcon(def.icon || 'assets/classiquiz-icon.svg'); w.titleEl.textContent = def.title || appId;
    windows.set(appId, w); layoutWin(w);
    try { def.render?.(w, params); } catch (err) { console.error('[render]', appId, err); w.body.textContent = 'Erro ao abrir este programa.'; }
    WM.focus(appId); CQ.bus.emit('win:open', {id: appId}); updateTaskbar(); updateDesktopInert();
    return w;
  },
  refresh(appId) { const w = windows.get(appId), def = CQ.apps[appId]; if (!w || !def || def.persistent) return; const st = w.body.scrollTop; try { def.render?.(w, w.params); } catch (err) { console.error('[refresh]', appId, err); } w.body.scrollTop = st; },
  refreshAll() { for (const id of windows.keys()) WM.refresh(id); },
  focus(id) {
    const w = windows.get(id); if (!w || w.minimized) return; if (activeId !== id) { const prev = windows.get(activeId); activeId = id; prev && CQ.bus.emit('win:blur', {id: prev.id}); }
    w.el.style.zIndex = ++zTop; for (const x of windows.values()) x.el.classList.toggle('active', x.id === id); updateTaskbar(); CQ.bus.emit('win:focus', {id});
  },
  minimize(id) {
    const w = windows.get(id); if (!w || w.minimized) return; w.minimized = true; w.el.hidden = true; w.el.classList.remove('active');
    CQ.apps[id]?.onHide?.(w); CQ.bus.emit('win:min', {id}); if (activeId === id) { activeId = null; focusTop(); } updateTaskbar(); updateDesktopInert();
  },
  restore(id) {
    const w = windows.get(id); if (!w) return; if (w.minimized) { w.minimized = false; w.el.hidden = false; CQ.apps[id]?.onShow?.(w); CQ.bus.emit('win:restore', {id}); }
    WM.focus(id); updateDesktopInert();
  },
  toggleMax(id) { const w = windows.get(id); if (!w) return; w.maximized = !w.maximized; layoutWin(w); CQ.apps[id]?.onResize?.(w); CQ.bus.emit('win:max', {id, max: w.maximized}); updateDesktopInert(); },
  async requestClose(id) {
    const w = windows.get(id), def = CQ.apps[id]; if (!w) return true;
    if (def?.beforeClose) { if (w.minimized) WM.restore(id); const ok = await def.beforeClose(w); if (ok === false) return false; }
    WM.close(id); return true;
  },
  close(id) {
    const w = windows.get(id); if (!w) return; const def = CQ.apps[id];
    try { def?.onClose?.(w); } catch (err) { console.error(err); }
    w.el.remove(); windows.delete(id); if (activeId === id) { activeId = null; focusTop(); }
    CQ.bus.emit('win:close', {id}); updateTaskbar(); updateDesktopInert();
  },
  closeAll() { for (const id of [...windows.keys()]) WM.close(id); },
  dirtyList() { return WM.list().filter(w => CQ.apps[w.id]?.isDirty?.(w)); }
};
function focusTop() { const vis = WM.list().filter(w => !w.minimized).sort((a, b) => Number(b.el.style.zIndex) - Number(a.el.style.zIndex)); if (vis[0]) WM.focus(vis[0].id); }
function layoutWin(w) {
  const el = w.el; el.classList.toggle('max', w.maximized);
  if (w.maximized) { el.style.left = el.style.top = el.style.width = el.style.height = ''; return; }
  const def = CQ.apps[w.id] || {}, A = $('windows'), aw = A.clientWidth, ah = A.clientHeight;
  const ww = Math.min(def.w || 860, aw - 16), hh = Math.min(def.h || 600, ah - 16), n = windows.size % 6;
  if (!w.rect) w.rect = {x: Math.max(4, (aw - ww) / 2 + n * 18 - 30), y: Math.max(4, (ah - hh) / 2 + n * 14 - 20), w: ww, h: hh};
  el.style.left = w.rect.x + 'px'; el.style.top = w.rect.y + 'px'; el.style.width = w.rect.w + 'px'; el.style.height = w.rect.h + 'px';
}
// arrastar pelo título (só quando não maximizada)
let drag = null;
document.addEventListener('pointerdown', e => {
  const t = e.target.closest('.win-title'); if (!t || e.target.closest('button')) { const win = e.target.closest('.cq-win'); if (win) WM.focus(win.dataset.win); return; }
  const el = t.closest('.cq-win'), w = windows.get(el.dataset.win); WM.focus(w.id); if (w.maximized || e.button > 0) return;
  drag = {w, sx: e.clientX, sy: e.clientY, ox: w.rect.x, oy: w.rect.y, id: e.pointerId}; try { t.setPointerCapture(e.pointerId); } catch {}
}, true);
document.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.id) return; const s = OS.scale(), A = $('windows');
  drag.w.rect.x = Math.max(-drag.w.rect.w + 80, Math.min(A.clientWidth - 60, drag.ox + (e.clientX - drag.sx) / s)); drag.w.rect.y = Math.max(0, Math.min(A.clientHeight - 30, drag.oy + (e.clientY - drag.sy) / s));
  drag.w.el.style.left = drag.w.rect.x + 'px'; drag.w.el.style.top = drag.w.rect.y + 'px';
});
for (const ev of ['pointerup', 'pointercancel']) document.addEventListener(ev, e => { if (drag && e.pointerId === drag.id) drag = null; });
document.addEventListener('dblclick', e => { const t = e.target.closest('.win-title'); if (t && !e.target.closest('button')) WM.toggleMax(t.closest('.cq-win').dataset.win); });
window.addEventListener('resize', () => { applyScale(); for (const w of windows.values()) if (!w.maximized) { w.rect = null; layoutWin(w); } });
window.addEventListener('orientationchange', () => setTimeout(applyScale, 120));

function updateDesktopInert() {
  const d = $('desktop'); if (!d) return; const cover = WM.list().some(w => !w.minimized && w.maximized);
  d.inert = cover; d.setAttribute('aria-hidden', cover ? 'true' : 'false');
}
function updateTaskbar() {
  const holder = $('task-programs'); if (!holder) return; const keep = holder.scrollLeft;
  holder.innerHTML = WM.list().map(w => { const def = CQ.apps[w.id] || {}; const cls = (w.id === activeId && !w.minimized ? 'active ' : '') + (w.minimized ? 'min' : '');
    return `<button type="button" class="task-program ${cls}" data-act="task-app" data-app="${E(w.id)}" title="${E(w.titleEl.textContent)}" aria-label="${E(w.titleEl.textContent)}${w.minimized ? ' (minimizada)' : ''}" aria-pressed="${w.id === activeId && !w.minimized}"><img class="task-app-icon" src="${E(w.iconEl.getAttribute('src') || def.icon || '')}" alt=""><span class="task-program-name">${E(w.titleEl.textContent)}</span></button>`; }).join('');
  holder.scrollLeft = keep;
}
OS.updateTaskbar = updateTaskbar;
function taskClick(id) { const w = WM.get(id); if (!w) return; if (w.minimized) WM.restore(id); else if (activeId === id) WM.minimize(id); else WM.focus(id); }

// =============== abrir programas ===============
OS.open = async function (appId, params) {
  const def = CQ.apps[appId]; if (!def) { console.warn('programa desconhecido', appId); return null; }
  closeStart();
  if (def.beforeOpen) { let ok; try { ok = await def.beforeOpen(params); } catch (err) { console.error(err); ok = false; } if (ok === false) return null; }
  return WM.open(appId, params);
};
OS.ultraBlocked = id => id === 'dev' && CQ.rules.ultra();

// =============== Start ===============
function startItems() {
  const sections = [
    ['Principal', [['new','Jogar'],['resume','Continuar'],['library','Minhas Trilhas'],['ultra','Ultra ClassiQuiz'],['mais','Mais opções']]],
    ['Internet', [['browser','ClaQui Browser'],['netconfig','Configurações de Rede']]],
    ['Jogos', [['mines','Campo Minado'],['ttt','Jogo da Velha'],['snake','Cobrinha'],['desvio','Desvio CQ'],['solitaire','Paciência'],['pong','Pong']]],
    ['Acessórios', [['notepad','Bloco de Notas'],['paint','Paint'],['calc','Calculadora'],['calendar','Calendário'],['clock','Relógio'],['viewer','Visualizador'],['player','Reprodutor']]],
    ['Sistema e biblioteca', [['explorer','Explorador de Arquivos'],['trash','Lixeira'],['settings','Configurações'],['datetime','Data e Hora'],['achievements','Conquistas'],['rewards','Recompensas'],['stats','Estatísticas'],['favorites','Favoritas'],['updates','ClaQui Update'],['tutorial','Ajuda e Tutorial'],['about','Sobre']]]
  ];
  // Programas novos entram automaticamente no menu, sem exigir alterar a lista.
  const listed = new Set(sections.flatMap(([,list]) => list.map(([id]) => id)));
  const extra = Object.keys(CQ.apps).filter(id => !listed.has(id) && id !== 'game' && id !== 'dev' && id !== 'mais' && !CQ.apps[id]?.hidden && CQ.apps[id]?.title)
    .map(id => [id, CQ.apps[id].title]);
  if (extra.length) sections.push(['Mais programas', extra]);
  if (!CQ.rules.ultra()) sections.push(['Ferramentas avançadas', [['dev', 'Terminal']]]);
  return sections;
}
function renderStart() {
  const m = $('start-menu'); if (!m) return;
  const sections = startItems();
  m.innerHTML = `<div class="start-menu-title"><img src="assets/classiquiz-icon.svg" alt=""><span data-osname>${E(CQ.clock ? CQ.clock.osName() : 'ClaQui OS')}</span></div>` +
    `<div class="start-menu-scroll" aria-label="Lista de programas">${sections.map(([group,items]) =>
      `<div class="start-group-title">${E(group)}</div>` + items.filter(([id]) => CQ.apps[id]).map(([id,label]) =>
        `<button type="button" role="menuitem" data-act="open-app" data-app="${E(id)}"><img class="start-item-icon" src="${E(CQ.apps[id].icon || 'assets/icons/f-desconhecido.svg')}" alt=""><span>${E(label)}</span></button>`).join('')
    ).join('')}</div>` +
    `<div class="start-menu-power"><button type="button" role="menuitem" data-act="power-shutdown"><img class="start-item-icon" src="assets/icons/configuracoes.svg" alt=""> Desligar</button><button type="button" role="menuitem" data-act="power-restart"><img class="start-item-icon" src="assets/icons/atualizacoes.svg" alt=""> Reiniciar</button></div>`;
}
function closeStart() { const m = $('start-menu'); m?.classList.remove('open'); $('start-button')?.setAttribute('aria-expanded', 'false'); }
function toggleStart() { const m = $('start-menu'); if (!m) return; const open = !m.classList.contains('open'); if (open) renderStart(); m.classList.toggle('open', open); $('start-button').setAttribute('aria-expanded', String(open)); if (open) m.querySelector('.start-menu-scroll button')?.focus({preventScroll: true}); }
OS.closeStart = closeStart;
document.addEventListener('click', e => { if (!e.target.closest('#start-menu,#start-button')) closeStart(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeStart(); });

// =============== cliques globais do shell ===============
// Proteção contra duplo clique em atalhos: o 1º clique abre a janela (muitas abrem maximizadas) e o 2º cairia em cima de um botão dela.
let shield = {until: 0, x: -999, y: -999};
document.addEventListener('click', e => { if (performance.now() < shield.until && e.detail > 0 && Math.hypot(e.clientX - shield.x, e.clientY - shield.y) < 14 && !e.target.closest('.desktop-shortcut')) { e.stopPropagation(); e.preventDefault(); } }, true);
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-act]'); if (!btn || btn.disabled) return;
  const act = btn.dataset.act;
  for (const fn of OS.interceptors) { try { if (fn(act, btn, e)) { e.stopPropagation(); return; } } catch (err) { console.error(err); } }
  switch (act) {
    case 'win-min': WM.minimize(btn.dataset.win); closeStart(); return;
    case 'win-max': WM.toggleMax(btn.dataset.win); return;
    case 'win-close': WM.requestClose(btn.dataset.win); closeStart(); return;
    case 'task-app': taskClick(btn.dataset.app); return;
    case 'open-app': if (btn.classList.contains('desktop-shortcut') && e.detail > 0) shield = {until: performance.now() + 500, x: e.clientX, y: e.clientY}; OS.open(btn.dataset.app, btn.dataset.param ? JSON.parse(btn.dataset.param) : undefined); return;
    case 'start-toggle': toggleStart(); return;
    case 'icon-logo': showDesktopToggle(); return;
    case 'version-click': CQ.ui.alert('Sobre o ' + CQ.clock.osName(), `<p><b>${E(CQ.clock.osName())}</b> • ClaQui OS — sistema fictício que roda no seu navegador.</p><p>Versão <b>${E(CQ.VERSION)}</b> • compilação <b>${E(CQ.BUILD)}</b></p><p>Jogo: <b>ClassiQuiz</b> — UM CLÁSSICO QUE NUNCA EXISTIU.</p><p class="muted">Frontend puro • PWA que funciona offline depois de instalada.</p>`); return;
    case 'power-shutdown': closeStart(); OS.power('shutdown'); return;
    case 'power-restart': closeStart(); OS.power('restart'); return;
  }
});
function showDesktopToggle() {
  const vis = WM.list().filter(w => !w.minimized);
  if (vis.length) { hiddenByShowDesktop = vis.map(w => w.id); vis.forEach(w => WM.minimize(w.id)); }
  else if (hiddenByShowDesktop.some(id => WM.isOpen(id))) { hiddenByShowDesktop.filter(id => WM.isOpen(id)).forEach(id => WM.restore(id)); hiddenByShowDesktop = []; }
  else OS.open('new');
}

// =============== energia: desligar / reiniciar / tela azul (SIMULAÇÕES) ===============
let powerBusy = false;
async function confirmWindowsClosing(verb) {
  const open = WM.list(); if (!open.length) return true;
  const ok = await CQ.ui.confirm(verb === 'shutdown' ? 'Desligar o ' + CQ.clock.osName() : 'Reiniciar o ' + CQ.clock.osName(),
    `<p>Existem <b>${open.length}</b> programa(s) aberto(s) (inclusive minimizados): ${open.map(w => E(w.titleEl.textContent)).join(', ')}.</p><p>Ao continuar, eles serão fechados. Seu progresso do jogo é salvo automaticamente.</p><p class="muted">Isto é uma simulação: o computador real não é desligado.</p>`, 'Confirmar', 'Cancelar');
  if (!ok) return false;
  const dirty = WM.dirtyList();
  if (dirty.length) {
    const r = await CQ.ui.modal({title: 'Documentos não salvos', body: `<p>Estes programas têm alterações não salvas:</p><ul>${dirty.map(w => `<li>${E(CQ.apps[w.id].dirtyLabel?.(w) || w.titleEl.textContent)}</li>`).join('')}</ul><p>O que deseja fazer?</p>`, dismiss: 'cancel',
      buttons: [{label: 'Cancelar', value: 'cancel'}, {label: 'Descartar', value: 'discard', danger: true}, {label: 'Salvar tudo', value: 'save', primary: true}]});
    if (r === 'cancel' || r == null) return false;
    if (r === 'save') { for (const w of dirty) { const done = await CQ.apps[w.id].save?.(w); if (done === false) return false; } }
  }
  return true;
}
OS.power = async function (verb) {
  if (powerBusy) return; powerBusy = true;
  try {
    if (!(await confirmWindowsClosing(verb))) return;
    CQ.bus.emit('power:before', {verb}); WM.list().forEach(w => CQ.apps[w.id]?.onShutdown?.(w)); WM.closeAll(); OS.ctx.hide();
    if (verb === 'restart') { try { sessionStorage.setItem('cq.restart', '1'); } catch {} showPower('restart'); setTimeout(() => location.reload(), reduced() ? 300 : 900); return; }
    showPower('shutdown'); const t = reduced() ? 1200 : 5000; await new Promise(r => setTimeout(r, t));
    await OS.bootSequence({mode: 'returning', quick: true});
  } finally { powerBusy = false; }
};
function showPower(kind) {
  const L = $('power-layer'); L.hidden = false; L.className = 'power-layer ' + kind;
  L.innerHTML = kind === 'restart' ? `<div class="power-msg" role="status">Reiniciando o ${E(CQ.clock.osName())}…</div>` : '<div class="power-msg fade" role="status">Desligando…</div>';
}
OS.bsod = function ({cause = 'system32'} = {}) { // queda FICTÍCIA, nunca do Windows real
  const L = $('power-layer'); if (L.classList.contains('bsod') && !L.hidden) return Promise.resolve(false);
  const math = cause === 'division-by-zero';
  OS.ctx.hide(); CQ.ui.closeModal(); closeStart();
  CQ.game?.persist?.(); // A tentativa atual permanece retomável após a simulação.
  const DURATION = math ? 8000 : 10000, t0 = CQ.mono(); L.hidden = false; L.className = 'power-layer bsod';
  const seconds = Math.ceil(DURATION / 1000);
  L.innerHTML = math
    ? `<div class="bsod-box" role="alert"><h1 data-osname>${E(CQ.clock.osName())}</h1><p>O sistema encontrou um erro matemático e precisou ser interrompido.</p><p class="code">DIVIDE_BY_ZERO</p><p>A operação realizada na Calculadora é inválida. Nenhum arquivo real foi afetado.</p><p>Reiniciando em <b id="bsod-left">${seconds}</b> segundos…</p><div class="bsod-bar"><i id="bsod-fill"></i></div></div>`
    : `<div class="bsod-box" role="alert"><h1 data-osname>${E(CQ.clock.osName())}</h1><p>Um problema fictício foi detectado e o ClaQui OS foi interrompido para proteger o seu jogo de mentirinha.</p><p class="code">SYSTEM32_NOT_FOUND</p><p>A pasta System32 virtual foi apagada. Nada no seu computador real foi alterado.</p><p>Reiniciando em <b id="bsod-left">${seconds}</b> segundos…</p><div class="bsod-bar"><i id="bsod-fill"></i></div></div>`;
  WM.list().forEach(w => CQ.apps[w.id]?.onShutdown?.(w));
  CQ.bus.emit(math ? 'calc:crash' : 'sys32:crash', {cause});
  return new Promise(resolve => {
    const iv = setInterval(async () => {
      const elapsed = CQ.mono() - t0, left = Math.max(0, Math.ceil((DURATION - elapsed) / 1000));
      const n = $('bsod-left'), f = $('bsod-fill'); if (n) n.textContent = left;
      if (f) f.style.width = Math.min(100, elapsed / DURATION * 100) + '%';
      if (elapsed >= DURATION) {
        clearInterval(iv); WM.closeAll();
        if (!math) { CQ.vfs.ensureSystem(); CQ.bus.emit('sys32:recovered', {}); }
        L.hidden = true; L.className = 'power-layer'; L.innerHTML = '';
        if (math) await OS.bootSequence({mode: 'restart', quick: true});
        else CQ.notify('Sistema restaurado. A pasta System32 virtual voltou.');
        resolve(true);
      }
    }, 200);
  });
};

// =============== boot, boas-vindas e primeira execução ===============
const sleep = ms => new Promise(r => setTimeout(r, reduced() ? Math.min(ms, 120) : ms));
OS.bootSequence = async function ({mode = 'returning', quick = false, tasks = []} = {}) {
  const L = $('power-layer'); const first = mode === 'first'; let skipped = false;
  L.hidden = false; L.className = 'power-layer boot';
  L.innerHTML = `<div class="boot-box"><img class="boot-logo" src="assets/classiquiz-icon.svg" alt=""><h1 data-osname>${E(CQ.clock.osName())}</h1><p class="boot-ver">Versão ${E(CQ.VERSION)} • compilação ${E(CQ.BUILD)}</p><div class="boot-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i id="boot-fill"></i></div><p class="boot-line" id="boot-line" role="status">Iniciando…</p>${first ? '<button type="button" class="chrome-button tiny" id="boot-skip">Pular configuração</button>' : ''}<p class="boot-copy">ClaQui OS © 2026 — sistema fictício. Todos os direitos autorais deste jogo reservados ao ClassiQuiz.</p></div>`;
  $('boot-skip')?.addEventListener('click', () => { skipped = true; });
  const line = $('boot-line'), fill = $('boot-fill'); const setP = (p, t) => { if (fill) fill.style.width = p + '%'; if (t && line) line.textContent = t; };
  const repairBoot = !!CQ.store.read('classiquiz.os.boot-repair', false);
  if (repairBoot) CQ.store.write('classiquiz.os.boot-repair', false);
  const steps = first ? [['Carregando componentes locais…', 500], ['Verificando arquivos virtuais…', 450], ['Aplicando preferências iniciais…', 450], ['Ajustando escala da interface…', 400], ['Carregando fundo padrão…', 400]] : [['Carregando…', quick ? 300 : 500]];
  if (repairBoot) steps.push(['Detectada falha fictícia no carregamento... Recuperando arquivos...', 950], ['Arquivos virtuais restaurados.', 550]);
  for (let i = 0; i < steps.length; i++) { if (skipped) break; setP(Math.round((i + .4) / steps.length * 100), steps[i][0]); if (tasks[i]) { try { await tasks[i](); } catch (err) { console.error(err); } } await sleep(steps[i][1]); }
  for (let i = steps.length; i < tasks.length; i++) { try { await tasks[i](); } catch (err) { console.error(err); } }
  setP(100, 'Pronto.'); await sleep(180);
  const welcomeText = first ? 'Seu sistema está pronto' : mode === 'restart' ? 'Bem-vindo de volta' : 'Bem-vindo de volta';
  L.className = 'power-layer welcome';
  if (first && !skipped) {
    L.innerHTML = `<div class="welcome-box"><img class="welcome-mascot" src="assets/img/claquim.svg" alt="Claquim, o assistente do ClaQui OS"><h1>${welcomeText}</h1><p>Bem-vindo ao <b data-osname>${E(CQ.clock.osName())}</b>.</p><p><b>ClassiQuiz</b> — UM CLÁSSICO QUE NUNCA EXISTIU.</p><p class="muted-w">Tudo roda aqui no navegador. Nada é enviado a lugar nenhum.</p><button type="button" class="chrome-button primary big" id="welcome-go" data-autofocus="1">Iniciar</button></div>`;
    await new Promise(res => { const b = $('welcome-go'); b.addEventListener('click', res); b.focus(); });
  } else {
    L.innerHTML = `<div class="welcome-box small"><img class="welcome-mascot" src="assets/img/claquim.svg" alt=""><h1>${first ? welcomeText : 'Bem-vindo de volta'}</h1></div>`; await sleep(first ? 200 : quick ? 500 : 800);
  }
  L.className = 'power-layer leaving'; await sleep(220); L.hidden = true; L.className = 'power-layer'; L.innerHTML = '';
  if (first) CQ.sys.set({bootCompleted: true});
  CQ.sys.set({lastBoot: Date.now()}); CQ.bus.emit('os:ready', {mode});
  return true;
};

// =============== inicialização geral ===============
OS.start = async function (hooks = {}) {
  CQ.easterEggs(); CQ.migrate(); CQ.clock.applyName(); const tv0 = $('task-version'); if (tv0) tv0.textContent = 'v' + CQ.VERSION; applyScale(); OS.applyTheme(); OS.applyWallpaper();
  const fromRestart = (() => { try { const v = sessionStorage.getItem('cq.restart'); sessionStorage.removeItem('cq.restart'); return v === '1'; } catch { return false; } })();
  const first = !CQ.sys.get('bootCompleted');
  const tasks = first ? [() => CQ.vfs.init(), () => hooks.beforeDesktop?.(), () => OS.applyTheme(), () => applyScale(), () => OS.applyWallpaper()] : [async () => { await CQ.vfs.init(); await OS.applyWallpaper(); await hooks.beforeDesktop?.(); }];
  await OS.bootSequence({mode: first ? 'first' : fromRestart ? 'restart' : 'returning', tasks});
  hooks.afterDesktop?.(); updateTaskbar(); updateDesktopInert();
  CQ.clock.start(); const tv = $('task-version'); if (tv) tv.textContent = 'v' + CQ.VERSION;
};
// ícones da área de trabalho: atualizam rótulo/ícone a partir dos registros
OS.registerDesktop = function () { for (const b of document.querySelectorAll('[data-app]')) { const def = CQ.apps[b.dataset.app]; if (def && b.querySelector('img')) b.querySelector('img').src = def.icon; } };
})();
