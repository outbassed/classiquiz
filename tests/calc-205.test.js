/* Calculadora 2.0.5: primeira divisão por zero, ocorrências posteriores e persistência. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname, '../assets/js/apps-tools.js'), 'utf8');
const saved = new Map();
const crashes = [], events = [];
let checks = 0;
function startContext(randomResult = 0.91) {
  const CQ = {
    apps: {}, vfs: {}, os: {wm: {}, bsod: data => crashes.push(data)},
    store: {read: (k, fallback) => saved.has(k) ? saved.get(k) : fallback, write: (k, v) => {saved.set(k, v); return true;}},
    E: x => String(x), tone: () => {}, bus: {emit: (name, data) => events.push({name, data})}
  };
  const mockMath = Object.create(Math); mockMath.random = () => randomResult; // Sorteio determinístico: ramo de erro.
  const context = {window: {CQ}, Math: mockMath, setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {}, console, Date};
  vm.runInNewContext(src, context);
  const fields = {};
  for (const id of ['#calc-disp', '#calc-hist', '#calc-op', '#calc-warning']) fields[id] = {textContent: '', innerHTML: '', hidden: true};
  fields['.calc'] = {classList: {add: () => {}, remove: () => {}}, offsetWidth: 40, focus: () => {}};
  const handlers = {};
  const w = {body: {innerHTML: '', querySelector: key => fields[key], addEventListener: (event, cb) => {handlers[event] = cb;}}, setTitle: () => {}, setStatus: () => {}};
  CQ.apps.calc.render(w);
  const tap = k => handlers.click({target: {closest: () => ({dataset: {k}})}});
  const run = (...keys) => keys.forEach(tap);
  return {CQ, fields, run, w};
}
const first = startContext();
first.run('1','0','÷','0','=');
assert.equal(crashes.length, 1); checks++;
assert.equal(crashes[0].cause, 'division-by-zero'); checks++;
assert.equal(saved.get('classiquiz.v1.calc.divideZeroSeen'), true); checks++;
assert.equal(events.filter(x => x.name === 'calc:divide-zero').length, 1); checks++;
assert.equal(events.find(x => x.name === 'calc:divide-zero').data.first, true); checks++;
assert.equal(events.filter(x => x.name === 'calc:result').length, 0); checks++;
first.run('C','0','÷','0','=');
assert.equal(crashes.length, 1); checks++;
assert.match(first.fields['#calc-warning'].textContent, /Erro fatal de matemática/); checks++;
assert.equal(first.fields['#calc-warning'].hidden, false); checks++;
first.run('C','9','÷','3','=');
assert.equal(first.fields['#calc-disp'].textContent, '3'); checks++;
assert.equal(first.fields['#calc-warning'].hidden, true); checks++;
assert.equal(events.filter(x => x.name === 'calc:result').length, 1); checks++;
first.run('C','5','÷','0','+');
assert.equal(crashes.length, 1); checks++;
assert.match(first.fields['#calc-warning'].textContent, /Erro fatal de matemática/); checks++;
first.CQ.apps.calc.onClose();
// Metade das ocorrências seguintes ainda pode causar a tela azul (sorteio < 0,5).
const reopened = startContext(0.91);
reopened.run('2','÷','0','=');
assert.equal(crashes.length, 1); checks++;
assert.match(reopened.fields['#calc-warning'].textContent, /Erro fatal de matemática/); checks++;
assert.equal(events.filter(x => x.name === 'calc:divide-zero').length, 4); checks++;
const unlucky = startContext(0.1);
unlucky.run('1','÷','0','=');
assert.equal(crashes.length, 2); checks++;
assert.equal(events.at(-1).data.first, false); checks++;
const lucky = startContext(0.9);
lucky.run('1','÷','0','=');
assert.equal(crashes.length, 2); checks++;
assert.match(lucky.fields['#calc-warning'].textContent, /Erro fatal de matemática/); checks++;
console.log(`calc-205: ${checks} verificações OK (primeira vez, sequência, reabertura, persistência)`);
