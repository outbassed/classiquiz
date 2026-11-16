/* ClaQui OS — versões por data (comparador) e relógio simulado do sistema fictício. Licença: MIT.
   O relógio simulado NUNCA altera o relógio real do aparelho nem as datas técnicas de publicação/compilação (CQ.RELEASED_AT, CQ.BUILD).
   Este arquivo é testável em Node (sem DOM). */
(() => {
'use strict';
const CQ = window.CQ = window.CQ || {};
const pad2 = n => String(n).padStart(2, '0');

// =============== comparação de versões: semântica legada (2.0.9) e data (26nov16, 26nov16.1) ===============
const MON = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const ver = CQ.ver = {
  months: MON,
  parse(v) {
    const s = String(v ?? '').trim().replace(/^v/i, '').toLowerCase(); let m;
    if ((m = s.match(/^(\d{1,4})\.(\d{1,4})\.(\d{1,4})$/))) return {kind: 0, key: [+m[1], +m[2], +m[3]], text: s};
    if ((m = s.match(/^(\d{2})(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)(\d{2})(?:\.(\d{1,3}))?$/)) && +m[1] >= 1 && +m[1] <= 31)
      return {kind: 1, key: [2000 + +m[3], MON.indexOf(m[2]) + 1, +m[1], m[4] ? +m[4] : 0], text: s};
    return null;
  },
  // -1, 0 ou 1. Versão por data é sempre mais nova que qualquer numeração semântica legada. Inválida < válida.
  compare(a, b) {
    const x = ver.parse(a), y = ver.parse(b);
    if (!x || !y) return x ? 1 : y ? -1 : 0;
    if (x.kind !== y.kind) return x.kind < y.kind ? -1 : 1;
    for (let i = 0; i < x.key.length; i++) if (x.key[i] !== y.key[i]) return x.key[i] < y.key[i] ? -1 : 1;
    return 0;
  },
  isValid: v => !!ver.parse(v),
  // Compilação DDMMAAAA.HHMMSS -> número AAAAMMDDHHMMSS (para ordenar)
  buildKey(b) { const m = String(b ?? '').match(/^(\d{2})(\d{2})(\d{4})\.(\d{2})(\d{2})(\d{2})$/); return m ? +(m[3] + m[2] + m[1] + m[4] + m[5] + m[6]) : null; },
  isBuild: b => ver.buildKey(b) !== null
};

// =============== relógio simulado ===============
const DEFAULTS = {clockMode: 'device', clockOffset: 0, clockFrozen: false, clockFrozenAt: 0, clock24: true, clockTz: 'device'};
const get = k => (CQ.sys && CQ.sys.get(k) !== undefined) ? CQ.sys.get(k) : DEFAULTS[k];
// Fusos fixos (sem horário de verão: é um sistema fictício). 'device' usa o fuso real do aparelho.
const ZONES = [['device', 'Fuso do dispositivo', null],
  ['-720', '(UTC−12:00) Linha internacional de data', -720], ['-660', '(UTC−11:00) Samoa', -660], ['-600', '(UTC−10:00) Havaí', -600], ['-540', '(UTC−09:00) Alasca', -540],
  ['-480', '(UTC−08:00) Hora do Pacífico', -480], ['-420', '(UTC−07:00) Hora das Montanhas', -420], ['-360', '(UTC−06:00) Hora Central', -360], ['-300', '(UTC−05:00) Hora do Leste / Bogotá', -300],
  ['-240', '(UTC−04:00) Manaus / Atlântico', -240], ['-180', '(UTC−03:00) Brasília', -180], ['-120', '(UTC−02:00) Fernando de Noronha', -120], ['-60', '(UTC−01:00) Açores', -60],
  ['0', '(UTC±00:00) Greenwich / Lisboa / Londres', 0], ['60', '(UTC+01:00) Europa Central', 60], ['120', '(UTC+02:00) Europa Oriental / Cairo', 120], ['180', '(UTC+03:00) Moscou / Nairóbi', 180],
  ['240', '(UTC+04:00) Dubai', 240], ['300', '(UTC+05:00) Karachi', 300], ['330', '(UTC+05:30) Nova Délhi', 330], ['360', '(UTC+06:00) Daca', 360], ['420', '(UTC+07:00) Bangcoc', 420],
  ['480', '(UTC+08:00) Pequim / Singapura', 480], ['540', '(UTC+09:00) Tóquio / Seul', 540], ['600', '(UTC+10:00) Sydney', 600], ['660', '(UTC+11:00) Ilhas Salomão', 660], ['720', '(UTC+12:00) Auckland', 720]];
const WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MONTHS_FULL = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const zoneMin = () => { const z = ZONES.find(x => x[0] === String(get('clockTz'))); return z && z[2] !== null ? z[2] : null; };

const clock = CQ.clock = {
  zones: ZONES, weekdays: WEEKDAYS, monthsFull: MONTHS_FULL, minYear: 1601, maxYear: 9999,
  // Instante simulado (ms desde 1970). Modo "device": igual ao aparelho. Manual: parte do valor escolhido e continua andando (a menos que congelado).
  now() {
    if (get('clockMode') !== 'manual') return Date.now();
    return get('clockFrozen') ? Number(get('clockFrozenAt')) || 0 : Date.now() + (Number(get('clockOffset')) || 0);
  },
  isManual: () => get('clockMode') === 'manual',
  isFrozen: () => get('clockMode') === 'manual' && !!get('clockFrozen'),
  // Deslocamento usado para exibir carimbos de tempo antigos (arquivos, salvamentos) como se tivessem sido feitos neste relógio.
  shift: () => get('clockMode') === 'manual' && !get('clockFrozen') ? Number(get('clockOffset')) || 0 : 0,
  // Componentes de calendário no fuso escolhido. mo: 0-11.
  parts(ts = clock.now()) {
    const min = zoneMin(), d = new Date(min === null ? ts : ts + min * 60000);
    return min === null
      ? {y: d.getFullYear(), mo: d.getMonth(), d: d.getDate(), H: d.getHours(), M: d.getMinutes(), S: d.getSeconds(), dow: d.getDay()}
      : {y: d.getUTCFullYear(), mo: d.getUTCMonth(), d: d.getUTCDate(), H: d.getUTCHours(), M: d.getUTCMinutes(), S: d.getUTCSeconds(), dow: d.getUTCDay()};
  },
  // Monta um instante a partir dos componentes exibidos (inverso de parts). Valida limites e dias do mês.
  compose({y, mo, d, H = 0, M = 0, S = 0}) {
    y = Math.max(clock.minYear, Math.min(clock.maxYear, Math.trunc(+y))); mo = Math.max(0, Math.min(11, Math.trunc(+mo)));
    const dim = new Date(Date.UTC(2001, mo + 1, 0)).getUTCDate() + (mo === 1 && clock.isLeap(y) ? 1 : 0);
    d = Math.max(1, Math.min(dim, Math.trunc(+d))); H = Math.max(0, Math.min(23, Math.trunc(+H))); M = Math.max(0, Math.min(59, Math.trunc(+M))); S = Math.max(0, Math.min(59, Math.trunc(+S)));
    const min = zoneMin(), dt = new Date(0);
    if (min === null) { dt.setFullYear(y, mo, d); dt.setHours(H, M, S, 0); return dt.getTime(); }
    dt.setUTCFullYear(y, mo, d); dt.setUTCHours(H, M, S, 0); return dt.getTime() - min * 60000;
  },
  isLeap: y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0,
  daysIn: (y, mo) => [31, clock.isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo],
  // Configuração. Nenhuma função aqui toca no relógio real do dispositivo.
  setDevice() { CQ.sys.set({clockMode: 'device', clockOffset: 0, clockFrozen: false, clockFrozenAt: 0}); },
  setManual(p, {frozen = false} = {}) {
    const target = clock.compose(p); CQ.sys.set({clockMode: 'manual', clockOffset: target - Date.now(), clockFrozen: !!frozen, clockFrozenAt: target}); return target;
  },
  setFrozen(on) { if (!clock.isManual()) return; const t = clock.now(); CQ.sys.set(on ? {clockFrozen: true, clockFrozenAt: t} : {clockFrozen: false, clockOffset: t - Date.now()}); },
  // Nome visível do sistema: dois últimos dígitos do ano; a exceção é o ano 2000.
  nameForYear: y => `ClaQui ${y === 2000 ? '2000' : pad2(((y % 100) + 100) % 100)}`,
  osName: () => clock.nameForYear(clock.parts().y),
  fmtTime(ts = clock.now(), seconds = false) {
    const p = clock.parts(ts); let h = p.H, suf = '';
    if (!get('clock24')) { suf = h >= 12 ? ' PM' : ' AM'; h = h % 12 || 12; }
    return `${get('clock24') ? pad2(h) : h}:${pad2(p.M)}${seconds ? ':' + pad2(p.S) : ''}${suf}`;
  },
  fmtDate(ts = clock.now()) { const p = clock.parts(ts); return `${pad2(p.d)}/${pad2(p.mo + 1)}/${String(p.y).padStart(4, '0')}`; },
  fmtLong(ts = clock.now()) { const p = clock.parts(ts); return `${WEEKDAYS[p.dow][0].toUpperCase() + WEEKDAYS[p.dow].slice(1)}, ${p.d} de ${MONTHS_FULL[p.mo]} de ${p.y}`; },
  // Carimbo REAL (ex.: criado em) exibido no relógio simulado
  fmtDateTime(realTs) { const t = Number(realTs) + clock.shift(); return clock.fmtDate(t) + ' ' + clock.fmtTime(t); },
  // ---- atualização da interface ----
  tick() {
    if (typeof document === 'undefined') return;
    const c = document.getElementById('task-clock'), txt = clock.fmtTime(), name = clock.osName();
    if (c) { if (c.textContent !== txt) c.textContent = txt; const tip = `${clock.fmtLong()} • ${clock.fmtTime(clock.now(), true)}${clock.isManual() ? ' (manual)' : ''} — clique para ajustar data e hora`; if (c.title !== tip) c.title = tip; }
    if (name !== clock._name) { clock._name = name; clock.applyName(); CQ.bus && CQ.bus.emit('clock:name', {name}); }
    CQ.bus && CQ.bus.emit('clock:tick', {});
  },
  applyName() {
    if (typeof document === 'undefined') return; const n = clock.osName();
    for (const el of document.querySelectorAll('[data-osname]')) if (el.textContent !== n) el.textContent = n;
    document.title = `ClassiQuiz • ${n} | Um clássico que nunca existiu`;
  },
  start() {
    clearInterval(clock._iv); clock._name = null; clock.tick(); clock._iv = setInterval(clock.tick, 1000);
    CQ.bus && CQ.bus.on('sys:change', p => { if (Object.keys(p).some(k => k.startsWith('clock'))) clock.tick(); });
  }
};
})();
