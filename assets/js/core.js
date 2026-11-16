/* ClassiQuiz / ClaQui OS — núcleo compartilhado (namespace, armazenamento, eventos, modais, sons). Licença: MIT. */
(() => {
'use strict';
const CQ = window.CQ = window.CQ || {};
const BUILD_INFO = window.CQ_BUILD || {version: 'dev', build: '00000000.000000', releasedAt: ''};
CQ.VERSION = BUILD_INFO.version;          // nome público da release (ex.: 26nov16) — gerado por tools/build.js
CQ.BUILD = BUILD_INFO.build;              // compilação DDMMAAAA.HHMMSS
CQ.RELEASED_AT = BUILD_INFO.releasedAt;   // data real da publicação (não depende do relógio simulado)
CQ.apps = {};
CQ.rules = {ultra: () => false};          // preenchido pelo jogo: regras que dependem da partida atual
CQ.KEYS = {SESSION:'classiquiz.v1.session',LIB:'classiquiz.v1.library',PREF:'classiquiz.v1.preferences',ACH:'classiquiz.v1.achievements',
  SYS:'classiquiz.v1.system',REW:'classiquiz.v1.rewards',REC:'classiquiz.v1.records',CAMP:'classiquiz.v1.campaigns',META:'classiquiz.v1.meta',
  DISC:'classiquiz.v1.discoveries',BACKUP:'classiquiz.v1.backup.pre-v2',CAL:'classiquiz.v1.calendar',PLAYER:'classiquiz.v1.player'};

CQ.E = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
CQ.mono = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
// Normalização explícita usada nas missões de texto: minúsculas, sem acentos, espaços colapsados.
CQ.norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
CQ.pad2 = n => String(n).padStart(2, '0');
// Datas exibidas passam pelo relógio simulado quando ele existe (CQ.clock, definido em clock.js); caso contrário, usam o dispositivo.
CQ.fmtDate = t => { if (CQ.clock) return CQ.clock.fmtDateTime(t); const d = new Date(t); return `${CQ.pad2(d.getDate())}/${CQ.pad2(d.getMonth()+1)}/${d.getFullYear()} ${CQ.pad2(d.getHours())}:${CQ.pad2(d.getMinutes())}`; };

// ---------- armazenamento local (JSON), tolerante a dados corrompidos e falta de espaço ----------
CQ.store = {
  read(key, fb) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  write(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { CQ.notify('Armazenamento local indisponível ou cheio.'); return false; } },
  remove(key) { try { localStorage.removeItem(key); } catch {} }
};

// ---------- barramento de eventos ----------
const listeners = new Map();
CQ.bus = {
  on(ev, fn) { if (!listeners.has(ev)) listeners.set(ev, new Set()); listeners.get(ev).add(fn); return () => listeners.get(ev)?.delete(fn); },
  emit(ev, data) { for (const fn of [...(listeners.get(ev) || [])]) { try { fn(data); } catch (e) { console.error('[CQ.bus]', ev, e); } } }
};

// ---------- preferências do sistema (ClaQui OS) ----------
const SYS_DEFAULTS = {scale: null, wallpaper: 'classico', wallpaperFit: 'fill', customWallpaper: false, reduceMotion: 'auto', volume: 70,
  bootCompleted: false, terminalConsent: false, iconOrder: 'default', theme: 'padrao', cursor: 'padrao', mouseScheme: 'classico', mouseSize: 32, mouseRoles: {}, mouseTrail: false, touchpadEnabled: false, touchpadFolded: false, touchpadSensitivity: 1, touchpadPosition: 'right', touchpadOpacity: .88, touchpadSize: 'medium', iconStyle: 'padrao', lastBoot: 0,
  // v26nov16: relógio simulado, rede virtual, tutorial e touchpad avançado (valores novos; dados antigos permanecem intactos)
  clockMode: 'device', clockOffset: 0, clockFrozen: false, clockFrozenAt: 0, clock24: true, clockTz: 'device',
  netOnline: true, netDial: false, fastEffects: false,
  tutorialDone: false, tutorialHide: false, seenRelease: '',
  touchpadShape: 'classico', touchpadW: 0, touchpadH: 0, touchpadAccel: 1, touchpadTapClick: true, touchpadX: -1, touchpadY: -1, touchpadProfiles: {}, touchpadButtons: 'integrated'};
let sysCache = null;
CQ.sys = {
  all() { if (!sysCache) { const raw = CQ.store.read(CQ.KEYS.SYS, {}); sysCache = Object.assign({}, SYS_DEFAULTS, raw && typeof raw === 'object' ? raw : {}); } return sysCache; },
  get(k) { return this.all()[k]; },
  set(patch) { Object.assign(this.all(), patch); CQ.store.write(CQ.KEYS.SYS, sysCache); CQ.bus.emit('sys:change', patch); },
  defaults: SYS_DEFAULTS
};
// Preferência legada de som (classiquiz.v1.preferences) — formato preservado.
CQ.prefs = CQ.store.read(CQ.KEYS.PREF, {sound: true});
if (!CQ.prefs || typeof CQ.prefs !== 'object') CQ.prefs = {sound: true};
CQ.savePrefs = () => CQ.store.write(CQ.KEYS.PREF, CQ.prefs);

// ---------- toast (notificações retrô curtas) ----------
let toastTimer = 0; const toastQueue = []; let toastBusy = false;
function showToast() {
  const el = document.getElementById('toast'); if (!el) return;
  const msg = toastQueue.shift(); if (!msg) { toastBusy = false; return; }
  toastBusy = true; el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.classList.remove('show'); setTimeout(showToast, 160); }, 2600);
}
CQ.notify = msg => { if (toastQueue.length < 4 && toastQueue[toastQueue.length-1] !== msg) toastQueue.push(String(msg)); if (!toastBusy) showToast(); };

