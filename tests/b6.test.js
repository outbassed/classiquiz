// Testes do banco B6, do gerador B6, do Ultra v2 e das Campanhas 1/2/3 (Node, sem navegador). Uso: node tests/b6.test.js
const {load, LEGACY_DATA} = require('./lib/load.js');
const w = load([...LEGACY_DATA, 'gen.js', 'data-b6.js', 'campaigns-b6.js', 'gen-b6.js']); const G = w.CQ_GEN, D = w.CLASSIQUIZ_DATA_B6;
let pass = 0, fail = 0; const fails = [];
const ok = (c, msg) => { if (c) pass++; else { fail++; fails.push(msg); if (fails.length <= 60) console.log('  FALHOU:', msg); } };
const WIN = {50: [12, 25], 75: [16, 46], 100: [21, 66], 150: [31, 111], 200: [41, 151], 400: [81, 301]};
const nrm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const MOUSE = ['hover', 'hover-target', 'right-click', 'right-click-folder'], TOUCH = ['touch-hold'];
const isMouseOnly = s => s.needs === 'mouse' || MOUSE.includes(s.mode), isTouchOnly = s => s.needs === 'touch' || TOUCH.includes(s.mode);

// ---------- 1. integridade do banco ----------
console.log('1. Integridade do banco B6');
ok(D.bankVersion === 'B6', 'bankVersion');
const allQ = [...D.questions, ...D.extended]; const texts = new Map();
for (const q of [...allQ, ...D.stories.flatMap(g => g.items), ...D.show.tiers.flat()]) {
  ok(q.options.length >= 4 && q.correct === 0, 'opções/correta ' + q.id);
  ok(new Set(q.options.map(o => String(o).toLowerCase().trim())).size === q.options.length, 'opções repetidas ' + q.id);
  ok(q.options.every(o => !/^op[cç][aã]o\s+[a-z]$/i.test(o) && !/nenhuma das anteriores|todas as anteriores/i.test(o)), 'alternativa genérica ' + q.id);
  ok(!/[\u{1F300}-\u{1FAFF}️]/u.test(q.text + q.options.join('')), 'emoji ' + q.id);
  if (q.kind !== 'story') { const k = nrm(q.text); ok(!texts.has(k), 'texto duplicado ' + q.id + ' = ' + texts.get(k)); texts.set(k, q.id); }
  ok(['easy', 'medium', 'hard'].includes(q.difficulty), 'dificuldade ' + q.id); ok(!!q.theme, 'tema ' + q.id);
}
const idsAll = [...allQ, ...D.tricks, ...D.minigames, ...D.missions, ...D.stories.flatMap(g => g.items), ...D.show.tiers.flat()].map(x => x.id);
ok(new Set(idsAll).size === idsAll.length, 'ids únicos no banco');
ok(D.show.tiers.length === 10 && D.show.tiers.every(t => t.length >= 6), 'Show: 10 rodadas com >= 6 itens cada');
ok(D.stories.every(g => g.items.length >= 4 && g.items.length <= 7), 'histórias com 4 a 7 passos');
ok(D.stories.find(g => g.id === 'tijolo')?.items.length === 6, 'o clássico do tijolo tem 6 passos');
ok(D.stories.filter(g => g.investigation).length >= 4 && D.stories.filter(g => g.investigation).every(g => g.items.every(i => i.puzzle && i.puzzle.files.length)), 'casos de investigação com arquivos');
ok(D.tricks.every(t => t.theme === 'pegadinha'), 'tema das pegadinhas');
const genericAlt = D.tricks.filter(t => ['title-close', 'title-minimize', 'title-maximize', 'logo-symbol', 'taskbar-start', 'version-click', 'click-dot', 'click-word', 'word-target', 'fourth-word'].includes(t.mode) && !t.alts);
ok(genericAlt.length === 0, 'pegadinhas sem alts específicos: ' + genericAlt.map(t => t.id).join(','));
const showIds = new Set(D.show.tiers.flat().map(x => x.id)); ok(![...D.questions, ...D.extended].some(q => showIds.has(q.id)), 'pool do Show separado');
const showTexts = D.show.tiers.flat().map(q => nrm(q.text)); ok(showTexts.every(t => !texts.has(t) || showIds.has(texts.get(t))), 'Show sem perguntas repetidas do banco normal');
ok(D.missions.length >= 15, 'missões suficientes'); const mt = new Set(D.missions.map(m => m.mission.type)); ok(['notepad-text', 'calc-result', 'paint-fill', 'keep-open', 'explorer-open', 'trash-restore', 'viewer-answer'].every(t => mt.has(t)), 'todos os tipos de missão: ' + [...mt]);
ok(D.missions.filter(m => m.mission.type === 'keep-open').some(m => m.mission.seconds === 10) && D.missions.filter(m => m.mission.type === 'keep-open').some(m => m.mission.seconds === 20), 'missões temporais de 10 e 20 s');

