/* ClaQui OS — Explorador de Arquivos virtual, Lixeira e Visualizador. Tudo opera no sistema de arquivos VIRTUAL (nunca no disco real). Licença: MIT. */
(() => {
'use strict';
const CQ = window.CQ, E = CQ.E, OS = CQ.os, WM = OS.wm, V = CQ.vfs, A = CQ.apps;
const fmtSize = n => n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1).replace('.', ',') + ' KB' : (n / 1048576).toFixed(1).replace('.', ',') + ' MB';
const iconOf = n => V.key(n.path) === V.key(V.ROOT) ? 'assets/icons/f-disco.svg' : n.type === 'dir' ? (n.system ? 'assets/icons/f-pasta-sistema.svg' : 'assets/icons/f-pasta.svg') : n.kind === 'text' ? 'assets/icons/f-txt.svg' : n.kind === 'image' ? 'assets/icons/f-img.svg' : n.kind === 'shortcut' ? 'assets/icons/f-atalho.svg' : 'assets/icons/f-desconhecido.svg';
const typeLabel = n => V.key(n.path) === V.key(V.ROOT) ? 'Unidade de disco virtual' : n.typeLabel || (n.type === 'dir' ? 'Pasta de arquivos' : n.kind === 'text' ? 'Documento de texto' : n.kind === 'image' ? 'Imagem' : n.kind === 'shortcut' ? 'Atalho' : 'Arquivo ' + (n.ext ? n.ext.toUpperCase() : 'desconhecido'));
const fmtDate = t => CQ.fmtDate(t);
const sysWarnPath = V.key('C:\\ClaQui\\System32');

// =============== Explorador ===============
function newState() { return {path: V.HOME, back: [], fwd: [], sel: null, hidden: false, view: 'list', query: '', menu: null, lastTap: 0}; }
function items(st) { return st.query ? V.search(st.query, V.ROOT, st.hidden) : V.list(st.path, {hidden: st.hidden}); }
function treeHtml(st, path = V.HOME, depth = 0) {
  const dirs = V.list(path, {hidden: st.hidden}).filter(n => n.type === 'dir'); const cur = V.key(st.path);
  const me = V.get(path); const label = path === V.ROOT ? 'Disco Local CQ:' : path === V.HOME ? 'Meu Dispositivo' : me?.name;
  const row = `<button type="button" class="tree-row ${V.key(path) === cur ? 'on' : ''}" style="padding-left:${6 + depth * 14}px" data-act="ex-go" data-path="${E(path)}"><img src="${path === V.ROOT ? 'assets/icons/f-disco.svg' : V.key(path) === cur ? 'assets/icons/f-pasta-aberta.svg' : 'assets/icons/f-pasta.svg'}" alt=""><span>${E(label)}</span></button>`;
  const open = V.key(st.path) === V.key(path) || V.key(st.path).startsWith(V.key(path).replace(/\\$/, '') + '\\') || path === V.ROOT || path === V.HOME;
  return row + (open ? dirs.map(d => treeHtml(st, d.path, depth + 1)).join('') : '');
}
function menuPop(st) {
  const m = st.menu; if (!m) return '';
  const sel = st.sel && V.get(st.sel);
  const L = {
    arquivo: [['ex-newfile', 'Novo arquivo de texto'], ['ex-newdir', 'Nova pasta'], ['ex-open', 'Abrir', !sel], ['ex-props', 'Propriedades', !sel], ['sep'], ['win-close-ex', 'Fechar']],
    editar: [['ex-rename', 'Renomear', !sel], ['ex-delete', 'Excluir', !sel], ['ex-copypath', 'Copiar caminho']],
    exibir: [['ex-hidden', (st.hidden ? '✓ ' : '') + 'Mostrar arquivos ocultos'], ['ex-viewlist', (st.view === 'list' ? '✓ ' : '') + 'Lista'], ['ex-viewgrid', (st.view === 'grid' ? '✓ ' : '') + 'Grade'], ['ex-refresh', 'Atualizar']],
    ajuda: [['ex-help', 'Sobre o Explorador']]
  }[m] || [];
  return `<div class="menu-pop" role="menu">${L.map(([id, t, dis]) => id === 'sep' ? '<hr>' : `<button type="button" role="menuitem" data-act="${id}" ${dis ? 'disabled' : ''}>${E(t)}</button>`).join('')}</div>`;
}
function renderEx(w) {
  const st = w.data.st ||= newState(); const list = items(st); const n = V.get(st.path);
  const crumbs = st.query ? `Busca: “${E(st.query)}”` :
    [`<button type="button" class="crumb-b" data-act="ex-go" data-path="${V.HOME}">Meu Dispositivo</button>`,
    ...(st.path === V.HOME ? [] : [`<button type="button" class="crumb-b" data-act="ex-go" data-path="${E(V.ROOT)}">Disco Local CQ:</button>`,
      ...V.norm(st.path).slice(3).split('\\').filter(Boolean).map((part, i, all) => `<button type="button" class="crumb-b" data-act="ex-go" data-path="${E('C:\\' + all.slice(0, i + 1).join('\\'))}">${E(part)}</button>`)] )
    ].join('<span class="sep">›</span>');
  const mb = ['arquivo', 'editar', 'exibir', 'ajuda'].map(k => `<span class="mb-wrap"><button type="button" class="mb ${st.menu === k ? 'on' : ''}" data-act="ex-menu" data-menu="${k}" aria-haspopup="menu" aria-expanded="${st.menu === k}">${k[0].toUpperCase() + k.slice(1)}</button>${st.menu === k ? menuPop(st) : ''}</span>`).join('');
  const rowsList = list.map(x => `<button type="button" class="ex-item ${st.sel && V.key(st.sel) === V.key(x.path) ? 'on' : ''} ${x.hidden ? 'dim' : ''}" data-ctxitem="${E(x.path)}" data-act="ex-select" data-path="${E(x.path)}" aria-label="${E(x.name)}, ${typeLabel(x)}">${st.view === 'list' ? `<span class="nm"><img src="${iconOf(x)}" alt="">${E(x.name)}</span>` : `<img src="${iconOf(x)}" alt=""><span class="nm">${E(x.name)}</span>`}${st.view === 'list' ? `<span class="tp">${E(typeLabel(x))}</span><span class="sz">${x.type === 'file' ? fmtSize(x.size || 0) : ''}</span><span class="dt">${fmtDate(x.modified)}</span>` : ''}</button>`).join('');
  const total = list.reduce((s, x) => s + (x.type === 'file' ? x.size || 0 : 0), 0);
  w.body.innerHTML = `<div class="ex" data-ctxapp-area="1"><div class="menubar" role="menubar">${mb}</div>
    <div class="ex-tools"><button type="button" class="chrome-button tiny" data-act="ex-back" ${st.back.length ? '' : 'disabled'} aria-label="Voltar">←</button><button type="button" class="chrome-button tiny" data-act="ex-fwd" ${st.fwd.length ? '' : 'disabled'} aria-label="Avançar">→</button><button type="button" class="chrome-button tiny" data-act="ex-up" ${st.path !== V.HOME ? '' : 'disabled'} aria-label="Subir um nível">↑</button><nav class="ex-path" aria-label="Caminho">${crumbs}</nav><input class="text-input ex-search" id="ex-q" type="search" placeholder="Buscar" value="${E(st.query)}" aria-label="Buscar arquivos"><button type="button" class="chrome-button tiny" data-act="ex-open">Abrir</button></div>
    <div class="ex-body"><aside class="ex-tree" aria-label="Pastas">${treeHtml(st)}</aside><div class="ex-list ${st.view}" id="ex-list" role="listbox" aria-label="Arquivos">${st.view === 'list' ? '<div class="ex-head"><span>Nome</span><span>Tipo</span><span>Tamanho</span><span>Modificado</span></div>' : ''}${rowsList || '<div class="empty-state">Esta pasta está vazia.</div>'}</div></div></div>`;
  w.setTitle('Explorador de Arquivos'); w.setStatus(`${list.length} item(ns)${st.sel && V.get(st.sel) ? ' • selecionado: ' + V.get(st.sel).name : ''}`, `${fmtSize(total)} • ${st.path === V.HOME ? 'Meu Dispositivo' : st.path === V.ROOT ? 'Disco Local CQ:' : (n ? E(V.norm(st.path)) : '')}`.replace(/&amp;/g, '&'));
}
function go(w, path, push = true) {
  const st = w.data.st; const n = V.get(path); if (!n || n.type !== 'dir') return; if (push && V.key(path) !== V.key(st.path)) { st.back.push(st.path); st.fwd = []; }
  st.path = V.norm(path); st.sel = null; st.query = ''; st.menu = null; CQ.bus.emit('explorer:open', {path: st.path, dir: true}); WM.refresh('explorer');
}
async function openNode(w, path) {
  const n = V.get(path); if (!n) return;
  if (n.type === 'dir') return go(w, n.path);
  CQ.bus.emit('explorer:open', {path: n.path, dir: false});
  if (n.kind === 'text') await OS.open('notepad', {path: n.path});
  else if (n.kind === 'image') await OS.open('viewer', {path: n.path});
  else if (n.kind === 'shortcut') { const t = V.readText(n.path)?.trim(); const dest = V.get(t || ''); if (dest) { if (dest.type === 'dir') go(w, dest.path); else openNode(w, dest.path); } else CQ.ui.alert('Atalho quebrado', '<p>O destino deste atalho não existe mais.</p>'); }
  else CQ.ui.alert('Não é possível abrir', `<p>O ClaQui OS não sabe abrir arquivos do tipo <b>${E(n.ext ? '.' + n.ext : 'desconhecido')}</b>.</p>`);
}
function propsHtml(n) {
  const rows = [['Nome', n.name], ['Tipo', typeLabel(n)], ['Local', V.parentOf(n.path) || 'C:\\'], ['Caminho', n.path], ['Tamanho', n.type === 'dir' ? fmtSize(V.sizeOf(n.path)) + ' (' + V.countOf(n.path) + ' itens)' : fmtSize(n.size || 0)], ['Criado em', fmtDate(n.created)], ['Modificado em', fmtDate(n.modified)], ['Atributos', [n.hidden ? 'Oculto' : '', n.readonly ? 'Somente leitura' : '', n.system ? 'Sistema' : ''].filter(Boolean).join(', ') || 'Nenhum'], ...(n.props ? Object.entries(n.props) : [])];
  return `<table class="stat-table props"><tbody>${rows.map(([a, b]) => `<tr><th scope="row">${E(a)}</th><td class="selectable">${E(b)}</td></tr>`).join('')}</tbody></table>`;
}
async function exAction(w, a, b) {
  const st = w.data.st, refresh = () => WM.refresh('explorer'), sel = st.sel ? V.get(st.sel) : null;
  switch (a) {
    case 'ex-menu': st.menu = st.menu === b.dataset.menu ? null : b.dataset.menu; return refresh();
    case 'ex-go': return go(w, b.dataset.path);
    case 'ex-back': { const p = st.back.pop(); if (p) { st.fwd.push(st.path); go(w, p, false); } return; }
    case 'ex-fwd': { const p = st.fwd.pop(); if (p) { st.back.push(st.path); go(w, p, false); } return; }
    case 'ex-up': { const p = st.path === V.ROOT ? V.HOME : V.parentOf(st.path); if (p) go(w, p); return; }
    case 'ex-select': { const now = Date.now(), again = st.sel && V.key(st.sel) === V.key(b.dataset.path) && now - st.lastTap < 700; st.sel = b.dataset.path; st.lastTap = now; st.menu = null; if (again) return openNode(w, st.sel); refresh(); setTimeout(() => w.body.querySelector(`[data-path="${CSS.escape(st.sel)}"]`)?.focus({preventScroll: true}), 0); return; }
    case 'ex-open': if (sel) openNode(w, sel.path); else CQ.notify('Selecione um item.'); st.menu = null; return refresh();
    case 'ex-props': if (sel) CQ.ui.alert('Propriedades', propsHtml(sel)); st.menu = null; return refresh();
    case 'ex-hidden': st.hidden = !st.hidden; st.menu = null; return refresh();
    case 'ex-viewlist': st.view = 'list'; st.menu = null; return refresh();
    case 'ex-viewgrid': st.view = 'grid'; st.menu = null; return refresh();
    case 'ex-refresh': st.menu = null; return refresh();
    case 'ex-help': st.menu = null; refresh(); return CQ.ui.alert('Explorador de Arquivos', '<p>Navega pelo sistema de arquivos <b>virtual</b> do ClaQui OS. Nada aqui existe no seu computador real.</p><p>Clique duas vezes (ou use Abrir) para abrir. Botão direito mostra mais ações.</p>');
    case 'win-close-ex': WM.requestClose('explorer'); return;
    case 'ex-copypath': st.menu = null; refresh(); return CQ.game ? CQ.game.copy(sel ? sel.path : st.path) : undefined;
    case 'ex-newfile': case 'ex-newdir': {
      st.menu = null; refresh(); const isDir = a === 'ex-newdir';
      const name = await CQ.ui.prompt(isDir ? 'Nova pasta' : 'Novo arquivo de texto', 'Nome:', isDir ? 'Nova pasta' : 'Novo documento.txt'); if (!name) return;
      try { const p = V.uniquePath(st.path, isDir ? name.trim() : (/\.txt$/i.test(name) ? name.trim() : name.trim() + '.txt')); if (isDir) V.mkdir(p); else V.writeText(p, ''); st.sel = p; } catch (e) { CQ.ui.alert('Não foi possível criar', `<p>${E(e.message)}</p>`); } return refresh();
    }
    case 'ex-rename': {
      st.menu = null; if (!sel) return refresh(); const name = await CQ.ui.prompt('Renomear', 'Novo nome:', sel.name); if (!name || name === sel.name) return refresh();
      try { st.sel = V.rename(sel.path, name).path; } catch (e) { CQ.ui.alert('Não foi possível renomear', `<p>${E(e.message)}</p>`); } return refresh();
    }
    case 'ex-delete': {
      st.menu = null; if (!sel) return refresh(); const sys32 = V.key(sel.path) === sysWarnPath;
      const isEffect = sys32 || ['Drivers','Fontes','Temas','Media','Inicialização','Temp','Programas','Registros','Config'].some(folder => V.key(sel.path) === V.key('C:\\ClaQui\\' + folder));
      const ok = await CQ.ui.confirm(isEffect ? 'Excluir pasta do sistema?' : 'Excluir', isEffect
        ? `<p>Deseja excluir <b>${E(sel.name)}</b> do sistema virtual?</p><p>Esta é uma <b>exclusão fictícia</b>, realizada somente dentro do ClaQui OS. Nenhum arquivo real será alterado.</p>`
        : `<p>Mover <b>${E(sel.name)}</b> para a Lixeira?</p>`, isEffect ? 'Excluir de mentira' : 'Excluir', 'Cancelar', true);
      if (!ok) return refresh();
      try { const r = V.remove(sel.path); st.sel = null; refresh(); if (r.system32) { OS.bsod().then(() => { CQ.vfs.list('C:\\'); WM.refreshAll(); }); } else if (r.systemEffect) CQ.systemEffects?.apply(r.systemEffect); } catch (e) { CQ.ui.alert('Não foi possível excluir', `<p>${E(e.message)}</p>`); refresh(); } return;
    }
  }
}
A.explorer = {title: 'Explorador de Arquivos', icon: 'assets/icons/explorador.svg', bodyClass: 'flush', maxDefault: true, persistent: false,
  render(w, p) {
    if (!w._bound) { w._bound = true;
      w.body.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b) exAction(w, b.dataset.act, b); else if (w.data.st.menu) { w.data.st.menu = null; WM.refresh('explorer'); } });
      w.body.addEventListener('dblclick', e => { const b = e.target.closest('.ex-item'); if (b) openNode(w, b.dataset.path); });
      w.body.addEventListener('input', e => { if (e.target.id === 'ex-q') { const st = w.data.st; st.query = e.target.value; const pos = e.target.selectionStart; WM.refresh('explorer'); const i = w.body.querySelector('#ex-q'); i?.focus(); i?.setSelectionRange(pos, pos); } });
      w.body.addEventListener('keydown', e => { const st = w.data.st; if (e.target.id === 'ex-q') return; if (e.key === 'Enter' && st.sel) { e.preventDefault(); openNode(w, st.sel); } else if (e.key === 'Delete' && st.sel) exAction(w, 'ex-delete'); else if (e.key === 'F2' && st.sel) exAction(w, 'ex-rename'); else if (e.key === 'Backspace' && !st.query) { e.preventDefault(); exAction(w, 'ex-up'); } else if (e.key === 'Escape' && st.menu) { st.menu = null; WM.refresh('explorer'); } });
      CQ.bus.on('vfs:change', () => { if (WM.isOpen('explorer') && !document.activeElement?.matches?.('#ex-q')) WM.refresh('explorer'); });
    }
    if (p?.path && !w._startApplied) { w._startApplied = true; const n = V.get(p.path); if (n) { w.data.st ||= newState(); w.data.st.path = n.type === 'dir' ? n.path : V.parentOf(n.path); } }
    renderEx(w);
  },
  onParams(w, p) { if (p?.path) { const n = V.get(p.path); if (n) { w.data.st ||= newState(); go(w, n.type === 'dir' ? n.path : V.parentOf(n.path)); } } },
  contextMenu(target, host) {
    const it = target.closest('[data-ctxitem]'); const w = WM.get('explorer'); if (!w) return null; const st = w.data.st;
    const run = (a) => () => exAction(w, a);
    if (it) { st.sel = it.dataset.ctxitem; WM.refresh('explorer'); return [{label: 'Abrir', run: run('ex-open')}, {label: 'Renomear', run: run('ex-rename')}, {label: 'Excluir', run: run('ex-delete')}, {sep: true}, {label: 'Propriedades', run: run('ex-props')}, {label: 'Copiar caminho', run: run('ex-copypath')}]; }
    return [{label: 'Novo arquivo de texto', run: run('ex-newfile')}, {label: 'Nova pasta', run: run('ex-newdir')}, {sep: true}, {label: st.hidden ? 'Ocultar arquivos ocultos' : 'Mostrar arquivos ocultos', run: run('ex-hidden')}, {label: 'Atualizar', run: run('ex-refresh')}];
  }
};

