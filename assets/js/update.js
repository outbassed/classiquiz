/* ClaQui Update + registro do Service Worker. Licença: MIT.
   Consulta a internet REAL (version.json com cache:'no-store'), compara versões (semântica legada e por data), baixa a nova release em segundo plano
   pelo Service Worker (progresso real, sem simulação) e só troca de versão quando o jogador pede. Os dados salvos nunca são tocados. */
(() => {
'use strict';
const CQ = window.CQ, E = CQ.E, OS = CQ.os, WM = OS.wm, A = CQ.apps, ver = CQ.ver;
const web = /^https?:$/.test(location.protocol), swOk = web && 'serviceWorker' in navigator;
const U = CQ.update = {state: 'idle', latest: null, error: '', checkedAt: 0, progress: null, reg: null, controlled: false, offlineBuild: null, cacheInfo: null, _reloading: false};
const HISTORY = [
  ['26nov16', '16/11/2026', 'Navegador fictício ClaQui Browser, rede virtual, PWA 100% offline, Data e Hora com nome dinâmico, tutorial, minijogos por toque, touchpad customizável.'],
  ['2.0.9', '16/11/2026', 'PWA, Offline Runner, ClaQui Update, menus contextuais, touchpad e janelas maximizadas.'],
  ['2.0.8', '15/11/2026', 'Mouse corrigido, menu Iniciar rolável e Desvio CQ sem fim.'],
  ['2.0.7', '15/11/2026', 'Desktop reorganizado e Desvio CQ.'], ['2.0.6', '15/11/2026', 'Propriedades do Mouse e arcade.'], ['2.0.5', '15/11/2026', 'Divisão por zero na Calculadora.']];
const busy = () => { const open = id => WM.isOpen(id) && WM.isVisible(id); return ['game', 'new', 'ultra', 'mines', 'snake', 'pong', 'desvio', 'ttt', 'solitaire'].some(open) || (WM.isOpen('browser') && WM.get('browser').data.br?.mode === 'runner'); };
U.busy = busy;
const newer = l => !!l && (ver.compare(l.version, CQ.VERSION) > 0 || (ver.compare(l.version, CQ.VERSION) === 0 && (ver.buildKey(l.build) || 0) > (ver.buildKey(CQ.BUILD) || 0)));
const emit = () => { CQ.bus.emit('update:state', {state: U.state}); const w = WM.get('updates'); if (w) renderUpdate(w); };
const set = (patch) => { Object.assign(U, patch); emit(); };

// ---------- Service Worker ----------
async function refreshCacheInfo() {
  try { const keys = (await caches.keys()).filter(k => k.startsWith('classiquiz-cache-')); const all = await caches.keys(); let n = 0; if (keys.length) n = (await (await caches.open(keys[0])).keys()).length; U.cacheInfo = {keys, legacy: all.filter(k => k.startsWith('cq-offline-')).length, files: n}; } catch { U.cacheInfo = null; }
}
function watchInstalling(sw) {
  if (!sw) return; const hadController = !!navigator.serviceWorker.controller;
  if (hadController) set({state: 'downloading', progress: U.progress || {done: 0, total: 0}});   // há versão em uso: é uma atualização de verdade
  sw.addEventListener('statechange', () => {
    if (sw.state === 'installed') { if (hadController && U.reg && U.reg.waiting) set({state: 'ready', progress: null}); }   // 1ª instalação ativa sozinha; atualização espera o jogador
    else if (sw.state === 'activated' && !hadController) { set({state: U.state === 'downloading' ? 'idle' : U.state, progress: null}); void refreshCacheInfo().then(emit); }
    else if (sw.state === 'redundant' && U.state === 'downloading') set({state: 'error', error: 'O download da nova versão falhou e foi descartado. A versão atual continua funcionando.', progress: null});
  });
}
U.init = async () => {
  if (!swOk) return;
  navigator.serviceWorker.addEventListener('message', e => {
    const d = e.data; if (!d || d.source !== 'cq-sw') return;
    if (d.type === 'progress' && d.build !== CQ.BUILD) set({state: 'downloading', progress: {done: d.done, total: d.total}});
    else if (d.type === 'error') { if (d.build !== CQ.BUILD) set({state: 'error', error: 'Falha ao preparar a atualização: ' + d.message + '. A versão atual continua intacta.', progress: null}); }
    else if (d.type === 'installed' && d.build === CQ.BUILD) set({offlineBuild: CQ.BUILD});
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => { U.controlled = true; if (U._applying && !U._reloading) { U._reloading = true; location.reload(); } void refreshCacheInfo().then(emit); });
  try {
    U.reg = await navigator.serviceWorker.register('./sw.js', {scope: './', updateViaCache: 'none'}); U.controlled = !!navigator.serviceWorker.controller;
    U.reg.addEventListener('updatefound', () => watchInstalling(U.reg.installing));
    if (U.reg.waiting && U.controlled) set({state: 'ready'}); else if (U.reg.installing) watchInstalling(U.reg.installing);
    navigator.serviceWorker.ready.then(() => { void refreshCacheInfo().then(emit); });
  } catch (err) { console.warn('[PWA]', err); set({state: U.state === 'idle' ? 'idle' : U.state, error: 'Não foi possível registrar o modo offline neste navegador.'}); }
};

// ---------- verificação real ----------
U.check = async ({silent = false} = {}) => {
  if (U.state === 'checking' || U.state === 'downloading') return;
  if (!web) { set({state: 'error', error: 'Esta é uma edição local (arquivos abertos direto do disco). Abra a versão publicada na web para verificar atualizações.', checkedAt: Date.now()}); return; }
  if (navigator.onLine === false) { set({state: 'error', error: 'Sem internet real no momento. O ClaQui OS, os jogos e os sites .cqo continuam funcionando; só a atualização precisa de conexão.', checkedAt: Date.now()}); return; }
  set({state: 'checking', error: ''});
  try {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 12000);
    const r = await fetch(`version.json?cb=${Date.now()}`, {cache: 'no-store', signal: ctl.signal}); clearTimeout(timer);
    if (!r.ok) throw Error('O servidor respondeu ' + r.status + '.');
    const data = await r.json();
    if (!ver.isValid(data.version)) throw Error('O servidor enviou uma versão inválida.');
    if (data.build && !ver.isBuild(data.build)) throw Error('O servidor enviou uma compilação inválida.');
    U.latest = data; U.checkedAt = Date.now();
    if (newer(data)) {
      if (U.reg && U.reg.waiting) set({state: 'ready'});
      else { set({state: swOk && U.reg ? 'downloading' : 'available', progress: {done: 0, total: 0}}); if (swOk && U.reg) { try { await U.reg.update(); if (U.reg.waiting) set({state: 'ready', progress: null}); else if (!U.reg.installing) set({state: 'available'}); } catch (e) { set({state: 'error', error: 'Não foi possível baixar a nova versão agora. Tente novamente.'}); } } }
      if (silent) CQ.notify('Nova versão disponível: ' + data.version + '. Abra o ClaQui Update.');
    } else set({state: 'uptodate'});
  } catch (err) { set({state: 'error', error: err.name === 'AbortError' ? 'O servidor demorou demais para responder.' : (err.message && !/fetch|network|load failed/i.test(err.message) ? err.message : 'Não foi possível consultar a internet real. Verifique a conexão e tente novamente.'), checkedAt: Date.now()}); }
  void refreshCacheInfo().then(emit);
};
// Troca de versão. Nunca automática; pede confirmação se há Trilha/minijogo aberto; salva o progresso antes de reiniciar.
U.apply = async () => {
  if (busy()) { const ok = await CQ.ui.confirm('Atualizar agora?', '<p>Há uma Trilha ou um minijogo aberto. O progresso da Trilha é salvo automaticamente, mas a partida do minijogo será encerrada.</p><p>Deseja atualizar e reiniciar agora ou deixar para depois?</p>', 'Atualizar e reiniciar', 'Depois'); if (!ok) return; }
  try { CQ.game && CQ.game.persist && CQ.game.persist(); } catch {}
  if (U.reg && U.reg.waiting) { U._applying = true; U.reg.waiting.postMessage({type: 'SKIP_WAITING'}); setTimeout(() => { if (!U._reloading) { U._reloading = true; location.reload(); } }, 6000); }
  else location.reload();
};

// ---------- janela ----------
const PHASE = {idle: 'Pronto para procurar atualizações', checking: 'Procurando atualizações…', uptodate: 'Seu ClaQui OS está atualizado', available: 'Nova versão disponível', downloading: 'Baixando a nova versão…', ready: 'Atualização pronta para instalar', error: 'Não foi possível verificar'};
function renderUpdate(w) {
  const c = U, l = c.latest, pct = c.progress && c.progress.total ? Math.round(c.progress.done / c.progress.total * 100) : null;
  const ci = c.cacheInfo;
  w.setTitle('ClaQui Update'); w.setStatus('Internet real: ' + (!web ? 'edição local' : navigator.onLine === false ? 'sem conexão' : 'consulta real'), CQ.clock.osName() + ' • ' + CQ.VERSION);
  w.body.innerHTML = `<div class="setup-simple update-center"><div class="update-header"><img src="assets/icons/atualizacoes.svg" alt=""><div><h1>ClaQui Update</h1><p class="muted">Central de atualizações do ${E(CQ.clock.osName())}</p></div></div>
    <div class="update-status" role="status"><h2>${E(PHASE[c.state] || '')}</h2>
      <p>Versão em uso: <b>${E(CQ.VERSION)}</b> • compilação <b>${E(CQ.BUILD)}</b></p>
      ${l ? `<p>Última publicada: <b>${E(l.version)}</b>${l.build ? ` • compilação <b>${E(l.build)}</b>` : ''}${l.releasedAt ? ` • ${E(l.releasedAt.split('-').reverse().join('/'))}` : ''}</p>` : ''}
      ${c.state === 'downloading' ? `<div class="up-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct ?? 0}"><i style="width:${pct ?? 5}%"></i></div><p class="muted">${c.progress && c.progress.total ? `${c.progress.done} de ${c.progress.total} arquivos baixados e verificados` : 'Preparando download…'}</p>` : ''}
      ${c.state === 'error' ? `<p class="up-err">${E(c.error)}</p>` : ''}
      ${c.checkedAt ? `<p class="muted">Última verificação: ${E(CQ.fmtDate(c.checkedAt))}</p>` : '<p class="muted">Ainda não foram procuradas atualizações.</p>'}</div>
    ${(c.state === 'ready' || c.state === 'available' || c.state === 'downloading') ? `<div class="update-new"><h2>${E(l ? l.version : 'Nova versão')}</h2><p>${E((l && l.summary) || 'Uma nova versão do ClaQui OS está disponível.')}</p><div class="actions">${c.state === 'ready' ? '<button type="button" class="chrome-button primary" data-update="install">Atualizar e reiniciar</button><button type="button" class="chrome-button" data-update="later">Depois</button>' : c.state === 'available' ? '<button type="button" class="chrome-button primary" data-update="install">Atualizar e reiniciar</button><button type="button" class="chrome-button" data-update="later">Depois</button>' : ''}</div><p class="muted">O jogo não reinicia sozinho. Seus saves, conquistas e preferências continuam guardados.</p></div>` : ''}
    <div class="actions"><button type="button" class="chrome-button primary" data-update="check" ${c.state === 'checking' || c.state === 'downloading' ? 'disabled' : ''}>Procurar atualizações</button></div>
    <h2>Modo offline</h2><p>${swOk ? (c.controlled ? `Instalado: o ClaQui OS, os jogos e o navegador abrem sem internet${ci && ci.files ? ` (${ci.files} arquivos guardados, ${ci.keys.length} conjunto ativo)` : ''}.` : 'O modo offline ainda está sendo instalado. Mantenha a página aberta até o fim do carregamento.') : (web ? 'Este navegador não oferece suporte a Service Worker.' : 'Disponível somente na versão publicada na web.')}</p>
    <h2>Histórico de versões</h2><ul class="changes">${HISTORY.map(([v, d, t]) => `<li><b>${E(v)}</b> <span class="muted">(${E(d)})</span> ${E(t)}</li>`).join('')}</ul></div>`;
}
A.updates = {title: 'ClaQui Update', icon: 'assets/icons/atualizacoes.svg', bodyClass: 'page update-page', persistent: true,
  render(w) {
    renderUpdate(w);
    w.body.addEventListener('click', e => { const b = e.target.closest('[data-update]'); if (!b) return; const k = b.dataset.update; if (k === 'check') void U.check(); else if (k === 'install') void U.apply(); else if (k === 'later') CQ.notify('Tudo bem: a atualização fica esperando por você.'); });
    void refreshCacheInfo().then(() => WM.get('updates') && renderUpdate(w));
    const stamp = Number(CQ.store.read('classiquiz.v1.update-check', 0)) || 0;
    if (Date.now() - stamp > 6 * 3600000 && U.state === 'idle') { CQ.store.write('classiquiz.v1.update-check', Date.now()); void U.check(); }
  }};
window.addEventListener('load', () => { void U.init().then(() => { setTimeout(() => { if (web && navigator.onLine !== false && U.state === 'idle') void U.check({silent: true}); }, 4000); }); });
window.addEventListener('online', () => { if (U.state === 'error') void U.check({silent: true}); });
})();