// regra editorial: addedMonth original preservado; só os itens alterados em relação ao B5 ganham revisedMonth
const B5 = w.CLASSIQUIZ_DATA_B5, b5ById = new Map([...B5.questions, ...B5.extended].map(q => [q.id, q]));
for (const q of allQ) {
  const o = b5ById.get(q.id);
  if (!o) { ok(!!q.addedMonth && !q.revisedMonth, 'item novo sem revisedMonth ' + q.id); continue; }
  const changed = q.text !== o.text || JSON.stringify(q.options) !== JSON.stringify(o.options) || q.theme !== o.theme || q.difficulty !== o.difficulty;
  ok(q.addedMonth === o.addedMonth, 'addedMonth original preservado ' + q.id); ok(changed === !!q.revisedMonth, `revisedMonth só nos itens alterados ${q.id} (alterado=${changed}, revisedMonth=${q.revisedMonth})`);
}
ok(![...allQ, ...D.show.tiers.flat()].some(q => /sem usar as op[cç][õo]es/i.test(q.text)), 'nenhuma pergunta entrega a solução com "sem usar as opções"');
// ---------- 2. Trilhas B6 ----------
console.log('2. Trilhas B6 (todas as seeds de teste)');
const kinds = ['standard', 'extended', 'story', 'memory', 'skip-memory', 'skipped', 'trick', 'mini', 'show', 'mission'];
let seedsTested = 0;
for (const p of ['T', 'M', 'H']) for (const n of [25, 50, 75, 100, 150, 200, 400]) for (let k = 0; k < (n >= 200 ? 6 : 16); k++) {
  const seed = `CQ1-B6-${p}-${n}-TESTE${p}${n}${String(k).padStart(2, '0')}`; seedsTested++;
  let g, g2; try { g = G.generate(seed); g2 = G.generate(seed); } catch (e) { ok(false, 'geração ' + seed + ': ' + e.message); continue; }
  const st = g.stages;
  ok(st.length === n && st.every(Boolean), 'tamanho ' + seed);
  ok(JSON.stringify(st) === JSON.stringify(g2.stages), 'determinismo ' + seed);
  ok(st.every(s => kinds.includes(s.kind)), 'tipos válidos ' + seed);
  const ids = st.filter(s => !['skipped', 'memory', 'skip-memory'].includes(s.kind)).map(s => s.id); ok(new Set(ids).size === ids.length, 'sem repetição ' + seed);
  ok(st.every(s => !s.options || s.options.length >= 4), 'opções ' + seed);
  ok(st.filter(s => s.options && s.answer !== undefined).every(s => s.answer >= 0 && s.answer < s.options.length), 'índice da resposta ' + seed);
  if (p === 'T') ok(!st.some(isMouseOnly), 'T sem itens só-mouse ' + seed); if (p === 'M') ok(!st.some(isTouchOnly), 'M sem itens só-toque ' + seed);
  // Show
  const show = st.map((s, i) => s.kind === 'show' ? i : -1).filter(i => i >= 0);
  if (n === 25) ok(show.length === 0, 'sem Show em 25 ' + seed);
  else {
    ok(show.length === 10, 'Show com 10 rodadas ' + seed);
    if (show.length === 10) {
      ok(show.every((v, i) => v === show[0] + i), 'Show contíguo ' + seed); ok(show.every((v, i) => st[v].tier === i + 1), 'Show tiers 1..10 ' + seed);
      const [lo, hi] = WIN[n] || [Math.floor(n * .2) + 1, n - 9]; ok(show[0] + 1 >= lo && show[0] + 1 <= hi, `janela do Show ${seed}: ${show[0] + 1} fora de [${lo},${hi}]`);
      ok(!show.some(i => st[i].kind === 'skipped'), 'sem pulada no Show ' + seed);
      ok(show.every(i => !st[i].group || st[i].group === 'show'), 'Show sem história ' + seed);
    }
  }
  // histórias: contíguas, 4–7 passos, passo a passo; "tijolo" inteiro
  const groups = new Map(); st.forEach((s, i) => { if (s.kind === 'story') { if (!groups.has(s.group)) groups.set(s.group, []); groups.get(s.group).push([i, s.step]); } });
  for (const [gid, arr] of groups) { ok(arr.length >= 4 && arr.length <= 7, `história ${gid} com ${arr.length} passos ${seed}`); ok(arr.every(([i, step], j) => i === arr[0][0] + j && step === j + 1), `história ${gid} contígua ${seed}`); }
  if (groups.has('tijolo')) ok(groups.get('tijolo').length === 6, 'tijolo com 6 passos consecutivos ' + seed);
  // distância entre desafios independentes (>= 3 posições)
  const sp = st.map((s, i) => ['trick', 'mini', 'extended', 'mission'].includes(s.kind) ? i : -1).filter(i => i >= 0); ok(sp.every((v, i) => i === 0 || v - sp[i - 1] >= 3), 'distância >= 3 entre desafios ' + seed);
  // memória e pulada
  st.forEach((s, i) => { if (s.kind === 'memory') { ok(s.origin <= i - 9 && st[s.origin - 1].kind === 'standard' && st[s.origin - 1].id === s.originId, 'origem da memória ' + seed); } });
  const sk = st.findIndex(s => s.kind === 'skipped'), rc = st.findIndex(s => s.kind === 'skip-memory');
  ok((sk < 0) === (rc < 0), 'pulada e lembrança juntas ' + seed); if (sk >= 0) { ok(rc > sk + 3, 'lembrança depois da pulada ' + seed); ok(st[rc].skippedNumber === sk + 1 && st[rc].options[st[rc].answer] === String(sk + 1), 'resposta da lembrança ' + seed); ok(g.skippedNumber === sk + 1, 'skippedNumber ' + seed); }
  if (n === 50) ok(sk >= 0, 'Trilha de 50 sempre tem pulada ' + seed);
  if (n >= 50) ok(st.some(s => s.kind === 'mission'), 'missão presente ' + seed);
  // vazamento / temas vizinhos
  let adj = 0; for (let i = 1; i < n; i++) if (st[i].kind === 'standard' && st[i - 1].kind === 'standard' && st[i].theme === st[i - 1].theme) adj++; ok(adj <= Math.ceil(n / 25), `temas repetidos em sequência (${adj}) ${seed}`);
}
console.log('   seeds geradas:', seedsTested);
ok(G.capacity('H', 'B6') === 400 && G.capacity('T', 'B6') === 400 && G.capacity('M', 'B6') === 400, 'capacidade B6 = 400');
try { G.parseSeed('CQ1-B6-H-30-ABCDEFG'); ok(false, 'aceitou quantidade inválida'); } catch { ok(true, ''); }
ok(G.parseSeed('cq1-b6-m-100-abcdefg').seed === 'CQ1-B6-M-100-ABCDEFG', 'parseSeed normaliza');