// =============== Lixeira ===============
A.trash = {title: 'Lixeira', icon: 'assets/icons/lixeira.svg', bodyClass: 'page', maxDefault: false, w: 760, h: 520, refreshOnOpen: true,
  render(w) {
    if (!w._bound) { w._bound = true;
      w.body.addEventListener('click', async e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
        try {
          if (a === 'tr-restore') { const p = V.restore(b.dataset.id); CQ.notify('Restaurado em ' + p); }
          else if (a === 'tr-purge') { if (await CQ.ui.confirm('Excluir definitivamente', '<p>Excluir este item para sempre (do sistema virtual)? Não há como desfazer.</p>', 'Excluir', 'Cancelar', true)) V.purge(b.dataset.id); }
          else if (a === 'tr-empty') { if (await CQ.ui.confirm('Esvaziar a Lixeira', '<p>Excluir <b>todos</b> os itens da Lixeira (do sistema virtual)? Itens de casos do jogo são mantidos.</p>', 'Esvaziar', 'Cancelar', true)) V.emptyTrash(); }
        } catch (err) { CQ.ui.alert('Lixeira', `<p>${E(err.message)}</p>`); }
        WM.refresh('trash'); });
    }
    const list = V.trashList(); w.setTitle('Lixeira'); w.setStatus(`${list.length} item(ns)`, 'Itens virtuais descartados');
    w.body.innerHTML = `<div class="setup-simple wide"><h1>Lixeira</h1><div class="actions"><button type="button" class="chrome-button danger" data-act="tr-empty" ${list.some(x => !x.puzzle) ? '' : 'disabled'}>Esvaziar Lixeira</button></div>${list.length ? `<div class="library-list">${list.map(x => `<div class="lib-item"><div><img class="inl-ico" src="${x.type === 'dir' ? 'assets/icons/f-pasta.svg' : x.kind === 'image' ? 'assets/icons/f-img.svg' : 'assets/icons/f-txt.svg'}" alt=""> <strong>${E(x.name)}</strong><div class="lib-meta">Origem: ${E(x.originalPath)}<br>Excluído em ${fmtDate(x.deletedAt)} • ${fmtSize(x.size || 0)}</div></div><div class="lib-actions"><button type="button" class="chrome-button tiny" data-act="tr-restore" data-id="${E(x.id)}">Restaurar</button>${x.puzzle ? '' : `<button type="button" class="chrome-button tiny danger" data-act="tr-purge" data-id="${E(x.id)}">Excluir</button>`}</div></div>`).join('')}</div>` : '<div class="empty-state">A Lixeira está vazia.</div>'}</div>`;
    w.setIcon(list.length ? 'assets/icons/lixeira-cheia.svg' : 'assets/icons/lixeira.svg');
  }};
