/* ClaQui OS 2.0.5: recuperação do crash da Calculadora sem afetar a System32. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const code = fs.readFileSync(path.join(__dirname, '../assets/js/wm.js'), 'utf8');
const begin = code.indexOf('OS.bsod = function (');
const end = code.indexOf('\n\n// =============== boot, boas-vindas', begin);
assert.ok(begin !== -1 && end !== -1);
const bsod = code.slice(begin, end);
async function exercise(cause) {
  let now = 0, interval, cleared = false, closed = 0, booted = 0, ensured = 0, persisted = 0;
  const signals = [];
  const L = {hidden: true, className: '', innerHTML: '', classList: {contains(name) { return L.className.split(' ').includes(name); }}};
  const nodes = { 'power-layer': L, 'bsod-left': {textContent: null}, 'bsod-fill': {style: {width: ''}} };
  const CQ = {
    apps: {calc: {}}, mono: () => now, game: {persist: () => {persisted++;}}, ui: {closeModal: () => {}},
    vfs: {ensureSystem: () => {ensured++;}},
    bus: {emit: (name) => signals.push(name)}, notify: () => {}
  };
  const WM = {list: () => [{id: 'calc'}], closeAll: () => {closed++;}};
  const OS = {ctx: {hide: () => {}}, bootSequence: async () => {booted++;}};
  const context = {CQ, WM, OS, $: id => nodes[id], closeStart: () => {},
    setInterval: fn => {interval = fn; return 1;}, clearInterval: () => {cleared = true;}};
  vm.runInNewContext(bsod, context);
  const promise = OS.bsod(cause ? {cause} : undefined);
  assert.equal(L.className, 'power-layer bsod');
  assert.equal(persisted, 1);
  assert.equal(ensured, 0);
  const math = cause === 'division-by-zero';
  assert.match(L.innerHTML, math ? /DIVIDE_BY_ZERO/ : /SYSTEM32_NOT_FOUND/);
  assert.deepEqual(signals, [math ? 'calc:crash' : 'sys32:crash']);
  now = math ? 8100 : 10100;
  await interval();
  assert.equal(await promise, true);
  assert.ok(cleared);
  assert.equal(closed, 1);
  assert.equal(booted, math ? 1 : 0);
  assert.equal(ensured, math ? 0 : 1);
  assert.equal(L.hidden, true);
  assert.ok(math ? !signals.includes('sys32:recovered') : signals.includes('sys32:recovered'));
}
(async () => {
  await exercise('division-by-zero');
  await exercise(null);
  console.log('bsod-205: calculadora com boot fictício e System32 original preservada OK');
})().catch(err => {console.error(err);process.exitCode=1;});
