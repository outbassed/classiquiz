/* ClaQui Browser — o navegador fictício do ClaQui OS. Janela retrô, barra de endereços, voltar/avançar, favoritos, histórico e carregamento simulado.
   Renderiza apenas os sites .cqo internos (CQ.web); NUNCA usa iframe nem abre endereços reais. Licença: MIT. */
(() => {
'use strict';
const CQ = window.CQ, E = CQ.E, OS = CQ.os, WM = OS.wm, A = CQ.apps, W = CQ.web, net = CQ.net;
const statApp = k => CQ.game && CQ.game.statApp && CQ.game.statApp(k);
const MAX_HIST = 200;
const favOf = url => { const r = W.resolve(url); return r.ok && r.site.fav ? r.site.fav : W.fav('?', '#888'); };
const GLOBE = '<svg class="br-globe" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40"/><ellipse cx="50" cy="50" rx="17" ry="40"/><path d="M10 50H90M19 27H81M19 73H81"/><path class="x1" d="M14 85L86 15"/><path class="x2" d="M14 85L86 15"/></svg>';

function shell() {
  return `<div class="br"><div class="br-tools">
    <div class="br-nav" role="toolbar" aria-label="Navegação">
      <button type="button" data-br="back" title="Voltar (Alt+←)" aria-label="Voltar">◀</button><button type="button" data-br="fwd" title="Avançar (Alt+→)" aria-label="Avançar">▶</button>
      <button type="button" data-br="reload" title="Atualizar (F5)" aria-label="Atualizar">⟳</button><button type="button" data-br="home" title="Página inicial" aria-label="Página inicial">⌂</button></div>
    <form class="br-addr" data-br-form="addr" role="search" aria-label="Barra de endereços"><img class="br-fav" alt="" width="16" height="16"><input class="br-url" type="text" inputmode="url" autocapitalize="none" autocorrect="off" autocomplete="off" spellcheck="false" aria-label="Endereço" placeholder="Digite um endereço .cqo, como www.buscaja.cqo"><button type="submit" class="br-go" title="Ir">Ir</button><button type="button" data-br="star" class="br-star" title="Adicionar aos favoritos" aria-label="Adicionar aos favoritos" aria-pressed="false">☆</button></form>
    <div class="br-menu"><button type="button" data-br="favs" aria-expanded="false" aria-label="Favoritos">★<span class="br-lbl"> Favoritos</span></button><button type="button" data-br="hist" aria-expanded="false" aria-label="Histórico">🕘<span class="br-lbl"> Histórico</span></button></div></div>
    <div class="br-progress" aria-hidden="true"><i></i></div><div class="br-panel" hidden></div><div class="br-viewport" tabindex="0" aria-live="polite"></div></div>`;
}
const $q = (w, s) => w.body.querySelector(s);

// =============== carregamento simulado, histórico e navegação ===============
function setProgress(w, p, show = true) { const bar = $q(w, '.br-progress'); if (!bar) return; bar.classList.toggle('on', show); bar.firstElementChild.style.width = p + '%'; }
function setLoading(w, on, msg) {
  const b = w.data.br, btn = $q(w, '[data-br="reload"]'); b.loading = on; if (btn) { btn.textContent = on ? '✕' : '⟳'; btn.title = on ? 'Parar (Esc)' : 'Atualizar (F5)'; btn.setAttribute('aria-label', on ? 'Parar' : 'Atualizar'); btn.dataset.br = on ? 'stop' : 'reload'; }
  if (msg != null) w.setStatus(msg, net.online ? 'Rede ClaQui: conectada' : 'Rede ClaQui: desconectada');
  w.el.classList.toggle('br-busy', on);
}
function updateChrome(w) {
  const b = w.data.br, e = b.stack[b.i], inp = $q(w, '.br-url'); if (!inp) return;
  if (document.activeElement !== inp || !b._typing) inp.value = e ? e.url : '';
  $q(w, '[data-br="back"]').disabled = b.i <= 0; $q(w, '[data-br="fwd"]').disabled = b.i >= b.stack.length - 1;
  const fav = $q(w, '.br-fav'); if (fav) fav.src = e && e.ok ? favOf(e.url) : W.fav('!', '#999');
  const isFav = !!(e && W.data().fav.some(f => f.url === e.url)), s = $q(w, '[data-br="star"]'); s.textContent = isFav ? '★' : '☆'; s.setAttribute('aria-pressed', String(isFav)); s.title = isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
}
function pushHistory(w, e) {
  const d = W.data(), last = d.hist[0]; if (!last || last.url !== e.url) { d.hist.unshift({url: e.url, title: e.title || e.url, t: Date.now()}); d.hist.length = Math.min(d.hist.length, MAX_HIST); }
  else last.title = e.title || last.title; W.save(d);
}
function stopLoading(w) { const b = w.data.br; b.token++; clearTimeout(b.timer); setProgress(w, 0, false); setLoading(w, false, 'Parado.'); }

function go(w, raw, {fromHistory = false, replace = false} = {}) {
  const b = w.data.br, r = W.resolve(raw); closePanel(w); endRunner(w);
  const url = r.ok ? r.url : (r.typed || String(raw ?? '').trim().slice(0, 200));
  if (!url) return;
  const entry = {url, ok: r.ok, title: ''};
  if (!fromHistory) { if (replace && b.i >= 0) b.stack[b.i] = entry; else { b.stack.length = b.i + 1; b.stack.push(entry); b.i = b.stack.length - 1; } }
  b._typing = false; load(w, r, entry);
}
function load(w, r, entry) {
  const b = w.data.br; b.token++; const t = b.token; clearTimeout(b.timer); updateChrome(w);
  if (!net.online) { setProgress(w, 0, false); showOffline(w, entry); return; }
  const host = (entry.url.split('/')[0] || '').slice(0, 60), delay = net.latency();
  setLoading(w, true, 'Procurando ' + host + '…'); setProgress(w, 8);
  const steps = [[.18, 'Conectando a ' + host + '…', 12], [.5, 'Aguardando resposta de ' + host + '…', 45], [.85, 'Baixando página…', 78]];
  for (const [f, msg, p] of steps) setTimeout(() => { if (b.token === t && b.loading) { setProgress(w, p); w.setStatus(msg, null); } }, delay * f);
  b.timer = setTimeout(() => { if (b.token !== t) return; render(w, r, entry); }, delay);
}
function mountCleanup(w) { const b = w.data.br; try { b.cleanup && b.cleanup(); } catch (e) { console.error(e); } b.cleanup = null; }
function render(w, r, entry, keepScroll = false) {
  const b = w.data.br, vp = $q(w, '.br-viewport'); mountCleanup(w); endRunner(w); b.mode = 'page'; b.current = r.ok ? r : null;
  const st = vp.scrollTop;
  if (r.ok) {
    const ctx = {url: r.url, path: r.path, params: r.params, site: r.site, L: W.link, E};
    let html = ''; try { html = r.page.html(ctx); } catch (err) { console.error('[browser]', err); html = `<div class="web-error"><h1>Erro no servidor (500)</h1><p>O site encontrou um problema interno. ${W.link(W.HOME, 'Voltar ao BuscaJá!', 'br-btn')}</p></div>`; }
    vp.innerHTML = `<div class="web-page site-${E(r.site.id)}" data-site="${E(r.site.id)}">${html}</div>`;
    entry.title = r.page.title || r.site.title; w.setTitle(entry.title + ' — ClaQui Browser');
    if (r.page.mount) { try { b.cleanup = r.page.mount(vp.firstElementChild, ctx); } catch (err) { console.error(err); } }
    if (!keepScroll) trackVisit(r.site);
  } else {
    vp.innerHTML = `<div class="web-page site-error"><div class="web-error"><h1>Erro 404 — Página não encontrada</h1><p>O endereço <code>${E(r.typed || entry.url)}</code> não existe na web do ClaQui OS.</p><ul><li>Confira se digitou o endereço corretamente (os sites terminam em <code>.cqo</code>).</li><li>Para procurar um assunto, use o campo de pesquisa do BuscaJá!.</li></ul><p><button type="button" class="br-btn" data-cqo="${W.HOME}">Voltar ao BuscaJá!</button></p><p class="muted">Erro HTTP 404 • ClaQui Browser</p></div></div>`;
    entry.title = 'Erro 404'; w.setTitle('Erro 404 — ClaQui Browser');
  }
  vp.scrollTop = keepScroll ? st : 0; setProgress(w, 100); setTimeout(() => setProgress(w, 0, false), 160); setLoading(w, false, entry.title ? 'Concluído' : '');
  if (!keepScroll) pushHistory(w, entry); updateChrome(w);
}
function trackVisit(site) {
  const d = W.data(); if (d.visited[site.id]) { statApp('webVisit'); return; } d.visited[site.id] = Date.now(); W.save(d); statApp('webVisit');
  if (site.secret) statApp('webSecret'); else if (W.publicSites().filter(s => d.visited[s.id]).length >= 8) statApp('webExplorer');
}

// =============== tela cinza de conexão perdida + Offline Runner secreto ===============
function showOffline(w, entry) {
  const b = w.data.br, vp = $q(w, '.br-viewport'); mountCleanup(w); endRunner(w); b.mode = 'offline'; b.current = null;
  const url = entry ? entry.url : (b.stack[b.i] || {}).url || '';
  vp.innerHTML = `<div class="br-offline"><div class="br-offline-pics" aria-label="Conexão perdida">${GLOBE}<button type="button" class="br-sad" data-br="sad" title="ClassiQuiz indisponível" aria-label="Ícone triste do ClassiQuiz"><img src="assets/offline-sad.svg" alt="Rostinho triste do ClassiQuiz"></button></div>
    <h1>Sem conexão com a rede do ClaQui OS</h1><p>O ClaQui Browser não conseguiu abrir <b>${E(url || 'a página')}</b> porque a rede virtual está desconectada.</p>
    <ul class="br-offline-tips"><li>Clique no ícone de rede ao lado do relógio e escolha <b>Conectar</b>.</li><li>Ou abra as Configurações de Rede.</li></ul>
    <p class="br-offline-actions"><button type="button" class="chrome-button primary" data-br="netcfg">Configurações de Rede</button> <button type="button" class="chrome-button" data-br="retry">Tentar novamente</button></p><p class="muted">ERR_REDE_VIRTUAL_DESCONECTADA</p></div>`;
  w.setTitle('Sem conexão — ClaQui Browser'); if (entry) entry.title = 'Sem conexão'; setLoading(w, false, 'Rede virtual desconectada'); updateChrome(w);
  statApp('offlineSeen');
}
function startRunner(w) {
  const b = w.data.br, vp = $q(w, '.br-viewport'); if (!window.CQ_RUNNER) return; statApp('runnerSecret'); mountCleanup(w); b.mode = 'runner';
  vp.innerHTML = `<div class="br-runner"><div class="br-runner-bar"><button type="button" class="chrome-button tiny" data-br="runner-exit">← Voltar à tela offline</button><button type="button" class="chrome-button tiny" data-br="netcfg">Configurações de Rede</button><span class="br-reconnect" hidden>Rede reconectada! <button type="button" class="chrome-button tiny primary" data-br="retry">Carregar página</button></span></div><div class="runner-host"></div></div>`;
  b.runner = CQ_RUNNER.startGame(vp.querySelector('.runner-host'), {onExit: () => { b.runner = null; if (net.online) go(w, (b.stack[b.i] || {}).url || W.HOME, {fromHistory: true}); else showOffline(w, b.stack[b.i]); }});
  w.setTitle('ClaQui Offline Runner — ClaQui Browser'); w.setStatus('Segredo desconectado • Espaço/toque pula • ↓ ou deslizar abaixa', '');
}
function endRunner(w) { const b = w.data.br; if (b && b.runner) { const r = b.runner; b.runner = null; try { r.close(true); } catch {} } }

// =============== painéis: favoritos e histórico ===============
function closePanel(w) { const p = $q(w, '.br-panel'); if (!p) return; p.hidden = true; p.innerHTML = ''; w.data.br.panel = null; w.body.querySelectorAll('.br-menu button').forEach(x => x.setAttribute('aria-expanded', 'false')); }
function openPanel(w, kind) {
  const p = $q(w, '.br-panel'), b = w.data.br, d = W.data(); if (b.panel === kind) { closePanel(w); return; } b.panel = kind;
  const row = (url, title, extra = '', rm = '') => `<li><button type="button" class="br-row" data-cqo="${E(url)}"><img src="${E(favOf(url))}" alt="" width="16" height="16"><span class="br-row-t">${E(title || url)}</span><span class="br-row-u">${E(url)}</span>${extra}</button>${rm}</li>`;
  p.innerHTML = kind === 'favs'
    ? `<h2>★ Favoritos</h2><ul>${d.fav.map((f, i) => row(f.url, f.title, '', `<button type="button" class="br-rm" data-br="fav-rm" data-i="${i}" aria-label="Remover ${E(f.title)}">✕</button>`)).join('') || '<li class="muted">Nenhum favorito ainda. Toque na estrela ao lado do endereço.</li>'}</ul>`
    : `<h2>🕘 Histórico</h2><ul>${d.hist.slice(0, 60).map(h => row(h.url, h.title, `<span class="br-row-d">${E(CQ.fmtDate(h.t))}</span>`)).join('') || '<li class="muted">O histórico está vazio.</li>'}</ul>${d.hist.length ? '<p><button type="button" class="chrome-button tiny" data-br="hist-clear">Limpar histórico</button></p>' : ''}`;
  p.hidden = false; w.body.querySelectorAll('.br-menu button').forEach(x => x.setAttribute('aria-expanded', String(x.dataset.br === kind)));
}
function toggleFav(w) {
  const b = w.data.br, e = b.stack[b.i]; if (!e || !e.ok) { CQ.notify('Só é possível favoritar páginas existentes.'); return; }
  const d = W.data(), i = d.fav.findIndex(f => f.url === e.url); if (i >= 0) { d.fav.splice(i, 1); CQ.notify('Removido dos favoritos.'); } else { d.fav.unshift({url: e.url, title: e.title || e.url, t: Date.now()}); d.fav.length = Math.min(d.fav.length, 100); CQ.notify('Adicionado aos favoritos.'); }
  W.save(d); updateChrome(w); if (b.panel === 'favs') { b.panel = null; openPanel(w, 'favs'); }
}
const hasBack = w => w.data.br.i > 0, hasFwd = w => w.data.br.i < w.data.br.stack.length - 1;
function back(w) { const b = w.data.br; if (hasBack(w)) { b.i--; load(w, W.resolve(b.stack[b.i].url), b.stack[b.i]); } }
function forward(w) { const b = w.data.br; if (hasFwd(w)) { b.i++; load(w, W.resolve(b.stack[b.i].url), b.stack[b.i]); } }
function reload(w) { const b = w.data.br, e = b.stack[b.i]; if (e) load(w, W.resolve(e.url), e); }

// =============== eventos ===============
function onViewportClick(w, e) {
  const cqo = e.target.closest('[data-cqo]'); if (cqo) { e.preventDefault(); go(w, cqo.dataset.cqo); return; }
  const open = e.target.closest('[data-open-app]'); if (open) { OS.open(open.dataset.openApp); return; }
  const act = e.target.closest('[data-web-act]');
  if (act) { siteAction(w, act.dataset.webAct, {...act.dataset}); return; }
  const a = e.target.closest('a'); if (a) { e.preventDefault(); CQ.notify('Link bloqueado: o ClaQui Browser só abre endereços .cqo.'); }
}
function siteAction(w, act, data) {
  const cur = w.data.br.current, site = cur && cur.site; if (!site || !site.onAction) return; let res = null;
  try { res = site.onAction(act, data, {url: cur.url}); } catch (err) { console.error(err); }
  if (!res) return; if (res.toast) CQ.notify(res.toast);
  if (res.alert) CQ.ui.alert(res.alert.title, res.alert.body);
  if (res.navigate) go(w, res.navigate, {replace: res.navigate === cur.url}); else if (res.refresh) render(w, cur, w.data.br.stack[w.data.br.i], true);
}
function onSubmit(w, e) {
  const f = e.target.closest('form'); if (!f) return; e.preventDefault();
  if (f.dataset.brForm === 'addr') { go(w, f.querySelector('.br-url').value); $q(w, '.br-viewport').focus({preventScroll: true}); return; }
  if (f.dataset.cqoForm) { const qs = new URLSearchParams([...new FormData(f)].filter(([, v]) => String(v).trim()).map(([k, v]) => [k, String(v).trim().slice(0, 120)])).toString(); go(w, f.dataset.cqoForm + (qs ? '?' + qs : f.dataset.cqoForm.includes('/busca') ? '?q=' : '')); return; }
  if (f.dataset.webForm) siteAction(w, f.dataset.webForm, {...f.dataset, ...Object.fromEntries(new FormData(f))});
}
function onToolClick(w, e) {
  const btn = e.target.closest('[data-br]'); if (!btn || btn.disabled) return; const k = btn.dataset.br;
  switch (k) {
    case 'back': back(w); break; case 'fwd': forward(w); break; case 'home': go(w, W.HOME); break; case 'reload': case 'retry': if (k === 'retry' && !net.online) { CQ.notify('A rede virtual ainda está desconectada.'); break; } reload(w); break; case 'stop': stopLoading(w); break;
    case 'star': toggleFav(w); break; case 'favs': case 'hist': openPanel(w, k); break;
    case 'fav-rm': { const d = W.data(); d.fav.splice(+btn.dataset.i, 1); W.save(d); updateChrome(w); w.data.br.panel = null; openPanel(w, 'favs'); break; }
    case 'hist-clear': { const d = W.data(); d.hist = []; W.save(d); w.data.br.panel = null; openPanel(w, 'hist'); break; }
    case 'sad': startRunner(w); break; case 'runner-exit': { const r = w.data.br.runner; if (r) r.close(); break; }
    case 'netcfg': OS.open('netconfig'); break;
  }
}
function onKey(w, e) {
  if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); back(w); } else if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); forward(w); }
  else if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) { e.preventDefault(); reload(w); }
  else if ((e.ctrlKey && e.key.toLowerCase() === 'l') || e.key === 'F6') { e.preventDefault(); const i = $q(w, '.br-url'); i.focus(); i.select(); }
  else if (e.key === 'Escape') { if (w.data.br.loading) stopLoading(w); else closePanel(w); }
}

