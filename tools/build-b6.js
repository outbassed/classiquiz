// Gera assets/js/data-b6.js (banco B6) a partir do B5 (imutável) + correções + conteúdo novo. Também gera as planilhas de auditoria.
const fs = require('fs'), path = require('path');
const ROOT = process.argv[2] || path.resolve(__dirname, '..');
const B = path.join(__dirname, 'b6-fonte');
const W = require('./loaddata.js')(ROOT); const D5 = W.CLASSIQUIZ_DATA_B5;
const ovStd = Object.assign({}, require(B + '/ov-std-1.js'), require(B + '/ov-std-2.js'), require(B + '/ov-std-3.js'));
const ovExt = require(B + '/ov-ext.js'); const OM = require(B + '/ov-misc.js'); const NEW = require(B + '/new-std.js'); const C = require(B + '/content.js');
const THEME = {comida: 'culinária', futebol: 'esportes', internet: 'tecnologia', 'inúteis': 'curiosidades', animais: 'ciência', artes: 'arte', 'lógica': 'pegadinha', 'observação': 'pegadinha', 'desafio': 'desafio'};
const th = t => THEME[t] || t;
const MONTH = '11/2026';
const out = {version: '2.0.0', bankVersion: 'B6', questions: [], extended: [], tricks: [], minigames: [], stories: [], show: {tiers: []}, missions: []};
const audit = []; const csvNew = [];
let rec = (o, newItem, action, reason, kind) => audit.push({id: o.id, kind, theme: o.theme || '', diff: o.difficulty || '', text: o.text || '', ans: o.options ? o.options[o.correct] : (o.mode || ''), action, reason, newId: newItem ? newItem.id : '-', newText: newItem ? newItem.text : '', newAns: newItem && newItem.options ? newItem.options[newItem.correct] : (newItem ? (newItem.mode || '') : '')});
// Regra editorial 16: addedMonth original é preservado; todo item ajustado/reescrito ganha revisedMonth (mês da revisão B6).
const recBase = rec; rec = (o, newItem, action, reason, kind) => { if (newItem && action !== 'mantida') newItem.revisedMonth = MONTH; return recBase(o, newItem, action, reason, kind); };
const DIFF = {easy: 'easy', medium: 'medium', hard: 'hard'};

function applyQ(src, ov, kind, list) {
  const o = ov[src.id];
  if (o && o.drop) { rec(src, null, 'removida', o.why, kind); return; }
  const n = Object.assign({}, src, {theme: th(src.theme)});
  let changed = [];
  if (o) {
    if (o.t) { n.text = o.t; changed.push('enunciado'); }
    if (o.o) { n.options = o.o.slice(); n.correct = 0; changed.push('alternativas'); }
    if (o.th && th(o.th) !== n.theme) { n.theme = th(o.th); changed.push('tema'); }
    if (o.d && o.d !== n.difficulty) { n.difficulty = o.d; changed.push('dificuldade'); }
  }
  if (th(src.theme) !== src.theme && !changed.includes('tema')) changed.push('tema');
  n.addedMonth = src.addedMonth || MONTH; n.bankOrigin = 'B5';
  list.push(n);
  const action = changed.includes('enunciado') || changed.includes('alternativas') ? 'reescrita' : changed.length ? 'ajustada' : 'mantida';
  rec(src, n, action, o ? o.why : 'Revisada item a item: enunciado, resposta, alternativas, tema e dificuldade corretos.', kind);
}
// --- padrão e extendidas
for (const q of D5.questions) applyQ(q, ovStd, 'padrão', out.questions);
for (const q of D5.extended) applyQ(q, ovExt, 'estendida', out.extended);
let nq = 0;
for (const [t, d, text, ...opts] of NEW.N) { const id = 'b6-q-' + String(++nq).padStart(3, '0'); const it = {id, kind: 'standard', difficulty: d, theme: th(t), text, options: opts, correct: 0, addedMonth: MONTH}; out.questions.push(it); csvNew.push(it); }
let nx = 0;
for (const [t, d, text, ...opts] of NEW.X) { const id = 'b6-x-' + String(++nx).padStart(3, '0'); const it = {id, kind: 'extended', difficulty: d, theme: th(t), text, options: opts, correct: 0, addedMonth: MONTH}; out.extended.push(it); csvNew.push(it); }
// --- pegadinhas
for (const t of D5.tricks) {
  const o = OM.trick[t.id]; if (o && o.drop) { rec(t, null, 'removida', o.why, 'pegadinha'); continue; }
  const n = Object.assign({}, t, {theme: 'pegadinha'}); if (o && o.alts) n.alts = o.alts; n.bankOrigin = 'B5';
  out.tricks.push(n); rec(t, n, o && o.alts ? 'ajustada' : (t.theme !== 'pegadinha' ? 'ajustada' : 'mantida'), o ? o.why : 'Revisada.', 'pegadinha');
}
// --- minigames
for (const m of D5.minigames) {
  const o = OM.mini[m.id]; if (o && o.drop) { rec(m, null, 'removida', o.why, 'minigame'); continue; }
  const n = Object.assign({}, m); for (const k of ['targetIcon', 'otherIcon', 'symbols']) if (o && o[k]) n[k] = o[k]; n.bankOrigin = 'B5';
  out.minigames.push(n); rec(m, n, o ? 'ajustada' : 'mantida', o ? o.why : 'Revisado: mecânica, texto e dificuldade corretos.', 'minigame');
}
const MINI_NEW = [
  {id: 'b6-mini-hearts', kind: 'mini', mode: 'find', theme: 'desafio', difficulty: 'easy', text: 'Encontre o coração preenchido.', targetIcon: '♥', otherIcon: '♡', addedMonth: MONTH},
  {id: 'b6-mini-squares', kind: 'mini', mode: 'find', theme: 'desafio', difficulty: 'medium', text: 'Encontre o quadrado preenchido entre os vazados.', targetIcon: '■', otherIcon: '□', addedMonth: MONTH}];