CQ.bus.on('vfs:change', () => { if (WM.isOpen('trash')) WM.refresh('trash'); });

// =============== Visualizador ===============
const urls = new Map();
async function imgUrl(path) { const n = V.get(path); if (!n) return null; if (n.src) return n.src; if (urls.has(n.path)) return urls.get(n.path); const u = await V.imageUrl(n.path); if (u) urls.set(n.path, u); return u; }
async function drawViewer(w) {
  const imgs = V.allFiles().filter(n => n.kind === 'image'); const path = w.data.path; const n = path && V.get(path);
  w.setTitle(n ? 'Visualizador - ' + n.name : 'Visualizador'); w.setStatus(n ? `${n.name} • ${fmtSize(n.size || 0)}` : `${imgs.length} imagem(ns) disponíveis`, n ? fmtDate(n.modified) : '');
  const url = n ? await imgUrl(n.path) : null;
  w.body.innerHTML = n && url ? `<div class="viewer"><div class="viewer-bar"><button type="button" class="chrome-button tiny" data-act="vw-back">← Galeria</button><span>${E(n.name)}</span></div><div class="viewer-stage"><img src="${E(url)}" alt="${E(n.name)}"></div></div>`
    : `<div class="setup-simple wide"><h1>Visualizador</h1><p>Imagens do ClaQui OS e as que você salvou no Paint.</p><div class="gallery">${imgs.map(x => `<button type="button" class="g-item" data-act="vw-open" data-path="${E(x.path)}"><img src="${E(x.src || 'assets/icons/f-img.svg')}" alt=""><span>${E(x.name)}</span></button>`).join('') || '<div class="empty-state">Nenhuma imagem.</div>'}</div></div>`;
  if (n && url) CQ.bus.emit('viewer:open', {path: n.path});
}
A.viewer = {title: 'Visualizador', icon: 'assets/icons/visualizador.svg', bodyClass: 'flush', maxDefault: false, w: 760, h: 560, persistent: true,
  render(w, p) {
    if (p?.path) w.data.path = p.path;
    if (!w._bound) { w._bound = true; w.body.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; if (b.dataset.act === 'vw-open') { w.data.path = b.dataset.path; drawViewer(w); } else if (b.dataset.act === 'vw-back') { w.data.path = null; drawViewer(w); } }); }
    drawViewer(w);
  },
  onParams(w, p) { if (p?.path) { w.data.path = p.path; drawViewer(w); } }
};
})();
