/* Testes independentes para o motor do Jogo da Velha v2.0.1. */
'use strict';
const assert = require('node:assert/strict');
global.window = global;
const T = require('../assets/js/ttt-ai.js');
let checks = 0;
const ok = (v, label) => { assert.ok(v, label); checks++; };
const eq = (v, e, label) => { assert.deepEqual(v, e, label); checks++; };
const blank = () => Array(9).fill('');
eq(T.rollMode(0, () => .00), 'facil', 'sem vitórias: fácil');
eq(T.rollMode(0, () => .34), 'medio', 'sem vitórias: médio');
eq(T.rollMode(0, () => .67), 'dificil', 'sem vitórias: difícil');
for (let i = 0; i < 100; i++) ok(T.rollMode(0, () => i/100) !== 'ladrao', 'Ladrão bloqueado antes da primeira vitória');
for (let wins of [1, 2, 11, 100]) {
  eq(T.rollMode(wins, () => .00), 'facil', 'sorteio fácil');
  eq(T.rollMode(wins, () => .25), 'medio', 'sorteio médio');
  eq(T.rollMode(wins, () => .50), 'dificil', 'sorteio difícil');
  eq(T.rollMode(wins, () => .75), 'ladrao', 'sorteio Ladrão liberado');
}
const counts = {facil:0, medio:0, dificil:0, ladrao:0};
for (let i=0; i<20000; i++) counts[T.rollMode(1, () => (i+.5)/20000)]++;
eq(counts, {facil:5000,medio:5000,dificil:5000,ladrao:5000}, '25% por modo após a primeira vitória');
const forced = [['O','O',''],['O','O',''],['O','O','']];
const patterns = [
 [[0,1],{x:-1,y:0}], [[1,2],{x:3,y:0}],
 [[0,3],{x:0,y:-1}], [[3,6],{x:0,y:3}],
 [[0,4],{x:-1,y:-1}], [[4,8],{x:3,y:3}],
 [[2,4],{x:3,y:-1}], [[4,6],{x:-1,y:3}],
];
for (const [pair, outer] of patterns) {
  const b = blank(); b[pair[0]] = b[pair[1]] = 'O';
  ok(T.frauds(b).some(f => f.outer.x === outer.x && f.outer.y === outer.y),
    `fraude possível fora da grade: ${outer.x},${outer.y}`);
}
const bNo = blank(); bNo[0] = 'O'; bNo[8] = 'O';
eq(T.frauds(bNo).length, 0, 'O não adjacentes não criam fraude');
// Propriedade essencial: Minimax jamais perde contra todas as escolhas do humano.
for (const seed of [.01,.50,.99]) {
  const visited = new Set(); let n=0;
  function play(board) {
    const key = board.map(v => v || '-').join('');
    if (visited.has(key)) return;
    visited.add(key);
    ok(!T.win(board,'X'), 'minimax nunca permitiu vitória X');
    if (T.win(board,'O') || !T.free(board).length) return;
    for (const i of T.free(board)) {
      board[i] = 'X';
      if (T.win(board,'X')) {
        throw Error(`Dificuldade difícil perdeu com tabuleiro ${board}`);
      }
      if (!T.free(board).length) { board[i] = ''; continue; }
      const m = T.choose('dificil',board,() => seed);
      ok(board[m] === '', 'movimento válido do Minimax');
      board[m] = 'O'; n++;
      play(board);
      board[m] = ''; board[i] = '';
    }
  }
  play(blank());
  ok(n>30, 'múltiplas sequências analisadas');
}
console.log(`Jogo da Velha 2.0.1: ${checks} verificações OK`);