// ---------- som (efeitos curtos sintetizados, sem arquivos externos) ----------
let audioCtx = null;
CQ.tone = (hz = 500, ms = 65, type = 'square') => {
  if (!CQ.prefs.sound || CQ.systemEffects?.silent) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    audioCtx ||= new AC();
    const vol = Math.max(0, Math.min(100, CQ.sys.get('volume'))) / 100;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = type; o.frequency.value = hz; g.gain.value = .027 * vol * 1.4;
    o.connect(g).connect(audioCtx.destination); o.start();
    g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + ms / 1000); o.stop(audioCtx.currentTime + ms / 1000);
  } catch {}
};
CQ.audio = () => { try { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; audioCtx ||= new AC(); return audioCtx; } catch { return null; } };

// ---------- modal acessível (uma por vez) com foco gerenciado ----------
let modalState = null;
CQ.ui = CQ.ui || {};
CQ.ui.modal = function modal(opts) {
  const layer = document.getElementById('modal-layer'); if (!layer) return Promise.resolve(null);
  if (modalState) CQ.ui.closeModal(modalState.dismiss);
  const {title = 'ClaQui OS', body = '', buttons = [{label: 'Fechar', value: true, primary: true}], footer = null, dismiss = null, cls = '', icon = 'assets/classiquiz-icon.svg'} = opts || {};
  return new Promise(resolve => {
    const prevFocus = document.activeElement;
    modalState = {resolve, dismiss, prevFocus};
    const foot = footer != null ? footer : buttons.map((b, i) => `<button type="button" class="chrome-button ${b.primary ? 'primary' : ''} ${b.danger ? 'danger' : ''}" data-modal-value="${CQ.E(JSON.stringify(b.value ?? null))}" ${i === 0 && buttons.length === 1 ? 'data-autofocus="1"' : ''}>${CQ.E(b.label)}</button>`).join('');
    layer.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true" aria-label="${CQ.E(title)}"><div class="modal-top"><span class="modal-heading"><img src="${CQ.E(icon)}" alt=""> ${CQ.E(title)}</span><button class="modal-close" type="button" data-modal-value="${CQ.E(JSON.stringify(dismiss))}" aria-label="Fechar">×</button></div><div class="modal-body">${body}</div><div class="modal-footer">${foot}</div></div>`;
    layer.classList.add('visible');
    const first = layer.querySelector('[data-autofocus]') || layer.querySelector('.modal-footer .primary,.modal-footer button,.modal-body input,.modal-body button');
    setTimeout(() => (first || layer.querySelector('.modal'))?.focus?.({preventScroll: true}), 20);
    CQ.bus.emit('modal:open', {title});
  });
};
CQ.ui.closeModal = function (value = null) {
  const layer = document.getElementById('modal-layer'); const st = modalState; modalState = null;
  if (layer) { layer.classList.remove('visible'); layer.innerHTML = ''; }
  if (st) { try { st.prevFocus?.focus?.({preventScroll: true}); } catch {} st.resolve(value); }
  CQ.bus.emit('modal:close', {});
};
CQ.ui.isModalOpen = () => !!modalState;
CQ.ui.confirm = (title, body, ok = 'Confirmar', cancel = 'Cancelar', danger = false) =>
  CQ.ui.modal({title, body, dismiss: false, buttons: [{label: cancel, value: false}, {label: ok, value: true, primary: !danger, danger}]});
