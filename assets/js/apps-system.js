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
const TABS = [['exibicao', 'Exibição'], ['personalizacao', 'Personalização'], ['mouse', 'Mouse'], ['som', 'Som e animação'], ['conquistas', 'Conquistas'], ['atualizacoes', 'Atualizações'], ['sistema', 'Sistema']];
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
      <h2>Touchpad virtual (celular e tablet)</h2><div class="touchpad-settings tp-set">
      <label><input type="checkbox" data-act="touchpad-enable" ${sys.touchpadEnabled?'checked':''}> Ativar touchpad virtual</label>
      <p class="muted">Desativado por padrão e totalmente opcional: o toque normal sempre continua funcionando. Deslize para mover, toque para clicar, dois dedos rolam e a barra de título move o touchpad.${CQ.touchpad&&!CQ.touchpad.isAvailable()?' <b>(Este aparelho não tem tela de toque: o touchpad só aparece em celulares e tablets.)</b>':''}</p>
      <label>Formato <select data-act="touchpad-shape">${Object.entries(CQ.touchpad?.shapes||{}).map(([k,v])=>`<option value="${k}" ${(sys.touchpadShape||'classico')===k?'selected':''}>${E(v[0])}</option>`).join('')}</select></label>
      <label>Largura <input type="range" min="120" max="340" step="5" data-act="touchpad-w" value="${sys.touchpadW||CQ.touchpad?.dims().w||220}"> <small>${sys.touchpadW||'auto'}</small></label>
      <label>Altura <input type="range" min="70" max="260" step="5" data-act="touchpad-h" value="${sys.touchpadH||CQ.touchpad?.dims().h||140}"> <small>${sys.touchpadH||'auto'}</small></label>
      <label>Posição <select data-act="touchpad-position"><option value="right" ${(sys.touchpadPosition||'right')==='right'?'selected':''}>Direita</option><option value="center" ${sys.touchpadPosition==='center'?'selected':''}>Centro</option><option value="left" ${sys.touchpadPosition==='left'?'selected':''}>Esquerda</option><option value="custom" ${sys.touchpadPosition==='custom'?'selected':''}>Personalizada (arraste a barra)</option></select></label>
      <label>Botões <select data-act="touchpad-buttons"><option value="integrated" ${sys.touchpadButtons!=='bar'?'selected':''}>Integrados ao touchpad</option><option value="bar" ${sys.touchpadButtons==='bar'?'selected':''}>Em barra destacada</option></select></label>
      <label>Opacidade <input type="range" min="0.35" max="1" step="0.05" data-act="touchpad-opacity" value="${sys.touchpadOpacity??.88}"></label>
      <label>Sensibilidade <input type="range" min="0.4" max="2.5" step="0.1" data-act="touchpad-sensitivity" value="${sys.touchpadSensitivity||1}"></label>
      <label>Aceleração <input type="range" min="0" max="1" step="0.1" data-act="touchpad-accel" value="${sys.touchpadAccel??1}"></label>
      <label><input type="checkbox" data-act="touchpad-tap" ${sys.touchpadTapClick!==false?'checked':''}> Tocar na superfície clica</label>
      <div class="tp-prof"><b>Perfis:</b> <select data-act="touchpad-profile" aria-label="Perfis salvos"><option value="">Escolher perfil…</option>${Object.keys(CQ.touchpad?.profiles()||{}).map(n=>`<option value="${E(n)}">${E(n)}</option>`).join('')}</select><input type="text" id="tp-prof-name" maxlength="24" placeholder="Nome do perfil" aria-label="Nome do perfil"><button type="button" class="chrome-button tiny" data-act="touchpad-profile-save">Salvar perfil</button><button type="button" class="chrome-button tiny" data-act="touchpad-profile-del">Excluir</button></div>
      <h2>Toque nos minijogos</h2><label><input type="checkbox" data-act="touch-buttons" ${sys.touchButtons?'checked':''}> Mostrar botões de direção na tela (Cobrinha, Pong, Desvio CQ). Os jogos funcionam por gestos sem eles.</label>
      </div><h2>Personalizar ponteiros</h2><div class="mouse-role-grid">${mouse.roles.map(([id,name]) => {
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
  } else if(tab === 'atualizacoes') {
    body = `<h2>ClaQui Update</h2><p>Consulte a versão publicada online e instale as novidades quando desejar. Versão em uso: <b>${E(CQ.VERSION)}</b> (compilação ${E(CQ.BUILD)}).</p><div class="actions"><button type="button" class="chrome-button primary" data-act="open-app" data-app="updates">Abrir ClaQui Update</button></div>`;
  } else {
    body = `<h2>Sistema</h2><p>${E(CQ.clock.osName())} • versão ${E(CQ.VERSION)} (compilação ${E(CQ.BUILD)}) • dados guardados apenas neste navegador (${CQ.vfs.mode === 'idb' ? 'IndexedDB' : 'memória'} para arquivos virtuais).</p>
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
    w.setTitle('Configurações'); w.setStatus('Alterações são salvas automaticamente.', CQ.clock.osName() + ' • ' + CQ.VERSION);
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
  else if (a === 'touchpad-profile-save') { const n = w.body.querySelector('#tp-prof-name')?.value; if (CQ.touchpad.saveProfile(n)) { CQ.notify('Perfil salvo: ' + n.trim()); re(); } else CQ.notify('Digite um nome para o perfil.'); }
  else if (a === 'touchpad-profile-del') { const n = w.body.querySelector('[data-act="touchpad-profile"]')?.value; if (n && CQ.touchpad.deleteProfile(n)) { CQ.notify('Perfil excluído.'); re(); } else CQ.notify('Escolha um perfil na lista para excluir.'); }
}
async function settingsChange(e, w) {
  const t = e.target, a = t.dataset.act; if (!a && t.id !== 'wp-file') return;
  if (t.id === 'wp-file') return importWallpaper(t.files?.[0], w);
  if (a === 'wp-fit') { wpDraft.fit = t.value; WM.refresh('settings'); }
  else if (a === 'mouse-scheme') { CQ.sys.set({mouseScheme:t.value, mouseRoles:{}, cursor:'padrao'}); CQ.mouse.apply(); WM.refresh('settings'); }
  else if (a === 'mouse-size') { CQ.sys.set({mouseSize:Number(t.value)}); CQ.mouse.apply(); WM.refresh('settings'); }
  else if (a === 'mouse-role') { const roles = {...CQ.sys.get('mouseRoles')}; if (t.value) roles[t.dataset.role] = t.value; else delete roles[t.dataset.role]; CQ.sys.set({mouseRoles:roles}); CQ.mouse.apply(); WM.refresh('settings'); }
  else if (a === 'mouse-trail') { CQ.sys.set({mouseTrail:t.checked}); CQ.mouse.apply(); }
  else if (a === 'touchpad-enable') CQ.sys.set({touchpadEnabled:t.checked});
  else if (a === 'touchpad-position') CQ.sys.set({touchpadPosition:t.value});
  else if (a === 'touchpad-shape') CQ.sys.set({touchpadShape:t.value,touchpadW:0,touchpadH:0});
  else if (a === 'touchpad-w') CQ.sys.set({touchpadW:Number(t.value)});
  else if (a === 'touchpad-h') CQ.sys.set({touchpadH:Number(t.value)});
  else if (a === 'touchpad-buttons') CQ.sys.set({touchpadButtons:t.value});
  else if (a === 'touchpad-accel') CQ.sys.set({touchpadAccel:Number(t.value)});
  else if (a === 'touchpad-tap') CQ.sys.set({touchpadTapClick:t.checked});
  else if (a === 'touch-buttons') CQ.sys.set({touchButtons:t.checked});
  else if (a === 'touchpad-profile') { if (t.value && CQ.touchpad.loadProfile(t.value)) { CQ.notify('Perfil aplicado: ' + t.value); WM.refresh('settings'); } }
  else if (a === 'touchpad-opacity') CQ.sys.set({touchpadOpacity:Number(t.value)});
  else if (a === 'touchpad-sensitivity') CQ.sys.set({touchpadSensitivity:Number(t.value)});
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
A.about = {title: 'Sobre', icon: 'assets/icons/sobre.svg', bodyClass: 'page', maxDefault: false, w: 640, h: 600,
  render(w) {
    const name = CQ.clock.osName();
    w.setTitle('Sobre o ' + name); w.setStatus(name + ' • ' + CQ.VERSION, 'Compilação ' + CQ.BUILD);
    w.body.innerHTML = `<div class="setup-simple"><div class="about-head"><img src="assets/img/claquim.svg" alt="Claquim, assistente do ClaQui OS" width="96" height="96"><div><h1>ClassiQuiz</h1><p class="slogan">UM CLÁSSICO QUE NUNCA EXISTIU</p></div></div>
      <p><b>ClassiQuiz</b> é um quiz de perguntas, pegadinhas, minigames, missões e histórias encadeadas. Ele roda dentro do <b>ClaQui OS</b> (Classic + Quiz), um sistema operacional <i>fictício</i> que existe só no seu navegador. O nome visível do sistema acompanha o ano do relógio: agora ele é <b data-osname>${E(name)}</b>.</p>
      <table class="stat-table about-ver"><tbody><tr><th scope="row">Versão</th><td><b>${E(CQ.VERSION)}</b></td></tr><tr><th scope="row">Compilação</th><td>${E(CQ.BUILD)}</td></tr><tr><th scope="row">Publicada em</th><td>${E((CQ.RELEASED_AT || '').split('-').reverse().join('/') || '—')} <span class="muted">(data real, independente do relógio simulado)</span></td></tr></tbody></table>
      <p>Código sob licença MIT. Instalado como PWA, o jogo inteiro (apps, perguntas, Trilhas, minijogos e o ClaQui Browser) funciona <b>sem internet</b>. A internet real só é usada pelo ClaQui Update.</p>
      <p class="muted">Todos os arquivos do Explorador, a pasta System32, a rede, o navegador, o relógio e as operações de desligar e reiniciar são <b>simulações virtuais</b>: nada do seu computador real é lido, alterado ou apagado.</p>
      <p class="muted">Personagens e artes originais: Claquim (assistente do sistema) e Milhito (apresentador do Show do Milhozão). “Show do Milhozão” é uma paródia original e não tem relação com programas reais.</p>
      <div class="actions"><button type="button" class="chrome-button primary" data-act="open-app" data-app="tutorial">Ajuda e Tutorial</button><button type="button" class="chrome-button" data-act="open-app" data-app="updates">ClaQui Update</button><button type="button" class="chrome-button" data-act="open-app" data-app="datetime">Data e Hora</button></div></div>`;
  }};
// ClaQui Update: agora em assets/js/update.js (consulta real, Service Worker, progresso verdadeiro).

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
  ['browser', 'ClaQui Browser'], ['netconfig', 'Configurações de Rede'], ['datetime', 'Data e Hora'], ['tutorial', 'Ajuda e Tutorial'],
  ['favorites', 'Favoritas'], ['updates', 'ClaQui Update'],
  ['achievements', 'Conquistas'], ['stats', 'Estatísticas'], ['rewards', 'Recompensas'],
  ['explorer', 'Explorador de Arquivos'], ['notepad', 'Bloco de Notas'], ['paint', 'Paint'],
  ['calc', 'Calculadora'], ['mines', 'Campo Minado'], ['ttt', 'Jogo da Velha'],
  ['snake', 'Cobrinha'], ['desvio', 'Desvio CQ'], ['solitaire', 'Paciência'], ['pong', 'Pong'],
  ['calendar', 'Calendário'], ['clock', 'Relógio'], ['viewer', 'Visualizador'],
  ['player', 'Reprodutor'], ['trash', 'Lixeira']
], 'ClaQui OS › Mais opções');
})();
