#!/usr/bin/env node
/* ClassiQuiz — ferramenta de build/release. Gera, de forma reproduzível:
     assets/js/build-info.js  (versão + compilação embutidas no cliente)
     version.json             (consultado pelo ClaQui Update, sempre sem cache)
     asset-manifest.json      (lista de TODOS os arquivos do jogo, com tamanho e hash SHA-256)
     sw.js                    (apenas a linha BUILD é carimbada; o restante é código-fonte escrito à mão)
   Uso:
     node tools/build.js                      -> carimba usando a data/hora REAIS (America/Sao_Paulo); gera .1, .2... se já houve release no dia
     node tools/build.js --check              -> só valida que os arquivos gerados estão coerentes com o disco (usado nos testes)
     node tools/build.js --version 26nov16 --build 16112026.135032 --summary "texto"   -> força valores (testes/reprodução)
   O nome da versão é DDmmmAA[.N]: dia, mês em português abreviado, ano com 2 dígitos; N só a partir do 2º lançamento do dia.
   A compilação é DDMMAAAA.HHMMSS. Versões antigas (2.0.9 etc.) não são renomeadas. */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..');
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const RUNTIME_ROOTS = ['index.html', 'offline.html', 'manifest.webmanifest', 'assets'];   // o que o PWA precisa para funcionar offline
const args = process.argv.slice(2), opt = n => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };

function saoPaulo(d = new Date()) {   // calendário e fuso brasileiros, independente do fuso da máquina
  const f = new Intl.DateTimeFormat('en-GB', {timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'});
  const p = Object.fromEntries(f.formatToParts(d).filter(x => x.type !== 'literal').map(x => [x.type, x.value]));
  return {y: +p.year, m: +p.month, d: +p.day, H: +p.hour, M: +p.minute, S: +p.second};
}
const pad = (n, l = 2) => String(n).padStart(l, '0');
const dayBase = t => `${pad(t.d)}${MONTHS[t.m - 1]}${pad(t.y % 100)}`;
const buildId = t => `${pad(t.d)}${pad(t.m)}${t.y}.${pad(t.H)}${pad(t.M)}${pad(t.S)}`;
function readJson(f, fb) { try { return JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch { return fb; } }

function walk(rel, out) {
  const abs = path.join(ROOT, rel), st = fs.statSync(abs);
  if (st.isDirectory()) { for (const n of fs.readdirSync(abs).sort()) walk(rel + '/' + n, out); }
  else out.push(rel.replace(/\\/g, '/'));
}
function listRuntimeFiles() { const out = []; for (const r of RUNTIME_ROOTS) walk(r, out); return out.filter(f => !/\.(map|log)$|\.DS_Store$/.test(f)).sort(); }
function hashFile(rel) { const b = fs.readFileSync(path.join(ROOT, rel)); return {size: b.length, sha256: crypto.createHash('sha256').update(b).digest('hex')}; }

function nextVersion(prev, now) {
  const base = dayBase(now);
  if (!prev || typeof prev.version !== 'string') return base;
  const m = prev.version.match(/^(\d{2}[a-z]{3}\d{2})(?:\.(\d+))?$/);
  if (!m || m[1] !== base) return base;                  // outro dia (ou versão legada): volta ao nome sem sufixo
  return `${base}.${(m[2] ? +m[2] : 0) + 1}`;            // mesmo dia: .1, .2, ...
}
function uniqueBuild(prevBuild, now) {                     // identificadores de build nunca se repetem
  let id = buildId(now), t = {...now};
  while (id === prevBuild) { t.S++; if (t.S > 59) { t.S = 0; t.M++; } if (t.M > 59) { t.M = 0; t.H = Math.min(23, t.H + 1); } id = buildId(t); }
  return id;
}
function stampSw(build) {
  const f = path.join(ROOT, 'sw.js'); let s = fs.readFileSync(f, 'utf8');
  const next = s.replace(/^const BUILD = '[^']*';.*$/m, `const BUILD = '${build}'; // carimbado por tools/build.js`);
  if (next !== s) fs.writeFileSync(f, next);
}
function generate() {
  const prev = readJson('version.json', null), now = saoPaulo();
  const version = opt('version') || nextVersion(prev, now), build = opt('build') || uniqueBuild(prev && prev.build, now);
  if (!/^\d{2}[a-z]{3}\d{2}(\.\d+)?$/.test(version)) throw Error('versão inválida: ' + version);
  if (!/^\d{8}\.\d{6}$/.test(build)) throw Error('compilação inválida: ' + build);
  const summary = opt('summary') || (prev && prev.summary) || 'ClassiQuiz';
  const iso = `${now.y}-${pad(now.m)}-${pad(now.d)}`;
  const info = {version, build, releasedAt: opt('date') || iso, summary, previous: prev ? {version: prev.version, build: prev.build || null} : null};
  fs.writeFileSync(path.join(ROOT, 'assets/js/build-info.js'),
    `/* GERADO por tools/build.js — não edite à mão. */\nwindow.CQ_BUILD=${JSON.stringify({version, build, releasedAt: info.releasedAt})};\n`);
  fs.writeFileSync(path.join(ROOT, 'version.json'), JSON.stringify({version, build, releasedAt: info.releasedAt, summary, notes: readJson('version.json', {}).notes || []}, null, 2) + '\n');
  stampSw(build);
  const files = listRuntimeFiles().map(f => ({path: f, ...hashFile(f)}));
  fs.writeFileSync(path.join(ROOT, 'asset-manifest.json'), JSON.stringify({version, build, count: files.length, files}) + '\n');
  console.log(`release ${version}  compilação ${build}  (${files.length} arquivos no pré-cache)`);
}
function check() {
  const problems = [], vj = readJson('version.json', null), man = readJson('asset-manifest.json', null);
  const bi = fs.readFileSync(path.join(ROOT, 'assets/js/build-info.js'), 'utf8'), sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  if (!vj || !man) return ['version.json ou asset-manifest.json ausente'];
  if (vj.version !== man.version || vj.build !== man.build) problems.push('version.json e asset-manifest.json divergem');
  if (!bi.includes(`"version":"${vj.version}"`) || !bi.includes(`"build":"${vj.build}"`)) problems.push('build-info.js diverge de version.json');
  if (!sw.includes(`const BUILD = '${vj.build}'`)) problems.push('sw.js carimbado com outra compilação');
  const disk = listRuntimeFiles(), inMan = new Set(man.files.map(f => f.path));
  for (const f of disk) if (!inMan.has(f)) problems.push('arquivo fora do manifesto: ' + f);
  for (const f of man.files) { if (!fs.existsSync(path.join(ROOT, f.path))) { problems.push('manifesto cita arquivo inexistente: ' + f.path); continue; } const h = hashFile(f.path); if (h.sha256 !== f.sha256) problems.push('hash diferente (rode tools/build.js): ' + f.path); }
  return problems;
}
if (require.main === module) {
  if (args.includes('--check')) { const p = check(); if (p.length) { console.error(p.join('\n')); process.exit(1); } console.log('build coerente'); }
  else generate();
}
module.exports = {nextVersion, uniqueBuild, dayBase, buildId, saoPaulo, MONTHS, listRuntimeFiles};
