/* ClaQui OS — programas de sistema: Configurações, Terminal (com autorização), Sobre, Atualizações, Estatísticas, Recompensas e pastas. Licença: MIT. */
(() => {
'use strict';
const CQ = window.CQ, E = CQ.E, OS = CQ.os, WM = OS.wm, K = CQ.KEYS, API = CQ.game, A = CQ.apps;

// =============== catálogo cosmético (Loja de recompensas: nenhuma vantagem de jogo) ===============
CQ.REWARDS = [
  {id: 'wp-aurora', cat: 'wallpaper', name: 'Papel de parede Aurora', price: 30, apply: {wallpaper: 'aurora'}},
  {id: 'wp-milharal', cat: 'wallpaper', name: 'Papel de parede Milharal', price: 40, apply: {wallpaper: 'milharal'}},
  {id: 'wp-vinil', cat: 'wallpaper', name: 'Papel de parede Vinil', price: 50, apply: {wallpaper: 'vinil'}},
  {id: 'th-vinho', cat: 'tema', name: 'Tema Vinho', price: 40, apply: {theme: 'vinho'}},
  {id: 'th-musgo', cat: 'tema', name: 'Tema Musgo', price: 40, apply: {theme: 'musgo'}},
  {id: 'th-grafite', cat: 'tema', name: 'Tema Grafite', price: 60, apply: {theme: 'grafite'}},
  {id: 'cu-azul', cat: 'cursor', name: 'Cursor seta azul', price: 25, apply: {cursor: 'seta-azul'}},
  {id: 'cu-dourada', cat: 'cursor', name: 'Cursor seta dourada', price: 35, apply: {cursor: 'seta-dourada'}},
  {id: 'cu-cruz', cat: 'cursor', name: 'Cursor em cruz', price: 25, apply: {cursor: 'cruz'}},
  {id: 'ic-mono', cat: 'icones', name: 'Ícones monocromáticos', price: 30, apply: {iconStyle: 'mono'}},
  {id: 'ic-neon', cat: 'icones', name: 'Ícones neon', price: 45, apply: {iconStyle: 'neon'}}
];
const FREE = {tema: [['padrao', 'Padrão']], cursor: [['padrao', 'Padrão']], icones: [['padrao', 'Padrão']]};
const owned = id => !!API.rew().owned[id];
const catKey = {tema: 'theme', cursor: 'cursor', icones: 'iconStyle'};
function applySys(patch) { CQ.sys.set(patch); OS.applyTheme(); if ('wallpaper' in patch || 'wallpaperFit' in patch) OS.applyWallpaper(); }

// =============== Configurações ===============
const SCALES = [100, 125, 150, 175];
const FITS = [['fill', 'Preencher'], ['fit', 'Ajustar'], ['stretch', 'Esticar'], ['tile', 'Repetir']];
let wpDraft = null;   // {id, fit, blob?, url?}
const TABS = [['exibicao', 'Exibição'], ['personalizacao', 'Personalização'], ['mouse', 'Mouse'], ['som', 'Som e animação'], ['conquistas', 'Conquistas'], ['sistema', 'Sistema']];
function wpPreviewStyle(d) {
  const w = OS.wallpapers.find(x => x.id === d.id); const src = d.url || (w ? w.src : OS.wallpapers[0].src);
  const m = {fill: ['cover', 'no-repeat'], fit: ['contain', 'no-repeat'], stretch: ['100% 100%', 'no-repeat'], tile: ['80px', 'repeat']}[d.fit] || ['cover', 'no-repeat'];
  return `background-image:url('${E(src)}');background-size:${m[0]};background-repeat:${m[1]};background-position:center`;
}
function settingsHtml(w) {
  const tab = w.data.tab || 'exibicao', sys = CQ.sys.all(), cur = OS.chosenScale();
  const tabs = `<div class="tabs" role="tablist">${TABS.map(([id, n]) => `<button type="button" role="tab" class="tab ${tab === id ? 'on' : ''}" aria-selected="${tab === id}" data-act="set-tab" data-tab="${id}">${n}</button>`).join('')}</div>`;
  let body = '';
  if (tab === 'exibicao') {
    body = `<h2>Tamanho da interface</h2><p>Aumenta textos, ícones, janelas, menus e alternativas ao mesmo tempo. A mudança é aplicada na hora e fica salva neste dispositivo.</p>
      <div class="options-group" role="group" aria-label="Tamanho da interface">${SCALES.map(s => `<button type="button" class="select-chip ${cur === s ? 'selected' : ''}" data-act="set-scale" data-value="${s}" aria-pressed="${cur === s}">${s}%</button>`).join('')}</div>
      <p class="muted">Padrão deste dispositivo: ${OS.defaultScale()}%. Em telas estreitas o sistema limita a escala para nada ficar cortado.</p>
      <div class="actions"><button type="button" class="chrome-button" data-act="scale-reset">Restaurar padrão</button></div>`;
  } else if (tab === 'personalizacao') {
    wpDraft ||= {id: sys.wallpaper, fit: sys.wallpaperFit};
    const walls = OS.wallpapers.map(x => { const locked = x.shop && !owned(x.shop); return `<button type="button" class="wp-thumb ${wpDraft.id === x.id ? 'on' : ''}" data-act="wp-pick" data-id="${x.id}" ${locked ? 'disabled' : ''} aria-pressed="${wpDraft.id === x.id}" title="${locked ? 'Bloqueado — desbloqueie na Loja de recompensas' : x.name}"><img src="${E(x.src)}" alt=""><span>${E(x.name)}${locked ? ' (loja)' : ''}</span></button>`; }).join('');
    const ownedThemes = (cat, label) => { const list = [...FREE[cat], ...CQ.REWARDS.filter(r => r.cat === cat && owned(r.id)).map(r => [r.apply[catKey[cat]], r.name])]; const k = catKey[cat]; return `<label>${label}<select data-act="set-look" data-key="${k}">${list.map(([v, n]) => `<option value="${E(v)}" ${sys[k] === v ? 'selected' : ''}>${E(n)}</option>`).join('')}</select></label>`; };
    body = `<h2>Papel de parede</h2><p>O papel de parede altera só o fundo da área de trabalho. A marca, o slogan e os atalhos não mudam de lugar.</p>
      <div class="wp-grid">${walls}</div>
      <div class="wp-controls"><label>Ajuste da imagem<select data-act="wp-fit">${FITS.map(([v, n]) => `<option value="${v}" ${wpDraft.fit === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <button type="button" class="chrome-button" data-act="wp-import">Importar imagem…</button><input id="wp-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden></div>
      <div class="wp-preview" aria-label="Prévia do papel de parede" style="${wpPreviewStyle(wpDraft)}"><span>Prévia</span></div>
      <div class="actions"><button type="button" class="chrome-button primary" data-act="wp-apply">Aplicar</button><button type="button" class="chrome-button" data-act="wp-reset">Restaurar fundo original</button></div>
      ${wpDraft.id === 'custom' && !wpDraft.url ? '<p class="muted">Imagem importada anteriormente (ainda não pré-visualizada).</p>' : ''}
      <h2>Aparência</h2><div class="look-grid">${ownedThemes('tema', 'Tema das janelas')}${ownedThemes('cursor', 'Cursor')}${ownedThemes('icones', 'Estilo dos ícones')}</div><p class="muted">Mais opções cosméticas podem ser desbloqueadas com Fichas Classi na Loja de recompensas.</p>`;
  } else if (tab === 'mouse') {
    const mouse = CQ.mouse, sch = sys.mouseScheme || 'classico', sz = sys.mouseSize || 32, slots = sys.mouseRoles || {};
    const opt = (v, n, selected) => `<option value="${E(v)}" ${selected === v ? 'selected' : ''}>${E(n)}</option>`;
    body = `<h2>Propriedades do Mouse</h2><p>Escolha um esquema completo ou personalize os 15 ponteiros. São cursores originais do ClaQui OS inspirados nas eras 95/98, XP e Aero. As mudanças afetam somente este jogo.</p>
      <div class="mouse-head"><label>Esquema<select data-act="mouse-scheme">${mouse.schemes.map(([v,n])=>opt(v,n,sch)).join('')}</select></label>
      <label>Tamanho<select data-act="mouse-size">${[24,32,40].map(n=>opt(n,n+' px',sz)).join('')}</select></label></div>
      <h2>Área de teste</h2><p class="muted">Passe o ponteiro sobre os campos abaixo. A mudança também vale para as janelas e programas do ClaQui OS.</p>
      <div class="mouse-test-panel" aria-label="Teste de cursores"><div class="mouse-test-normal">Seleção normal</div><div class="mouse-test-link">Mãozinha (link)</div><div class="mouse-test-text">Texto: passe aqui</div><div class="mouse-test-busy">Ocupado</div></div>
      <h2>Personalizar ponteiros</h2><div class="mouse-role-grid">${mouse.roles.map(([id,name]) => {
        const theme = slots[id] || sch;
        return `<div class="mouse-role"><label for="mouse-${id}">${E(name)}</label><div class="mouse-role-preview" style="cursor:${mouse.preview(id,theme,sz)}" title="Mova o mouse aqui">Mova o mouse aqui</div><select id="mouse-${id}" data-act="mouse-role" data-role="${id}">${opt('', 'Usar esquema', slots[id] || '')}${mouse.schemes.map(([v,n])=>opt(v,n,slots[id] || '')).join('')}</select></div>`;
      }).join('')}</div>
      <label class="mouse-trail-toggle"><input type="checkbox" data-act="mouse-trail" ${sys.mouseTrail?'checked':''}> Mostrar rastro do ponteiro</label>
      <p class="muted">No celular, os botões continuam funcionando por toque. O cursor do Windows real não é alterado.</p><div class="actions"><button type="button" class="chrome-button" data-act="mouse-reset">Restaurar ponteiros</button></div>`;
  } else if (tab === 'som') {
    body = `<h2>Som</h2><div class="actions"><button type="button" class="chrome-button" data-act="toggle-sound" aria-pressed="${!!CQ.prefs.sound}">Som: ${CQ.prefs.sound ? 'Ligado' : 'Desligado'}</button><button type="button" class="chrome-button" data-act="test-sound">Testar</button></div>
      <label class="range-label">Volume dos efeitos: <b id="vol-val">${sys.volume}%</b><input type="range" min="0" max="100" step="5" value="${sys.volume}" data-act="set-volume" aria-label="Volume dos efeitos"></label>
      <h2>Animações</h2><label>Animações<select data-act="set-motion"><option value="auto" ${sys.reduceMotion === 'auto' ? 'selected' : ''}>Seguir o sistema</option><option value="off" ${sys.reduceMotion === 'off' ? 'selected' : ''}>Completas</option><option value="on" ${sys.reduceMotion === 'on' ? 'selected' : ''}>Reduzidas</option></select></label>`;
  } else if (tab === 'conquistas') {
    const locked = API.achievementsLocked(), ultra = CQ.rules.ultra();
    body = `<h2>Conquistas</h2><p class="status-pill ${locked ? 'off' : 'on'}" role="status"><b>${locked ? 'Conquistas desativadas' : 'Conquistas ativas'}</b></p>
      <p>${locked ? 'O Terminal foi usado neste dispositivo, então novas conquistas ficam bloqueadas até você resetar.' : 'Tentativas limpas podem desbloquear conquistas. Abrir o Terminal desativa as conquistas até um reset.'}</p>
      <p class="muted"><b>O que o reset faz:</b> apaga as conquistas já desbloqueadas e o progresso das metas. Mantém estatísticas gerais, recordes, favoritas, Trilhas e preferências. Uma tentativa em andamento que tenha sido marcada como teste continua sem conquistas; só uma tentativa nova e limpa volta a desbloquear.</p>
      <div class="actions"><button type="button" class="chrome-button danger" data-act="reset-ach" ${ultra ? 'disabled' : ''}>Resetar conquistas…</button></div>${ultra ? '<p class="muted">Indisponível durante uma partida Ultra.</p>' : ''}`;
  } else {
    body = `<h2>Sistema</h2><p>ClaQui OS ${CQ.VERSION} • dados guardados apenas neste navegador (${CQ.vfs.mode === 'idb' ? 'IndexedDB' : 'memória'} para arquivos virtuais).</p>
      <div class="actions"><button type="button" class="chrome-button" data-act="open-app" data-app="about">Sobre o ClaQui OS</button><button type="button" class="chrome-button" data-act="open-app" data-app="stats">Estatísticas</button></div>
      <p class="muted">Ctrl + botão direito abre o menu nativo do navegador. F12 e “Inspecionar” funcionam normalmente.</p>`;
  }
  return `${tabs}<div class="tab-body">${body}</div>`;
}
A.settings = {title: 'Configurações', icon: 'assets/icons/configuracoes.svg', bodyClass: 'page', maxDefault: true, refreshOnOpen: false,
  onParams(w, p) { if (p?.tab) { w.data.tab = p.tab; WM.refresh('settings'); } },
  render(w, p) {
    if (p?.tab) w.data.tab = p.tab;
    if (!w._bound) { w._bound = true;
      w.body.addEventListener('click', e => settingsClick(e, w));
      w.body.addEventListener('change', e => settingsChange(e, w));
      w.body.addEventListener('input', e => { if (e.target.dataset.act === 'set-volume') { CQ.sys.set({volume: Number(e.target.value)}); const v = w.body.querySelector('#vol-val'); if (v) v.textContent = e.target.value + '%'; } });
    }
    w.setTitle('Configurações'); w.setStatus('Alterações são salvas automaticamente.', 'ClaQui OS ' + CQ.VERSION);
    w.body.innerHTML = settingsHtml(w);
  }};
function wpFromSys() { wpDraft = {id: CQ.sys.get('wallpaper'), fit: CQ.sys.get('wallpaperFit')}; }
async function settingsClick(e, w) {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return; const a = b.dataset.act, re = () => WM.refresh('settings');
  if (a === 'set-tab') { w.data.tab = b.dataset.tab; if (b.dataset.tab === 'personalizacao') wpFromSys(); re(); }
  else if (a === 'set-scale') { CQ.sys.set({scale: Number(b.dataset.value)}); OS.applyScale(); re(); }
  else if (a === 'mouse-reset') { CQ.mouse.reset(); re(); }
  else if (a === 'scale-reset') { CQ.sys.set({scale: null}); OS.applyScale(); re(); CQ.notify('Tamanho restaurado para o padrão.'); }
  else if (a === 'wp-pick') { wpDraft.id = b.dataset.id; wpDraft.url = null; wpDraft.blob = null; re(); }
  else if (a === 'wp-import') w.body.querySelector('#wp-file')?.click();
  else if (a === 'wp-apply') {
    if (wpDraft.id === 'custom' && wpDraft.blob) { await CQ.vfs.kvPut('wallpaper', wpDraft.blob); CQ.sys.set({customWallpaper: true}); }
    CQ.sys.set({wallpaper: wpDraft.id, wallpaperFit: wpDraft.fit}); await OS.applyWallpaper(); CQ.notify('Papel de parede aplicado.');
  } else if (a === 'wp-reset') { wpDraft = {id: 'classico', fit: 'fill'}; CQ.sys.set({wallpaper: 'classico', wallpaperFit: 'fill'}); await OS.applyWallpaper(); re(); CQ.notify('Fundo original restaurado.'); }
  else if (a === 'toggle-sound') { CQ.prefs.sound = !CQ.prefs.sound; CQ.savePrefs(); re(); }
  else if (a === 'test-sound') { const s = CQ.prefs.sound; CQ.prefs.sound = true; CQ.tone(660, 120); CQ.prefs.sound = s; }
  else if (a === 'reset-ach') resetAchievementsFlow();
}
async function settingsChange(e, w) {
  const t = e.target, a = t.dataset.act; if (!a && t.id !== 'wp-file') return;
  if (t.id === 'wp-file') return importWallpaper(t.files?.[0], w);
  if (a === 'wp-fit') { wpDraft.fit = t.value; WM.refresh('settings'); }
  else if (a === 'mouse-scheme') { CQ.sys.set({mouseScheme:t.value, mouseRoles:{}, cursor:'padrao'}); CQ.mouse.apply(); WM.refresh('settings'); }
  else if (a === 'mouse-size') { CQ.sys.set({mouseSize:Number(t.value)}); CQ.mouse.apply(); WM.refresh('settings'); }
  else if (a === 'mouse-role') { const roles = {...CQ.sys.get('mouseRoles')}; if (t.value) roles[t.dataset.role] = t.value; else delete roles[t.dataset.role]; CQ.sys.set({mouseRoles:roles}); CQ.mouse.apply(); WM.refresh('settings'); }
  else if (a === 'mouse-trail') { CQ.sys.set({mouseTrail:t.checked}); CQ.mouse.apply(); }
  else if (a === 'set-look') { applySys({[t.dataset.key]: t.value}); }
  else if (a === 'set-motion') { CQ.sys.set({reduceMotion: t.value}); OS.applyScale(); }
}
const MAX_WP = 8 * 1024 * 1024;
async function importWallpaper(file, w) {
  if (!file) return;
  if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) { CQ.notify('Formato não suportado. Use PNG, JPG, WebP ou GIF.'); return; }
  if (file.size > MAX_WP) { CQ.notify('Imagem grande demais (máximo: 8 MB).'); return; }
  const url = URL.createObjectURL(file);
  const ok = await new Promise(res => { const im = new Image(); im.onload = () => res(im.naturalWidth > 0 && im.naturalWidth <= 12000 && im.naturalHeight <= 12000); im.onerror = () => res(false); im.src = url; });
  if (!ok) { URL.revokeObjectURL(url); CQ.notify('Não foi possível ler esta imagem.'); return; }
  wpDraft = {id: 'custom', fit: wpDraft?.fit || 'fill', blob: file, url}; WM.refresh('settings'); CQ.notify('Pré-visualização pronta. Clique em Aplicar.');
}
async function resetAchievementsFlow() {
  if (CQ.rules.ultra()) return;
  const ok = await CQ.ui.confirm('Resetar conquistas', `<p><b>Apagar todas as conquistas desbloqueadas e o progresso das metas?</b></p><p>Esta ação não pode ser desfeita. Estatísticas gerais, recordes, favoritas, Trilhas e preferências são mantidos.</p><p>Se o Terminal estiver aberto, ele será fechado. Uma tentativa em andamento marcada como teste continua sem conquistas; novas tentativas limpas voltam a conquistar.</p>`, 'Sim, resetar conquistas', 'Cancelar', true);
  if (!ok) return; API.resetAchievements(); WM.close('dev'); CQ.notify('Conquistas reiniciadas. Inicie uma tentativa limpa para desbloquear novas.');
}
CQ.bus.on('achievements:reset', () => { WM.refresh('settings'); WM.refresh('achievements'); });

// =============== Terminal (antigo DevTools) ===============
const term = {lines: [], booted: false, hist: [], hi: 0};
const MENU = ['', 'COMANDOS DISPONIVEIS', '------------------------------------------', '[1] STATUS            Dados da Trilha', '[2] NEXT              Proxima questao', '[3] PREV              Questao anterior', '[4] GOTO NUMERO       Ir para uma questao', '[5] ANSWER            Revelar a resposta', '[6] HEARTS NUMERO     Ajustar coracoes', '[7] FREEZE            Pausar/retomar espera', '[8] SOLVE             Concluir a questao', '[9] RESETAR           Resetar conquistas', '[0] EXIT              Fechar o terminal', '', 'HELP  CLS  RESTART  SOUND  DIAG  DESKTOP'];
function termBoot() {
  term.booted = true;
  term.lines = ['ClaQui OS Terminal [Versao ' + CQ.VERSION + ']', 'Copyright (C) 2026 ClassiQuiz. Codigo sob licenca MIT.', 'UM CLASSICO QUE NUNCA EXISTIU', '', 'Iniciando sistema de comandos...', 'Unidades virtuais verificadas. Interface pronta.', '', '*** CONQUISTAS DESATIVADAS ***', 'Para reativar, use RESETAR. Essa opcao apaga as conquistas', 'e o progresso delas. Estatisticas gerais serao preservadas.', 'A tentativa atual permanece de teste ate ser reiniciada.', ...MENU];
}
async function uac() {
  const body = `<div class="uac"><svg viewBox="0 0 40 40" width="54" height="54" aria-hidden="true"><path d="M20 3l15 6v10c0 9-6 15-15 18C11 34 5 28 5 19V9z" fill="#2c5db8" stroke="#0e2a63" stroke-width="2"/><path d="M20 10v14M20 28v2" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/></svg><div><p><b>Permitir que o Terminal modifique a partida?</b></p><p>Programa: <b>Terminal do ClaQui OS</b><br>Origem verificada: ClassiQuiz</p><p>O Terminal permite alterar a partida (pular questões, ajustar corações, revelar respostas). <b>Enquanto você não resetar as conquistas, elas ficam desativadas.</b></p><details><summary>Mais detalhes</summary><p class="muted">A tentativa atual passa a ser de teste: sem recordes, moedas ou conquistas. Isto vale só dentro do jogo; nada no seu computador real é alterado. Fechar o Terminal não reativa as conquistas; só o reset em Configurações ou no Terminal.</p></details></div></div>`;
  return CQ.ui.modal({title: 'Controle de Conta do ClaQui OS', body, cls: 'uac-modal', dismiss: false, icon: 'assets/icons/terminal.svg', footer: '<button type="button" class="chrome-button primary" data-modal-value="true">Sim</button><button type="button" class="chrome-button" data-modal-value="false" data-autofocus="1">Não</button>'});
}
function termHtml() {
  return `<div class="term" aria-label="Terminal do ClaQui OS"><div class="term-bar"><span>C:\\CLASSIQUIZ — Terminal</span><span class="term-btns"><button type="button" data-act="term-help">Comandos</button><button type="button" data-act="term-clear">Limpar</button><button type="button" data-act="term-reset">Resetar conquistas</button></span></div><div class="term-out selectable" id="term-out" role="log" aria-live="off"><pre>${E(term.lines.join('\n'))}</pre></div><form class="term-prompt" id="term-form" autocomplete="off"><label for="term-cmd">C:\\CLASSIQUIZ&gt;</label><input id="term-cmd" name="cmd" spellcheck="false" autocorrect="off" autocapitalize="off" aria-label="Digite um comando" placeholder="HELP lista os comandos"><button type="submit">Executar</button></form></div>`;
}
function termDraw(w) { const out = w.body.querySelector('#term-out'); if (!out) return; out.querySelector('pre').textContent = term.lines.join('\n'); out.scrollTop = out.scrollHeight; }
function say(...ls) { term.lines.push(...ls.flat().map(String)); if (term.lines.length > 140) term.lines.splice(0, term.lines.length - 140); }
function runCmd(w, input) {
  const raw = String(input || '').trim().slice(0, 120); if (!raw) return; const S = API.state; term.hist.push(raw); term.hi = term.hist.length;
  const [word, ...args] = raw.toUpperCase().split(/\s+/);
  const alias = {'1': 'STATUS', '2': 'NEXT', '3': 'PREV', '4': 'GOTO', '5': 'ANSWER', '6': 'HEARTS', '7': 'FREEZE', '8': 'SOLVE', '9': 'RESETAR', '0': 'EXIT', '?': 'HELP', QUIT: 'EXIT', CLEAR: 'CLS', RESPOSTA: 'ANSWER', VIDAS: 'HEARTS', ANTERIOR: 'PREV', PROXIMA: 'NEXT', IR: 'GOTO', REINICIAR: 'RESTART'};
  const c = alias[word] || word; say(`C:\\CLASSIQUIZ> ${raw}`); const g = S.generation;
  if (c === 'CLS') { term.lines = []; }
  else if (c === 'HELP') say(MENU);
  else if (c === 'EXIT') { term.booted = false; term.lines = []; WM.close('dev'); return; }
  else if (c === 'DESKTOP') { WM.minimize('dev'); return; }
  else if (c === 'RESETAR') { resetAchievementsFlow(); }
  else if (c === 'SOUND') { CQ.prefs.sound = !CQ.prefs.sound; CQ.savePrefs(); say('Som: ' + (CQ.prefs.sound ? 'ligado' : 'desligado') + '.'); }
  else if (c === 'STATUS') say(g ? [`Seed: ${g.seed}`, `Modo: ${API.isUltra() ? 'Ultra' : API.isCampaign() ? 'Campanha' : 'Normal'} | Questao: ${S.phase + 1}/${g.count}`, `Vidas: ${S.lives} | Banco: ${g.bank} | Perfil: ${g.profile}`, `Tentativa de teste: ${S.dev ? 'SIM' : 'NAO'}`] : 'Nao existe Trilha ativa. Inicie uma Trilha no desktop.');
  else if (c === 'DIAG') { const cap = API.capabilities(); say(g ? [`ID: ${API.cur()?.id || '-'} | Tipo: ${API.cur()?.kind || '-'}`, `Dispositivo: mouse=${cap.mouse ? 'sim' : 'nao'}, toque=${cap.touch ? 'sim' : 'nao'}`] : 'Nao existe Trilha ativa.'); }
  else if (!g || API.isUltra()) say('ERRO: Comando exige uma Trilha normal ativa.');
  else if (c === 'ANSWER') say('RESPOSTA: ' + API.debugAnswer());
  else if (c === 'NEXT' || c === 'PREV' || c === 'GOTO') {
    const n = Number(args[0]);
    if (c === 'GOTO' && (!Number.isInteger(n) || n < 1 || n > g.count)) say('Uso: GOTO 1 a ' + g.count);
    else { const t = c === 'NEXT' ? S.phase + 1 : c === 'PREV' ? S.phase - 1 : n - 1; if (t < 0 || t >= g.count) say('Limite de questoes atingido.'); else if (t === S.phase) say('Voce ja esta nesta questao.'); else { say('Carregando questao ' + (t + 1) + '...'); API.devJump(t); } }
  } else if (c === 'HEARTS') {
    const v = args.length ? Number(args[0]) : API.maxLives(S.phase);
    if (!Number.isInteger(v) || v < 1 || v > 9) say('Uso: HEARTS [1 a 9]'); else { API.taint(); S.dev = true; S.lives = v; API.persist(); API.render(); say('Vidas ajustadas para ' + v + '.'); }
  } else if (c === 'FREEZE') {
    const s = API.cur();
    if (s?.mode !== 'wait20' || S.mini.solved) say('FREEZE disponivel somente no desafio de espera.');
    else { if (S.mini.frozenAt) { S.mini.readyAt += Date.now() - S.mini.frozenAt; delete S.mini.frozenAt; say('Contagem retomada.'); } else { S.mini.frozenAt = Date.now(); say('Contagem pausada.'); } S.dev = true; API.persist(); API.render(); }
  } else if (c === 'SOLVE') { S.dev = true; S.lives = Math.max(1, S.lives); API.success('Questao concluida pelo Terminal.'); say('Questao concluida.'); }
  else if (c === 'RESTART') { API.resetAttempt(false); API.render(); say('Trilha reiniciada.'); }
  else say('Comando desconhecido. Digite HELP para listar os comandos.');
  termDraw(w);
}
A.dev = {title: 'Terminal', icon: 'assets/icons/terminal.svg', bodyClass: 'flush term-win', maxDefault: false, w: 780, h: 540, persistent: true,
  async beforeOpen() {
    if (CQ.rules.ultra()) return false;
    if (!CQ.sys.get('terminalConsent')) { const ok = await uac(); if (!ok) return false; CQ.sys.set({terminalConsent: true}); }   // o aviso só aparece na 1ª vez; depois do 1º Sim nunca volta (nem após Resetar conquistas), mas as conquistas voltam a ser bloqueadas
    API.lockAchievements(); API.taint(); return true;
  },
  render(w) {
    if (!term.booted) termBoot();
    w.body.innerHTML = termHtml(); w.setStatus('Sistema local de diagnóstico • Conquistas desativadas', 'TERMINAL • v' + CQ.VERSION);
    if (!w._bound) { w._bound = true;
      w.body.addEventListener('submit', e => { if (e.target.id === 'term-form') { e.preventDefault(); const i = w.body.querySelector('#term-cmd'); const v = i.value; i.value = ''; runCmd(w, v); i.focus({preventScroll: true}); } });
      w.body.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; if (b.dataset.act === 'term-help') runCmd(w, 'HELP'); else if (b.dataset.act === 'term-clear') runCmd(w, 'CLS'); else if (b.dataset.act === 'term-reset') resetAchievementsFlow(); else if (!e.target.closest('input,button')) w.body.querySelector('#term-cmd')?.focus(); });
      w.body.addEventListener('keydown', e => { if (e.target.id !== 'term-cmd') return; if (e.key === 'ArrowUp') { e.preventDefault(); term.hi = Math.max(0, term.hi - 1); e.target.value = term.hist[term.hi] || ''; } else if (e.key === 'ArrowDown') { e.preventDefault(); term.hi = Math.min(term.hist.length, term.hi + 1); e.target.value = term.hist[term.hi] || ''; } });
    }
    setTimeout(() => { termDraw(w); w.body.querySelector('#term-cmd')?.focus({preventScroll: true}); }, 30);
  },
  onClose() { term.booted = false; term.lines = []; },
  onShow(w) { setTimeout(() => w.body.querySelector('#term-cmd')?.focus({preventScroll: true}), 30); }
};
CQ.bus.on('achievements:reset', () => WM.close('dev'));

// =============== Sobre e Atualizações ===============
A.about = {title: 'Sobre', icon: 'assets/icons/sobre.svg', bodyClass: 'page', maxDefault: false, w: 640, h: 560,
  render(w) {
    w.setTitle('Sobre'); w.setStatus('ClaQui OS ' + CQ.VERSION, 'ClassiQuiz');
    w.body.innerHTML = `<div class="setup-simple"><div class="about-head"><img src="assets/img/claquim.svg" alt="Claquim, assistente do ClaQui OS" width="96" height="96"><div><h1>ClassiQuiz</h1><p class="slogan">UM CLÁSSICO QUE NUNCA EXISTIU</p></div></div>
      <p><b>ClassiQuiz</b> é um quiz de perguntas, pegadinhas, minigames, missões e histórias encadeadas. Ele roda dentro do <b>ClaQui OS</b>, um sistema operacional <i>fictício</i> (Classic + Quiz) que existe só no seu navegador.</p>
      <p>Versão <b>${CQ.VERSION}</b>. Código sob licença MIT. Funciona offline, sem conta, sem anúncios e sem enviar nada para lugar nenhum.</p>
      <p class="muted">Todos os arquivos do Explorador, incluindo a pasta System32, e as operações de desligar e reiniciar são <b>simulações virtuais</b>: nenhum arquivo ou configuração real do seu computador é lido, criado, alterado ou apagado.</p>
      <p class="muted">Personagens e artes originais: Claquim (assistente do sistema) e Milhito (apresentador do Show do Milhozão). “Show do Milhozão” é uma paródia original e não tem relação com programas reais.</p></div>`;
  }};
const CHANGES = [
  ['v2.0.8: correção real do mouse', 'Caminhos dos cursores corrigidos; PNG e SVG, 15 funções, 4 esquemas, testes por área e prévias nas Configurações.'],
  ['Menu Iniciar completo', 'Lista rolável dos programas por categoria, com Desligar e Reiniciar sempre visíveis.'],
  ['Desvio CQ sem fase final', 'Níveis contínuos, recorde do maior nível, obstáculos com velocidade limitada e conquistas para 25, 50 e 100 níveis.'],
  ['v2.0.7: atalhos reorganizados', 'Conquistas e Recompensas na área de trabalho; Favoritas, Atualizações e todos os utilitários diretamente em Mais opções.'],
  ['Desvio CQ', 'Novo arcade original substitui o Pac-Man CQ; missões antigas e saves continuam preservados.'],
  ['Propriedades do Mouse', 'Quatro esquemas retrô originais e 15 tipos de ponteiros personalizáveis, com rastro e tamanho.'],
  ['Desvio CQ e Cobrinha', 'Arcade original de obstáculos e reflexos; Cobrinha pode atravessar paredes.'],
  ['Conquistas dos minijogos', 'Novas metas do Desvio CQ e da Cobrinha.'],
  ['Trilha Aleatória', 'Continuar aparece só na seleção dos modos, não na escolha do tamanho.'],
  ['Calculadora: divisão por zero', 'Primeira ocorrência provoca tela azul fictícia; as seguintes têm 50% de chance de tela azul ou erro na calculadora.'],
  ['Jogo da Velha 2.0.3', 'Fácil, Médio e Difícil desde o início; Ladrão é desbloqueado após a primeira vitória, com 25% de chance por partida.'],
  ['Tela Jogar', 'Quatro cards em grade 2×2, com ClassiQuiz Aleatório abrindo a seleção de tamanho.'],
  ['Meu Dispositivo', 'Navegação como um computador: Meu Dispositivo > Disco Local CQ: > ClaQui > System32, com novas pastas fictícias e migração dos arquivos salvos.'],
  ['Pastas e missões do ClaQui OS', 'Exclusões simuladas produzem efeitos temporários; missões usam Registros e arquivos ocultos de Config.'],
  ['ClaQui OS', 'Sistema operacional fictício com várias janelas, barra de tarefas rolável, menu Start, menu de contexto próprio, boot, desligar e reiniciar simulados.'],
  ['ClassiQuiz 1, 2 e 3', 'Três edições oficiais de 50 questões fixas, cada uma com identidade própria, e a Trilha Aleatória no novo banco B6.'],
  ['Banco B6', 'Revisão completa das 534 questões do banco anterior (auditoria item a item) e dezenas de novas questões, pegadinhas, histórias e missões.'],
  ['Show do Milhozão', 'Bloco de 10 rodadas crescentes com o apresentador Milhito e a conquista “Milhonário”.'],
  ['Programas', 'Explorador de arquivos virtual, Lixeira, Bloco de Notas, Paint, Calculadora, Campo Minado, Jogo da Velha, Cobrinha, Pong, Calendário, Relógio e Visualizador.'],
  ['Missões', 'Questões que pedem tarefas reais nos programas, incluindo manter um programa aberto por 10 ou 20 segundos.'],
  ['Terminal', 'Agora no menu Start, com autorização e desativação persistente das conquistas até o reset.'],
  ['Configurações', 'Tamanho da interface (100–175%), papel de parede com importação, temas, cursores e som.'],
  ['Recompensas', 'Fichas Classi e loja cosmética, sem nenhuma vantagem no jogo.'],
  ['Dados antigos', 'Seeds B1–B5, biblioteca, favoritas, conquistas e preferências da v1.2.x continuam funcionando; migração segura com backup lógico.']
];
A.updates = {title: 'Atualizações', icon: 'assets/icons/atualizacoes.svg', bodyClass: 'page', maxDefault: false, w: 700, h: 580,
  render(w) { w.setTitle('Atualizações'); w.setStatus('Novidades da versão ' + CQ.VERSION, ''); w.body.innerHTML = `<div class="setup-simple"><h1>Novidades da versão ${CQ.VERSION}</h1><ul class="changes">${CHANGES.map(([t, d]) => `<li><b>${E(t)}.</b> ${E(d)}</li>`).join('')}</ul><p class="muted">Veja o CHANGELOG.md para o detalhamento completo.</p></div>`; }};

// =============== Estatísticas ===============
A.stats = {title: 'Estatísticas', icon: 'assets/icons/estatisticas.svg', bodyClass: 'page', maxDefault: false, w: 760, h: 600, refreshOnOpen: true,
  render(w) {
    const s = API.achievementsState().stats, r = CQ.store.read(K.REC, {}), camp = r.campaigns || {}, ul = Object.values(r.ultra || {}), tt = r.totals || {}, rw = API.rew();
    const ms = tt.ms || 0, h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000);
    w.setTitle('Estatísticas'); w.setStatus('Dados guardados neste navegador.', '');
    const row = (a, b) => `<tr><th scope="row">${a}</th><td>${b}</td></tr>`;
    w.body.innerHTML = `<div class="setup-simple wide"><h1>Estatísticas</h1><table class="stat-table"><tbody>${row('Acertos', s.correct || 0)}${row('Erros (respostas erradas)', s.errors || 0)}${row('Derrotas (partidas perdidas)', s.losses || 0)}${row('Vitórias (partidas concluídas)', s.wins || 0)}${row('Pegadinhas resolvidas', s.tricks || 0)}${row('Minigames vencidos', s.mini || 0)}${row('Missões cumpridas', s.missions || 0)}${row('Tempo jogado', `${h}h ${m}min`)}${row('Fichas Classi', rw.coins)}</tbody></table>
      <h2>Recordes</h2><table class="stat-table"><tbody>${row('Trilha Aleatória (melhor questão)', r.trails?.best || 0)}${[1, 2, 3].map(i => row('ClassiQuiz ' + i, `melhor ${camp[i]?.best || 0}/50 • vitórias ${camp[i]?.wins || 0}`)).join('')}</tbody></table>
      <h2>Ultra por perfil, corações e tamanho</h2>${ul.length ? `<table class="stat-table"><tbody>${ul.map(u => row(`Perfil ${u.profile} • ${u.lives} coração(ões) • ${u.count} posições`, `melhor ${u.best} • vitórias ${u.wins}`)).join('')}</tbody></table>` : '<p class="muted">Nenhuma partida Ultra registrada.</p>'}</div>`;
  }};

// =============== Recompensas (Loja cosmética) ===============
A.rewards = {title: 'Recompensas', icon: 'assets/icons/recompensas.svg', bodyClass: 'page', maxDefault: false, w: 780, h: 600, refreshOnOpen: true,
  render(w) {
    if (!w._bound) { w._bound = true; w.body.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const it = CQ.REWARDS.find(x => x.id === b.dataset.id); if (!it) return; if (b.dataset.act === 'buy') buy(it); else if (b.dataset.act === 'equip') { applySys(it.apply); WM.refresh('rewards'); CQ.notify('Aplicado: ' + it.name); } }); }
    const rw = API.rew(); w.setTitle('Recompensas'); w.setStatus('Itens cosméticos: nenhuma vantagem no jogo.', 'Fichas Classi: ' + rw.coins);
    const cats = {wallpaper: 'Papéis de parede', tema: 'Temas', cursor: 'Cursores', icones: 'Estilo de ícones'};
    w.body.innerHTML = `<div class="setup-simple wide"><h1>Loja de recompensas</h1><p>Você ganha <b>Fichas Classi</b> jogando (acertos, vitórias, conquistas) em tentativas limpas. Elas só compram itens visuais; nada altera perguntas, corações ou dificuldade.</p><p class="coins" role="status"><b>${rw.coins}</b> Fichas Classi</p>
      ${Object.entries(cats).map(([c, label]) => `<h2>${label}</h2><div class="shop-grid">${CQ.REWARDS.filter(r => r.cat === c).map(it => { const own = !!rw.owned[it.id]; return `<div class="shop-item"><b>${E(it.name)}</b><span class="muted">${it.price} Fichas</span>${own ? `<button type="button" class="chrome-button tiny primary" data-act="equip" data-id="${it.id}">Usar</button>` : `<button type="button" class="chrome-button tiny" data-act="buy" data-id="${it.id}" ${rw.coins < it.price ? 'disabled' : ''}>Comprar</button>`}</div>`; }).join('')}</div>`).join('')}</div>`;
  }};
async function buy(it) {
  const rw = API.rew(); if (rw.owned[it.id]) return; if (rw.coins < it.price) { CQ.notify('Fichas insuficientes.'); return; }
  if (!(await CQ.ui.confirm('Comprar item', `<p>Comprar <b>${E(it.name)}</b> por ${it.price} Fichas Classi?</p>`, 'Comprar', 'Cancelar'))) return;
  rw.coins -= it.price; rw.owned[it.id] = Date.now(); CQ.store.write(K.REW, rw); WM.refresh('rewards'); WM.refresh('settings'); CQ.notify('Item desbloqueado!');
}
CQ.bus.on('rewards:earn', () => WM.refresh('rewards'));

// =============== pasta Mais opções: atalhos organizados sem pasta intermediária ===============
function folder(title, icon, items, crumb) {
  return {title, icon, bodyClass: 'page', maxDefault: false, w: 720, h: 520, refreshOnOpen: true,
    render(w) {
      w.setTitle(title); w.setStatus(`${items.length} itens`, 'ClaQui OS');
      w.body.innerHTML = `<nav class="crumb" aria-label="Caminho">${crumb}</nav><div class="folder-grid">${items.map(([id, label]) => `<button type="button" class="folder-item" data-act="open-app" data-app="${id}"><img src="${E(A[id]?.icon || 'assets/icons/f-desconhecido.svg')}" alt=""><span>${E(label)}</span></button>`).join('')}</div>`;
    }};
}
A.mais = folder('Mais opções', 'assets/icons/mais-opcoes.svg', [
  ['favorites', 'Favoritas'], ['updates', 'Atualizações'],
  ['achievements', 'Conquistas'], ['stats', 'Estatísticas'], ['rewards', 'Recompensas'],
  ['explorer', 'Explorador de Arquivos'], ['notepad', 'Bloco de Notas'], ['paint', 'Paint'],
  ['calc', 'Calculadora'], ['mines', 'Campo Minado'], ['ttt', 'Jogo da Velha'],
  ['snake', 'Cobrinha'], ['desvio', 'Desvio CQ'], ['pong', 'Pong'],
  ['calendar', 'Calendário'], ['clock', 'Relógio'], ['viewer', 'Visualizador'],
  ['player', 'Reprodutor'], ['trash', 'Lixeira']
], 'ClaQui OS › Mais opções');
})();
