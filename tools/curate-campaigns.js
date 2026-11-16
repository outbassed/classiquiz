// Curadoria das Campanhas ClassiQuiz 1/2/3: escolhe e ordena 50 etapas fixas por campanha (sem itens só-mouse/só-toque, sem repetição entre campanhas)
// e grava a tabela explícita em assets/js/campaigns-b6.js. Determinístico: mesmo resultado a cada execução.
const fs = require('fs'), path = require('path');
const ROOT = process.argv[2] || path.resolve(__dirname, '..');
const W = require('./loaddata.js')(ROOT, ['data-b6.js']); const D = W.CLASSIQUIZ_DATA_B6;
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rngFrom = seed => { let a = hash(seed); return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const shuffle = (xs, r) => { const a = xs.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const hybrid = it => !it.needs && !['hover', 'hover-target', 'right-click', 'right-click-folder', 'touch-hold'].includes(it.mode);
const ids = new Set(); const used = new Set();
const SPEC = {
  1: {name: 'Primeiros passos', story: 'bolo', showStart: 13, skip: 9, recall: 41, mem: 35, mis: ['m-note-1', 'm-calc-1'], tricks: ['trick-cover', 'trick-double', 'trick-cancel', 'trick-invisible'], minis: ['mini-order', 'mini-find', 'mini-count'], ext: ['extended013', 'extended021'], mix: {easy: 15, medium: 6, hard: 0}},
  2: {name: 'Programas e enigmas', story: 'detetive', showStart: 16, skip: 11, recall: 43, mem: 34, mis: ['m-paint-1', 'm-open-note-10'], tricks: ['trick-dot', 'trick-window', 'trick-fake-popup', 'trick-count-hearts'], minis: ['mini-memory', 'mini-path', 'mini-color'], ext: ['extended001', 'extended017'], mix: {easy: 6, medium: 12, hard: 4}},
  3: {name: 'O grande desafio', story: 'tijolo', showStart: 19, skip: 9, recall: 44, mem: 37, mis: ['m-explore-2', 'm-open-paint-20'], tricks: ['trick-color-words', 'trick-bigger', 'trick-fourth', 'b5-trick-save'], minis: ['mini-arrows2', 'mini-lights', 'mini-maze3'], ext: ['extended009', 'extended003'], mix: {easy: 0, medium: 6, hard: 14}}
};
const byId = new Map(); for (const k of ['questions', 'extended', 'tricks', 'minigames', 'missions']) for (const it of D[k]) byId.set(it.id, it);
const out = {};
for (const n of [1, 2, 3]) {
  const sp = SPEC[n], rng = rngFrom('curadoria-campanha-' + n), order = new Array(50).fill(null);
  const story = D.stories.find(g => g.id === sp.story); if (!story) throw Error('história ausente ' + sp.story);
  const special = [...sp.mis, ...sp.tricks, ...sp.minis, ...sp.ext]; for (const id of special) { const it = byId.get(id); if (!it) throw Error('ausente ' + id); if (!hybrid(it)) throw Error('não híbrido ' + id); if (used.has(id)) throw Error('repetido ' + id); used.add(id); }
  // show
  const showItems = D.show.tiers.map((t, i) => shuffle(t.filter(x => !used.has(x.id)), rng)[0]); showItems.forEach((it, i) => { order[sp.showStart + i] = it.id; used.add(it.id); });
  // história: bloco antes do Show, com margem
  const sl = story.items.length; let sStart = n === 1 ? 2 : n === 2 ? 4 : 1; story.items.forEach((it, i) => order[sStart + i] = it.id);
  order[sp.skip] = 'SKIP'; order[sp.recall] = 'RECALL'; order[sp.mem] = 'MEM';
  // desafios espaçados (>=3) fora do Show e das histórias
  const blockedNear = i => order.some((v, k) => v && (v === 'SKIP' || v === 'RECALL' || v === 'MEM' || v.startsWith('b5-story') || v.startsWith('b6-case') || v.startsWith('b6-show')) && Math.abs(k - i) < 1);
  const freeIdx = Array.from({length: 50}, (_, i) => i).filter(i => !order[i] && i > 0);
  let pos; for (let t = 0; t < 500; t++) { const c = shuffle(freeIdx, rng), p = []; for (const i of c) { if (p.length >= special.length) break; if (p.every(v => Math.abs(v - i) >= 3)) p.push(i); } if (p.length === special.length) { pos = p; break; } }
  if (!pos) throw Error('não coube os desafios na campanha ' + n);
  shuffle(special, rng).forEach((id, i) => order[pos[i]] = id);
  // standards: quadro de dificuldade por campanha, temas variados, sem repetir entre campanhas
  const rest = order.map((v, i) => v ? -1 : i).filter(i => i >= 0), need = rest.length;
  const pool = D.questions.filter(q => hybrid(q) && !used.has(q.id));
  const picks = [];
  for (const d of ['easy', 'medium', 'hard']) {
    const want = sp.mix[d]; if (!want) continue; const cands = shuffle(pool.filter(q => q.difficulty === d && !picks.includes(q)), rng);
    const byTheme = new Map(); for (const q of cands) { if (!byTheme.has(q.theme)) byTheme.set(q.theme, []); byTheme.get(q.theme).push(q); }
    const themes = shuffle([...byTheme.keys()], rng); let k = 0, got = 0;
    while (got < want) { const t = themes[k % themes.length]; const q = byTheme.get(t).shift(); if (q) { picks.push(q); got++; } k++; if (k > 5000) throw Error('faltam questões ' + d); }
  }
  // ajusta a quantidade total (o mix nominal pode não bater com os espaços livres)
  while (picks.length < need) { const extra = shuffle(pool.filter(q => !picks.includes(q)), rng)[0]; picks.push(extra); }
  while (picks.length > need) picks.pop();
  picks.forEach(q => used.add(q.id));
  // ordem: dificuldade levemente crescente com variação, sem temas repetidos em sequência
  const rank = {easy: 0, medium: 1, hard: 2}; let seq = picks.map((q, i) => ({q, k: rank[q.difficulty] * 10 + rng() * 14 + i * 0.001})).sort((a, b) => a.k - b.k).map(x => x.q);
  const themeAt = i => { const v = order[i]; if (!v) return null; const it = byId.get(v); if (it) return it.theme; for (const g of D.stories) if (g.items.some(x => x.id === v)) return g.items[0].theme; for (const t of D.show.tiers) { const s = t.find(x => x.id === v); if (s) return s.theme; } return null; };
  const placed = []; for (const i of rest) { let idx = seq.findIndex(q => q.theme !== themeAt(i - 1) && q.theme !== themeAt(i + 1)); if (idx < 0) idx = 0; const q = seq.splice(idx, 1)[0]; order[i] = q.id; }
  // verificação
  if (order.some(v => !v)) throw Error('lacuna'); if (new Set(order.filter(v => !['SKIP', 'RECALL', 'MEM'].includes(v))).size !== order.filter(v => !['SKIP', 'RECALL', 'MEM'].includes(v)).length) throw Error('duplicata interna');
  out[n] = {name: sp.name, order};
}
// duplicatas entre campanhas
const all = [1, 2, 3].flatMap(n => out[n].order.filter(v => !['SKIP', 'RECALL', 'MEM'].includes(v))); if (new Set(all).size !== all.length) throw Error('itens repetidos entre campanhas');
const file = '/* ClassiQuiz — Campanhas 1/2/3 (B6): ordem FIXA de 50 etapas por campanha, curada por tools/curate-campaigns.js. Sem itens só-mouse/só-toque e sem repetição entre campanhas. Licença: MIT.\n   Tokens: id do item | SKIP (questão pulada) | RECALL (lembrança da pulada) | MEM (memória). */\nwindow.CQ_CAMPAIGNS_B6 = ' + JSON.stringify(out) + ';\n';
fs.writeFileSync(path.join(ROOT, 'assets/js/campaigns-b6.js'), file);
for (const n of [1, 2, 3]) { const o = out[n].order; const diff = {}; for (const v of o) { const it = byId.get(v); if (it) diff[it.kind + ':' + it.difficulty] = (diff[it.kind + ':' + it.difficulty] || 0) + 1; } console.log(n, out[n].name, JSON.stringify(diff)); }
console.log('ok, itens únicos:', all.length);
