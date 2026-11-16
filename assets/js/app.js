/* ClassiQuiz 2.0 — núcleo do jogo (roda dentro do ClaQui OS). Código MIT, sem dependências externas.
   Geradores puros ficam em gen.js/gen-b6.js; aqui estão estado, telas das questões, conquistas, registros e janelas do jogo. */
(() => {
'use strict';
const CQ = window.CQ, G = window.CQ_GEN, E = CQ.E, OS = CQ.os, WM = OS.wm, K = CQ.KEYS;
if (!G) { document.getElementById('desktop').textContent = 'Não foi possível carregar o banco de perguntas.'; return; }
const TIMEOUT = 20 * 60 * 1000;
const NEWBANK = () => (G.bankAvailable('B7') ? 'B7' : G.bankAvailable('B6') ? 'B6' : 'B5');
const S = {generation: null, phase: 0, lives: 1, mini: {}, feedback: '', dev: false, done: false, lost: false, updatedAt: 0, hadError: false, storyFailed: {}, run: null, show: null, ultraLives: 1, selectedCount: 100};
const API = CQ.game = {state: S};
let library = CQ.store.read(K.LIB, []); if (!Array.isArray(library)) library = [];
let achievements = CQ.store.read(K.ACH, {unlocked: {}, stats: {}});
if (!achievements || typeof achievements !== 'object') achievements = {unlocked: {}, stats: {}};
achievements.unlocked ||= {}; achievements.stats ||= {}; achievements.disabled = achievements.disabled === true;
let tickTimer = 0, lastDragCleanup = null, lastHoverCleanup = null, onlyFav = false;
const saveAch = () => CQ.store.write(K.ACH, achievements);
const saveLib = () => CQ.store.write(K.LIB, library);

// ---------- ícones SVG inline (sem emoji) ----------
const SV = {
  floppy: '<svg viewBox="0 0 32 32" width="46" height="46" aria-hidden="true"><path d="M3 3h22l4 4v22H3z" fill="#2c5db8" stroke="#0e2a63" stroke-width="2"/><rect x="8" y="3" width="14" height="9" fill="#e8ecf4" stroke="#0e2a63" stroke-width="1.5"/><rect x="17" y="5" width="3" height="5" fill="#0e2a63"/><rect x="7" y="17" width="18" height="12" fill="#f4f6fa" stroke="#0e2a63" stroke-width="1.5"/></svg>',
  folder: '<svg viewBox="0 0 32 32" width="46" height="46" aria-hidden="true"><path d="M2 8h11l3 3h14v17H2z" fill="#f1c24c" stroke="#7a5a10" stroke-width="2"/></svg>',
  star: '<svg viewBox="0 0 32 32" width="44" height="44" aria-hidden="true"><path d="M16 3l4 9 10 1-7.5 6.5L25 29l-9-5-9 5 2.5-9.5L2 13l10-1z" fill="#f3c33a" stroke="#7a5a10" stroke-width="2"/></svg>',
  disk: '<svg viewBox="0 0 32 32" width="46" height="46" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="#3a4a6a" stroke="#0e1a38" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="#cfd6e6"/></svg>',
  bugA: '<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><ellipse cx="16" cy="18" rx="9" ry="11" fill="#d33848" stroke="#4a0e17" stroke-width="2"/><path d="M16 7v22" stroke="#4a0e17" stroke-width="2"/><circle cx="12" cy="15" r="1.8" fill="#4a0e17"/><circle cx="20" cy="21" r="1.8" fill="#4a0e17"/></svg>',
  bugB: '<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><ellipse cx="16" cy="18" rx="9" ry="11" fill="#2a3358" stroke="#0a0f24" stroke-width="2"/><path d="M16 7v22" stroke="#9fb0e0" stroke-width="2"/><circle cx="12" cy="15" r="1.8" fill="#9fb0e0"/><circle cx="20" cy="21" r="1.8" fill="#9fb0e0"/></svg>',
  heart: '<svg viewBox="0 0 20 18" width="22" height="20" aria-hidden="true"><path d="M10 17S1 11 1 5.5A4.5 4.5 0 0 1 10 4a4.5 4.5 0 0 1 9 1.5C19 11 10 17 10 17z" fill="#d33848" stroke="#4a0e17" stroke-width="1.6"/></svg>',
  heartEmpty: '<svg viewBox="0 0 20 18" width="22" height="20" aria-hidden="true"><path d="M10 17S1 11 1 5.5A4.5 4.5 0 0 1 10 4a4.5 4.5 0 0 1 9 1.5C19 11 10 17 10 17z" fill="none" stroke="#6b6f80" stroke-width="1.6" stroke-dasharray="3 2"/></svg>'
};
API.svg = SV;

// ---------- perfil de controle ----------
const mobileDevice = () => { const ua = navigator.userAgent || ''; return navigator.userAgentData?.mobile === true || /Android|iPhone|iPad|iPod|Mobile|Tablet|Silk/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); };
function capabilities() {
  const mobile = mobileDevice(), fine = matchMedia('(any-pointer: fine)').matches || matchMedia('(pointer: fine)').matches;
  const coarse = matchMedia('(any-pointer: coarse)').matches || matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  return {mouse: !mobile && fine, touch: mobile || coarse || !fine, mobile};
}
const currentProfile = () => { const c = capabilities(); return c.mobile ? 'T' : c.mouse && c.touch ? 'H' : c.mouse ? 'M' : 'T'; };
const compatible = p => { if (p === 'U') return true; const c = capabilities(); return p === 'M' ? c.mouse : p === 'H' ? c.mouse && c.touch : c.touch; };   // U = universal (campanhas: só itens híbridos)
const capacity = (p, bank = NEWBANK()) => G.capacity(p, bank);
const sizes = p => Array.from({length: Math.floor(capacity(p) / 25)}, (_, i) => (i + 1) * 25);
Object.assign(API, {capabilities, currentProfile, compatible, capacity, sizes});

// ---------- modo, vidas, contexto Ultra ----------
const isUltra = () => S.generation?.mode === 'ultra';
const isCampaign = () => S.generation?.mode === 'campaign';
const maxLives = i => isUltra() ? Math.max(1, Math.min(3, S.generation.initialLives || 1)) : Math.ceil((i + 1) / 25);
CQ.rules.ultra = () => isUltra() && !S.done && !S.lost || WM.isOpen('ultra');
const cur = () => S.generation?.stages[S.phase];
const clearTransient = () => { S.mini = {}; S.feedback = ''; };
Object.assign(API, {isUltra, isCampaign, maxLives, cur});

// ---------- estatísticas de execução (retrospectiva real) ----------
function newRun() { return {correct: 0, errors: 0, heartsLost: 0, tricks: 0, minis: 0, missions: 0, ms: 0, last: Date.now()}; }
function tickRun() { if (!S.run) return; const now = Date.now(); if (!document.hidden && now - S.run.last < 120000) S.run.ms += now - S.run.last; S.run.last = now; }

// ---------- persistência ----------
function persist() {
  if (!S.generation) return; S.updatedAt = Date.now(); tickRun();
  CQ.store.write(K.SESSION, {generation: S.generation, phase: S.phase, lives: S.lives, mini: S.mini, dev: S.dev, done: S.done, lost: S.lost, hadError: !!S.hadError, storyFailed: S.storyFailed || {}, run: S.run, show: S.show, updatedAt: S.updatedAt});
}
function restore() {
  const saved = CQ.store.read(K.SESSION, null); if (!saved?.generation?.stages || !Array.isArray(saved.generation.stages)) return;
  const g = saved.generation; if (!/^(CQ1-|CQU1-|CQU2-|CQC)/.test(g.seed) || g.stages.length !== g.count) return;
  S.generation = g; S.phase = Math.max(0, Math.min(g.count - 1, Number(saved.phase) || 0));
  if (g.stages[S.phase]?.kind === 'skipped') S.phase = Math.min(g.count - 1, S.phase + 1);
  S.lives = Math.max(0, Math.min(maxLives(S.phase), Number(saved.lives) || 0));
  S.mini = saved.mini && typeof saved.mini === 'object' ? saved.mini : {}; S.hadError = !!saved.hadError; S.storyFailed = saved.storyFailed || {};
  S.run = saved.run || newRun(); S.run.last = Date.now(); S.show = saved.show || null;
  if (S.mini.locked) { S.mini.open = []; S.mini.locked = false; }
  S.dev = !!saved.dev && !isUltra(); S.done = !!saved.done; S.lost = !!saved.lost; S.updatedAt = Number(saved.updatedAt) || 0;
  if (!S.done && !S.lost && Math.abs(Date.now() - S.updatedAt) > TIMEOUT) { resetAttempt(false); S.feedback = 'Sessão anterior expirada após 20 minutos. A Trilha foi mantida.'; }
  if (!S.done && !S.lost && !isUltra() && !isCampaign()) remember(g, false);
}
function resetAttempt(open = true) {
  if (!S.generation) return;
  S.phase = 0; S.lives = maxLives(0); S.dev = false; S.done = false; S.lost = false; S.hadError = false; S.storyFailed = {}; S.show = null; S.run = newRun(); clearTransient(); persist();
  CQ.missions?.cleanup?.(); if (open) { OS.open('game'); render(); }
}
function remember(g, favorite = false) {
  let item = library.find(v => v.seed === g.seed);
  if (item) { item.timeline = g.stages; item.profile = g.profile; item.count = g.count; item.bank = g.bank; if (favorite) item.favorite = true; }
  else library.unshift({seed: g.seed, profile: g.profile, count: g.count, bank: g.bank, timeline: g.stages, createdAt: Date.now(), name: 'Trilha ' + String(library.length + 1).padStart(3, '0'), favorite: !!favorite, best: 1});
  saveLib();
}
// ---------- registros (store separado) ----------
const rec = () => { const r = CQ.store.read(K.REC, {}); r.trails ||= {}; r.campaigns ||= {}; r.ultra ||= {}; r.totals ||= {}; return r; };
function markRecord() {
  if (S.dev || !S.generation) return; const g = S.generation, n = S.phase + 1;
  if (isUltra()) { const r = rec(), k = `${g.profile}|${g.initialLives || 1}|${g.count}`; const o = r.ultra[k] ||= {best: 0, wins: 0, profile: g.profile, lives: g.initialLives || 1, count: g.count}; o.best = Math.max(o.best, n); CQ.store.write(K.REC, r); return; }
  if (isCampaign()) { const r = rec(), o = r.campaigns[g.campaign] ||= {best: 0, wins: 0, played: 0}; o.best = Math.max(o.best, n); CQ.store.write(K.REC, r); return; }
  const item = library.find(v => v.seed === g.seed); if (item) { item.best = Math.max(item.best || 1, n); saveLib(); }
  const r = rec(); r.trails.best = Math.max(r.trails.best || 0, n); CQ.store.write(K.REC, r);
}
function recordRunEnd(won) {
  const r = rec(), g = S.generation; const t = r.totals; t.runs = (t.runs || 0) + 1; t.ms = (t.ms || 0) + (S.run?.ms || 0);
  if (isCampaign()) { const o = r.campaigns[g.campaign] ||= {best: 0, wins: 0, played: 0}; o.played++; if (won) { o.wins++; o.lastWin = Date.now(); } }
  if (isUltra() && won) { const o = r.ultra[`${g.profile}|${g.initialLives || 1}|${g.count}`]; if (o) o.wins++; }
  CQ.store.write(K.REC, r);
}
// ---------- Fichas Classi (moeda cosmética) ----------
const rew = () => { const r = CQ.store.read(K.REW, {}); r.coins ||= 0; r.owned ||= {}; r.earned ||= 0; return r; };
function earn(n, why) { if (S.dev || achievements.disabled || n <= 0) return; const r = rew(); r.coins += n; r.earned += n; CQ.store.write(K.REW, r); CQ.bus.emit('rewards:earn', {n, why}); }
API.rew = rew; API.earn = earn;

// ---------- criação e carregamento de partidas ----------
const askReplace = () => (S.generation && !S.done && !S.lost) ? CQ.ui.confirm('Substituir tentativa atual?', '<p>Existe uma partida em andamento. Se continuar, ela será substituída (a Trilha continua na biblioteca).</p>', 'Substituir', 'Cancelar', true) : Promise.resolve(true);
function activate(g) {
  S.generation = g; S.phase = 0; S.lives = maxLives(0); S.done = false; S.lost = false; S.dev = false; S.hadError = false; S.storyFailed = {}; S.show = null; S.run = newRun(); clearTransient();
  if (g.mode !== 'ultra' && g.mode !== 'campaign') remember(g);
  CQ.missions?.cleanup?.(); CQ.vfs?.unmountAllPuzzles?.(); persist();
  if (g.mode === 'ultra') WM.close('dev');            // sem Terminal durante o Ultra
  WM.close('new'); WM.close('ultra'); OS.open('game'); WM.refresh('game'); WM.refreshAll(); CQ.bus.emit('game:start', {mode: g.mode || 'normal'});
}
async function startNew() {
  const p = currentProfile(), opts = sizes(p), count = Number(S.selectedCount);
  if (!opts.includes(count)) { CQ.notify('Essa quantidade não está disponível para seu dispositivo.'); return; }
  if (!(await askReplace())) return;
  try { activate(G.generate(`CQ1-${NEWBANK()}-${p}-${count}-${G.newSalt()}`)); } catch (ex) { CQ.notify(ex.message); }
}
async function startUltra(lives) {
  lives = Math.max(1, Math.min(3, Number(lives) || 1));
  if (!(await askReplace())) return;
  try { const p = currentProfile(), v2 = G.bankAvailable('B6') && G.generateUltraB6; const seed = v2 ? `CQU2-B6-${p}-ALL-${G.newSalt()}` : `CQU1-B5-${p}-ALL-${G.newSalt()}`;
    const g = v2 ? G.generateUltraB6(p, lives, seed) : G.generateUltraB5(p, lives, seed); activate(g); CQ.notify('Ultra ClassiQuiz iniciado com ' + lives + ' coração(ões).');
  } catch (e) { CQ.notify('Não foi possível iniciar o Ultra: ' + e.message); }
}
async function startCampaign(id) {
  if (!G.campaign) { CQ.notify('Campanhas indisponíveis.'); return; }
  if (!(await askReplace())) return;
  try { activate(G.campaign(id)); } catch (e) { CQ.notify('Não foi possível iniciar a campanha: ' + e.message); }
}
async function openSeed(value) {
  try {
    const raw = String(value).trim().toUpperCase(); let gen = null;
    const camp = raw.match(/^CQC([123])-/); const ult = raw.match(/^CQU([12])-B([56])-(T|M|H)-ALL-([A-Z0-9]{6,12})$/);
    if (camp) gen = G.campaign(Number(camp[1]));
    else if (ult) { const p = ult[3], seed = raw; gen = ult[1] === '2' ? G.generateUltraB6(p, 1, seed) : G.generateUltraB5(p, 1, seed); }
    else { const meta = G.parseSeed(raw); const item = library.find(v => v.seed === meta.seed); gen = item?.timeline?.length === meta.count ? {seed: meta.seed, bank: meta.bank, count: meta.count, profile: meta.p, stages: item.timeline, createdAt: item.createdAt} : G.generate(meta.seed); }
    if (!(await askReplace())) return; activate(gen);
  } catch (ex) { CQ.notify(ex.message); }
}
Object.assign(API, {startNew, startUltra, startCampaign, openSeed, resetAttempt, persist});

// ---------- janelas: cabeçalho/estado ----------
function gameWin() { return WM.get('game'); }
function setGameTitle(str, left, right) { const w = gameWin(); if (!w) return; w.setTitle('ClassiQuiz - ' + str); w.setStatus(left, right); }
function render() { const w = gameWin(); if (!w) return; const mark = (S.done || S.lost ? 'end' : 'game') + '#' + S.phase + '#' + (S.generation?.seed || ''); const changed = w._mark !== mark; WM.refresh('game'); if (changed) { w._mark = mark; w.body.scrollTop = 0; } }
API.render = render;

// ---------- telas da questão ----------
const heartsHtml = (n, max) => Array.from({length: max}, (_, i) => `<span class="heart ${i < n ? 'full' : 'empty'}" role="img" aria-label="${i < n ? 'Vida disponível' : 'Vida perdida'}">${i < n ? SV.heart : SV.heartEmpty}</span>`).join('');
function renderGame() {
  const gen = S.generation, s = cur(); if (!gen || !s) return '<div class="page"><p>Nenhuma partida em andamento.</p><button type="button" class="chrome-button primary" data-act="open-app" data-app="new">Abrir ClassiQuiz</button></div>';
  const isShow = s.kind === 'show';
  setGameTitle(`Questão ${S.phase + 1} de ${gen.count}`, `${gen.mode === 'campaign' ? 'CAMPANHA' : 'SEED'} ${gen.seed}`, `${S.dev ? 'MODO TESTE • ' : ''}${gen.profile === 'U' ? 'MOUSE OU TOQUE' : gen.profile} • ${gen.bank}`);
  const visible = S.dev ? Math.max(maxLives(S.phase), S.lives) : maxLives(S.phase);
  const phaseNum = s.mode === 'click-number' || s.mode === 'click-number-hidden' ? `<button type="button" class="phase-number as-target" data-act="trick-win" aria-label="Número ${S.phase + 1}">${S.phase + 1}</button>` : `<span class="phase-number">${S.phase + 1}</span>`;
  const bar = `<div class="game-head"><div class="game-head-left"><div class="phase-box"><span class="tiny-cap">QUESTÃO</span> ${phaseNum}<span class="tiny-cap">/ ${gen.count}</span></div>${S.dev ? '<span class="test-flag">TESTE</span>' : ''}</div><div class="hearts" role="group" aria-label="${S.lives} vidas de ${visible}">${heartsHtml(S.lives, visible)}</div></div>`;
  const progress = `<div class="prog-track" role="progressbar" aria-valuemin="0" aria-valuemax="${gen.count}" aria-valuenow="${S.phase + 1}"><div style="width:${(S.phase + 1) / gen.count * 100}%"></div></div>`;
  if (!compatible(gen.profile)) return `${bar}${progress}<div class="game-stage"><h2>Trilha incompatível</h2><p>Esta Trilha usa o perfil <b>${gen.profile}</b> e não foi detectado o conjunto de controles necessário neste dispositivo.</p><p class="muted">A seed e a questão atual foram preservadas. Volte a utilizar os controles compatíveis ou crie outra Trilha.</p><div class="actions"><button type="button" class="chrome-button" data-act="home">Menu</button></div></div>`;
  const solved = !!S.mini.solved; let body = '';
  if (solved) body = `<div class="result-notice">✓ ${E(S.mini.message || 'Resposta correta!')}</div><div class="actions"><button type="button" class="chrome-button primary" data-act="advance">${S.phase + 1 === gen.count ? 'Concluir Trilha' : 'Próxima questão →'}</button></div>`;
  else if (['standard', 'extended', 'story', 'memory', 'skip-memory', 'show'].includes(s.kind)) body = (s.puzzle ? `<div class="case-bar"><button type="button" class="chrome-button primary" data-act="open-case">Abrir pasta do caso</button><span class="muted">Os arquivos do caso são só para leitura. Use o Explorador, o Bloco de Notas e o Visualizador.</span></div>` : '') + answerButtons(s);
  else if (s.kind === 'trick') body = trickStage(s);
  else if (s.kind === 'mini') body = miniStage(s);
  else if (s.kind === 'mission') body = CQ.missions ? CQ.missions.render(s, S) : '<p>Missões indisponíveis.</p>';
  const meta = `<div class="question-meta"><span>IMPLEMENTADA EM: ${E(s.addedMonth || '11/2026')}</span></div>`;
  const tools = `<div class="game-tools"><button type="button" class="chrome-button tiny" data-act="home">Voltar ao menu</button><span class="hint">${S.dev ? 'Tentativa de teste: sem recordes ou conquistas.' : 'Seu progresso é salvo automaticamente.'}</span></div>`;
  const fb = S.feedback && !solved ? `<div class="result-notice error" role="alert">${E(S.feedback)}</div>` : '';
  if (isShow) return `${bar}${progress}${showFrame(s, `<h2 class="question-text">${questionText(s)}</h2>${body}${fb}`)}${tools}`;
  return `${bar}${progress}<section class="game-stage"><h2 class="question-text">${questionText(s)}</h2>${body}${meta}${fb}</section>${tools}`;
}
function showFrame(s, inner) {
  const tier = s.tier || 1, lines = ['Vamos começar com calma!', 'Aquecendo o milho…', 'Está pegando o jeito!', 'A plateia torce por você!', 'Metade do caminho!', 'Agora a pipoca estoura!', 'O milharal prende a respiração!', 'Faltam poucas espigas!', 'Penúltima! Respire fundo.', 'A pergunta do Milhozão!'];
  const ladder = Array.from({length: 10}, (_, i) => 10 - i).map(n => `<li class="${n === tier ? 'now' : n < tier ? 'passed' : ''}" ${n === tier ? 'aria-current="step"' : ''}><span>${n}</span></li>`).join('');
  return `<section class="show-stage"><aside class="show-side"><img class="milhito" src="assets/img/milhito.svg" alt="Milhito, apresentador do Show do Milhozão"><p class="milhito-say" role="status">${E(lines[tier - 1])}</p></aside><div class="show-main"><div class="show-banner">SHOW DO MILHOZÃO • Rodada ${tier} de 10</div>${inner}</div><ol class="show-ladder" aria-label="Escada de rodadas">${ladder}</ol></section>`;
}
function questionText(s) {
  if (s.id === 'b5-trick-number') return E('Qual número completa esta sequência? ' + S.phase + ', ___, ' + (S.phase + 2));
  if (s.id === 'b5-trick-x') return E(s.text);
  if (s.kind !== 'trick') return E(s.text).replace(/pergunta nº/g, 'questão nº');
  switch (s.mode) {
    case 'click-red': return 'Clique no <button type="button" class="question-word-button" data-act="trick-win">vermelho</button>';
    case 'click-dot': return 'Clique no ponto final<button type="button" class="question-word-button" data-act="trick-win">.</button>';
    case 'click-word': return 'Toque na palavra <button type="button" class="question-word-button" data-act="trick-win">certa</button>.';
    case 'word-target': { const source = E(s.text), word = E(s.word), start = source.indexOf(word); return start < 0 ? source : source.slice(0, start) + `<button type="button" class="question-word-button" data-act="trick-win">${word}</button>` + source.slice(start + word.length); }
    case 'fourth-word': { const words = E(s.text).split(/(\s+)/), idx = words.map((w, i) => !/^\s+$/.test(w) ? i : -1).filter(i => i >= 0), ix = idx[3]; if (ix !== undefined) words[ix] = `<button type="button" class="question-word-button" data-act="trick-win">${words[ix]}</button>`; return words.join(''); }
    default: return E(s.text);
  }
}
const answerButtons = s => `<div class="answers ${s.options.length > 4 ? 'many' : ''}">${s.options.map((a, i) => `<button class="answer-button" type="button" data-act="answer" data-i="${i}"><span class="answer-letter">${String.fromCharCode(65 + i)}</span><span>${E(a)}</span></button>`).join('')}</div>`;
// Alternativas genéricas de pegadinhas: textos reais e curtos (nunca "Opção A").
const wrongBtns = list => `<div class="answers">${list.map(x => `<button class="answer-button" type="button" data-act="trick-wrong">${E(x)}</button>`).join('')}</div>`;
function trickStage(s) {
  const mode = s.mode, alts = s.alts || null;
  if (['title-close', 'title-minimize', 'title-maximize', 'logo-symbol', 'taskbar-start', 'version-click'].includes(mode)) return wrongBtns(alts || ['Nenhuma das anteriores', 'Todas as anteriores', 'Não sei responder', 'Pular esta etapa']);
  if (mode === 'save-trap') return `<div class="mini-panel"><div class="fake-dialog"><div class="fake-dialog-title">ClassiQuiz • Salvamento</div><div class="answers"><button type="button" class="answer-button" data-act="trick-wrong">Salvar meu progresso</button><button type="button" class="answer-button" data-act="trick-win">Não Salvar</button></div></div></div>`;
  if (mode === 'context-properties') return wrongBtns(['Abrir', 'Renomear', 'Excluir', 'Imprimir']);
  if (mode === 'context-copy') return wrongBtns(['Recortar', 'Colar', 'Excluir', 'Renomear']);
  if (mode === 'context-refresh') return wrongBtns(['Reiniciar', 'Fechar', 'Minimizar', 'Desligar']);
  if (mode === 'context-info') return wrongBtns(['Executar', 'Mover', 'Compactar', 'Duplicar']);
  if (mode === 'click-red') return `<div class="answers">${[['Azul', '#346ed6'], ['Verde', '#31874d'], ['Vermelho', '#d83e45'], ['Amarelo', '#f0c44a']].map(([n, c]) => `<button type="button" class="color-answer ${n === 'Amarelo' ? 'yellow' : ''}" data-act="trick-wrong" style="background:${c}">${n}</button>`).join('')}</div>`;
  if (['click-number', 'click-dot', 'click-word'].includes(mode)) return wrongBtns(alts || (mode === 'click-number' ? [S.phase - 1, S.phase, S.phase + 2, S.phase + 3, S.phase + 4, S.phase + 5].filter(n => n > 0 && n !== S.phase + 1).slice(0, 4).map(String) : ['Nenhuma das anteriores', 'Todas as anteriores', 'Não sei responder', 'Pular esta etapa']));
  if (['drag-cover', 'drag-window'].includes(mode)) return `<div class="mini-panel"><p class="mini-caption">Segure e arraste a caixa usando o mouse ou o dedo.</p><div class="drag-scene"><div class="drag-reveal">${S.mini.revealed ? 'A resposta é 42' : '42'}<p>Agora escolha a alternativa.</p></div>${S.mini.revealed ? '' : `<div class="drag-object" data-drag="1"><strong>${mode === 'drag-cover' ? '▣' : '▤'}</strong><span>${mode === 'drag-cover' ? 'CAIXA' : 'JANELA'}</span><small>arraste</small></div>`}</div><div class="answers" style="margin-top:14px">${['24', '40', '42', '44'].map(t => `<button type="button" class="answer-button" data-act="drag-ans" data-value="${t}">${t}</button>`).join('')}</div></div>`;
  if (mode === 'double-tap') return `<div class="mini-panel" style="text-align:center"><p>Dois toques ou cliques rápidos no mesmo botão.</p><button type="button" class="mini-tile" style="width:116px;margin:0 auto" data-act="double-tap" aria-label="Disquete">${SV.floppy}</button><p class="mini-caption">${S.mini.lastTap ? 'Mais um clique rápido...' : '&nbsp;'}</p></div>`;
  if (['hover', 'hover-target', 'right-click', 'right-click-folder'].includes(mode)) { const right = mode.startsWith('right'); return `<div class="mini-panel" style="text-align:center"><p>${right ? 'Use o botão direito sobre o item:' : 'Mova o cursor sobre o item sem clicar:'}</p><div class="dev-controls" style="justify-content:center"><button type="button" class="mini-tile" style="width:120px;min-height:105px" data-mouse-target="1" aria-label="${mode.includes('folder') || mode === 'hover-target' ? 'Pasta' : 'Disquete'}">${mode.includes('folder') || mode === 'hover-target' ? SV.folder : SV.floppy}</button></div><p class="mini-caption">Questão exclusiva de mouse.</p></div>`; }
  if (mode === 'touch-hold') return `<div class="mini-panel" style="text-align:center"><p>Toque e segure por 1 segundo.</p><button type="button" class="mini-tile" style="width:116px;margin:0 auto" data-touch-hold="1" aria-label="Estrela">${SV.star}</button><p class="mini-caption">Questão exclusiva de toque.</p></div>`;
  if (mode === 'hold-universal') return `<div class="mini-panel" style="text-align:center"><p>Pressione por um segundo, sem soltar.</p><button type="button" class="mini-tile" style="width:116px;margin:0 auto;touch-action:none" data-universal-hold="1" aria-label="Botão de pressão">${SV.disk}</button></div>`;
  if (mode === 'confirm-no') return `<div class="mini-panel"><p class="mini-caption">O que deseja fazer?</p><div class="answers"><button type="button" class="answer-button" data-act="trick-wrong">Confirmar</button><button type="button" class="answer-button" data-act="trick-win">Cancelar</button></div></div>`;
  if (mode === 'blank-button') return `<div class="mini-panel"><div class="answers"><button type="button" class="answer-button" data-act="trick-wrong">Primeira</button><button type="button" class="answer-button" data-act="trick-win" aria-label="Alternativa sem inscrição"><span aria-hidden="true">&nbsp;</span></button><button type="button" class="answer-button" data-act="trick-wrong">Terceira</button><button type="button" class="answer-button" data-act="trick-wrong">Quarta</button></div></div>`;
  if (mode === 'fake-popup') return `<div class="mini-panel"><div class="fake-dialog"><div class="fake-dialog-title">Aviso do sistema <button type="button" class="fake-dialog-x" data-act="trick-win" aria-label="Fechar aviso">×</button></div><p>Operação interrompida. Feche esta janela para continuar.</p></div><div class="answers" style="margin-top:12px">${['Continuar', 'Ignorar', 'Confirmar', 'Retornar'].map(x => `<button type="button" class="answer-button" data-act="trick-wrong">${x}</button>`).join('')}</div></div>`;
  if (mode === 'count-hearts') { const c = maxLives(S.phase); const opts = G.shuffle(Array.from(new Set([c, c + 1, c + 2, Math.max(0, c - 1)])), G.rngFrom(S.generation.seed + '#hearts' + S.phase)); return `<div class="answers">${opts.map(v => `<button type="button" class="answer-button" data-act="trick-count" data-value="${v}">${v}</button>`).join('')}</div>`; }
  if (mode === 'color-words') return `<div class="mini-panel"><div class="answers"><button type="button" class="color-word-answer" style="color:#cf3636" data-act="trick-wrong">AZUL</button><button type="button" class="color-word-answer" style="color:#226fbc" data-act="trick-win">VERMELHO</button><button type="button" class="color-word-answer" style="color:#249548" data-act="trick-wrong">AMARELO</button><button type="button" class="color-word-answer" style="color:#a17812" data-act="trick-wrong">VERDE</button></div></div>`;
  if (mode === 'big-button') return `<div class="mini-panel"><div class="answers"><button type="button" class="answer-button" data-act="trick-wrong">999</button><button type="button" class="answer-button" data-act="trick-wrong">1000</button><button type="button" class="answer-button" style="font-size:24px;min-height:104px" data-act="trick-win">3</button><button type="button" class="answer-button" data-act="trick-wrong">500</button></div></div>`;
  if (['word-target', 'fourth-word'].includes(mode)) return wrongBtns(alts || ['Nenhuma das anteriores', 'Todas as anteriores', 'Não sei responder', 'Pular esta etapa']);
  return '';
}
function setupMini(s) {
  if (S.mini.initialized) return; const r = G.rngFrom(S.generation.seed + '@' + S.phase + '#mini'); const m = {initialized: true}, shuffle = G.shuffle;
  switch (s.mode) {
    case 'order': case 'path': m.sequence = shuffle(Array.from({length: s.amount || (s.mode === 'order' ? 5 : 4)}, (_, i) => i + 1), r); m.step = 0; break;
    case 'find': m.target = Math.floor(r() * 12); break;
    case 'pairs': { const ch = s.symbols || ['★', '◆', '●', '♣']; m.cards = shuffle([...ch, ...ch], r); m.matched = []; m.open = []; break; }
    case 'count': m.count = Math.floor(r() * 5) + 3; m.grid = shuffle(Array.from({length: 12}, (_, i) => i < m.count ? 'blue' : 'gray'), r); break;
    case 'bug': m.target = Math.floor(r() * 12); break;
    case 'color': m.colors = shuffle([...Array(4).fill('green'), ...Array(8).fill('blue')], r); m.found = []; break;
    case 'arrows': m.sequence = Array.from({length: s.amount || 4}, () => Math.floor(r() * 4)); m.step = 0; m.hide = false; break;
    case 'maze': m.pos = 0; m.walls = [5, 6, 9, 10]; break;
    case 'target': m.target = Math.floor(r() * 16); m.clicks = 0; m.total = s.amount || 3; break;
    case 'lights': { m.lights = Array(6).fill(false); for (const n of shuffle([0, 1, 2, 3, 4, 5], r).slice(0, 3)) for (const k of [n - 1, n, n + 1]) if (k >= 0 && k < 6) m.lights[k] = !m.lights[k]; break; }
    case 'reaction': m.readyAt = Date.now() + 950 + Math.floor(r() * 1450); m.scheduled = false; break;
    case 'wait20': m.readyAt = Date.now() + 20000; break;
    case 'click60': m.clicks = 0; break;
  }
  S.mini = m; persist();
}
function miniStage(s) {
  setupMini(s); const m = S.mini;
  if (s.mode === 'order' || s.mode === 'path') return `<div class="mini-panel"><div class="mini-caption">${s.mode === 'path' ? 'Continue o caminho sem errar.' : 'Toque do menor para o maior.'} Progresso: ${m.step}/${m.sequence.length}</div><div class="mini-grid">${m.sequence.map(n => `<button type="button" class="mini-tile ${n <= m.step ? 'done' : ''}" data-act="mini-step" data-value="${n}" ${n <= m.step ? 'disabled' : ''}>${n}</button>`).join('')}</div></div>`;
  if (s.mode === 'find') return `<div class="mini-panel"><div class="mini-caption">Localize o símbolo diferente dos demais.</div><div class="mini-grid">${Array.from({length: 12}, (_, i) => `<button type="button" class="mini-tile" data-act="mini-find" data-i="${i}" aria-label="Posição ${i + 1}">${i === m.target ? E(s.targetIcon || '★') : E(s.otherIcon || '✦')}</button>`).join('')}</div></div>`;
  if (s.mode === 'bug') return `<div class="mini-panel"><div class="mini-caption">Só um inseto é diferente dos outros.</div><div class="mini-grid">${Array.from({length: 12}, (_, i) => `<button type="button" class="mini-tile" data-act="mini-find" data-i="${i}" aria-label="Inseto ${i + 1}">${i === m.target ? SV.bugB : SV.bugA}</button>`).join('')}</div></div>`;
  if (s.mode === 'count') return `<div class="mini-panel"><div class="mini-grid">${m.grid.map(c => `<div class="mini-tile" style="background:${c === 'blue' ? (s.color || '#346ad3') : '#babec9'};min-height:45px"></div>`).join('')}</div><p class="mini-caption">Quantos quadrados coloridos há acima?</p><div class="answers">${[m.count - 1, m.count, m.count + 1, m.count + 2].map(n => `<button type="button" class="answer-button" data-act="mini-count" data-value="${n}">${n}</button>`).join('')}</div></div>`;
  if (s.mode === 'pairs') return `<div class="mini-panel"><div class="mini-caption">Pares encontrados: ${m.matched.length / 2}/4. Erros apenas viram as cartas de volta.</div><div class="mini-grid">${m.cards.map((c, i) => `<button type="button" class="mini-tile ${m.matched.includes(i) ? 'done' : ''}" data-act="mini-pair" data-i="${i}" ${m.matched.includes(i) || m.locked ? 'disabled' : ''}>${m.matched.includes(i) || m.open.includes(i) ? c : '?'}</button>`).join('')}</div></div>`;
  if (s.mode === 'color') return `<div class="mini-panel"><div class="mini-caption">Verdes encontrados: ${m.found.length}/4. Não toque nas peças azuis.</div><div class="mini-grid">${m.colors.map((c, i) => `<button type="button" class="mini-tile ${m.found.includes(i) ? 'done' : ''}" style="background:${m.found.includes(i) ? '#bee3c8' : c === 'green' ? '#379960' : '#377bd3'}" data-act="mini-color" data-i="${i}" ${m.found.includes(i) ? 'disabled' : ''} aria-label="Peça ${i + 1}">${m.found.includes(i) ? '✓' : '&nbsp;'}</button>`).join('')}</div></div>`;
  if (s.mode === 'arrows') return `<div class="mini-panel"><p class="mini-caption">${!m.hide ? 'Memorize e depois esconda a sequência.' : 'Toque na ordem correta. Progresso: ' + m.step + '/' + m.sequence.length}</p>${!m.hide ? `<div class="mini-caption" style="font-size:30px;font-weight:700;letter-spacing:8px">${m.sequence.map(n => ['↑', '→', '↓', '←'][n]).join(' ')}</div><button type="button" class="chrome-button primary wide" data-act="mini-hide">Esconder e jogar</button>` : `<div class="mini-grid">${['↑', '→', '↓', '←'].map((v, i) => `<button type="button" class="mini-tile" data-act="mini-arrow" data-value="${i}">${v}</button>`).join('')}</div>`}</div>`;
  if (s.mode === 'maze') return `<div class="mini-panel"><p class="mini-caption">Use os botões direcionais para chegar à bandeira. Os blocos escuros são obstáculos.</p><div class="mini-grid maze-grid">${Array.from({length: 16}, (_, i) => `<div class="maze-cell ${m.walls.includes(i) ? 'wall' : ''} ${i === m.pos ? 'player' : ''}">${i === m.pos ? '■' : i === 15 ? '⚑' : ''}</div>`).join('')}</div><div class="maze-controls"><button type="button" class="chrome-button" data-act="mini-move" data-value="up" aria-label="Para cima">↑</button><div><button type="button" class="chrome-button" data-act="mini-move" data-value="left" aria-label="Para a esquerda">←</button><button type="button" class="chrome-button" data-act="mini-move" data-value="down" aria-label="Para baixo">↓</button><button type="button" class="chrome-button" data-act="mini-move" data-value="right" aria-label="Para a direita">→</button></div></div></div>`;
  if (s.mode === 'target') return `<div class="mini-panel"><p class="mini-caption">Alvos acertados: ${m.clicks}/${m.total}.</p><div class="mini-grid">${Array.from({length: 16}, (_, i) => `<button type="button" class="mini-tile" data-act="mini-target" data-i="${i}" aria-label="Posição ${i + 1}">${i === m.target ? '◎' : '·'}</button>`).join('')}</div></div>`;
  if (s.mode === 'lights') return `<div class="mini-panel"><p class="mini-caption">Cada interruptor alterna a própria luz e as luzes vizinhas.</p><div class="light-grid">${m.lights.map((on, i) => `<button type="button" class="mini-tile ${on ? 'lit' : ''}" data-act="mini-light" data-i="${i}" aria-label="Luz ${i + 1}, ${on ? 'acesa' : 'apagada'}">${on ? '●' : '○'}</button>`).join('')}</div></div>`;
  if (s.mode === 'wait20') { const rem = Math.max(0, Math.ceil((m.readyAt - Date.now()) / 1000)); return `<div class="mini-panel patience-panel"><h3>Aguarde a contagem regressiva</h3><div id="wait-remaining" class="big-clock">00:${String(rem).padStart(2, '0')}</div><button type="button" class="chrome-button primary" data-act="mini-wait-done" ${rem ? 'disabled' : ''}>Próxima questão</button></div>`; }
  if (s.mode === 'click60') return `<div class="mini-panel patience-panel"><div class="big-clock">${m.clicks || 0} / 60</div><div class="tap60-wrap"><button type="button" class="tap60-square" data-act="mini-click60">CLIQUE AQUI</button>${m.clicks >= 22 ? '<button type="button" class="tap60-trap" data-act="mini-click60-trap">Finalizar agora</button>' : ''}</div><p class="muted">Complete os 60 cliques no quadrado.</p></div>`;
  if (s.mode === 'reaction') { const ready = Date.now() >= m.readyAt; if (!ready) setTimeout(() => { if (WM.isOpen('game') && cur()?.id === s.id && !S.mini.solved) render(); }, Math.max(0, m.readyAt - Date.now() + 20)); return `<div class="mini-panel" style="text-align:center"><p class="mini-caption">${ready ? 'Sinal verde! Pressione agora.' : 'Aguarde o sinal verde antes de pressionar.'}</p><button type="button" class="reaction-button ${ready ? 'ready' : ''}" data-act="mini-reaction">${ready ? 'CLIQUE!' : 'AGUARDE'}</button></div>`; }
  return '';
}
function updateWaitClock() {
  clearInterval(tickTimer); const w = gameWin(); if (!w || cur()?.mode !== 'wait20' || S.mini.solved) return;
  tickTimer = setInterval(() => { const el = document.getElementById('wait-remaining'); if (!el) { clearInterval(tickTimer); return; } const sec = Math.max(0, Math.ceil((S.mini.readyAt - (S.mini.frozenAt || Date.now())) / 1000)); el.textContent = '00:' + String(sec).padStart(2, '0'); const b = w.body.querySelector('[data-act="mini-wait-done"]'); if (b) b.disabled = sec > 0; if (sec === 0) clearInterval(tickTimer); }, 250);
}
let mountedPuzzle = '';
function syncPuzzle(s) {   // arquivos de enigma: namespace próprio, somente leitura, recriado a partir da seed
  const want = s && s.puzzle && S.generation && !S.done && !S.lost ? S.generation.seed + '#' + (s.puzzle.id || s.id) : '';
  if (want === mountedPuzzle) return; mountedPuzzle = want;
  if (!want) { if (!(s && s.kind === 'mission' && s.mission?.puzzle)) CQ.vfs?.unmountAllPuzzles?.(); return; }
  CQ.vfs?.unmountAllPuzzles?.(); CQ.vfs?.mountPuzzle(s.puzzle.id || s.id, s.puzzle);
}
function bindUnique(w) {
  syncPuzzle(cur());
  if (lastDragCleanup) { lastDragCleanup(); lastDragCleanup = null; } if (lastHoverCleanup) { lastHoverCleanup(); lastHoverCleanup = null; }
  const s = cur(); if (!s || S.mini.solved || S.done || S.lost || !S.generation || !compatible(S.generation.profile)) return;
  if (['drag-cover', 'drag-window'].includes(s.mode)) {
    const el = w.body.querySelector('[data-drag]'); if (!el) return; let start = null, dist = 0; const sc = () => OS.scale();
    const down = e => { e.preventDefault(); start = {x: e.clientX, y: e.clientY, id: e.pointerId}; try { el.setPointerCapture(e.pointerId); } catch {} };
    const move = e => { if (!start || e.pointerId !== start.id) return; const dx = (e.clientX - start.x) / sc(), dy = (e.clientY - start.y) / sc(); dist = Math.hypot(dx, dy); el.style.transform = `translate(${Math.max(-100, Math.min(100, dx))}px,${Math.max(-90, Math.min(90, dy))}px)`; };
    const up = () => { if (!start) return; start = null; if (dist >= 65) { S.mini.revealed = true; persist(); render(); } else el.style.transform = ''; dist = 0; };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    lastDragCleanup = () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
  }
  if (['hover', 'hover-target', 'right-click', 'right-click-folder'].includes(s.mode)) {
    const el = w.body.querySelector('[data-mouse-target]'); if (!el) return;
    const ptr = e => { if (e.pointerType === 'mouse' && s.mode.startsWith('hover')) success('Passou o cursor!'); };
    const ctx = e => { if (e.ctrlKey) return; e.preventDefault(); if (s.mode.startsWith('right')) success('Botão direito detectado!'); };
    el.addEventListener('pointerenter', ptr); el.addEventListener('contextmenu', ctx);
    lastHoverCleanup = () => { el.removeEventListener('pointerenter', ptr); el.removeEventListener('contextmenu', ctx); };
  }
  if (s.mode === 'touch-hold' || s.mode === 'hold-universal') {
    const el = w.body.querySelector('[data-touch-hold],[data-universal-hold]'); if (!el) return; let timer = 0;
    const down = e => { if (s.mode === 'touch-hold' && e.pointerType !== 'touch') return; e.preventDefault(); timer = setTimeout(() => success('Tempo de pressão concluído.'), 1000); }; const clear = () => clearTimeout(timer);
    el.addEventListener('pointerdown', down); el.addEventListener('pointerup', clear); el.addEventListener('pointercancel', clear); el.addEventListener('pointerleave', clear);
    lastHoverCleanup = () => { clear(); el.removeEventListener('pointerdown', down); el.removeEventListener('pointerup', clear); el.removeEventListener('pointercancel', clear); el.removeEventListener('pointerleave', clear); };
  }
  if (s.kind === 'mission') CQ.missions?.attach?.(s, w);
}

// ---------- acertos, erros e avanço ----------
function success(message = 'Resposta correta!') {
  if (!S.mini.solved) recordSuccess(); CQ.tone(680, 85); S.mini = {solved: true, message}; S.feedback = ''; persist(); render();
}
function failure(reason = 'Resposta errada!') {
  recordFailure(); CQ.tone(210, 125); S.lives -= 1; S.feedback = reason; S.mini = {};
  if (S.run) { S.run.errors++; S.run.heartsLost++; }
  if (S.dev && S.devInfinite) S.lives = maxLives(S.phase);
  if (S.lives <= 0) { S.lost = true; recordLoss(); recordRunEnd(false); persist(); CQ.missions?.cleanup?.(); render(); WM.refreshAll(); return; }
  persist(); render();
}
function advance() {
  if (!S.mini.solved) return;
  if (S.phase === S.generation.count - 1) { S.done = true; recordWin(); markRecord(); recordRunEnd(true); persist(); CQ.missions?.cleanup?.(); CQ.vfs?.unmountAllPuzzles?.(); render(); WM.refreshAll(); return; }
  const prior = maxLives(S.phase); do { S.phase++; } while (S.phase < S.generation.count && S.generation.stages[S.phase]?.kind === 'skipped');
  const nm = maxLives(S.phase); S.lives = Math.min(nm, S.lives + nm - prior); clearTransient(); CQ.missions?.cleanup?.(); markRecord(); persist(); render();
}
function onAnswer(index) { const s = cur(); if (!s || S.mini.solved) return; if (s.answer === index) success(['memory', 'skip-memory'].includes(s.kind) ? 'Boa memória!' : 'Resposta correta!'); else failure('Alternativa incorreta. Você perdeu uma vida.'); }
Object.assign(API, {success, failure, advance});
function miniClick(action, button) {
  const s = cur(), m = S.mini; if (!s || s.kind !== 'mini' || m.solved) return; const ix = Number(button.dataset.i), num = Number(button.dataset.value);
  switch (action) {
    case 'mini-step': if (num === m.step + 1) { m.step++; if (m.step === m.sequence.length) return success('Sequência concluída!'); persist(); render(); } else failure('Ordem incorreta! Você perdeu 1 vida.'); break;
    case 'mini-find': if (ix === m.target) success('Encontrou!'); else failure('Este não era o símbolo diferente!'); break;
    case 'mini-count': if (num === m.count) success('Contagem correta!'); else failure('Contagem incorreta!'); break;
    case 'mini-color': if (m.colors[ix] === 'green') { m.found.push(ix); if (m.found.length === 4) return success('Todas as peças verdes!'); persist(); render(); } else failure('Essa peça é azul!'); break;
    case 'mini-hide': m.hide = true; persist(); render(); break;
    case 'mini-arrow': if (num === m.sequence[m.step]) { m.step++; if (m.step === m.sequence.length) return success('Sequência reproduzida corretamente.'); persist(); render(); } else failure('Sequência de setas incorreta!'); break;
    case 'mini-move': { const next = {up: m.pos - 4, down: m.pos + 4, left: m.pos % 4 === 0 ? -1 : m.pos - 1, right: m.pos % 4 === 3 ? -1 : m.pos + 1}[button.dataset.value]; if (next === undefined || next < 0 || next > 15 || m.walls.includes(next)) return; m.pos = next; if (next === 15) return success('Você encontrou a saída.'); persist(); render(); break; }
    case 'mini-target': { if (ix !== m.target) return failure('O alvo estava em outra posição.'); m.clicks++; if (m.clicks === m.total) return success('Todos os alvos foram encontrados.'); const r = G.rngFrom(S.generation.seed + '#target' + S.phase + '#' + m.clicks); m.target = (m.target + 1 + Math.floor(r() * 15)) % 16; persist(); render(); break; }
    case 'mini-light': { for (const k of [ix - 1, ix, ix + 1]) if (k >= 0 && k < 6) m.lights[k] = !m.lights[k]; if (m.lights.every(v => !v)) return success('As luzes foram apagadas.'); persist(); render(); break; }
    case 'mini-wait-done': if (!m.frozenAt && Date.now() >= m.readyAt) { success('Você esperou os 20 segundos!'); advance(); } return;
    case 'mini-click60': m.clicks = (m.clicks || 0) + 1; if (m.clicks >= 60) return success('60 cliques concluídos!'); persist(); render(); return;
    case 'mini-click60-trap': return failure('Você apertou o botão errado!');
    case 'mini-reaction': if (Date.now() < m.readyAt) return failure('Você pressionou antes do sinal verde.'); return success('Tempo de reação registrado.');
    case 'mini-pair': {
      if (m.locked || m.matched.includes(ix) || m.open.includes(ix)) return; m.open.push(ix);
      if (m.open.length === 2) { const [a, b] = m.open; if (m.cards[a] === m.cards[b]) { m.matched.push(a, b); m.open = []; if (m.matched.length === m.cards.length) return success('Todos os pares encontrados!'); } else { m.locked = true; persist(); render(); setTimeout(() => { if (cur()?.id !== s.id || S.mini.solved) return; S.mini.open = []; S.mini.locked = false; persist(); render(); }, 650); return; } }
      persist(); render(); break;
    }
  }
}
// Respostas reveladas pelo Terminal (apenas tentativa de teste).
function debugAnswer() {
  const s = cur(); if (!s) return 'Sem questão ativa.';
  if (['standard', 'extended', 'story', 'memory', 'skip-memory', 'show'].includes(s.kind)) return `${String.fromCharCode(65 + s.answer)}) ${s.options[s.answer]}${s.kind === 'memory' ? ` • Origem: questão ${s.origin}, letra ${s.originLetter}` : ''}`;
  if (s.kind === 'trick') { const m = {'click-red': 'Clique na palavra "vermelho" do enunciado.', 'click-number': 'Clique no número no cabeçalho.', 'click-dot': 'Clique no ponto final do enunciado.', 'click-word': 'Clique em "certa" no enunciado.', 'drag-cover': 'Arraste a caixa e escolha 42.', 'drag-window': 'Arraste a janela e escolha 42.', 'double-tap': 'Dois cliques no disquete.', 'hover': 'Passe o mouse sem clicar.', 'hover-target': 'Passe o mouse sobre a pasta.', 'right-click': 'Botão direito sobre o disquete.', 'right-click-folder': 'Botão direito sobre a pasta.', 'touch-hold': 'Segure a estrela por um segundo com toque.'}; return m[s.mode] || s.mode; }
  return 'Resolva o desafio conforme as instruções.';
}
function devJump(to) {
  if (!S.generation || isUltra()) return; const next = Math.max(0, Math.min(S.generation.count - 1, to)); if (next === S.phase) return;
  S.dev = true; S.phase = S.generation.stages[next]?.kind === 'skipped' ? Math.min(next + 1, S.generation.count - 1) : next; S.lives = Math.max(1, Math.min(S.lives, maxLives(next))); S.done = false; S.lost = false; clearTransient(); persist(); render();
}
Object.assign(API, {debugAnswer, devJump, taint() { if (S.generation && !S.done && !S.lost && !isUltra()) { S.dev = true; persist(); } }});

// ---------- conquistas ----------
const ACHIEVEMENTS = [
  ['first', 'Primeiro Boot', 'Responder corretamente a primeira questão.', s => s.qualifiedCorrect >= 1, 'normal'],
  ['25', 'Primeiros 25', 'Concluir uma Trilha de 25 questões.', s => s.finished25 >= 1, 'normal'],
  ['50', 'Meio Caminho', 'Concluir uma Trilha de 50 questões.', s => s.finished50 >= 1, 'normal'],
  ['100', 'Centenário', 'Concluir uma Trilha de 100 questões.', s => s.finished100 >= 1, 'normal'],
  ['untouched', 'Intocável', 'Concluir uma Trilha de 25 sem perder corações.', s => s.perfect25 >= 1, 'normal'],
  ['persistent', 'Persistente', 'Concluir uma Trilha depois de perder uma tentativa anterior.', s => s.wonAfterLoss >= 1, 'normal'],
  ['memory', 'Memória de Elefante', 'Acertar uma questão que lembra uma resposta anterior.', s => s.memory >= 1, 'normal'],
  ['eagle', 'Olho de Águia', 'Acertar 10 desafios de observação.', s => s.observation >= 10, 'normal'],
  ['mini25', 'Mestre dos Minigames', 'Vencer 25 minigames.', s => s.mini >= 25, 'normal'],
  ['fav10', 'Colecionador', 'Adicionar 10 Trilhas às favoritas.', s => s.favorites >= 10, 'normal'],
  ['camp1', 'Edição de Colecionador', 'Concluir uma edição oficial ClassiQuiz (1, 2 ou 3).', s => s.campaignWins >= 1, 'normal'],
  ['camp3', 'Trilogia Completa', 'Concluir as três edições ClassiQuiz 1, 2 e 3.', s => (s.campaignSet || []).length >= 3, 'normal'],
  ['trick10', 'Clique Certeiro', 'Resolver 10 pegadinhas interativas.', s => s.tricks >= 10, 'habilidade'],
  ['context', 'Botão Direito', 'Resolver uma pergunta usando o menu de contexto.', s => s.context >= 1, 'habilidade'],
  ['files', 'Explorador', 'Resolver um desafio relacionado a arquivos.', s => s.files >= 1, 'habilidade'],
  ['story', 'Tudo Conectado', 'Concluir uma história encadeada sem errar.', s => s.stories >= 1, 'habilidade'],
  ['patience', 'Paciência é Tudo', 'Vencer um desafio de espera.', s => s.patience >= 1, 'habilidade'],
  ['trick20', 'Investigador', 'Resolver 20 pegadinhas diferentes.', s => s.uniqueTricks >= 20, 'habilidade'],
  ['mission1', 'Mão na Massa', 'Cumprir uma missão que usa um programa do ClaQui OS.', s => s.missions >= 1, 'habilidade'],
  ['mission10', 'Funcionário do Mês', 'Cumprir 10 missões de programas.', s => s.missions >= 10, 'habilidade'],
  ['perfect75', 'Sistema Estável', 'Concluir uma Trilha de 75 sem perder corações.', s => s.perfect75 >= 1, 'habilidade'],
  ['perfect100', 'Invencível', 'Concluir uma Trilha de 100 sem perder corações.', s => s.perfect100 >= 1, 'habilidade'],
  ['milhonario', 'Milhonário', 'Acertar as 10 rodadas do Show do Milhozão, sem errar nenhuma.', s => s.milhonario >= 1, 'show'],
  ['u25', 'Uma Vida Só', 'Superar 25 questões do Ultra com um coração.', s => s.ultraBest >= 25, 'ultra'],
  ['u50', 'Sem Segunda Chance', 'Superar 50 questões do Ultra com um coração.', s => s.ultraBest >= 50, 'ultra'],
  ['u100', 'Sobrevivente', 'Superar 100 questões do Ultra com um coração.', s => s.ultraBest >= 100, 'ultra'],
  ['u150', 'Nervos de Aço', 'Superar 150 questões do Ultra com um coração.', s => s.ultraBest >= 150, 'ultra'],
  ['u200', 'Mente Blindada', 'Superar 200 questões do Ultra com um coração.', s => s.ultraBest >= 200, 'ultra'],
  ['u300', 'Além do Limite', 'Superar 300 questões do Ultra com um coração.', s => s.ultraBest >= 300, 'ultra'],
  ['u90', 'Quase Impossível', 'Completar 90% de um Ultra com um coração.', s => s.ultraBestRatio >= .90, 'ultra'],
  ['u100p', 'O Clássico Impossível', 'Concluir todo o Ultra com um coração.', s => s.ultraWins >= 1, 'ultra'],
  ['g_ttt', 'Velha de Verdade', 'Vencer o computador no Jogo da Velha.', s => s.tttWins >= 1, 'jogos'],
  ['secret6', 'Fui roubado!', 'Perder para uma linha ilegal no Jogo da Velha.', s => s.tttCheated >= 1, 'secreta'],
  ['g_mines', 'Campo Limpo', 'Vencer uma partida de Campo Minado.', s => s.minesWins >= 1, 'jogos'],
  ['g_snake', 'Cobrinha Faminta', 'Chegar a 10 pontos na Cobrinha.', s => s.snake10 >= 1, 'jogos'],
  ['g_snake_wrap', 'Sem Fronteiras', 'Atravessar uma borda na Cobrinha com colisão desativada.', s => s.snakeWraps >= 1, 'jogos'],
  ['g_snake25', 'Cobra Faminta', 'Comer 25 frutas em uma única partida da Cobrinha.', s => s.snake25 >= 1, 'jogos'],
  ['g_snake100', 'Serpente Lendária', 'Comer 100 frutas numa partida da Cobrinha.', s => s.snake100 >= 1, 'jogos'],
  ['g_desvio_play', 'Primeiro Desvio', 'Iniciar uma partida de Desvio CQ.', s => s.desvioPlayed >= 1, 'jogos'],
  ['g_desvio_level', 'Campo Livre', 'Completar um nível de Desvio CQ.', s => s.desvioLevels >= 1, 'jogos'],
  ['g_desvio_clean', 'Sem Arranhões', 'Completar um nível de Desvio CQ sem receber dano.', s => s.desvioClean >= 1, 'jogos'],
  ['g_desvio_time', 'Reflexos de Aço', 'Sobreviver por dois minutos numa partida de Desvio CQ.', s => s.desvio120 >= 1, 'jogos'],
  ['g_desvio_master', 'Mestre do Desvio', 'Alcançar o nível 10 de Desvio CQ.', s => s.desvioMaster >= 1, 'jogos'],
  ['g_desvio_win', 'Sem Saída? Sem Problema!', 'Alcançar o nível 25 de Desvio CQ.', s => s.desvioWin >= 1, 'jogos'],
  ['g_desvio_50', 'Meio Século', 'Alcançar o nível 50 de Desvio CQ.', s => s.desvio50 >= 1, 'jogos'],
  ['g_desvio_100', 'Centenário do Desvio', 'Alcançar o nível 100 de Desvio CQ.', s => s.desvio100 >= 1, 'jogos'],
  ['offline_seen', 'Sem internet', 'Ver a tela de conexão perdida: desconecte a rede virtual do ClaQui OS e abra o ClaQui Browser (ou abra o PWA sem internet, se a instalação estiver incompleta).', s => s.offlineSeen >= 1, 'jogos'],
  ['runner_secret', 'Segredo desconectado', 'Descobrir o Offline Runner: sem rede virtual, abra o ClaQui Browser e toque no rostinho triste.', s => s.runnerSecret >= 1, 'secreta'],
  ['runner_first', 'Primeiros passos', 'Alcançar 100 pontos no Offline Runner.', s => s.runner100 >= 1, 'jogos'],
  ['runner_alert', 'Alerta vermelho', 'Desviar de 10 alertas de erro voadores no Offline Runner.', s => s.runnerFlyerDodge >= 10, 'jogos'],
  ['runner_1000', 'Sem sinal, sem medo', 'Alcançar 1.000 pontos numa partida de Offline Runner.', s => s.runner1000 >= 1, 'jogos'],
  ['runner_180', 'Intocável offline', 'Sobreviver por 3 minutos no Offline Runner sem colisão.', s => s.runner180 >= 1, 'jogos'],
  ['runner_5000', 'Lenda offline', 'Alcançar 5.000 pontos numa partida de Offline Runner.', s => s.runner5000 >= 1, 'jogos'],
  ['web_first', 'Navegando na Rede', 'Visitar um site no ClaQui Browser.', s => s.webVisit >= 1, 'jogos'],
  ['web_explorer', 'Surfista da Web', 'Visitar 8 sites públicos diferentes no ClaQui Browser.', s => s.webExplorer >= 1, 'jogos'],
  ['web_secret', 'Endereço Escondido', 'Encontrar um site secreto digitando o endereço certo.', s => s.webSecret >= 1, 'secreta'],
  ['web_vault', 'Senha do Cofre', 'Abrir o cofre do Arquivo Secreto.', s => s.webVault >= 1, 'secreta'],
  ['g_solitaire', 'Paciência de Monge', 'Vencer uma partida de Paciência.', s => s.solitaireWins >= 1, 'jogos'],
  ['g_pong', 'Rei da Quadra', 'Vencer uma partida de Pong.', s => s.pongWins >= 1, 'jogos'],
  ['secret1', 'Sem Pressa', 'Concluir um desafio de espera sem interferir.', s => s.patience >= 1, 'secreta'],
  ['secret2', 'Até o Fim', 'Concluir o desafio de 60 cliques.', s => s.clicked60 >= 1, 'secreta'],
  ['secret3', 'Além das Alternativas', 'Acertar uma resposta escondida na interface.', s => s.hidden >= 1, 'secreta'],
  ['secret4', 'Fui Enganado', 'Cair na armadilha do salvamento.', s => s.saveTrap >= 1, 'secreta'],
  ['secret5', 'Tela Azul de Mentira', 'Provocar a tela azul fictícia do ClaQui OS.', s => s.bsod >= 1, 'secreta'],
  ['lost1', 'Primeira de Muitas', 'Perder pela primeira vez.', s => s.qualifiedLosses >= 1, 'erros'],
  ['lost5', 'Não Era Essa', 'Perder 5 vezes.', s => s.qualifiedLosses >= 5, 'erros'],
  ['lost10', 'Já Virou Rotina', 'Perder 10 vezes.', s => s.qualifiedLosses >= 10, 'erros'],
  ['lost25', 'Apanhando e Aprendendo', 'Perder 25 vezes.', s => s.qualifiedLosses >= 25, 'erros'],
  ['lost50', 'Freguês do Game Over', 'Perder 50 vezes.', s => s.qualifiedLosses >= 50, 'erros'],
  ['lost100', 'Cliente Fiel', 'Perder 100 vezes.', s => s.qualifiedLosses >= 100, 'erros'],
  ['lost250', 'Recordista de Derrotas', 'Perder 250 vezes.', s => s.qualifiedLosses >= 250, 'erros'],
  ['lost500', 'Lenda do Fracasso', 'Perder 500 vezes.', s => s.qualifiedLosses >= 500, 'erros'],
  ['err1', 'Errou Feio', 'Errar uma questão pela primeira vez.', s => s.qualifiedErrors >= 1, 'erros'],
  ['err10', 'Não Era Óbvio?', 'Errar 10 questões.', s => s.qualifiedErrors >= 10, 'erros'],
  ['err100', 'Colecionador de Erros', 'Acumular 100 respostas erradas.', s => s.qualifiedErrors >= 100, 'erros'],
  ['err500', 'Especialista em Errar', 'Acumular 500 respostas erradas.', s => s.qualifiedErrors >= 500, 'erros']
];
API.ACHIEVEMENTS = ACHIEVEMENTS;
const stat = (k, n = 1) => { achievements.stats[k] = (achievements.stats[k] || 0) + n; };
// Elegível a conquistas: não desativadas pelo Terminal, tentativa não-teste, Ultra só com 1 coração.
const canEarn = () => !achievements.disabled && !S.dev && (!isUltra() || S.generation.initialLives === 1);
API.canEarn = canEarn;
function unlock(id) {
  if (achievements.unlocked[id]) return false; const def = ACHIEVEMENTS.find(a => a[0] === id); if (!def) return false;
  achievements.unlocked[id] = Date.now(); CQ.notify('Conquista desbloqueada: ' + def[1]); earn(15, 'achievement'); return true;
}
function checkAchievements() { if (!canEarn()) return; for (const [id, , , done] of ACHIEVEMENTS) if (!achievements.unlocked[id] && done(achievements.stats)) unlock(id); saveAch(); }
API.stat = (k, n) => { stat(k, n); if (canEarn()) checkAchievements(); else saveAch(); };
// Conquistas de programas (jogos de Mais opções): valem fora de partidas; bloqueadas por Terminal, tentativa de teste em andamento e Ultra ativo.
const canEarnApp = () => !achievements.disabled && !CQ.rules.ultra() && !(S.dev && S.generation && !S.done && !S.lost);
API.statApp = k => { if (!canEarnApp()) return; stat(k); for (const [id, , , done, cat] of ACHIEVEMENTS) if ((cat === 'jogos' || id === 'secret6' || id === 'runner_secret' || id === 'web_secret' || id === 'web_vault') && !achievements.unlocked[id] && done(achievements.stats)) unlock(id); saveAch(); };
API.achievementsState = () => achievements;
function recordSuccess() {
  const s = cur(); if (!s) return; stat('correct'); if (S.run) S.run.correct++;
  if (canEarn()) {
    stat('qualifiedCorrect'); earn(1, 'correct');
    if (s.kind === 'mini') { stat('mini'); if (S.run) S.run.minis++; if (s.mode === 'wait20') stat('patience'); if (s.mode === 'click60') stat('clicked60'); }
    if (s.kind === 'mission') { stat('missions'); if (S.run) S.run.missions++; }
    if (s.kind === 'trick') { stat('tricks'); if (S.run) S.run.tricks++; const ids = achievements.stats.trickIds || []; if (!ids.includes(s.id)) { ids.push(s.id); achievements.stats.trickIds = ids; achievements.stats.uniqueTricks = ids.length; } }
    if (s.kind === 'memory' || s.kind === 'skip-memory') stat('memory');
    if (s.theme === 'observação') stat('observation');
    if (['context-properties','context-copy','context-refresh','context-info'].includes(s.mode)) stat('context');
    if (['title-close', 'title-minimize', 'title-maximize', 'click-number', 'click-red', 'word-target','context-copy','context-refresh','context-info'].includes(s.mode)) stat('hidden');
    if (s.files || /folder|file|arquivo|pasta/.test(s.id)) stat('files');
    if (s.kind === 'story' && s.step > 1 && !S.storyFailed?.[s.group]) { const up = S.generation.stages[S.phase + 1]; if (!up || up.group !== s.group) stat('stories'); }
    if (isUltra()) { const n = S.generation.stages.slice(0, S.phase + 1).filter(q => q.kind !== 'skipped').length; achievements.stats.ultraBest = Math.max(achievements.stats.ultraBest || 0, n); achievements.stats.ultraBestRatio = Math.max(achievements.stats.ultraBestRatio || 0, n / S.generation.stages.filter(q => q.kind !== 'skipped').length); }
  }
  // Show do Milhozão: bloco fechado; "Milhonário" só se as 10 rodadas forem acertadas sem erro no mesmo bloco.
  if (s.kind === 'show') {
    const sh = S.show && S.show.group === s.group ? S.show : (S.show = {group: s.group, clean: true, got: 0});
    sh.got = Math.max(sh.got, s.tier);
    if (s.tier === 10 && sh.clean && sh.got === 10 && canEarn()) { stat('milhonario'); unlock('milhonario'); earn(50, 'show'); }
  }
  checkAchievements(); saveAch();
}
function recordFailure() {
  stat('errors'); S.hadError = true; const s = cur();
  if (s?.kind === 'story') { S.storyFailed ||= {}; S.storyFailed[s.group] = true; }
  if (s?.kind === 'show') { S.show = S.show && S.show.group === s.group ? S.show : {group: s.group, clean: true, got: 0}; S.show.clean = false; }
  if (s?.mode === 'save-trap' && canEarn()) stat('saveTrap');
  if (canEarn()) { stat('qualifiedErrors'); checkAchievements(); } else saveAch();
}
const recordLoss = () => { stat('losses'); if (canEarn()) { stat('qualifiedLosses'); checkAchievements(); } else saveAch(); };
function recordWin() {
  stat('wins'); if (!canEarn()) { saveAch(); return; }
  if (isUltra()) stat('ultraWins');
  else if (isCampaign()) { stat('campaignWins'); const set = achievements.stats.campaignSet || []; if (!set.includes(S.generation.campaign)) { set.push(S.generation.campaign); achievements.stats.campaignSet = set; } earn(30, 'campaign'); if (!S.hadError) stat('campaignPerfect'); }
  else { const n = S.generation.count; if (n === 25) stat('finished25'); if (n === 50) stat('finished50'); if (n === 100) stat('finished100'); if (!S.hadError) { if (n === 25) stat('perfect25'); if (n === 75) stat('perfect75'); if (n === 100) stat('perfect100'); } if (achievements.stats.qualifiedLosses) stat('wonAfterLoss'); earn(10, 'win'); }
  checkAchievements();
}
// Terminal: desativa conquistas de forma persistente; Resetar reativa para tentativas novas e limpas.
API.achievementsLocked = () => achievements.disabled;
API.lockAchievements = () => { if (!achievements.disabled) { achievements.disabled = true; saveAch(); } };
API.resetAchievements = () => {
  const old = achievements.stats || {};
  achievements = {unlocked: {}, stats: {errors: old.errors || 0, losses: old.losses || 0, correct: old.correct || 0, wins: old.wins || 0}, disabled: false}; saveAch();
  if (S.generation && !S.done && !S.lost) { S.dev = true; persist(); }   // a tentativa em que o Terminal foi usado nunca se torna elegível retroativamente
  WM.refreshAll(); CQ.bus.emit('achievements:reset', {});
};

// ---------- janelas do jogo ----------
const winIntercept = {'win-close': 'title-close', 'win-min': 'title-minimize', 'win-max': 'title-maximize', 'icon-logo': 'logo-symbol', 'start-toggle': 'taskbar-start', 'version-click': 'version-click'};
OS.interceptors.push((act, btn) => {
  const t = cur(); if (!t || t.kind !== 'trick' || S.mini.solved || S.done || S.lost || !WM.isVisible('game')) return false;
  if (winIntercept[act] !== t.mode) return false;
  if (['win-close', 'win-min', 'win-max'].includes(act) && btn.dataset.win !== 'game') return false;
  success('Você encontrou a resposta na interface!'); return true;
});
CQ.rules.onProperties = () => { const t = cur(); if (t?.mode === 'context-properties' && !S.mini.solved && WM.isVisible('game') && !S.done && !S.lost) { success('Você encontrou as propriedades no menu!'); return true; } return false; };
CQ.bus.on('sys32:crash', () => { API.stat('bsod'); });
CQ.bus.on('calc:crash', () => { API.stat('bsod'); }); // A tela azul da Calculadora também conta para a conquista existente.

function bodyClick(e) {
  const btn = e.target.closest('[data-act]'); if (!btn || btn.disabled) return; const a = btn.dataset.act;
  switch (a) {
    case 'home': WM.minimize('game'); OS.open('new'); return;
    case 'restart': resetAttempt(); return;
    case 'advance': advance(); return;
    case 'open-case': { const p = cur()?.puzzle; if (p) { syncPuzzle(cur()); OS.open('explorer', {path: ['C:', 'ClaQui', 'Arquivos de jogo', 'Casos', p.folder || p.id].join(String.fromCharCode(92))}); } return; }
    case 'copy-seed': copy(S.generation.seed); return;
    case 'answer': if (!S.mini.solved) onAnswer(Number(btn.dataset.i)); return;
    case 'trick-win': if (!S.mini.solved) success('Você encontrou a resposta fora das alternativas!'); return;
    case 'trick-wrong': if (!S.mini.solved) failure('Esta não era a resposta correta.'); return;
    case 'trick-count': if (!S.mini.solved) { if (Number(btn.dataset.value) === maxLives(S.phase)) success('Contagem correta.'); else failure('A quantidade indicada está incorreta.'); } return;
    case 'drag-ans': if (S.mini.solved) return; if (!S.mini.revealed) { failure('Você precisa revelar a resposta primeiro!'); return; } if (btn.dataset.value === '42') success('Encontrou a resposta escondida!'); else failure('Resposta incorreta!'); return;
    case 'double-tap': if (S.mini.solved) return; { const now = Date.now(); if (S.mini.lastTap && now - S.mini.lastTap < 480) success('Dois cliques rápidos!'); else { S.mini.lastTap = now; persist(); render(); } } return;
  }
  if (a.startsWith('mini-')) miniClick(a, btn);
}
async function copy(text) {
  try { if (!navigator.clipboard?.writeText) throw Error(); await navigator.clipboard.writeText(text); CQ.notify('Copiado para a área de transferência.'); }
  catch { const x = document.createElement('textarea'); x.value = text; x.style.cssText = 'position:fixed;opacity:0'; document.body.append(x); x.select(); let ok = false; try { ok = document.execCommand('copy'); } catch {} x.remove(); if (ok) CQ.notify('Copiado.'); else CQ.ui.alert('Copie o código', `<p class="selectable" style="overflow-wrap:anywhere">${E(text)}</p>`); }
}
API.copy = copy;

function renderEnd() {
  const g = S.generation; setGameTitle(S.done ? 'Trilha concluída' : 'Fim de jogo', `SEED ${g.seed}`, 'TENTATIVA FINALIZADA');
  const msg = S.done ? (isUltra() ? 'ULTRA CLASSIQUIZ CONCLUÍDO!' : isCampaign() ? 'EDIÇÃO CONCLUÍDA!' : 'TRILHA CONCLUÍDA!') : 'PARTIDA ENCERRADA.';
  const played = g.stages.filter(q => q.kind !== 'skipped').length;
  const r = S.run || newRun(), min = Math.floor(r.ms / 60000), sec = Math.round(r.ms / 1000) % 60;
  const countText = g.count !== played ? `Esta Trilha tinha ${played} desafios jogáveis em ${g.count} posições numeradas.` : '';
  return `<div class="hero end-hero">
    <div class="end-heading"><div class="end-mark">${S.done ? SV.star : SV.heartEmpty}</div><h1>${msg}</h1>
      <p>Você ${S.done ? 'concluiu' : 'chegou à questão'} <b>${S.done ? g.count : S.phase + 1}</b> de <b>${g.count}</b>${isCampaign() ? ` na edição <b>ClassiQuiz ${g.campaign}</b>` : ''}.</p></div>
    <dl class="retro end-stats" aria-label="Resumo da tentativa"><div><dt>Acertos</dt><dd>${r.correct}</dd></div><div><dt>Erros</dt><dd>${r.errors}</dd></div><div><dt>Corações perdidos</dt><dd>${r.heartsLost}</dd></div><div><dt>Pegadinhas</dt><dd>${r.tricks}</dd></div><div><dt>Minigames</dt><dd>${r.minis}</dd></div><div><dt>Missões</dt><dd>${r.missions}</dd></div><div><dt>Tempo jogado</dt><dd>${min}min ${String(sec).padStart(2, '0')}s</dd></div></dl>
    ${S.dev ? '<p class="muted end-dev-warning">Esta foi uma tentativa de teste: sem recordes, moedas ou conquistas.</p>' : ''}
    <div class="callout end-seed"><span>${isCampaign() ? 'Edição' : 'Seed'}: <b>${E(g.seed)}</b></span><span class="end-seed-detail">${countText ? `<br>${countText}` : ''}<br>Ao reiniciar, a sequência será exatamente a mesma.</span><span class="end-seed-short">${countText ? `${played} desafios em ${g.count} posições. ` : ''}A mesma sequência será repetida.</span></div>
    <div class="actions end-actions" role="group" aria-label="Próximas ações"><button type="button" class="chrome-button primary" data-act="restart">↻ Tentar a mesma ${isCampaign() ? 'edição' : 'Trilha'}</button><button type="button" class="chrome-button" data-act="home">Menu</button><button type="button" class="chrome-button" data-act="copy-seed">Copiar seed</button></div>
  </div>`;
}
CQ.apps.game = {title: 'ClassiQuiz', icon: 'assets/icons/classiquiz.svg', bodyClass: 'page', persistent: false, maxDefault: true, noStatus: false,
  render(w) {
    if (!w._bound) { w.body.addEventListener('click', bodyClick); w._bound = true; }
    w.body.classList.toggle('end-screen-body', !!(S.generation && (S.done || S.lost)));
    w.body.innerHTML = !S.generation ? renderGame() : (S.done || S.lost) ? renderEnd() : renderGame(); bindUnique(w); updateWaitClock();
    if (!S.generation) { w.setTitle('ClassiQuiz'); w.setStatus('Sem partida', ''); }
  },
  onClose() { clearInterval(tickTimer); CQ.missions?.pause?.(); },
  contextMenu(target) {
    const s=cur(), active=!!s && !S.mini.solved && !S.done && !S.lost && WM.isVisible('game');
    const inside=!!target.closest('.game-stage,.show-stage') || !!target.closest('.question-text');
    const normal=[
      {label:'Copiar enunciado', run:()=>copy(s?.text || '')},
      {label:'Inspecionar questão', run:()=>CQ.ui.alert('Propriedades da questão', `<p>Número: ${S.phase+1}</p><p>Banco: ${E(S.generation?.bank||'-')}</p>`)},
      {sep:true},{label:'Voltar ao menu',run:()=>OS.open('new')}
    ];
    if(!active || !inside)return normal;
    const special={
      'context-copy':{label:'Copiar',run:()=>success('Você descobriu o comando Copiar pelo botão direito!')},
      'context-refresh':{label:'Atualizar',run:()=>success('O menu contextual trouxe a resposta!')},
      'context-info':{label:'Propriedades',run:()=>success('Você encontrou as propriedades no menu!')},
      'context-properties':{label:'Propriedades',run:()=>success('Você encontrou as propriedades no menu!')}
    }[s.mode];
    if(!special)return normal;
    // A resposta existe apenas neste menu: nenhuma alternativa visível é correta.
    const items = s.mode === 'context-copy' ? [
      {label:'Recortar',run:()=>failure('Recortar não é copiar: o original seria removido.')}, special,
      {label:'Colar',run:()=>failure('Colar insere o conteúdo existente na área de transferência.')},
      {label:'Selecionar tudo',run:()=>failure('Selecionar não copia o conteúdo.')}
    ] : [{label:'Abrir',run:()=>failure('Essa opção não resolve a pergunta.')},special,{label:'Copiar',run:()=>failure('Essa opção não resolve a pergunta.')},{sep:true},{label:'Ajuda',run:()=>CQ.notify('Explore as opções do menu contextual.')}];
    return items;
  }
};
CQ.apps.resume = {title: 'Continuar', icon: 'assets/icons/continuar.svg', beforeOpen() {
  if (!S.generation || S.done || S.lost) { CQ.notify('Não há partida em andamento.'); return false; }
  OS.open('game'); return false;
}};
// ----- janela ClassiQuiz (seletor de modo) -----
function campaignCard(id, info) { const r = rec().campaigns[id] || {}; return `<button type="button" class="mode-card" data-act="camp" data-id="${id}"><span class="mode-kicker">EDIÇÃO OFICIAL</span><span class="mode-title">ClassiQuiz ${id}</span><span class="mode-sub">${E(info.subtitle)}</span><span class="mode-meta">50 questões fixas • Melhor: ${r.best || 0}/50 • Vitórias: ${r.wins || 0}</span></button>`; }
function randomCard() { return `<button type="button" class="mode-card random-card" data-act="random-open"><span class="mode-kicker">TRILHA ALEATÓRIA</span><span class="mode-title">ClassiQuiz Aleatório</span><span class="mode-sub">Desafios e perguntas em uma sequência diferente a cada seed.</span><span class="mode-meta">25 a 400 posições • Escolher tamanho ›</span></button>`; }
CQ.apps.new = {title: 'ClassiQuiz', icon: 'assets/icons/classiquiz.svg', bodyClass: 'page', maxDefault: true, refreshOnOpen: true,
  render(w) {
    if (!w._bound) {
      w._bound = true; w.body.addEventListener('click', e => {
        const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
        if (a === 'random-open') { w.data.randomOpen = true; WM.refresh('new'); }
        else if (a === 'random-back') { w.data.randomOpen = false; WM.refresh('new'); }
        else if (a === 'size') { S.selectedCount = Number(b.dataset.value); WM.refresh('new'); }
        else if (a === 'new-gen') { w.data.randomOpen = false; startNew(); }
        else if (a === 'camp') { w.data.randomOpen = false; startCampaign(Number(b.dataset.id)); }
        else if (a === 'resume-game') OS.open('game');
        else if (a === 'enter-seed') { const i = w.body.querySelector('#seed-entry'); if (i?.value) openSeed(i.value); else CQ.notify('Digite uma seed.'); }
      });
      w.body.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'seed-entry') openSeed(e.target.value); });
    }
    const p = currentProfile(), opts = sizes(p), info = G.campaignInfo ? G.campaignInfo() : null;
    if (!opts.includes(S.selectedCount)) S.selectedCount = opts.includes(100) ? 100 : (opts.at(-1) || 25);
    const resumable = S.generation && !S.done && !S.lost;
    w.setTitle('ClassiQuiz'); w.setStatus('Escolha como jogar.', 'PERFIL ' + p + ' • v' + CQ.VERSION);
    w.body.innerHTML = `<div class="setup-simple wide play-setup"><h1>ClassiQuiz</h1><p class="slogan">UM CLÁSSICO QUE NUNCA EXISTIU</p>
      ${resumable && !w.data.randomOpen ? `<div class="actions"><button type="button" class="chrome-button primary" data-act="resume-game">↪ Continuar ${isUltra() ? 'Ultra' : isCampaign() ? 'ClassiQuiz ' + S.generation.campaign : 'Trilha'} (questão ${S.phase + 1})</button></div>` : ''}
      ${w.data.randomOpen ? `<div class="random-picker"><button type="button" class="chrome-button tiny" data-act="random-back">← Voltar aos modos</button><h2>ClassiQuiz Aleatório</h2><p>Escolha a quantidade de posições. A ordem é criada por uma seed e permanece igual ao reiniciar.</p><div class="options-group">${opts.map(n => `<button type="button" class="select-chip ${S.selectedCount === n ? 'selected' : ''}" data-act="size" data-value="${n}" aria-pressed="${S.selectedCount === n}">${n}</button>`).join('')}</div><div class="actions"><button type="button" class="chrome-button primary" data-act="new-gen">▶ Começar Trilha Aleatória (${S.selectedCount})</button></div></div>` : `<div class="box-label">ESCOLHA UM MODO</div><div class="play-grid">${randomCard()}${info ? [1, 2, 3].map(i => campaignCard(i, info[i])).join('') : ''}</div>`}
      <div class="line"></div><label for="seed-entry">Abrir uma seed</label><div class="seed-row"><input class="text-input" id="seed-entry" placeholder="CQ1-${NEWBANK()}-${p}-100-ABC123" autocomplete="off" spellcheck="false"><button type="button" class="chrome-button" data-act="enter-seed">Carregar</button></div>
      <p class="muted">${G.eligibleList(G.dataOf(NEWBANK()), p).length} questões e desafios no banco ${NEWBANK()} para o seu dispositivo. Máximo de ${capacity(p)} posições.</p></div>`;
  }};