CQ.ui.alert = (title, body, ok = 'OK') => CQ.ui.modal({title, body, buttons: [{label: ok, value: true, primary: true}], dismiss: true});
CQ.ui.prompt = (title, label, initial = '') => new Promise(resolve => {
  const id = 'prm' + Math.random().toString(36).slice(2, 7);
  CQ.ui.modal({title, body: `<label for="${id}">${CQ.E(label)}</label><input id="${id}" class="text-input" value="${CQ.E(initial)}" maxlength="120" autocomplete="off" spellcheck="false">`, dismiss: null,
    buttons: [{label: 'Cancelar', value: null}, {label: 'OK', value: '__ok__', primary: true}]}).then(v => resolve(v === '__ok__' ? (document.__lastPrompt ?? initial) : null));
  setTimeout(() => { const i = document.getElementById(id); if (i) { i.focus(); i.select(); i.addEventListener('input', () => { document.__lastPrompt = i.value; }); document.__lastPrompt = i.value; i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); document.__lastPrompt = i.value; CQ.ui.closeModal('__ok__'); } }); } }, 40);
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-modal-value]'); if (!b) return;
  let v = null; try { v = JSON.parse(b.dataset.modalValue); } catch {}
  CQ.ui.closeModal(v);
});
document.addEventListener('keydown', e => {
  if (!modalState) return;
  if (e.key === 'Escape') { e.stopPropagation(); CQ.ui.closeModal(modalState.dismiss); return; }
  if (e.key === 'Tab') {           // prende o foco dentro do modal
    const items = [...document.querySelectorAll('#modal-layer button,#modal-layer input,#modal-layer select,#modal-layer textarea,#modal-layer [tabindex="0"]')].filter(x => !x.disabled);
    if (!items.length) return; const i = items.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); } else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
  }
}, true);

// ---------- migração idempotente de dados (v1.2.x → v2.0.0) ----------
CQ.migrate = function () {
  const meta = CQ.store.read(CQ.KEYS.META, {schema: 0});
  if (meta && meta.schema >= 2) return meta;
  // Backup lógico: só o que é leve e insubstituível. Linhas do tempo das Trilhas são recriáveis pela seed.
  try {
    if (!localStorage.getItem(CQ.KEYS.BACKUP)) {
      const lib = CQ.store.read(CQ.KEYS.LIB, []), ses = CQ.store.read(CQ.KEYS.SESSION, null);
      const backup = {at: Date.now(), from: 'v1.2.x', achievements: CQ.store.read(CQ.KEYS.ACH, null), preferences: CQ.store.read(CQ.KEYS.PREF, null),
        library: Array.isArray(lib) ? lib.map(g => ({seed: g.seed, name: g.name, favorite: g.favorite, best: g.best, profile: g.profile, count: g.count, bank: g.bank, createdAt: g.createdAt})) : [],
        session: ses && ses.generation ? {seed: ses.generation.seed, phase: ses.phase, lives: ses.lives, done: ses.done, lost: ses.lost, updatedAt: ses.updatedAt} : null};
      localStorage.setItem(CQ.KEYS.BACKUP, JSON.stringify(backup));
    }
  } catch {}
  // Estruturas novas são ADICIONADAS sem tocar nas antigas.
  const ach = CQ.store.read(CQ.KEYS.ACH, null);
  if (ach && typeof ach === 'object') { ach.unlocked ||= {}; ach.stats ||= {}; ach.disabled = ach.disabled === true; CQ.store.write(CQ.KEYS.ACH, ach); }
  const next = {schema: 2, migratedAt: Date.now(), from: meta && meta.schema ? 'v' + meta.schema : 'v1.2.x', app: CQ.VERSION};
  CQ.store.write(CQ.KEYS.META, next); return next;
};

// Mensagens inofensivas para quem inspeciona o console real do navegador (nada depende disto).
CQ.easterEggs = function () {
  try {
    console.log('%cClassiQuiz', 'font:900 28px monospace;color:#ffc852;text-shadow:2px 2px #142a75');
    console.log('%cUM CLÁSSICO QUE NUNCA EXISTIU', 'font:700 11px monospace;color:#8ec8f0');
    console.log('Olá, curioso! Tudo aqui é do jogo — nenhuma pergunta depende do console. Mas o Claquim agradece a visita.');
    console.log('Dica inútil: o milho tem número par de fileiras. Quase sempre.');
  } catch {}
};
})();
