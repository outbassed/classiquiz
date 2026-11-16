/* ClassiQuiz gen-b6.js — gerador do banco B6 (Trilhas aleatórias, Ultra v2 e Campanhas 1/2/3). Funções puras, sem DOM.
   O B6 nunca altera B1–B5: apenas registra BANKS.B6 em CQ_GEN. Licença: MIT. */
(() => {
'use strict';
const G = window.CQ_GEN, D = window.CLASSIQUIZ_DATA_B6;
if (!G || !D) return;
const {rngFrom, shuffle, choice, eligible} = G;
const MONTH = '11/2026';
const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
// Janelas (base 1) em que o Show do Milhozão pode começar, por tamanho de Trilha. 25 questões: sem Show.
const WINDOWS = {50: [12, 25], 75: [16, 46], 100: [21, 66], 150: [31, 111], 200: [41, 151], 400: [81, 301]};
function showWindow(count, ultra) {
  if (count < 50) return null;
  if (!ultra && WINDOWS[count]) return WINDOWS[count];
  const ks = Object.keys(WINDOWS).map(Number).sort((a, b) => a - b);
  if (!ultra && count > ks[0] && count < ks.at(-1)) for (let i = 0; i < ks.length - 1; i++) if (count > ks[i] && count < ks[i + 1]) {
    const t = (count - ks[i]) / (ks[i + 1] - ks[i]), a = WINDOWS[ks[i]], b = WINDOWS[ks[i + 1]];
    return [Math.round(a[0] + t * (b[0] - a[0])), Math.round(a[1] + t * (b[1] - a[1]))];
  }
  return [Math.floor(count * .2) + 1, Math.min(count - 9, Math.floor(count * .75) + 1)];
}
const isHybrid = it => !it.needs && !['hover', 'hover-target', 'right-click', 'right-click-folder', 'touch-hold'].includes(it.mode);
const stageFrom = (src, rng) => {
  if (['standard', 'extended', 'story', 'show'].includes(src.kind)) { const opts = shuffle(src.options, rng); return {...src, options: opts, answer: opts.indexOf(src.options[src.correct]), correct: undefined}; }
  return {...src};
};
const pools = p => ({
  std: D.questions.filter(q => eligible(q, p)),
  spec: [...D.extended, ...D.tricks, ...D.minigames].filter(q => eligible(q, p)),
  mis: D.missions.filter(q => eligible(q, p))
});
const storyItems = () => D.stories.reduce((n, g) => n + g.items.length, 0);
// ----- planejamento (tamanho dos blocos por tamanho de Trilha) -----
function plan(count, p) {
  const P = pools(p), show = count >= 50 ? 10 : 0;
  const nSt = count < 50 ? 1 : Math.min(8, Math.max(1, Math.floor(count / 45)));
  const nMis = count < 50 ? 1 : Math.min(P.mis.length, Math.floor(count / 25));
  const nSpec = Math.min(P.spec.length, Math.floor(count / 5.1));
  const nMem = Math.max(1, Math.floor(count / 65));
  const slots = nSpec + nMis, fixed = show + nSt * 7 + nMem + 2;
  const stdNeed = count - (show + nSt * 6 + nMem + 2 + slots);
  return {P, show, nSt, nMis, nSpec, nMem, slots, free: count - fixed, stdNeed, ok: stdNeed <= P.std.length && slots * 3 <= count - fixed && stdNeed >= 0};
}
function capacity(p) { let best = 0; for (let n = 25; n <= 400; n += 25) if (plan(n, p).ok) best = n; return best; }
// ----- ajuste de temas vizinhos (porta do B5) -----
function fixThemes(stages, count, unfilled, rng) {
  for (let pass = 0; pass < 12; pass++) {
    let changed = false;
    for (let i = 1; i < count; i++) {
      const left = stages[i - 1], right = stages[i];
      if (!left || !right || left.kind === 'skipped' || right.kind === 'skipped' || left.theme !== right.theme || (left.kind === 'story' && right.kind === 'story' && left.group === right.group)) continue;
      for (const ix of [i, i - 1].filter(k => stages[k]?.kind === 'standard')) {
        let solved = false;
        for (const j of shuffle(unfilled.filter(j => j !== ix && j !== i && j !== i - 1), rng)) {
          const x = stages[ix], y = stages[j]; if (y?.kind !== 'standard' || x.theme === y.theme) continue;
          const ok = (pos, theme, oi, ot) => { const tl = pos > 0 ? (pos - 1 === oi ? ot : stages[pos - 1]?.theme) : null, tr = pos < count - 1 ? (pos + 1 === oi ? ot : stages[pos + 1]?.theme) : null; return (!tl || tl !== theme) && (!tr || tr !== theme); };
          if (!ok(ix, y.theme, j, x.theme) || !ok(j, x.theme, ix, y.theme)) continue;
          stages[ix] = y; stages[j] = x; solved = true; changed = true; break;
        }
        if (solved) break;
      }
    }
    if (!changed) break;
  }
}
function pickSpaced(avail, k, rng) {   // k posições com distância >= 3; tentativas aleatórias e, por fim, distribuição uniforme
  if (!k) return [];
  let a = shuffle(avail, rng);
  for (let t = 0; t < 60; t++) { const pos = []; for (const ix of a) { if (pos.length >= k) break; if (pos.every(v => Math.abs(ix - v) >= 3)) pos.push(ix); } if (pos.length === k) return pos; a = shuffle(a, rng); }
  const L = avail.slice().sort((x, y) => x - y); if (L.length < 3 * k) throw Error('Não foi possível espaçar os desafios desta Trilha. Tente outra seed.');
  return Array.from({length: k}, (_, i) => L[Math.floor(i * L.length / k)]);
}
function memoryStage(stages, ix, rng) { const m = G.generatedMemory(stages, ix, rng); m.id = 'b6-memory-' + ix; return m; }
function skipRecallStage(ix, count, skipIx, rng) {
  const missing = skipIx + 1, distractors = shuffle(range(1, count).filter(n => n !== missing && Math.abs(n - missing) < 22), rng).slice(0, 3), options = shuffle([missing, ...distractors], rng);
  return {id: 'b6-skip-memory-' + ix, kind: 'skip-memory', theme: 'memória', difficulty: 'hard', addedMonth: MONTH, text: 'Qual número de questão foi pulado nesta Trilha?', options: options.map(String), answer: options.indexOf(missing), skippedNumber: missing};
}
// ----- Trilha B6 -----
function sequence(seed, count, p, ultra) {
  const rng = rngFrom(seed), stages = new Array(count).fill(null), P = pools(p), free = i => !stages[i];
  const std = shuffle(P.std, rng), spec = shuffle(P.spec, rng), mis = shuffle(P.mis, rng), groups = shuffle(D.stories, rng);
  // 1) Show do Milhozão: bloco fechado de 10 rodadas (1..10), antes de qualquer outro bloco
  let showStart = -1;
  if (count >= 50) {
    const [lo, hi] = showWindow(count, ultra), top = Math.min(hi, count - 9); showStart = lo + Math.floor(rng() * (top - lo + 1)) - 1;
    D.show.tiers.forEach((tier, t) => { const item = choice(tier, rng); stages[showStart + t] = {...stageFrom(item, rng), group: 'show'}; });
  }
  // 2) questão pulada e sua lembrança (nunca dentro do Show)
  const skipEnabled = ultra || count === 50 || (count === 25 ? rng() < .45 : rng() < .75);
  let skipIx = -1, skipRecall = -1;
  if (skipEnabled) {
    const lo = Math.max(6, Math.round(count * .14)), hi = Math.min(count - 13, Math.max(lo, Math.round(count * .60)));
    skipIx = choice(range(lo, hi).filter(free), rng);
    const laterLo = Math.max(skipIx + 4, Math.floor(count * .78)), laterHi = Math.max(laterLo, count - 3);
    skipRecall = choice(range(laterLo, laterHi).filter(i => free(i) && i !== skipIx), rng);
    stages[skipIx] = {id: 'b6-skipped-' + skipIx, kind: 'skipped', difficulty: 'medium', theme: 'memória', addedMonth: MONTH};
    stages[skipRecall] = {id: 'b6-skip-memory-' + skipRecall, kind: 'skip-memory', difficulty: 'hard', theme: 'memória', addedMonth: MONTH};
  }
  // 3) histórias e investigações (blocos contíguos, 4 a 7 passos)
  const nSt = ultra ? groups.length : count < 50 ? (rng() < .7 ? 1 : 0) : Math.min(8, Math.max(1, Math.floor(count / 45)));
  const storyLimit = ultra ? count : Math.max(7, Math.floor(count * .75));
  for (const g of groups.slice(0, nSt)) {
    const len = g.items.length, starts = [];
    for (let s = 0; s + len <= storyLimit; s++) { let ok = true; for (let i = Math.max(0, s - 1); i < Math.min(count, s + len + 1); i++) if (stages[i]) { ok = false; break; } if (ok) starts.push(s); }
    if (!starts.length) { if (ultra) throw Error('Não foi possível posicionar todas as histórias.'); continue; }
    const b = choice(starts, rng); g.items.forEach((it, i) => stages[b + i] = stageFrom(it, rng));
  }
  // 4) memórias
  const nMem = ultra ? Math.max(2, Math.floor(count / 75)) : (count === 25 && skipEnabled ? 0 : Math.max(1, Math.floor(count / 65))), mems = [];
  for (let j = 0; j < nMem; j++) {
    const c = shuffle(range(24, count - 1), rng).filter(ix => free(ix) && (skipRecall < 0 || Math.abs(ix - skipRecall) >= 3) && mems.every(o => Math.abs(ix - o) >= 12));
    if (c.length) { mems.push(c[0]); stages[c[0]] = {id: 'b6-pending-memory-' + c[0], kind: 'pending-memory', theme: 'memória'}; }
  }
  if (ultra && mems.length !== nMem) throw Error('Faltou espaço para questões de memória.');
  // 5) desafios (extras, pegadinhas, minigames) e missões, com distância mínima de 3 entre si
  const nSpec = ultra ? spec.length : Math.min(spec.length, Math.floor(count / 5.1)), nMis = ultra ? mis.length : count < 50 ? (rng() < .5 ? 1 : 0) : Math.min(mis.length, Math.floor(count / 25));
  const chosen = shuffle([...spec.slice(0, nSpec), ...mis.slice(0, nMis)], rng), specPos = pickSpaced(range(0, count - 1).filter(free), chosen.length, rng);
  chosen.forEach((it, i) => stages[specPos[i]] = stageFrom(it, rng));
  // 6) questões comuns
  const unfilled = stages.map((v, i) => v === null ? i : -1).filter(i => i >= 0);
  if (ultra && unfilled.length !== std.length) throw Error('Ultra inconsistente com o banco B6.');
  if (unfilled.length > std.length) throw Error('Banco B6 sem questões suficientes para esta Trilha.');
  const standards = ultra ? std.slice() : std.slice(0, unfilled.length);
  for (const pos of unfilled) {
    const lt = stages[pos - 1]?.theme, nt = stages[pos + 1]?.theme;
    const cs = standards.map((q, i) => ({q, i})).filter(({q}) => q.theme !== lt && q.theme !== nt), pick = cs.length ? choice(cs.slice(0, Math.min(18, cs.length)), rng) : {q: standards[0], i: 0};
    stages[pos] = stageFrom(standards.splice(pick.i, 1)[0], rng);
  }
  fixThemes(stages, count, unfilled, rng);
  for (const pos of mems) stages[pos] = memoryStage(stages, pos, rng);
  if (skipRecall >= 0) stages[skipRecall] = skipRecallStage(skipRecall, count, skipIx, rng);
  return {seed, count, profile: p, bank: 'B6', mode: ultra ? 'ultra' : 'normal', initialLives: ultra ? 1 : undefined, createdAt: Date.now(), stages, skippedNumber: skipIx >= 0 ? skipIx + 1 : null};
}
function ultraCount(p) {
  const P = pools(p), base = P.std.length + P.spec.length + P.mis.length + storyItems() + 10; let c = base + 4;
  for (let i = 0; i < 12; i++) c = base + 2 + Math.max(2, Math.floor(c / 75));
  return c;
}
function generateUltra(p, lives, seed) { const g = sequence(seed, ultraCount(p), p, true); g.initialLives = lives; return g; }
// ----- Campanhas 1, 2 e 3: 50 questões fixas e curadas (tabela em campaigns-b6.js), sem itens exclusivos de mouse/toque -----
const byId = (() => { const m = new Map(); for (const k of ['questions', 'extended', 'tricks', 'minigames', 'missions']) for (const it of D[k]) m.set(it.id, it); for (const g of D.stories) for (const it of g.items) m.set(it.id, it); for (const t of D.show.tiers) for (const it of t) m.set(it.id, it); return m; })();
const CAMP_INFO = {1: {title: 'ClassiQuiz 1', subtitle: 'Primeiros passos: perguntas acessíveis, pegadinhas leves e a primeira investigação.'}, 2: {title: 'ClassiQuiz 2', subtitle: 'Programas, enigmas e pegadinhas de nível médio.'}, 3: {title: 'ClassiQuiz 3', subtitle: 'O grande desafio: questões difíceis, o clássico do tijolo e missões exigentes.'}};
function campaign(id) {
  id = Number(id); const T = window.CQ_CAMPAIGNS_B6 && window.CQ_CAMPAIGNS_B6[id]; if (!T) throw Error('Campanha inexistente.');
  const seed = `CQC${id}-B6-U-50-CLASSIQUIZ${id}`, rng = rngFrom(seed + '#campanha'), stages = T.order.map(() => null);
  T.order.forEach((tok, i) => {
    if (tok === 'SKIP') stages[i] = {id: 'b6-skipped-' + i, kind: 'skipped', difficulty: 'medium', theme: 'memória', addedMonth: MONTH};
    else if (tok === 'RECALL' || tok === 'MEM') stages[i] = {id: 'pending'};
    else { const it = byId.get(tok); if (!it) throw Error('Item de campanha ausente: ' + tok); stages[i] = stageFrom(it, rngFrom(seed + '#' + it.id)); if (it.kind === 'show') stages[i].group = 'show'; }
  });
  const skipIx = T.order.indexOf('SKIP');
  T.order.forEach((tok, i) => { if (tok === 'MEM') stages[i] = memoryStage(stages, i, rngFrom(seed + '#mem' + i)); else if (tok === 'RECALL') stages[i] = skipRecallStage(i, T.order.length, skipIx, rngFrom(seed + '#recall')); });
  return {seed, mode: 'campaign', campaign: id, count: T.order.length, profile: 'U', bank: 'B6', createdAt: Date.now(), stages, skippedNumber: skipIx >= 0 ? skipIx + 1 : null, title: CAMP_INFO[id].title};
}
const campaignInfo = () => CAMP_INFO;
G.BANKS.B6 = {data: D, capacity, generate: meta => sequence(meta.seed, meta.count, meta.p, false)};
Object.assign(G, {generateB6: code => G.BANKS.B6.generate(G.parseSeed(code)), generateUltraB6: generateUltra, ultraCountB6: ultraCount, campaign, campaignInfo, isHybrid, showWindow, planB6: plan});
})();
