/* ClaQui OS — motor de missões: questões que pedem tarefas reais nos programas do sistema. Licença: MIT.
   Tipos: notepad-text, calc-result, paint-fill, keep-open (10/20 s), explorer-open, trash-restore, viewer-answer.
   Regras da missão temporal: o relógio só conta com a janela do programa pedido ABERTA e VISÍVEL (não minimizada) e a aba do navegador visível;
   minimizar PAUSA, fechar ZERA, abrir outro programa não conta; vencer o jogo NÃO é necessário. */
(() => {
'use strict';
const CQ = window.CQ, E = CQ.E, OS = CQ.os, WM = OS.wm, API = CQ.game;
const NAMES = {notepad: 'Bloco de Notas', paint: 'Paint', calc: 'Calculadora', mines: 'Campo Minado', ttt: 'Jogo da Velha', snake: 'Cobrinha', pong: 'Pong', explorer: 'Explorador de Arquivos', trash: 'Lixeira', viewer: 'Visualizador', calendar: 'Calendário', clock: 'Relógio', player: 'Reprodutor'};
const M = CQ.missions = {};
let active = null;   // {key, stage, offs:[], timer, acc, last, started, status}
const key = () => { const g = API.state.generation; return g ? g.seed + '#' + API.state.phase : ''; };
const open = (app, params) => OS.open(app, params);

M.render = function (s) {
  const m = s.mission || {}; const app = m.app || {'notepad-text': 'notepad', 'calc-result': 'calc', 'paint-fill': 'paint', 'explorer-open': 'explorer', 'trash-restore': 'trash', 'viewer-answer': 'viewer', 'os-file-answer': 'explorer'}[m.type];
  const label = NAMES[app] || 'programa';
  const extra = m.type === 'notepad-text' ? '<p class="mission-note">A comparação ignora maiúsculas, acentos e espaços repetidos. É preciso <b>salvar</b> o arquivo.</p>'
    : m.type === 'calc-result' ? '<p class="mission-note">O resultado precisa vir de uma conta feita na calculadora (com ao menos uma operação).</p>'
    : m.type === 'keep-open' ? `<p class="mission-note">O tempo só conta com o programa aberto e visível. Minimizar pausa; fechar zera. Você pode jogar à vontade: <b>vencer não é necessário</b>.</p>`
    : m.type === 'paint-fill' ? '<p class="mission-note">O Paint abre com um desenho pronto. Use o balde para preencher a forma.</p>'
    : (m.type === 'viewer-answer' || m.type === 'os-file-answer') ? `<label class="mission-ans">Resposta<input class="text-input" id="mission-answer" autocomplete="off" spellcheck="false" aria-label="Resposta da missão"></label><button type="button" class="chrome-button primary" data-act="mission-submit">Responder</button>` : '';
  return `<div class="mini-panel mission" data-mission="${E(m.type)}"><div class="actions"><button type="button" class="chrome-button primary" data-act="mission-open" data-app="${E(app)}">Abrir ${E(label)}</button>${m.type === 'explorer-open' || m.type === 'trash-restore' ? '<button type="button" class="chrome-button" data-act="mission-open" data-app="explorer">Explorador de Arquivos</button>' : ''}</div>${extra}<p class="mission-status" id="mission-status" role="status" aria-live="polite">${E(statusText(s))}</p></div>`;
};
function statusText(s) {
  const m = s.mission || {}; if (API.state.mini.solved) return 'Missão cumprida!';
  if (m.type === 'keep-open') { const a = active?.key === key() ? active : null; const sec = m.seconds || 10; const got = a ? Math.floor(a.acc / 1000) : 0; const win = WM.get(m.app); const st = !a || !a.started ? 'Abra o programa para começar a contar.' : (win && win.minimized) ? 'Pausado: a janela está minimizada.' : document.hidden ? 'Pausado: aba em segundo plano.' : 'Contando…'; return `${st} Tempo: ${Math.min(got, sec)}/${sec} s`; }
  return active?.status || 'Aguardando a tarefa…';
}
function setStatus(txt) { if (active) active.status = txt; const el = document.getElementById('mission-status'); if (el) el.textContent = txt; }
function done(msg) { if (!active || API.state.mini.solved) return; const k = active.key; if (k !== key()) return; API.success(msg || 'Missão cumprida!'); }
M.cleanup = function () { if (!active) return; for (const off of active.offs) { try { off(); } catch {} } clearInterval(active.timer); if (active.mountedId) { try { CQ.vfs.unmountPuzzle(active.mountedId); } catch {} } active = null; };
M.pause = function () { if (active) active.last = CQ.mono(); };
M.attach = function (s, w) {
  const k = key(); const m = s.mission || {};
  if (active && active.key === k) { const el = w.body.querySelector('#mission-status'); if (el) el.textContent = statusText(s); bindClicks(w, s); return; }
  M.cleanup(); active = {key: k, stage: s, offs: [], acc: 0, last: CQ.mono(), started: false, status: ''};
  bindClicks(w, s);
  const on = (ev, fn) => active.offs.push(CQ.bus.on(ev, fn));
  if (m.type === 'notepad-text') on('file:saved', d => { if (d.kind !== 'text') return; const t = CQ.norm(d.text); if (t === CQ.norm(m.phrase)) done('Texto salvo corretamente!'); else setStatus('Arquivo salvo, mas o texto não confere com o pedido.'); });
  else if (m.type === 'calc-result') on('calc:result', d => { if (d.hadOp && Math.abs(d.value - m.target) < 1e-9) done('Resultado correto!'); else setStatus(d.hadOp ? 'O resultado foi ' + d.value + '. Não é esse.' : 'Faça uma conta com ao menos uma operação.'); });
  else if (m.type === 'paint-fill') on('paint:draw', d => { if (!d.check) return; const r = d.check(m.region, m.color, m.coverage || 0.85); if (r.ok) done('Forma preenchida!'); else setStatus(`Cobertura da cor: ${Math.round(r.ratio * 100)}% (precisa de ${Math.round((m.coverage || 0.85) * 100)}%).`); });
  else if (m.type === 'explorer-open') on('explorer:open', d => { if (CQ.vfs.key(d.path) === CQ.vfs.key(m.path)) done('Arquivo encontrado!'); });
  else if (m.type === 'trash-restore') on('puzzle:restore', d => { if (CQ.norm(CQ.vfs.baseOf(d.path)) === CQ.norm(m.name)) done('Documento restaurado!'); });
  else if (m.type === 'os-file-answer') on('explorer:open', d => { if (!d.dir && CQ.vfs.key(d.path) === CQ.vfs.key(m.path)) { active.viewed = d.path; setStatus('Documento aberto. Digite a informação solicitada.'); } });
  else if (m.type === 'viewer-answer') on('viewer:open', d => { active.viewed = d.path; setStatus('Imagem aberta. Agora responda.'); });
  else if (m.type === 'keep-open') {
    const app = m.app, need = (m.seconds || 10) * 1000;
    on('win:open', d => { if (d.id === app) { active.started = true; active.acc = 0; active.last = CQ.mono(); setStatus(statusText(s)); } });
    on('win:close', d => { if (d.id === app) { active.started = false; active.acc = 0; setStatus(statusText(s)); } });
    on('win:min', d => { if (d.id === app) setStatus(statusText(s)); });
    on('win:restore', d => { if (d.id === app) { active.last = CQ.mono(); setStatus(statusText(s)); } });
    active.timer = setInterval(() => {
      const now = CQ.mono(), dt = Math.min(now - active.last, 1000); active.last = now;
      const win = WM.get(app); if (!active.started || !win || win.minimized || document.hidden || API.state.mini.solved) { setStatus(statusText(s)); return; }
      active.acc += dt; setStatus(statusText(s)); if (active.acc >= need) done('Tempo cumprido!');
    }, 250);
  }
  if (m.puzzle && CQ.vfs) { active.mountedId = m.puzzle.id || s.id; CQ.vfs.mountPuzzle(active.mountedId, m.puzzle); }
};
function bindClicks(w, s) {
  if (w._missionBound) return; w._missionBound = true;
  w.body.addEventListener('click', async e => {
    const b = e.target.closest('[data-act^="mission-"]'); if (!b) return; const st = API.cur(); if (!st || st.kind !== 'mission' || API.state.mini.solved) return; const m = st.mission || {};
    if (b.dataset.act === 'mission-open') {
      const app = b.dataset.app;
      if (m.type === 'keep-open' && app === m.app && WM.isOpen(app)) { WM.close(app); }          // a missão exige uma abertura nova
      const caseBase = m.puzzle ? ['C:', 'ClaQui', 'Arquivos de jogo', 'Casos', m.puzzle.folder || m.puzzle.id].join(String.fromCharCode(92)) : null;
      const params = app === 'paint' && m.type === 'paint-fill' ? {mission: m} : (app === 'viewer' && m.file ? {path: m.file} : (app === 'explorer' && m.type === 'os-file-answer' ? {path: 'C:\\ClaQui'} : (app === 'explorer' && m.type === 'explorer-open' && caseBase ? {path: caseBase} : undefined)));
      await open(app, params);
    } else if (b.dataset.act === 'mission-submit') {
      const v = CQ.norm(document.getElementById('mission-answer')?.value || ''); if (!v) { CQ.notify('Digite a resposta.'); return; }
      if (!active?.viewed) { setStatus(m.type === 'os-file-answer' ? 'Abra o documento solicitado no Explorador primeiro.' : 'Abra o Visualizador e observe a imagem primeiro.'); return; }
      if (v === CQ.norm(m.answer) || (m.accept || []).some(a => CQ.norm(a) === v)) done('Resposta correta!'); else API.failure(m.type === 'os-file-answer' ? 'Essa informação não confere com o registro.' : 'Essa não é a informação da imagem.');
    }
  });
}
})();
