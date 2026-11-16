/* ClassiQuiz (legado 2.0.9, mantido na 26nov16): seeds B7, AI dos dois lados, conquistas offline e PWA. Asserções de SW/versão atualizadas: o SW agora faz pré-cache de tudo. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const {load,LEGACY_DATA,ROOT}=require('./lib/load.js');
let checks=0;const ok=(c,m)=>{assert.ok(c,m);checks++};
const w=load([...LEGACY_DATA,'gen.js','data-b6.js','campaigns-b6.js','gen-b6.js','gen-b7.js']);
const G=w.CQ_GEN;ok(G.bankAvailable('B7'),'B7 disponível');
const ids=new Set(['b7-context-copy','b7-context-refresh','b7-context-properties']);
for(const p of ['T','M','H'])for(const n of [25,50,75,100,150,200,400])for(let z=0;z<30;z++){
 const seed=`CQ1-B7-${p}-${n}-TESTE${p}${n}${String(z).padStart(2,'0')}`;
 const g=G.generate(seed),g2=G.generate(seed);const spots=g.stages.map((s,i)=>ids.has(s.id)?i:-1).filter(i=>i>=0);
 ok(g.bank==='B7'&&g.stages.length===n,'banco B7 '+seed);
 ok(spots.length===1,'uma pergunta contextual '+seed);
 ok(JSON.stringify(g.stages)===JSON.stringify(g2.stages),'B7 determinístico '+seed);
 ok(spots[0]>=3&&spots[0]<n-3,'não nas extremidades '+seed);
 ok(!g.stages.filter(s=>s.kind==='memory').some(s=>s.originId===g.stages[spots[0]].id),'memória preservada '+seed);
}
global.window=global;const T=require('../assets/js/ttt-ai.js');
for(const ai of ['X','O']){
 const human=ai==='X'?'O':'X';
 for(const seed of [.01,.50,.99]){
  let count=0;
  function play(board,turn){
   if(T.win(board,ai)||!T.free(board).length)return;
   ok(!T.win(board,human),'AI perfeito não perde '+ai);
   if(turn==='machine'){
    const i=T.choose('dificil',board,()=>seed,ai);ok(i>=0&&!board[i],'jogada válida '+ai);
    board[i]=ai;play(board,'human');board[i]='';
   }else{for(const i of T.free(board)){board[i]=human;
    if(T.win(board,human))throw Error('AI '+ai+' perdeu');
    play(board,'machine');board[i]='';count++;}}
  }
  play(Array(9).fill(''),'machine');play(Array(9).fill(''),'human');ok(count>20,'sequências várias');
 }
 for(const [pair,expected] of [[ [0,1],[-1,0]],[[0,3],[0,-1]],[[0,4],[-1,-1]],[[2,4],[3,-1]]]){
  const board=Array(9).fill('');board[pair[0]]=board[pair[1]]=ai;
  ok(T.frauds(board,ai).some(v=>v.outer.x===expected[0]&&v.outer.y===expected[1]),'fraude fora do tabuleiro '+ai+pair);
 }
}
// Quando não há shell carregado, as conquistas são escritas diretamente no mesmo store.
const store=new Map();const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))};
const c={window:{},localStorage:storage,console,Date,Math,JSON,requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{}};
c.window=c;c.window.localStorage=storage;vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(ROOT,'assets/js/offline-runner.js'),'utf8'),c);
const runner=c.window.CQ_RUNNER;
runner.earn('offlineSeen');runner.earn('runnerSecret');runner.earn('runner100');runner.earn('runner1000');runner.earn('runner180');runner.earn('runner5000');
for(let i=0;i<10;i++)runner.earn('runnerFlyerDodge');
const ach=JSON.parse(store.get('classiquiz.v1.achievements'));for(const id of ['offline_seen','runner_secret','runner_first','runner_alert','runner_1000','runner_180','runner_5000'])ok(ach.unlocked[id]>0,'conquista '+id);
const sw=fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');ok(sw.includes('asset-manifest.json')&&sw.includes('offline.html'),'SW usa o manifesto de arquivos e mantém offline.html para falhas reais');
const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'manifest.webmanifest'),'utf8'));
ok(manifest.display==='standalone','PWA standalone');
for(const icon of manifest.icons){const bin=fs.readFileSync(path.join(ROOT,icon.src));ok(bin.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')),'ícone PNG '+icon.src);}
for(const file of ['index.html','version.json','assets/offline-sad.svg','assets/js/touchpad.js','assets/js/apps-browser.js'])ok(fs.existsSync(path.join(ROOT,file)),'arquivo '+file);
const sad=fs.readFileSync(path.join(ROOT,'assets/offline-sad.svg'),'utf8');
const colors=[...sad.matchAll(/#([A-Fa-f0-9]{6})\b/g)].map(m=>m[1].toLowerCase());
ok(colors.length>5&&colors.every(c=>c.slice(0,2)===c.slice(2,4)&&c.slice(2,4)===c.slice(4,6)),'ícone triste totalmente cinza');
const index=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');ok(index.includes('assets/js/gen-b7.js')&&index.includes('manifest.webmanifest'),'index B7 PWA');
const update=JSON.parse(fs.readFileSync(path.join(ROOT,'version.json'),'utf8'));ok(/^\d{2}[a-z]{3}\d{2}(\.\d+)?$/.test(update.version),'versão por data');
const wm=fs.readFileSync(path.join(ROOT,'assets/js/wm.js'),'utf8');ok(wm.includes('maximized: true'),'janelas maximizadas');
console.log('ClassiQuiz 2.0.9: '+checks+' verificações OK (B7=630 seeds, Minimax X/O, conquistas offline, PWA e janela).');