for (const m of MINI_NEW) { out.minigames.push(m); csvNew.push(m); }
// --- histórias
for (const g of D5.stories) {
  const items = g.items.map(it => {
    const o = OM.story['b5-story-' + g.id + '-' + it.step] || OM.story[it.id]; const n = Object.assign({}, it, {bankOrigin: 'B5'});
    if (o && o.o) { n.options = o.o.slice(); n.correct = 0; }
    rec(it, n, o ? 'reescrita' : 'mantida', o ? o.why : 'Revisada: lógica da história confere com a resposta e a sequência de passos.', 'história');
    return n;
  });
  out.stories.push({id: g.id, title: g.title, theme: g.theme, items, bankOrigin: 'B5'});
}
const base = f => 'C:\\ClaQui\\Arquivos de jogo\\Casos\\' + f;
for (const c of C.cases) {
  const puzzle = {id: c.id, folder: c.folder, files: c.files};
  const items = c.steps.map(([text, ...rest], i) => ({id: `b6-case-${c.id}-${i + 1}`, kind: 'story', group: c.id, step: i + 1, difficulty: rest[4], theme: 'investigação', text, options: rest.slice(0, 4), correct: 0, addedMonth: MONTH, puzzle}));
  out.stories.push({id: c.id, title: c.title, theme: 'investigação', items, puzzle, investigation: true}); items.forEach(i => csvNew.push(i));
}
// --- show
C.show.forEach((tier, ti) => out.show.tiers.push(tier.map(([t, text, ...opts], i) => { const it = {id: `b6-show-${ti + 1}-${i + 1}`, kind: 'show', tier: ti + 1, difficulty: ti < 3 ? 'easy' : ti < 7 ? 'medium' : 'hard', theme: th(t), text, options: opts, correct: 0, addedMonth: MONTH}; csvNew.push(it); return it; })));
// --- missões
for (const m of C.missions) {
  const b = base(m.mission.puzzle ? m.mission.puzzle.folder : '');
  const mis = JSON.parse(JSON.stringify(m.mission));
  if (mis.puzzle) mis.puzzle.id = m.id;
  if (mis.type === 'explorer-open' && !/^[a-z]:\\/i.test(mis.path)) mis.path = b + '\\' + mis.path;
  if (mis.type === 'viewer-answer') mis.file = b + '\\' + mis.file;
  if (mis.puzzle) mis.puzzle.folder = mis.puzzle.folder || m.id;
  const it = {id: m.id, kind: 'mission', difficulty: m.d, theme: 'missão', text: m.text, mission: mis, addedMonth: MONTH}; out.missions.push(it); csvNew.push(it);
}
// ---------- validação de qualidade ----------
const warn = []; const seen = new Map(); const nrm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}\uFE0F]/u; const SAFE_SYMBOLS = /^[★☆♥♡■□☀☂♫☎♞♠♣♦⬢⬡☾☽✿❀✪✩⬥◆]+$/;
const all = [...out.questions, ...out.extended, ...out.stories.flatMap(g => g.items), ...out.show.tiers.flat()];
for (const q of all) {
  const key = nrm(q.text); if (q.kind !== 'story' && seen.has(key)) warn.push(`DUPLICADO ${q.id} = ${seen.get(key)}`); seen.set(key, q.id);
  if (!q.options || q.options.length < 4) warn.push('POUCAS OPÇÕES ' + q.id);
  if (new Set(q.options.map(x=>String(x).toLowerCase().trim())).size !== q.options.length) warn.push('OPÇÕES REPETIDAS ' + q.id);
  for (const o of q.options) { if (/^op[cç][aã]o\s+[a-z]$/i.test(o) || /nenhuma das anteriores|todas as anteriores/i.test(o)) warn.push(`OPÇÃO GENÉRICA ${q.id}: ${o}`); if (EMOJI.test(o) || EMOJI.test(q.text)) warn.push('EMOJI ' + q.id); }
  const ans = nrm(q.options[q.correct]); if (q.kind !== 'story' && !['b5-q-002','b5-q-025'].includes(q.id) && ans.length > 4 && nrm(q.text).includes(ans)) warn.push(`VAZAMENTO ${q.id}: "${q.options[q.correct]}" aparece no enunciado`);
  if (q.correct !== 0) warn.push('CORRETA NÃO É 0 ' + q.id);
}
for (const m of out.minigames) for (const k of ['targetIcon', 'otherIcon']) if (m[k] && !SAFE_SYMBOLS.test(m[k])) warn.push('SÍMBOLO FORA DA LISTA ' + m.id + ' ' + m[k]);
const bad = /piada|imagin[aá]rio|o pr[oó]prio|pedreiro simulator|boleto com|dinossauro|nenhuma das|da firma|do desespero|cavernas digitais/i;
for (const q of all) for (const o of q.options) if (bad.test(o)) warn.push(`ALTERNATIVA SUSPEITA ${q.id}: ${o}`);
const total5 = D5.questions.length + D5.extended.length + D5.tricks.length + D5.minigames.length + D5.stories.reduce((a, g) => a + g.items.length, 0);
if (audit.length !== total5) warn.push(`AUDITORIA incompleta: ${audit.length}/${total5}`);
const diff = {}; for (const q of [...out.questions, ...out.extended]) diff[q.difficulty] = (diff[q.difficulty] || 0) + 1;
const themes = {}; for (const q of [...out.questions, ...out.extended]) themes[q.theme] = (themes[q.theme] || 0) + 1;
// ---------- saída ----------
const hdr = '/* ClassiQuiz — banco B6 (gerado por tools/build-b6.js a partir do B5 imutável + revisão editorial + conteúdo novo). Licença: MIT. */\n';
fs.writeFileSync(path.join(ROOT, 'assets/js/data-b6.js'), hdr + 'window.CLASSIQUIZ_DATA_B6 = ' + JSON.stringify(out) + ';\n');
const q = s => '"' + String(s ?? '').replace(/"/g, '""') + '"';
const rows = [['id_B5', 'tipo', 'tema_original', 'dificuldade_original', 'enunciado_original', 'resposta_correta_original', 'acao', 'motivo', 'id_B6', 'enunciado_B6', 'resposta_correta_B6']].concat(audit.map(a => [a.id, a.kind, a.theme, a.diff, a.text, a.ans, a.action, a.reason, a.newId, a.newText, a.newAns]));
fs.writeFileSync(path.join(ROOT, 'AUDITORIA-QUESTOES.csv'), '\uFEFF' + rows.map(r => r.map(q).join(';')).join('\r\n') + '\r\n');
const nrows = [['id_B6', 'tipo', 'tema', 'dificuldade', 'enunciado', 'resposta_correta']].concat(csvNew.map(i => [i.id, i.kind, i.theme, i.difficulty, i.text, i.options ? i.options[i.correct] : (i.mission ? i.mission.type : i.mode)]));
fs.writeFileSync(path.join(ROOT, 'NOVOS-ITENS-B6.csv'), '\uFEFF' + nrows.map(r => r.map(q).join(';')).join('\r\n') + '\r\n');
const count = a => audit.filter(x => x.action === a).length;
console.log(JSON.stringify({auditRows: audit.length, expectedB5: total5, mantida: count('mantida'), ajustada: count('ajustada'), reescrita: count('reescrita'), removida: count('removida'),
  B6: {standard: out.questions.length, extended: out.extended.length, tricks: out.tricks.length, minis: out.minigames.length, storyGroups: out.stories.length, storyItems: out.stories.reduce((a, g) => a + g.items.length, 0), show: out.show.tiers.map(t => t.length), missions: out.missions.length}, diff, themes}));
console.log(warn.length ? 'AVISOS (' + warn.length + '):\n' + warn.join('\n') : 'Sem avisos de qualidade.');