// ----- Ultra -----
CQ.apps.ultra = {title: 'Ultra ClassiQuiz', icon: 'assets/icons/ultra.svg', bodyClass: 'page', maxDefault: true, refreshOnOpen: true,
  render(w) {
    if (!w._bound) { w._bound = true; w.body.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; if (b.dataset.act === 'ultra-lives') { S.ultraLives = Number(b.dataset.value); WM.refresh('ultra'); } else if (b.dataset.act === 'ultra-start') startUltra(S.ultraLives || 1); }); }
    const p = currentProfile(), n = G.bankAvailable('B6') && G.ultraCountB6 ? G.ultraCountB6(p) : G.ultraCountB5(p); w.setTitle('Ultra ClassiQuiz'); w.setStatus('Perfil ' + p, 'MODO ULTRA');
    const lv = S.ultraLives || 1;
    w.body.innerHTML = `<div class="ultra-setup"><div class="ultra-head"><span class="ultra-symbol"><img src="assets/icons/ultra.svg" alt=""></span><div><h1>Ultra ClassiQuiz</h1><p>${n} posições. Todas as questões elegíveis ao seu perfil. Uma única sequência sorteada.</p></div></div>
    <p>Escolha os corações disponíveis desde a primeira questão. No Ultra, você <b>não recebe mais corações</b> a cada 25 questões.</p>
    <div class="ultra-hearts">${[1, 2, 3].map(k => `<button type="button" data-act="ultra-lives" data-value="${k}" class="select-chip ${lv === k ? 'selected' : ''}" aria-pressed="${lv === k}">${heartsHtml(k, k)}<br>${k} coração${k > 1 ? 'ões' : ''}</button>`).join('')}</div>
    <div class="ultra-note">${achievements.disabled ? 'Conquistas indisponíveis neste dispositivo.' : lv === 1 ? 'Conquistas do Ultra habilitadas.' : 'Conquistas do Ultra bloqueadas com 2 ou 3 corações.'}</div>
    <div class="actions"><button type="button" class="chrome-button primary" data-act="ultra-start">▶ Iniciar Ultra</button></div></div>`;
  }};
