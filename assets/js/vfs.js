/* ClaQui OS — sistema de arquivos VIRTUAL. Nunca toca no disco real do computador.
   Persistência em IndexedDB (nós + blobs), com fallback em memória/localStorage. Namespace de enigmas separado e somente leitura. */
(() => {
'use strict';
const CQ = window.CQ;
const ROOT = 'C:\\';
const SEED_VERSION = 4;
const HOME = '@meu-dispositivo';
const norm = p => {
  if (String(p).toLowerCase() === HOME) return HOME;
  let s = String(p || '').replace(/\//g, '\\').replace(/\\+/g, '\\').trim();
  if (!/^[A-Za-z]:/.test(s)) s = 'C:\\' + s.replace(/^\\/, '');
  s = s.replace(/^[a-z]:/, c => c.toUpperCase());
  // A rota de versões anteriores é aceita, mas a nova unidade é sempre C:\\.
  s = s.replace(/^C:\\Meu Dispositivo(?=\\|$)/i, 'C:');
  s = s.replace(/^C:\\Windows(?=\\|$)/i, 'C:\\ClaQui');
  // V2.0.1 guardava documentos e missões dentro de C:\\ClaQui.
  s = s.replace(/^C:\\ClaQui\\(Documentos|Imagens|Anotações|Arquivos de jogo|Sistema)(?=\\|$)/i, (_, name) => 'C:\\' + name);
  if (s.length > 3) s = s.replace(/\\$/, ''); else s = 'C:\\';
  return s;
};
const key = p => norm(p).toLowerCase();
const parentOf = p => { p = norm(p); if (p === ROOT || p === HOME) return null; const i = p.lastIndexOf('\\'); return i <= 2 ? ROOT : p.slice(0, i); };
const baseOf = p => { p = norm(p); if (p === HOME) return 'Meu Dispositivo'; if (p === ROOT) return 'Disco Local CQ:'; return p.slice(p.lastIndexOf('\\') + 1); };
const joinP = (a, b) => norm(a).replace(/\\$/, '') + '\\' + b;
const extOf = n => { const i = n.lastIndexOf('.'); return i > 0 ? n.slice(i + 1).toLowerCase() : ''; };
const kindOfName = n => { const e = extOf(n); return ['txt','md','ini','log','cqs'].includes(e) ? 'text' : ['png','jpg','jpeg','gif','webp','svg'].includes(e) ? 'image' : e === 'lnk' ? 'shortcut' : 'binary'; };
const BAD = /[<>:"/\\|?*\u0000-\u001f]/;

const nodes = new Map();      // key -> node
let trash = [];               // [{id, originalPath, deletedAt, nodes:[...]}]
const puzzle = new Map();     // caseId -> {nodes:Map, trash:[], root}
let db = null, mode = 'memory', ready = false, queue = Promise.resolve();

function idbOpen() {
  return new Promise((res, rej) => {
    if (!window.indexedDB) return rej(new Error('sem IndexedDB'));
    const r = indexedDB.open('classiquiz-os', 1);
    r.onupgradeneeded = () => { const d = r.result; ['nodes', 'trash', 'blobs', 'kv'].forEach(s => { if (!d.objectStoreNames.contains(s)) d.createObjectStore(s); }); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); r.onblocked = () => rej(new Error('bloqueado'));
  });
}
function idb(store, op, k, v) {
  if (!db) return Promise.resolve(null);
  return new Promise(res => {
    try {
      const t = db.transaction(store, op === 'get' || op === 'all' || op === 'keys' ? 'readonly' : 'readwrite'); const s = t.objectStore(store);
      const r = op === 'put' ? s.put(v, k) : op === 'delete' ? s.delete(k) : op === 'get' ? s.get(k) : op === 'all' ? s.getAll() : op === 'keys' ? s.getAllKeys() : op === 'clear' ? s.clear() : null;
      t.oncomplete = () => res(r && 'result' in r ? r.result : null); t.onerror = () => res(null); t.onabort = () => res(null);
    } catch { res(null); }
  });
}
const enqueue = fn => { queue = queue.then(fn).catch(() => {}); return queue; };
function saveNode(n) { const c = {...n}; delete c._text; if (db) enqueue(() => idb('nodes', 'put', key(n.path), c)); else saveFallback(); }
function dropNode(n) { if (db) enqueue(() => idb('nodes', 'delete', key(n.path))); else saveFallback(); }
function saveTrash() { if (db) enqueue(() => idb('trash', 'put', 'all', trash)); else saveFallback(); }
let fbTimer = 0;
function saveFallback() {   // sem IndexedDB: guarda só metadados e textos pequenos
  clearTimeout(fbTimer); fbTimer = setTimeout(() => {
    const out = {v: SEED_VERSION, nodes: [...nodes.values()].map(n => (n.blobKey ? {...n, blobKey: null, kind: 'binary', size: 0} : n)), trash: trash.map(t => ({...t, nodes: t.nodes.filter(n => !n.blobKey)}))};
    CQ.store.write('classiquiz.v1.vfs-fallback', out);
  }, 300);
}
const mkNode = (path, type, extra = {}) => {
  const now = Date.now(); path = norm(path);
  return Object.assign({path, name: baseOf(path), type, ext: type === 'file' ? extOf(baseOf(path)) : '', kind: type === 'dir' ? 'dir' : kindOfName(baseOf(path)), size: 0, created: now, modified: now, hidden: false, readonly: false, system: false}, extra);
};

function defaultTree() {
  const d = []; const D = (p, x) => d.push(mkNode(p, 'dir', x)); const F = (p, text, x) => d.push(mkNode(p, 'file', Object.assign({text, size: new Blob([text]).size}, x)));
  const t0 = new Date(2026, 10, 1, 9, 0).getTime();
  D('C:\\Documentos', {created: t0, modified: t0}); D('C:\\Imagens', {created: t0, modified: t0});
  D('C:\\Anotações', {created: t0, modified: t0}); D('C:\\Arquivos de jogo', {created: t0, modified: t0, system: true}); D('C:\\Arquivos de jogo\\Casos', {created: t0, modified: t0, system: true});
  D('C:\\Sistema', {created: t0, modified: t0, system: true});
  D('C:\\ClaQui', {created: t0, modified: t0, system: true}); D('C:\\ClaQui\\System32', {created: t0, modified: t0, system: true}); D('C:\\ClaQui\\System32\\drivers', {created: t0, modified: t0, system: true});
  F('C:\\Documentos\\Bem-vindo.txt', 'Bem-vindo ao ClaQui OS!\n\nEste sistema roda dentro do navegador. Os arquivos que você vê aqui são VIRTUAIS: ficam guardados só neste navegador e nunca tocam no disco do seu computador.\n\nUse o Bloco de Notas para criar documentos e o Paint para desenhar.', {created: t0, modified: t0});
  F('C:\\Documentos\\Receita de pipoca.txt', 'Pipoca de panela\n\n1. Uma colher de óleo na panela.\n2. Meia xícara de milho de pipoca.\n3. Tampa e fogo médio.\n4. Quando os estouros diminuírem, desligue.\n\nObservação: milho de pipoca é um tipo especial de milho. O milho comum não estoura.', {created: t0, modified: t0});
  const img = (n, src, size) => d.push(mkNode('C:\\Imagens\\' + n, 'file', {kind: 'image', src, size, readonly: true, created: t0, modified: t0}));
  img('claquim.svg', 'assets/img/claquim.svg', 1830); img('milhito.svg', 'assets/img/milhito.svg', 2410); img('logotipo.svg', 'assets/classiquiz-icon.svg', 2956);
  F('C:\\Arquivos de jogo\\LEIA-ME.txt', 'Esta pasta pertence ao jogo.\n\nA subpasta "Casos" recebe arquivos temporários de investigações. Eles ficam protegidos: dá para abrir e examinar, mas não para apagar ou alterar.', {created: t0, modified: t0, readonly: true, system: true});
  F('C:\\Sistema\\sobre.txt', 'ClaQui OS 2.0 — um sistema operacional fictício.\nClaQui = Classic + Quiz.\nTudo aqui é simulação dentro do navegador.', {created: t0, modified: t0, readonly: true, system: true});
  F('C:\\Sistema\\claqui.ini', '[sistema]\nnome=ClaQui OS\nversao=2.0\nmodo=simulado\n', {created: t0, modified: t0, hidden: true, readonly: true, system: true});
  d.push(...system32Nodes(), ...extraSystemNodes());
  return d;
}
function system32Nodes() {
  const t0 = new Date(2026, 10, 1, 9, 0).getTime(); const out = [];
  const D = (p) => out.push(mkNode(p, 'dir', {created: t0, modified: t0, system: true}));
  const F = (p, text, x) => out.push(mkNode(p, 'file', Object.assign({text, size: new Blob([text]).size, created: t0, modified: t0, system: true, kind: 'binary', readonly: true}, x)));
  D('C:\\ClaQui\\System32'); D('C:\\ClaQui\\System32\\drivers');
  F('C:\\ClaQui\\System32\\kernel.cqx', 'ARQUIVO FICTÍCIO DO SISTEMA'); F('C:\\ClaQui\\System32\\boot.cqi', 'ARQUIVO FICTÍCIO DO SISTEMA', {hidden: true});
  F('C:\\ClaQui\\System32\\drivers\\tela.cqd', 'ARQUIVO FICTÍCIO DO SISTEMA'); F('C:\\ClaQui\\System32\\LEIAME-SISTEMA.txt', 'Esta pasta pertence ao sistema virtual do ClaQui OS.\n\nOs arquivos exibidos aqui são fictícios. Se você excluir esta pasta, a exclusão será simulada apenas dentro do jogo.\n\nNenhum arquivo ou configuração do seu computador real será alterado.', {kind: 'text'});
  return out;
}

// Pastas internas com efeitos de exclusão temporários e pistas para missões.
const EFFECT_FOLDERS = ['Drivers', 'Fontes', 'Temas', 'Media', 'Inicialização', 'Temp', 'Programas', 'Registros', 'Config'];
function extraSystemNodes() {
  const out = [], t0 = new Date(2026, 10, 1, 9, 0).getTime();
  const D = (n) => out.push(mkNode('C:\\ClaQui\\' + n, 'dir', {system: true, created: t0, modified: t0}));
  const F = (n, text, x = {}) => out.push(mkNode('C:\\ClaQui\\' + n, 'file', {text, kind: 'text', size: new Blob([text]).size, system: true, readonly: true, created: t0, modified: t0, ...x}));
  EFFECT_FOLDERS.forEach(D);
  F('Drivers\\mouse.cqd', 'Dispositivo apontador virtual.\nModo de entrada: mouse e toque.');
  F('Fontes\\legibilidade.ini', '[fontes]\nprincipal=ClaQui Sans\nmodo=legivel\n');
  F('Temas\\aparencia.ini', '[aparencia]\nestilo=retro\nversao=2026\n');
  F('Media\\efeitos.ini', '[audio]\nefeitos=habilitados\nvolume=padrao\n');
  F('Inicialização\\boot.cfg', '[inicializacao]\nverificar=sim\nrecuperacao=automatica\n');
  F('Temp\\cache.tmp', 'Dados temporários fictícios do ClaQui OS.');
  F('Programas\\instalados.txt', 'Bloco de Notas\nPaint\nCalculadora\nExplorador de Arquivos\nJogo da Velha');
  F('Registros\\manutencao.log', 'LOG DE MANUTENÇÃO DO CLAQUI OS\nÚltima revisão: 15/11/2026\nCódigo da verificação: CQ-47\nStatus: concluído.');
  F('Registros\\sistema.log', 'ClaQui OS iniciou normalmente.\nTodos os arquivos apresentados são virtuais.');
  F('Config\\sistema.ini', '[sistema]\nnome=ClaQui OS\nunidade=CQ\nverificacao=CQ-47\n', {hidden: true});
  return out;
}
// Arquivo do sistema: atualiza o aviso padrão mesmo para instalações que já
// possuem o LEIAME-SISTEMA.txt salvo no IndexedDB (sem tocar em documentos do usuário).
function refreshSystemNotice() {
  const p = 'C:\\ClaQui\\System32\\LEIAME-SISTEMA.txt';
  const current = nodes.get(key(p));
  const desired = system32Nodes().find(n => key(n.path) === key(p));
  if (!current || !desired || !current.readonly || !current.system) return;
  
  if (!current.text || current.text === desired.text) return;
  // Only the read-only built-in notice changes; personal documents stay intact.
  current.text = desired.text;
  current.size = desired.size;
  saveNode(current);
  CQ.bus.emit('vfs:change', {path: p});
}

// Migra nomes persistidos sem recriar/descartar documentos nem imagens do usuário.
// blobKey é mantido (a chave antiga no IndexedDB continua válida).
function migrateNode(n) {
  if (!n || !n.path) return null;
  const oldKey = String(n.path).replace(/\//g, '\\').toLowerCase();
  const migrated = {...n, path: norm(n.path)};
  migrated.name = baseOf(migrated.path);
  return {node: migrated, oldKey, changed: oldKey !== key(migrated.path)};
}
function migrateTrash() {
  for (const t of trash) {
    t.originalPath = norm(t.originalPath);
    t.nodes = (t.nodes || []).map(n => migrateNode(n)?.node).filter(Boolean);
  }
  saveTrash();
}
async function init() {
  if (ready) return;
  try { db = await idbOpen(); mode = 'idb'; } catch { db = null; mode = 'memory'; }
  if (db) {
    const loaded = (await idb('nodes', 'all')) || [];
    trash = (await idb('trash', 'get', 'all')) || [];
    const ver = await idb('kv', 'get', 'seedVersion');
    // Nós já no formato novo têm precedência sobre cópias legadas.
    const migrated = loaded.map(migrateNode).filter(Boolean);
    for (const it of migrated.filter(it => !it.changed && it.node.path !== ROOT)) nodes.set(key(it.node.path), it.node);
    for (const it of migrated.filter(it => it.changed)) {
      if (it.node.path !== ROOT && !nodes.has(key(it.node.path))) { nodes.set(key(it.node.path), it.node); saveNode(it.node); }
      enqueue(() => idb('nodes', 'delete', it.oldKey));
    }
    if (ver !== SEED_VERSION) {
      migrateTrash();
      for (const n of defaultTree()) if (!nodes.has(key(n.path))) { nodes.set(key(n.path), n); saveNode(n); }
      await enqueue(() => idb('kv', 'put', 'seedVersion', SEED_VERSION));
    }
  } else {
    const fb = CQ.store.read('classiquiz.v1.vfs-fallback', null);
    if (fb && Array.isArray(fb.nodes)) {
      for (const raw of fb.nodes) { const m = migrateNode(raw); if (m && m.node.path !== ROOT) nodes.set(key(m.node.path), m.node); }
      trash = fb.trash || [];
    }
    migrateTrash();
    for (const n of defaultTree()) if (!nodes.has(key(n.path))) nodes.set(key(n.path), n);
    saveFallback();
  }
  ensureSystem(); refreshSystemNotice(); ready = true;
}
// A pasta fictícia System32 sempre pode ser restaurada.
function restoreSystemFolder(folder) {
  const prefix = key('C:\\ClaQui\\' + folder);
  let added = false;
  for (const n of extraSystemNodes()) if ((key(n.path) === prefix || key(n.path).startsWith(prefix + '\\')) && !nodes.has(key(n.path))) {
    nodes.set(key(n.path), n); saveNode(n); added = true;
  }
  if (added) CQ.bus.emit('vfs:change', {path: 'C:\\ClaQui\\' + folder});
  return added;
}
function ensureSystem() {
  let restored = false;
  for (const n of [...system32Nodes(), ...extraSystemNodes()]) if (!nodes.has(key(n.path))) { nodes.set(key(n.path), n); saveNode(n); restored = true; }
  trash = trash.filter(t => !key(t.originalPath).startsWith(key('C:\\ClaQui\\System32'))); saveTrash();
  if (restored) CQ.bus.emit('vfs:change', {path: 'C:\\ClaQui'});
  return restored;
}

function puzzleNode(path) { path = key(path); for (const c of puzzle.values()) { const n = c.nodes.get(path); if (n) return n; } return null; }
function get(path) {
  if (norm(path) === HOME) return mkNode(HOME, 'dir', {name: 'Meu Dispositivo', readonly: true, system: true});
  if (norm(path) === ROOT) return mkNode(ROOT, 'dir', {name: 'Disco Local CQ:', readonly: true, system: true});
  return nodes.get(key(path)) || puzzleNode(path) || null;
}
function list(path, opts = {}) {
  const base = norm(path), bk = key(base); if (base === HOME) return [get(ROOT)]; const out = [];
  for (const [k, n] of nodes) { if (k !== bk && parentOf(n.path) && key(parentOf(n.path)) === bk) out.push(n); }
  for (const c of puzzle.values()) for (const [k, n] of c.nodes) { if (n.puzzleRestorable === false) continue; if (parentOf(n.path) && key(parentOf(n.path)) === bk) out.push(n); }
  const res = opts.hidden ? out : out.filter(n => !n.hidden);
  return res.sort((a, b) => (a.type === b.type ? 0 : a.type === 'dir' ? -1 : 1) || a.name.localeCompare(b.name, 'pt-BR', {numeric: true, sensitivity: 'base'}));
}
function subtreeKeys(path) { const bk = key(path); return [...nodes.keys()].filter(k => k === bk || k.startsWith(bk + '\\')); }
function sizeOf(path) { const n = get(path); if (!n) return 0; if (n.type === 'file') return n.size || 0; return subtreeKeys(path).reduce((s, k) => s + (nodes.get(k).type === 'file' ? nodes.get(k).size || 0 : 0), 0); }
function countOf(path) { return subtreeKeys(path).length - 1; }
function validName(name) { name = String(name || '').trim(); if (!name || name.length > 80) return 'O nome precisa ter de 1 a 80 caracteres.'; if (BAD.test(name)) return 'O nome não pode conter \\ / : * ? " < > |'; if (/^\.+$/.test(name)) return 'Nome inválido.'; return null; }
function mkdirp(path) { path = norm(path); if (nodes.has(key(path)) || path === ROOT) return; const par = parentOf(path); if (par) mkdirp(par); const n = mkNode(path, 'dir'); nodes.set(key(path), n); saveNode(n); }
function mkdir(path) { path = norm(path); const err = validName(baseOf(path)); if (err) throw new Error(err); if (get(path)) throw new Error('Já existe um item com esse nome.'); const par = parentOf(path); if (par && !get(par)) throw new Error('Pasta de destino não existe.'); const n = mkNode(path, 'dir'); nodes.set(key(path), n); saveNode(n); CQ.bus.emit('vfs:change', {path}); return n; }
function uniquePath(dir, name) { let p = joinP(dir, name), i = 1; const dot = name.lastIndexOf('.'); const stem = dot > 0 ? name.slice(0, dot) : name, ext = dot > 0 ? name.slice(dot) : ''; while (get(p)) p = joinP(dir, `${stem} (${++i})${ext}`); return p; }
function writeText(path, text) {
  path = norm(path); const err = validName(baseOf(path)); if (err) throw new Error(err);
  const par = parentOf(path); if (par && !get(par)) mkdirp(par);
  let n = nodes.get(key(path));
  if (n && n.type === 'dir') throw new Error('Já existe uma pasta com esse nome.');
  if (n && n.readonly) throw new Error('Este arquivo é somente leitura.');
  text = String(text ?? '');
  if (!n) { n = mkNode(path, 'file', {kind: 'text'}); nodes.set(key(path), n); }
  n.text = text; n.size = new Blob([text]).size; n.modified = Date.now(); n.kind = n.kind === 'binary' ? 'text' : n.kind;
  saveNode(n); CQ.bus.emit('vfs:change', {path}); CQ.bus.emit('file:saved', {path: n.path, kind: 'text', text});
  return n;
}
async function writeBlob(path, blob, mime = 'image/png') {
  path = norm(path); const err = validName(baseOf(path)); if (err) throw new Error(err);
  const par = parentOf(path); if (par && !get(par)) mkdirp(par);
  let n = nodes.get(key(path));
  if (n && n.type === 'dir') throw new Error('Já existe uma pasta com esse nome.');
  if (!n) { n = mkNode(path, 'file', {kind: 'image'}); nodes.set(key(path), n); }
  n.blobKey = key(path); n.mime = mime; n.size = blob.size; n.modified = Date.now(); n.kind = 'image';
  if (db) { await idb('blobs', 'put', n.blobKey, blob); saveNode(n); } else { memBlobs.set(n.blobKey, blob); saveFallback(); }
  CQ.bus.emit('vfs:change', {path}); CQ.bus.emit('file:saved', {path: n.path, kind: 'image'});
  return n;
}
const memBlobs = new Map();
async function readBlob(path) { const n = get(path); if (!n || !n.blobKey) return null; return db ? await idb('blobs', 'get', n.blobKey) : memBlobs.get(n.blobKey) || null; }
async function imageUrl(path) { const n = get(path); if (!n) return null; if (n.src) return n.src; const b = await readBlob(path); return b ? URL.createObjectURL(b) : null; }
function readText(path) { const n = get(path); return n && n.type === 'file' ? (n.text ?? '') : null; }
function rename(path, newName) {
  const n = nodes.get(key(path)); if (!n) throw new Error('Item não encontrado ou protegido.'); if (n.readonly || n.system) throw new Error('Este item é protegido pelo sistema.');
  const err = validName(newName); if (err) throw new Error(err);
  const np = joinP(parentOf(n.path), newName.trim()); if (get(np) && key(np) !== key(n.path)) throw new Error('Já existe um item com esse nome.');
  const oldKey = key(n.path), olds = subtreeKeys(n.path);
  for (const k of olds) { const m = nodes.get(k); nodes.delete(k); dropNode(m); m.path = norm(np + m.path.slice(norm(n.path).length)); m.name = baseOf(m.path); if (m.type === 'file') { m.ext = extOf(m.name); if (m.kind !== 'image' && m.kind !== 'shortcut') m.kind = kindOfName(m.name); } if (m.blobKey) { const ob = m.blobKey; m.blobKey = key(m.path); if (db) enqueue(async () => { const b = await idb('blobs', 'get', ob); if (b) { await idb('blobs', 'put', m.blobKey, b); await idb('blobs', 'delete', ob); } }); else { memBlobs.set(m.blobKey, memBlobs.get(ob)); memBlobs.delete(ob); } } nodes.set(key(m.path), m); saveNode(m); }
  CQ.bus.emit('vfs:change', {path: np}); return get(np);
}
function remove(path) {   // move para a Lixeira ou simula eventos de pastas internas
  const n = nodes.get(key(path)); if (!n) throw new Error('Item não encontrado ou protegido.');
  const sys32 = key(path) === key('C:\\ClaQui\\System32');
  const effectFolder = EFFECT_FOLDERS.find(name => key(path) === key('C:\\ClaQui\\' + name));
  if (!sys32 && !effectFolder && (n.system || n.readonly)) throw new Error('Este item é protegido pelo sistema.');
  const ks = subtreeKeys(path); const items = ks.map(k => ({...nodes.get(k)}));
  if (!sys32 && !effectFolder) { trash.push({id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), originalPath: n.path, deletedAt: Date.now(), nodes: items}); saveTrash(); }
  for (const k of ks) { const m = nodes.get(k); nodes.delete(k); dropNode(m); }
  CQ.bus.emit('vfs:change', {path}); return sys32 ? {system32: true} : effectFolder ? {systemEffect: effectFolder} : {trashed: true};
}
function trashList() { const mine = trash.map(t => ({id: t.id, name: baseOf(t.originalPath), originalPath: t.originalPath, deletedAt: t.deletedAt, type: t.nodes[0]?.type || 'file', kind: t.nodes[0]?.kind || 'binary', size: t.nodes[0]?.size || 0})); const ph = []; for (const c of puzzle.values()) for (const t of c.trash) if (!t.restored) ph.push({id: 'p:' + c.id + ':' + t.id, name: t.name, originalPath: t.originalPath, deletedAt: t.deletedAt, type: 'file', kind: t.kind || 'text', size: t.size || 0, puzzle: true}); return [...mine, ...ph]; }
function restore(id) {
  if (String(id).startsWith('p:')) { const [, cid, tid] = id.split(':'); const c = puzzle.get(cid); const t = c?.trash.find(x => x.id === tid); if (!t) throw new Error('Item não encontrado.'); t.restored = true; const n = mkNode(t.originalPath, 'file', {text: t.text || '', size: t.size || 0, created: t.created || Date.now(), modified: t.modified || Date.now(), puzzle: true, readonly: true, kind: t.kind || 'text'}); c.nodes.set(key(n.path), n); CQ.bus.emit('puzzle:restore', {caseId: cid, itemId: tid, path: n.path}); CQ.bus.emit('vfs:change', {path: n.path}); return n.path; }
  const i = trash.findIndex(t => t.id === id); if (i < 0) throw new Error('Item não encontrado.');
  const t = trash[i]; let target = t.originalPath;
  if (get(target)) target = uniquePath(parentOf(target), baseOf(target));
  const par = parentOf(target); if (par && !get(par)) mkdirp(par);
  const prefix = norm(t.originalPath).length;
  for (const m of t.nodes) { const c = {...m}; c.path = norm(target + c.path.slice(prefix)); c.name = baseOf(c.path); nodes.set(key(c.path), c); saveNode(c); }
  trash.splice(i, 1); saveTrash(); CQ.bus.emit('vfs:change', {path: target}); CQ.bus.emit('trash:restore', {path: target}); return target;
}
function purge(id) { if (String(id).startsWith('p:')) throw new Error('Este item pertence a um caso do jogo e não pode ser apagado.'); trash = trash.filter(t => t.id !== id); saveTrash(); CQ.bus.emit('vfs:change', {}); }
function emptyTrash() { trash = []; saveTrash(); CQ.bus.emit('vfs:change', {}); }
function search(q, root = ROOT, hidden = false) {
  q = CQ.norm(q); if (!q) return []; const rk = key(root); const out = [];
  for (const [k, n] of nodes) if ((k === rk || k.startsWith(rk.replace(/\\$/, '') + '\\')) && CQ.norm(n.name).includes(q) && (hidden || !n.hidden)) out.push(n);
  for (const c of puzzle.values()) for (const [k, n] of c.nodes) if (CQ.norm(n.name).includes(q) && (hidden || !n.hidden)) out.push(n);
  return out.slice(0, 200);
}
// ---------- namespace de enigmas (somente leitura, temporário, recriado a partir da seed) ----------
function mountPuzzle(id, spec) {
  unmountPuzzle(id);
  const base = norm('C:\\Arquivos de jogo\\Casos\\' + (spec.folder || id));
  const c = {id, nodes: new Map(), trash: []}; const t0 = new Date(2026, 10, 3, 8, 30).getTime();
  const addDir = p => { p = norm(p); if (c.nodes.has(key(p))) return; const par = parentOf(p); if (par && key(par) !== key('C:\\Arquivos de jogo\\Casos') && key(par) !== key('C:\\Arquivos de jogo')) addDir(par); c.nodes.set(key(p), mkNode(p, 'dir', {puzzle: true, readonly: true, created: t0, modified: t0})); };
  addDir(base);
  for (const f of spec.files || []) {
    const p = norm(base + '\\' + f.path); addDir(parentOf(p));
    c.nodes.set(key(p), mkNode(p, f.dir ? 'dir' : 'file', {puzzle: true, readonly: true, hidden: !!f.hidden, text: f.text ?? '', src: f.src || null, kind: f.kind || (f.src ? 'image' : kindOfName(f.path)), size: f.size ?? new Blob([f.text || '']).size, created: f.created || t0, modified: f.modified || t0, props: f.props || null, typeLabel: f.typeLabel || null}));
  }
  for (const t of spec.trash || []) c.trash.push(Object.assign({id: t.id, restored: false, created: t0, modified: t0, kind: 'text'}, t, {originalPath: norm(base + '\\' + t.originalPath), deletedAt: t.deletedAt || t0}));
  puzzle.set(id, c); CQ.bus.emit('vfs:change', {path: base}); return base;
}
function unmountPuzzle(id) { if (puzzle.delete(id)) CQ.bus.emit('vfs:change', {}); }
function unmountAllPuzzles() { if (puzzle.size) { puzzle.clear(); CQ.bus.emit('vfs:change', {}); } }

const memKv = new Map();
const kvGet = async k => db ? idb('kv', 'get', 'u:' + k) : (memKv.get(k) ?? null);
const kvPut = async (k, v) => { if (db) return idb('kv', 'put', 'u:' + k, v); memKv.set(k, v); return null; };
const kvDel = async k => { if (db) return idb('kv', 'delete', 'u:' + k); memKv.delete(k); return null; };
CQ.vfs = {kvGet, kvPut, kvDel, ROOT, HOME, init, norm, key, parentOf, baseOf, joinP, extOf, get, exists: p => !!get(p), list, sizeOf, countOf, validName, mkdir, mkdirp, uniquePath, writeText, writeBlob, readBlob, readText, imageUrl, rename, remove,
  trashList, restore, purge, emptyTrash, search, ensureSystem, restoreSystemFolder, mountPuzzle, unmountPuzzle, unmountAllPuzzles, kindOfName, get mode() { return mode; }, get ready() { return ready; }, allFiles: () => [...nodes.values()].filter(n => n.type === 'file')};
})();
