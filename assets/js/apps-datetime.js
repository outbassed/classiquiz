/* ClaQui OS — janela "Propriedades de Data e Hora" (estilo Windows XP/2003). Licença: MIT.
   Tudo é SIMULAÇÃO: nada altera o relógio real do aparelho. O nome do sistema (ClaQui 26, ClaQui 99, ClaQui 2000…) acompanha o ano configurado. */
(() => {
'use strict';
const CQ = window.CQ, E = CQ.E, OS = CQ.os, WM = OS.wm, A = CQ.apps, C = CQ.clock, p2 = CQ.pad2;
const TABS = [['dt', 'Data e Hora'], ['tz', 'Fuso horário e formato'], ['op', 'Opções']];
const MON = C.monthsFull.map(m => m[0].toUpperCase() + m.slice(1));

function draftFromNow(manual) { const p = C.parts(); return {manual: !!manual, y: p.y, mo: p.mo, d: p.d, H: p.H, M: p.M, S: p.S, frozen: C.isFrozen(), tz: String(CQ.sys.get('clockTz')), h24: !!CQ.sys.get('clock24'), dirty: false}; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, Math.trunc(Number(v)) || 0));
function analog(H, M, S) {
  const a = (deg, len, wd, col) => `<line x1="50" y1="50" x2="${(50 + Math.sin(deg * Math.PI / 180) * len).toFixed(1)}" y2="${(50 - Math.cos(deg * Math.PI / 180) * len).toFixed(1)}" stroke="${col}" stroke-width="${wd}" stroke-linecap="square"/>`;
  const ticks = Array.from({length: 12}, (_, i) => `<line x1="50" y1="8" x2="50" y2="${i % 3 ? 12 : 15}" stroke="#172b51" stroke-width="${i % 3 ? 1.5 : 2.5}" transform="rotate(${i * 30} 50 50)"/>`).join('');
  return `<svg class="dt-analog" viewBox="0 0 100 100" role="img" aria-label="Relógio analógico"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#172b51" stroke-width="3"/>${ticks}<g id="dt-hands">${a((H % 12) * 30 + M * .5, 26, 4, '#172b51')}${a(M * 6 + S * .1, 38, 3, '#172b51')}${a(S * 6, 41, 1.4, '#d33848')}</g><circle cx="50" cy="50" r="3" fill="#172b51"/></svg>`;
}
function calendarGrid(d) {
  const first = new Date(Date.UTC(2000, 0, 1)); first.setUTCFullYear(d.y, d.mo, 1); const dow = first.getUTCDay(), n = C.daysIn(d.y, d.mo); let cells = '';
  for (let i = 0; i < dow; i++) cells += '<span></span>';
  for (let day = 1; day <= n; day++) cells += `<button type="button" class="dt-day ${day === d.d ? 'sel' : ''}" data-dt="day" data-v="${day}" aria-pressed="${day === d.d}" aria-label="Dia ${day}">${day}</button>`;
  return `<div class="dt-dow" aria-hidden="true">${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(x => `<b>${x}</b>`).join('')}</div><div class="dt-days">${cells}</div>`;
}
function view(w) {
  const d = w.data.dt, tab = w.data.tab || 'dt', dis = d.manual ? '' : 'disabled';
  const tabs = `<div class="tabs" role="tablist">${TABS.map(([id, n]) => `<button type="button" role="tab" class="tab ${tab === id ? 'on' : ''}" aria-selected="${tab === id}" data-dt="tab" data-v="${id}">${n}</button>`).join('')}</div>`;
  let body = '';
  if (tab === 'dt') {
    const hh = d.h24 ? d.H : (d.H % 12 || 12);
    body = `<div class="dt-modes" role="radiogroup" aria-label="Fonte da data e hora"><label class="check"><input type="radio" name="dtmode" data-dt="mode" value="device" ${d.manual ? '' : 'checked'}> Usar data e hora do dispositivo <small>(recomendado)</small></label><label class="check"><input type="radio" name="dtmode" data-dt="mode" value="manual" ${d.manual ? 'checked' : ''}> Definir data e hora manualmente</label></div>
      <div class="dt-cols"><fieldset class="dt-box"><legend>Data</legend><div class="dt-mhead"><select data-dt="month" aria-label="Mês" ${dis}>${MON.map((m, i) => `<option value="${i}" ${i === d.mo ? 'selected' : ''}>${m}</option>`).join('')}</select><input type="number" data-dt="year" min="${C.minYear}" max="${C.maxYear}" value="${d.y}" aria-label="Ano" ${dis}></div><div id="dt-cal">${calendarGrid(d)}</div></fieldset>
      <fieldset class="dt-box"><legend>Hora</legend><div id="dt-clockface">${analog(d.H, d.M, d.S)}</div><div class="dt-time"><input type="number" data-dt="h" min="${d.h24 ? 0 : 1}" max="${d.h24 ? 23 : 12}" value="${p2(hh)}" aria-label="Hora" ${dis}>:<input type="number" data-dt="m" min="0" max="59" value="${p2(d.M)}" aria-label="Minuto" ${dis}>:<input type="number" data-dt="s" min="0" max="59" value="${p2(d.S)}" aria-label="Segundo" ${dis}>${d.h24 ? '' : `<select data-dt="ampm" aria-label="AM ou PM" ${dis}><option value="AM" ${d.H < 12 ? 'selected' : ''}>AM</option><option value="PM" ${d.H >= 12 ? 'selected' : ''}>PM</option></select>`}</div></fieldset></div>
      <p class="dt-long" id="dt-long" role="status"></p>`;
  } else if (tab === 'tz') {
    body = `<fieldset class="dt-box wide"><legend>Fuso horário</legend><select data-dt="tz" aria-label="Fuso horário" class="dt-tz">${C.zones.map(z => `<option value="${z[0]}" ${String(d.tz) === z[0] ? 'selected' : ''}>${E(z[1])}</option>`).join('')}</select><p class="muted">Os fusos são fixos e sem horário de verão. “Fuso do dispositivo” usa o fuso do seu aparelho.</p></fieldset>
      <fieldset class="dt-box wide"><legend>Formato da hora</legend><label class="check"><input type="radio" name="dtfmt" data-dt="fmt" value="24" ${d.h24 ? 'checked' : ''}> 24 horas (14:35)</label><label class="check"><input type="radio" name="dtfmt" data-dt="fmt" value="12" ${d.h24 ? '' : 'checked'}> 12 horas (2:35 PM)</label></fieldset>`;
  } else {
    body = `<fieldset class="dt-box wide"><legend>Opções do relógio</legend><label class="check"><input type="checkbox" data-dt="freeze" ${d.frozen ? 'checked' : ''} ${d.manual ? '' : 'disabled'}> Manter o relógio parado no horário definido</label><p class="muted">Por padrão, no modo manual o relógio continua andando a partir da data e hora escolhidas. Marque a opção acima apenas se quiser que o tempo fique congelado.</p></fieldset>
      <p class="muted">As mudanças valem apenas dentro do ClaQui OS e <b>nunca alteram o relógio real do seu aparelho</b> nem as datas de publicação e compilação do jogo (versão ${E(CQ.VERSION)} • compilação ${E(CQ.BUILD)}).</p>`;
  }
  const nameYear = d.manual ? d.y : C.parts().y;
  return `<div class="setup-simple dt-win"><div class="update-header"><img src="assets/icons/data-hora.svg" alt=""><div><h1>Data e Hora</h1><p class="muted">O sistema se chama <b id="dt-osname">${E(C.nameForYear(nameYear))}</b> neste ano.</p></div></div>${tabs}<div class="tab-body">${body}</div>
    <div class="actions dt-actions"><button type="button" class="chrome-button primary" data-dt="ok">OK</button><button type="button" class="chrome-button" data-dt="cancel">Cancelar</button><button type="button" class="chrome-button" data-dt="apply" ${d.dirty ? '' : 'disabled'}>Aplicar</button></div></div>`;
}
function live(w) {   // atualiza relógio analógico/texto sem redesenhar (preserva foco e digitação)
  const d = w.data.dt; if (!d) return;
  if (!d.dirty) { const p = C.parts(); Object.assign(d, {y: p.y, mo: p.mo, d: p.d, H: p.H, M: p.M, S: p.S}); }
  const face = w.body.querySelector('#dt-clockface'); if (face && (!d.dirty)) face.innerHTML = analog(d.H, d.M, d.S);
  const ae = document.activeElement, typing = ae && w.body.contains(ae) && /INPUT|SELECT/.test(ae.tagName);
  if (!d.dirty && !typing) { const set = (sel, v) => { const el = w.body.querySelector(sel); if (el && el.value !== v) el.value = v; };
    set('[data-dt="h"]', p2(d.h24 ? d.H : (d.H % 12 || 12))); set('[data-dt="m"]', p2(d.M)); set('[data-dt="s"]', p2(d.S)); set('[data-dt="year"]', String(d.y)); set('[data-dt="month"]', String(d.mo)); set('[data-dt="ampm"]', d.H < 12 ? 'AM' : 'PM');
    const cal = w.body.querySelector('#dt-cal'); if (cal) { const key = d.y + '-' + d.mo + '-' + d.d; if (cal.dataset.k !== key) { cal.innerHTML = calendarGrid(d); cal.dataset.k = key; } } }
  const lg = w.body.querySelector('#dt-long'); if (lg) lg.textContent = (d.manual && d.dirty ? 'Pré-visualização: ' : 'Agora: ') + (d.manual && d.dirty ? `${p2(d.d)}/${p2(d.mo + 1)}/${d.y} ${p2(d.H)}:${p2(d.M)}:${p2(d.S)}` : `${C.fmtLong()} • ${C.fmtTime(C.now(), true)}`);
  const nm = w.body.querySelector('#dt-osname'); if (nm) nm.textContent = C.nameForYear(d.manual ? d.y : C.parts().y);
}
function apply(w) {
  const d = w.data.dt;
  CQ.sys.set({clockTz: d.tz, clock24: !!d.h24});
  if (d.manual) { const y = clamp(d.y, C.minYear, C.maxYear); C.setManual({y, mo: d.mo, d: d.d, H: d.H, M: d.M, S: d.S}, {frozen: d.frozen}); } else C.setDevice();
  w.data.dt = draftFromNow(C.isManual()); w.data.dt.dirty = false; CQ.notify('Data e hora aplicadas: ' + C.osName() + '.'); draw(w);
}
function draw(w) { if (w._drawing) return; w._drawing = true; try { w.body.innerHTML = view(w); } finally { w._drawing = false; } live(w); }   // trocar o HTML com um campo focado dispara 'change' ao sair do foco: o guarda evita redesenho aninhado
function normalizeDraft(d) { d.y = clamp(d.y, C.minYear, C.maxYear); d.mo = clamp(d.mo, 0, 11); d.d = clamp(d.d, 1, C.daysIn(d.y, d.mo)); d.H = clamp(d.H, 0, 23); d.M = clamp(d.M, 0, 59); d.S = clamp(d.S, 0, 59); }
function onInput(w, e, isChange) {
  if (w._drawing) return; const k = e.target.dataset.dt; if (!k) return; const d = w.data.dt; let redraw = false;
  const touch = () => { if (!d.manual) { d.manual = true; redraw = true; } d.dirty = true; };
  if (k === 'mode') { d.manual = e.target.value === 'manual'; d.dirty = true; if (!d.manual) Object.assign(d, {frozen: false}); const p = C.parts(); Object.assign(d, {y: p.y, mo: p.mo, d: p.d, H: p.H, M: p.M, S: p.S}); redraw = true; }
  else if (k === 'month') { touch(); d.mo = clamp(e.target.value, 0, 11); d.d = Math.min(d.d, C.daysIn(d.y, d.mo)); redraw = true; }
  else if (k === 'year') { if (!isChange && e.target.value.length < 4) return; touch(); d.y = clamp(e.target.value, C.minYear, C.maxYear); d.d = Math.min(d.d, C.daysIn(d.y, d.mo)); redraw = isChange; }
  else if (k === 'h') { touch(); let v = clamp(e.target.value, d.h24 ? 0 : 1, d.h24 ? 23 : 12); if (!d.h24) { v = v % 12 + (d.H >= 12 ? 12 : 0); } d.H = v; redraw = isChange; }
  else if (k === 'm') { touch(); d.M = clamp(e.target.value, 0, 59); redraw = isChange; } else if (k === 's') { touch(); d.S = clamp(e.target.value, 0, 59); redraw = isChange; }
  else if (k === 'ampm') { touch(); d.H = d.H % 12 + (e.target.value === 'PM' ? 12 : 0); redraw = true; }
  else if (k === 'tz') { d.tz = e.target.value; d.dirty = true; redraw = true; } else if (k === 'fmt') { d.h24 = e.target.value === '24'; d.dirty = true; redraw = true; }
  else if (k === 'freeze') { d.frozen = !!e.target.checked; d.dirty = true; redraw = true; }
  normalizeDraft(d); if (k === 'year' && !isChange) { live(w); return; }
  if (redraw) { const pos = k; draw(w); w.body.querySelector(`[data-dt="${pos}"]`)?.focus?.({preventScroll: true}); } else live(w);
}
A.datetime = {title: 'Data e Hora', icon: 'assets/icons/data-hora.svg', bodyClass: 'page', w: 640, h: 640, persistent: true,
  render(w) {
    w.data.dt = draftFromNow(C.isManual()); w.data.tab = 'dt'; w.setTitle('Propriedades de Data e Hora'); w.setStatus('Simulação: não altera o relógio real do aparelho.', C.osName()); draw(w);
    w.body.addEventListener('click', e => {
      const b = e.target.closest('button[data-dt]'); if (!b) return; const k = b.dataset.dt, d = w.data.dt;
      if (k === 'tab') { w.data.tab = b.dataset.v; draw(w); } else if (k === 'day') { if (!d.manual) { d.manual = true; } d.d = +b.dataset.v; d.dirty = true; draw(w); }
      else if (k === 'apply') apply(w); else if (k === 'ok') { if (d.dirty) apply(w); WM.close('datetime'); } else if (k === 'cancel') WM.close('datetime');
    });
    w.body.addEventListener('input', e => onInput(w, e, false)); w.body.addEventListener('change', e => onInput(w, e, true));
    w._iv = setInterval(() => { if (!w.minimized) live(w); }, 1000);
  },
  onClose(w) { clearInterval(w._iv); }
};
CQ.bus.on('clock:name', () => { const w = WM.get('datetime'); if (w) w.setStatus('Simulação: não altera o relógio real do aparelho.', C.osName()); });
})();