// ----- Minhas Trilhas / Favoritas -----
function libraryApp(favOnly) {
  return {title: favOnly ? 'Favoritas' : 'Minhas Trilhas', icon: favOnly ? 'assets/icons/favoritas.svg' : 'assets/icons/minhas-trilhas.svg', bodyClass: 'page', maxDefault: true, refreshOnOpen: true,
    render(w) {
      if (!w._bound) { w._bound = true; w.body.addEventListener('click', e => libClick(e, w, favOnly)); w.body.addEventListener('change', e => { if (e.target.id === 'lib-import') importLibrary(e.target.files?.[0], () => WM.refresh(w.id)); }); }
      const list = favOnly ? library.filter(g => g.favorite) : library; w.setTitle(favOnly ? 'Favoritas' : 'Minhas Trilhas'); w.setStatus(`${library.length} seeds salvas`, 'FAVORITOS');
      w.body.innerHTML = `<div class="section-title"><h2>${favOnly ? 'Trilhas favoritas' : 'Minhas Trilhas'}</h2></div><div class="dev-controls"><button type="button" class="chrome-button tiny" data-act="export-lib">⇩ Exportar biblioteca</button><button type="button" class="chrome-button tiny" data-act="import-lib">⇧ Importar biblioteca</button><input id="lib-import" type="file" accept="application/json,.json" hidden></div>
      <div class="library-list">${list.length ? list.map(g => `<div class="lib-item"><div><strong>${E(g.name || 'Sem nome')}</strong> <span class="mark">${E(g.profile)}</span><div class="lib-meta">${E(g.seed)}<br>${g.count} questões • Recorde: ${g.best || 1} • ${E(g.bank || 'B5')}</div></div><div class="lib-actions"><button type="button" class="star-btn ${g.favorite ? 'on' : ''}" data-act="fav" data-seed="${E(g.seed)}" title="Favoritar" aria-label="${g.favorite ? 'Desfavoritar' : 'Favoritar'}">${g.favorite ? '★' : '☆'}</button><button type="button" class="chrome-button tiny" data-act="play-saved" data-seed="${E(g.seed)}">▶ Jogar</button><button type="button" class="chrome-button tiny" data-act="rename" data-seed="${E(g.seed)}" aria-label="Renomear">✎</button><button type="button" class="chrome-button tiny" data-act="copy-one" data-seed="${E(g.seed)}">Copiar</button><button type="button" class="chrome-button tiny danger" data-act="delete" data-seed="${E(g.seed)}" aria-label="Excluir">×</button></div></div>`).join('') : '<div class="empty-state">Nenhuma Trilha nesta lista.</div>'}</div><p class="muted">O prazo de 20 minutos vale só para uma tentativa interrompida. Seeds salvas e favoritas não expiram.</p>`;
    }};
}
async function libClick(e, w, favOnly) {
  const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act, g = library.find(x => x.seed === b.dataset.seed);
  if (a === 'play-saved') openSeed(b.dataset.seed);
  else if (a === 'fav' && g) { g.favorite = !g.favorite; saveLib(); achievements.stats.favorites = library.filter(v => v.favorite).length; checkAchievements(); WM.refresh(w.id); }
  else if (a === 'rename' && g) { const name = await CQ.ui.prompt('Renomear Trilha', 'Nome desta Trilha:', g.name); if (name?.trim()) { g.name = name.trim().slice(0, 90); saveLib(); WM.refresh(w.id); } }
  else if (a === 'delete' && g) { if (await CQ.ui.confirm('Excluir Trilha', '<p>Excluir esta Trilha da biblioteca?</p>', 'Excluir', 'Cancelar', true)) { library = library.filter(x => x.seed !== g.seed); saveLib(); WM.refresh(w.id); } }
  else if (a === 'copy-one') copy(b.dataset.seed);
  else if (a === 'export-lib') exportLibrary();
  else if (a === 'import-lib') w.body.querySelector('#lib-import')?.click();
}
function importLibrary(file, done) {
  if (!file) return; if (file.size > 4 * 1024 * 1024) { CQ.notify('Arquivo grande demais (máximo: 4 MB).'); return; }
  const reader = new FileReader();
  reader.onload = () => { try { const inc = JSON.parse(String(reader.result)); if (!Array.isArray(inc)) throw Error('Formato inválido.'); let count = 0;
    for (const g of inc) { if (typeof g.seed !== 'string') continue; let meta; try { meta = G.parseSeed(g.seed); } catch { continue; } let stages; if (Array.isArray(g.timeline) && g.timeline.length === meta.count && g.timeline.every(x => typeof x.id === 'string' && typeof x.kind === 'string')) stages = g.timeline; else stages = G.generate(meta.seed).stages; if (library.some(x => x.seed === meta.seed)) continue; library.push({seed: meta.seed, name: String(g.name || 'Trilha importada').slice(0, 90), count: meta.count, profile: meta.p, bank: meta.bank, timeline: stages, favorite: !!g.favorite, best: Math.max(1, Math.min(meta.count, Number(g.best) || 1)), createdAt: Date.now()}); count++; }
    saveLib(); CQ.notify(`${count} Trilhas importadas.`); done?.(); } catch (ex) { CQ.notify('Importação inválida: ' + ex.message); } };
  reader.readAsText(file);
}
function exportLibrary() { const blob = new Blob([JSON.stringify(library, null, 2)], {type: 'application/json'}), url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = 'classiquiz-geracoes.json'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2500); CQ.notify('Biblioteca exportada.'); }
CQ.apps.library = libraryApp(false); CQ.apps.favorites = libraryApp(true);
// ----- Conquistas -----
CQ.apps.achievements = {title: 'Conquistas', icon: 'assets/icons/conquistas.svg', bodyClass: 'page', maxDefault: true, refreshOnOpen: true,
  render(w) {
    const total = ACHIEVEMENTS.length, got = ACHIEVEMENTS.filter(([id]) => !!achievements.unlocked[id]).length, s = achievements.stats; w.setTitle('Conquistas'); w.setStatus(`${got}/${total} desbloqueadas`, 'CLASSIQUIZ • CONQUISTAS');
    const groups = {normal: 'Jornada', habilidade: 'Habilidade', show: 'Show do Milhozão', jogos: 'Programas e jogos', ultra: 'Ultra', secreta: 'Secretas', erros: 'Erros e derrotas'};
    w.body.innerHTML = `<section class="ach-page"><div class="ach-summary"><h1>Conquistas</h1><strong>${got} / ${total}</strong></div>
      ${achievements.disabled ? '<div class="achievement-paused" role="status">Conquistas desativadas neste dispositivo (Terminal usado). Para reativar, use “Resetar conquistas” em Configurações ou no próprio Terminal.</div>' : ''}
      <p class="muted">Erros: ${s.errors || 0} • Derrotas: ${s.losses || 0} • Acertos: ${s.correct || 0} • Vitórias: ${s.wins || 0}</p>
      ${Object.entries(groups).map(([k, label]) => `<h2 class="ach-group">${label}</h2><div class="ach-grid">${ACHIEVEMENTS.filter(a => a[4] === k).map(([id, name, desc]) => { const un = !!achievements.unlocked[id], hid = (id.startsWith('secret') || id === 'runner_secret') && !un; return `<div class="ach-item ${un ? 'ach-unlocked' : ''}"><div class="ach-pict">${un ? '★' : '◇'}</div><div><strong>${hid ? '???' : E(name)}</strong><small>${hid ? 'Conquista secreta' : E(desc)}</small>${un ? `<small>Desbloqueada em ${new Date(achievements.unlocked[id]).toLocaleDateString('pt-BR')}</small>` : ''}</div></div>`; }).join('')}</div>`).join('')}</section>`;
  }};

// ---------- inicialização ----------
API.init = () => { restore(); };
document.addEventListener('visibilitychange', () => { if (!document.hidden && S.generation && !S.done && !S.lost) { if (S.run) S.run.last = Date.now(); persist(); } });
setInterval(() => { if (WM.isVisible('game') && !document.hidden && S.generation && !S.done && !S.lost) persist(); }, 15000);
window.CLASSIQUIZ_TEST = {generate: G.generate, parseSeed: G.parseSeed, capacity: G.capacity, eligible: G.eligible, hash: G.hash};
})();