// ---------- 3. Ultra v2 ----------
console.log('3. Ultra B6');
// 120 seeds por perfil (T = toque, M = mouse, H = híbrido): 360 Ultras completos; cada falha informa o número da seed.
const ultraAll = (c, m) => ok(c, m); const ultraSigs = {};
for (const p of ['T', 'M', 'H']) for (let n = 1; n <= 120; n++) {
  const ok = (c, m) => ultraAll(c, `${m} [seed ${n}]`);
  const seed = `CQU2-B6-${p}-ALL-ULTRA${p}${n}`; const g = G.generateUltraB6(p, 1, seed), g2 = G.generateUltraB6(p, 3, seed);
  ok(g.count === G.ultraCountB6(p) && g.stages.length === g.count, 'tamanho do Ultra ' + p); ok(g.initialLives === 1 && g2.initialLives === 3, 'corações iniciais ' + p);
  ok(JSON.stringify(g.stages) === JSON.stringify(g2.stages), 'Ultra: mesma ordem para 1 e 3 corações ' + p);
  const ids = g.stages.filter(s => !['skipped', 'memory', 'skip-memory'].includes(s.kind)).map(s => s.id); ok(new Set(ids).size === ids.length, 'Ultra sem repetição ' + p);
  const want = new Set([...D.questions, ...D.extended, ...D.tricks, ...D.minigames, ...D.missions].filter(x => G.eligible(x, p)).map(x => x.id)); D.stories.forEach(s => s.items.forEach(i => want.add(i.id))); D.show.tiers.forEach(t => t.forEach(i => { }));
  ok([...want].every(id => ids.includes(id)), 'Ultra contém todos os itens ' + p);
  ok(g.stages.filter(s => s.kind === 'show').length === 10, 'Ultra com 1 Show ' + p); ok(!g.stages.some(s => s.kind === 'mission' && /terminal/i.test(JSON.stringify(s))), 'Terminal fora do Ultra ' + p);
  const sp = g.stages.map((s, i) => ['trick', 'mini', 'extended', 'mission'].includes(s.kind) ? i : -1).filter(i => i >= 0); ok(sp.every((v, i) => i === 0 || v - sp[i - 1] >= 3), 'Ultra: distância >= 3 ' + p);
  const gs = new Map(); g.stages.forEach((s, i) => { if (s.kind === 'story') { if (!gs.has(s.group)) gs.set(s.group, []); gs.get(s.group).push(i); } }); ok(gs.size === D.stories.length && [...gs.values()].every(a => a.every((v, i) => v === a[0] + i)), 'Ultra: todas as histórias contíguas ' + p);
  if (p === 'T') ok(!g.stages.some(isMouseOnly), 'Ultra T sem só-mouse'); if (p === 'M') ok(!g.stages.some(isTouchOnly), 'Ultra M sem só-toque');
  (ultraSigs[p] = ultraSigs[p] || new Set()).add(g.stages.map(s => s.id || s.kind).join('|'));
  if (n === 120) ok(ultraSigs[p].size === 120, `Ultra ${p}: as 120 seeds geram 120 ordens diferentes (${ultraSigs[p].size})`);
}
// ---------- 4. Campanhas ----------
console.log('4. Campanhas 1/2/3');
const seen = new Set();
for (const c of [1, 2, 3]) {
  const g = G.campaign(c), g2 = G.campaign(c), st = g.stages;
  ok(g.count === 50 && st.length === 50, `campanha ${c}: 50 etapas`); ok(JSON.stringify(st) === JSON.stringify(g2.stages), `campanha ${c}: ordem e alternativas fixas`);
  ok(/^CQC[123]-/.test(g.seed) && g.mode === 'campaign' && g.campaign === c && g.profile === 'U' && g.bank === 'B6', 'metadados da campanha ' + c);
  ok(!st.some(isMouseOnly) && !st.some(isTouchOnly), `campanha ${c}: só itens híbridos`);
  const show = st.map((s, i) => s.kind === 'show' ? i : -1).filter(i => i >= 0); ok(show.length === 10 && show.every((v, i) => v === show[0] + i && st[v].tier === i + 1), `campanha ${c}: Show 1..10 contíguo`); ok(show[0] + 1 >= 12 && show[0] + 1 <= 25, `campanha ${c}: Show na janela [12,25] (${show[0] + 1})`);
  ok(!show.some(i => st[i].kind === 'skipped'), `campanha ${c}: sem pulada no Show`);
  ok(st.filter(s => s.kind === 'story').length >= 4, `campanha ${c}: tem história`);
  for (const s of st) if (!['skipped', 'memory', 'skip-memory'].includes(s.kind)) { ok(!seen.has(s.id), `campanha ${c}: item repetido ${s.id}`); seen.add(s.id); }
  const sk = st.findIndex(s => s.kind === 'skipped'), rc = st.findIndex(s => s.kind === 'skip-memory'); ok(sk >= 0 && rc > sk && st[rc].skippedNumber === sk + 1, `campanha ${c}: pulada/lembrança`);
  const mem = st.filter(s => s.kind === 'memory'); ok(mem.length === 1 && mem[0].origin <= st.indexOf(mem[0]) - 9, `campanha ${c}: memória válida`);
  ok(st.filter(s => s.kind === 'mission').length === 2, `campanha ${c}: 2 missões`);
  const sp = st.map((s, i) => ['trick', 'mini', 'extended', 'mission'].includes(s.kind) ? i : -1).filter(i => i >= 0); ok(sp.every((v, i) => i === 0 || v - sp[i - 1] >= 3), `campanha ${c}: distância >= 3`);
  ok(st.every(s => !s.options || (s.options.length >= 4 && s.answer >= 0 && s.answer < s.options.length)), `campanha ${c}: opções`);
}
ok(Object.keys(G.campaignInfo()).length === 3, 'campaignInfo');
// ---------- 5. Milhonário (lógica de sequência) ----------
console.log('5. Show do Milhozão: pool por rodada e escolha fixa pela seed');
const a = G.generate('CQ1-B6-H-100-SHOWTEST1'), b = G.generate('CQ1-B6-H-100-SHOWTEST1'), c2 = G.generate('CQ1-B6-H-100-SHOWTEST2');
const sh = x => x.stages.filter(s => s.kind === 'show').map(s => s.id + ':' + s.options.join('|'));
ok(JSON.stringify(sh(a)) === JSON.stringify(sh(b)), 'Show: mesma seed, mesmas perguntas e alternativas'); ok(JSON.stringify(sh(a)) !== JSON.stringify(sh(c2)), 'Show: seeds diferentes variam');
ok(a.stages.filter(s => s.kind === 'show').every((s, i) => D.show.tiers[i].some(x => x.id === s.id)), 'Show: item da rodada vem do pool da rodada');
console.log(`\nB6: ${pass} verificações ok, ${fail} falhas`);
process.exit(fail ? 1 : 0);
