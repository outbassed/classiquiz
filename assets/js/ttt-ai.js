/* ClassiQuiz / ClaQui OS — lógica do Jogo da Velha e adversários.
   Motor puro, sem manipular DOM nem salvar dados. Licença: MIT. */
(() => {
'use strict';
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const WIN = (b, p) => LINES.find(line => line.every(i => b[i] === p)) || null;
const FREE = b => b.map((v, i) => v === '' ? i : -1).filter(i => i >= 0);
const RAND = (xs, rng) => xs.length ? xs[Math.min(xs.length - 1, Math.floor(rng() * xs.length))] : -1;
function oneMove(b, p) {
  for (const line of LINES) {
    const vals = line.map(i => b[i]);
    if (vals.filter(x => x === p).length === 2 && vals.includes('')) return line[vals.indexOf('')];
  }
  return -1;
}
// Jogo perfeito: a avaliação de cada estado considera também a vez seguinte.
// Entre alternativas igualmente boas, sorteia para evitar partidas mecânicas.
function minimax(b, turn, cache, ai = 'O') {
  const human = ai === 'O' ? 'X' : 'O';
  if (WIN(b, ai)) return 10 + FREE(b).length;
  if (WIN(b, human)) return -10 - FREE(b).length;
  const free = FREE(b);
  if (!free.length) return 0;
  const key = turn + ':' + b.map(v => v || '-').join('');
  if (cache.has(key)) return cache.get(key);
  let best = turn === ai ? -Infinity : Infinity;
  for (const i of free) {
    b[i] = turn;
    const score = minimax(b, turn === 'O' ? 'X' : 'O', cache, ai);
    b[i] = '';
    best = turn === ai ? Math.max(best, score) : Math.min(best, score);
  }
  cache.set(key, best);
  return best;
}
function perfect(b, rng, ai = 'O') {
  const free = FREE(b), cache = new Map();
  if (!free.length) return -1;
  let best = -Infinity, options = [];
  for (const i of free) {
    b[i] = ai; const sc = minimax(b, ai === 'O' ? 'X' : 'O', cache, ai); b[i] = '';
    if (sc > best) { best = sc; options = [i]; }
    else if (sc === best) options.push(i);
  }
  return RAND(options, rng);
}
// Uma vitória fraudulenta só é desenhada quando dois O adjacentes permitem
// colocar o terceiro O um quadrado *fora* da grade, na mesma reta.
// Direções: 2 horizontais, 2 verticais e as 4 diagonais.
function frauds(b, ai = 'O') {
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  const inside = (x,y) => x>=0 && x<3 && y>=0 && y<3;
  const found = new Map();
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) {
    if (b[y * 3 + x] !== ai) continue;
    for (const [dx,dy] of dirs) {
      const x2 = x + dx, y2 = y + dy;
      if (!inside(x2,y2) || b[y2*3+x2] !== ai) continue;
      for (const [ox,oy] of [[x-dx,y-dy],[x2+dx,y2+dy]]) {
        if (inside(ox,oy)) continue;
        const key = `${ox},${oy}|${x},${y}|${x2},${y2}`;
        found.set(key, {outer: {x: ox, y: oy}, pair: [y*3+x,y2*3+x2]});
      }
    }
  }
  return [...found.values()];
}
function makeFraud(b, rng = Math.random, ai = 'O') { return RAND(frauds(b, ai), rng); }
function choose(mode, b, rng = Math.random, ai = 'O') {
  const free = FREE(b);
  if (!free.length) return -1;
  const human = ai === 'X' ? 'O' : 'X';
  const win = oneMove(b, ai), block = oneMove(b, human);
  if (mode === 'dificil') return perfect(b, rng, ai);
  if (mode === 'facil') {
    if (win !== -1 && rng() < .55) return win;
    if (block !== -1 && rng() < .35) return block;
    return RAND(free, rng);
  }
  if (win !== -1) return win;
  if (block !== -1 && (mode !== 'medio' || rng() < .9)) return block;
  if (mode === 'ladrao') {
    // Se ainda não conseguiu roubar, desenvolve O alinhados perto das bordas.
    const setups = free.filter(i => { b[i] = ai; const ok = frauds(b, ai).length > 0; b[i] = ''; return ok; });
    if (setups.length) return RAND(setups, rng);
  }
  // O Médio procura garfos (dois desfechos de vitória no turno seguinte).
  if (mode === 'medio') {
    const forks = free.filter(i => {
      b[i] = ai; let threats = 0;
      for (const line of LINES) {
        const v = line.map(j => b[j]);
        if (v.filter(x => x === ai).length === 2 && v.includes('')) threats++;
      }
      b[i] = ''; return threats >= 2;
    });
    if (forks.length && rng() < .85) return RAND(forks, rng);
  }
  if (b[4] === '' && rng() < .7) return 4;
  const corners = free.filter(i => [0,2,6,8].includes(i));
  if (corners.length && rng() < .8) return RAND(corners, rng);
  return RAND(free, rng);
}
function rollMode(wins, rng = Math.random) {
  const choices = wins >= 1 ? ['facil','medio','dificil','ladrao'] : ['facil','medio','dificil'];
  return choices[Math.min(choices.length - 1, Math.floor(rng() * choices.length))];
}
const api = Object.freeze({LINES, win: WIN, free: FREE, frauds, makeFraud, choose, rollMode});
window.CQ_TTT = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