A.browser = {title: 'ClaQui Browser', icon: 'assets/icons/navegador.svg', bodyClass: 'flush browser-app', persistent: true, w: 980, h: 680,
  onParams(w, p) { if (p && p.url) go(w, p.url); },
  contextMenu(target, host) {
    const w = WM.get('browser'); if (!w || !w.data.br) return null; const link = target.closest('[data-cqo]');
    return [...(link ? [{label: 'Abrir link', run: () => go(w, link.dataset.cqo)}, {sep: true}] : []),
      {label: 'Voltar', disabled: !hasBack(w), run: () => back(w)}, {label: 'Avançar', disabled: !hasFwd(w), run: () => forward(w)}, {label: 'Atualizar', run: () => reload(w)}, {sep: true},
      {label: 'Adicionar/remover favorito', run: () => toggleFav(w)}, {label: 'Página inicial', run: () => go(w, W.HOME)}, {sep: true},
      {label: 'Minimizar', run: () => WM.minimize('browser')}, {label: 'Fechar', run: () => WM.requestClose('browser')}];
  },
  render(w, p) {
    w.data.br = {stack: [], i: -1, token: 0, loading: false, mode: 'page', current: null, runner: null, cleanup: null, panel: null, timer: 0};
    w.body.innerHTML = shell(); w.setTitle('ClaQui Browser'); w.setStatus('Pronto', 'ClaQui Browser');
    w.body.addEventListener('click', e => { if (e.target.closest('[data-br]')) onToolClick(w, e); else if (e.target.closest('.br-viewport,.br-panel')) onViewportClick(w, e); });
    w.body.addEventListener('submit', e => onSubmit(w, e)); w.body.addEventListener('keydown', e => onKey(w, e));
    const inp = $q(w, '.br-url'); inp.addEventListener('input', () => { w.data.br._typing = true; }); inp.addEventListener('focus', () => inp.select()); inp.addEventListener('blur', () => { w.data.br._typing = false; });
    w.body.querySelector('.br-viewport').addEventListener('mouseover', e => { const l = e.target.closest('[data-cqo]'); if (l && !w.data.br.loading) w.setStatus(l.dataset.cqo, null); });
    w._off = [CQ.bus.on('net:change', ({online}) => {
      const b = w.data.br; if (!WM.get('browser')) return;
      if (!online) { endRunnerKeep(w); showOffline(w, b.stack[b.i]); }
      else if (b.mode === 'offline') reload(w); else if (b.mode === 'runner') { const r = w.body.querySelector('.br-reconnect'); if (r) r.hidden = false; }
    }), CQ.bus.on('clock:name', () => {})];
    function endRunnerKeep(w) { endRunner(w); }
    go(w, (p && p.url) || W.HOME);
  },
  onHide(w) { /* o Runner pausa sozinho quando a janela fica oculta */ },
  onClose(w) { clearTimeout(w.data.br && w.data.br.timer); mountCleanup(w); endRunner(w); (w._off || []).forEach(f => f && f()); }
};
})();
