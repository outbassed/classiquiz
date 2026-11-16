/* Offline Runner 26nov16: física, justiça das colisões, independência de taxa de quadros e conquistas. */
'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const {ROOT}=require('./lib/load.js');
let checks=0;const ok=(c,m)=>{assert.ok(c,m);checks++};
const store=new Map();const storage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))};
const c={window:{},localStorage:storage,console,Date,Math,JSON};c.window=c;vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(ROOT,'assets/js/offline-runner.js'),'utf8'),c);
const R=c.CQ_RUNNER,P=R.PARAMS;
// --- parâmetros: pulo MAIS ALTO e ágil, velocidade inicial MAIS ALTA que a versão 2.0.9 (pico ~68, v0 175, queda lenta)
ok(R.peak()>=100,'pulo alcança 100+ unidades (antes ~68): '+R.peak().toFixed(1));ok(R.airtime()<.6,'salto rápido, sem câmera lenta: '+R.airtime().toFixed(3)+' s');
ok(P.V0>175,'velocidade inicial maior que a antiga (175)');ok(P.VMAX>=520&&P.VMAX<=800,'velocidade máxima razoável');ok(P.FALL>1,'queda mais rápida que a subida');
const rng=seed=>{let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};};
function newSim(seed,worldW=500){const ev=[];const sim=R.createSim({rng:rng(seed),worldW,onEvent:(e,k)=>ev.push([e,k])});sim.layout(worldW,70);sim.ev=ev;return sim;}
// --- piso físico: o pulo realmente chega ao pico previsto, depois cai
{const sim=newSim(1);let top=0,t=0;sim.jump();while(sim.st.y>0||t===0){sim.step(P.STEP);t+=P.STEP;top=Math.max(top,sim.st.y);if(t>2)break;}
 ok(top>=100&&Math.abs(top-R.peak())<4.5,'pico simulado ~ analítico '+top.toFixed(1));ok(top>=100,'pulo simulado chega a 100+ unidades');ok(Math.abs(t-R.airtime())<.03,'tempo no ar simulado = analítico '+t.toFixed(3));}
// --- aceleração progressiva e justa
{const sim=newSim(2);const sp=[];for(let i=0;i<120*130;i++){sim.st.live=true;sim.st.ob=[];sim.step(P.STEP);if(i%(120*10)===0)sp.push(sim.st.speed);}
 ok(sp.every((v,i)=>i===0||v>=sp[i-1]),'velocidade nunca diminui');ok(sp[0]<=P.V0+1&&sp[sp.length-1]<=P.VMAX,'dentro dos limites');ok(sp[6]-sp[0]<=P.ACC*61,'aceleração gradual');}
// --- distância entre obstáculos: sempre MAIOR que o alcance do salto (tolerância humana) e maior que a versão antiga
for(const seed of [3,4,5]){const sim=newSim(seed);const spawned=[];let last=null;
 for(let i=0;i<120*200&&sim.st.live;i++){const before=sim.st.ob.length;const ids=new Set(sim.st.ob);
  // bot perfeito para sobreviver e medir
  const st=sim.st,nxt=st.ob.find(o=>o.x+o.w>st.px+5);if(nxt){const d=nxt.x-(st.px+31);if(nxt.type==='alert'&&nxt.b>20)sim.duck(true);else{sim.duck(false);if(d<st.speed*.17&&d>-5&&st.y===0)sim.jump();}}else sim.duck(false);
  sim.step(P.STEP);for(const o of st.ob)if(!ids.has(o)){if(last&&!(o.x-last.x<last.w+40&&o.type===last.type&&o.x-last.x<80))spawned.push((o.x-last.x)/Math.max(1,st.speed));last=o;}}
 ok(sim.st.live,'bot com tempo de reação humano sobrevive 200 s (seed '+seed+')');
 ok(spawned.length>20,'obstáculos suficientes');ok(Math.min(...spawned)>=R.airtime()*.9,'intervalo mínimo entre obstáculos ('+Math.min(...spawned).toFixed(2)+' s) cobre o tempo de salto ('+R.airtime().toFixed(2)+' s)');}
// --- independência da taxa de quadros: mesma partida em 30, 60, 90, 144 e 240 Hz => resultados idênticos
function play(fps,seed){const sim=newSim(seed);let acc=0,cnt=0;const N=120*90,dt=1/fps;while(sim.st.live&&cnt<N){acc+=dt;while(acc>=P.STEP&&cnt<N&&sim.st.live){const st=sim.st,nxt=st.ob.find(o=>o.x+o.w>st.px+5);if(nxt){const d=nxt.x-(st.px+31);if(nxt.type==='alert'&&nxt.b>20)sim.duck(true);else{sim.duck(false);if(d<st.speed*.17&&d>-5&&st.y===0)sim.jump();}}else sim.duck(false);sim.step(P.STEP);acc-=P.STEP;cnt++;}}
 return JSON.stringify([Math.round(sim.st.score*1000),sim.st.passed,sim.st.live,sim.st.flyers]);}
const ref=play(60,7);for(const f of [30,45,90,120,144,240])ok(play(f,7)===ref,'mesma física a '+f+' Hz');
// --- colisões justas (casos construídos à mão)
function setup(o,y=0,duck=false){const sim=newSim(9);sim.st.ob=[Object.assign({passed:false,x:sim.st.px+5,w:30,h:40,b:0,type:'file'},o)];sim.st.y=y;sim.st.vy=0;sim.st.duck=duck;sim.st.dist=-1e9;return sim;}
{let s=setup({});s.step(P.STEP);ok(!s.st.live,'parado no chão colide com arquivo');
 s=setup({x:600});for(let i=0;i<20;i++)s.step(P.STEP);ok(s.st.live,'obstáculo longe não colide');
 s=setup({h:46});s.st.y=60;s.st.vy=0;s.step(P.STEP/10);ok(s.st.live,'altura 60 > obstáculo de 46: passa por cima (com folga)');
 s=setup({type:'alert',w:34,h:28,b:26});s.st.duck=true;s.step(P.STEP);ok(s.st.live,'abaixado passa por baixo do alerta alto');
 s=setup({type:'alert',w:34,h:28,b:26});s.step(P.STEP);ok(!s.st.live,'em pé colide com o alerta alto');
 s=setup({type:'alert',w:34,h:28,b:6});s.st.duck=true;s.step(P.STEP);ok(!s.st.live,'abaixado NÃO passa pelo alerta baixo (precisa pular)');
 s=setup({type:'alert',w:34,h:28,b:6},40);s.step(P.STEP);ok(s.st.live,'pulando passa por cima do alerta baixo');}
// --- buffer de pulo: apertar um pouco antes de pousar ainda pula
{const s=newSim(11);s.st.ob=[];s.st.dist=-1e9;s.jump();for(let i=0;i<Math.floor(R.airtime()/P.STEP)-6;i++)s.step(P.STEP);s.jump();let jumpedAgain=false;for(let i=0;i<60;i++){s.step(P.STEP);if(s.st.vy>600)jumpedAgain=true;}ok(jumpedAgain,'pulo antecipado é lembrado por ~0,1 s');}
// --- mundo largo/estreito: layout não reinicia a partida nem muda a física
{const s=newSim(12,480);for(let i=0;i<500;i++){s.st.ob=[];s.step(P.STEP);}const sc=s.st.score;s.layout(900,110);s.layout(300,48);ok(s.st.score===sc&&s.st.live,'redimensionar não reinicia');ok(s.st.px===48,'posição do jogador se adapta');}
// --- eventos e conquistas: metas disparam uma vez por partida
{const s=newSim(13);s.st.ob=[];s.st.dist=-1e9;for(let i=0;i<120*200;i++){s.st.ob=[];s.step(P.STEP);}const goals=s.ev.filter(e=>e[0]==='goal').map(e=>e[1]);for(const g of ['runner100','runner1000','runner180'])ok(goals.filter(x=>x===g).length===1,'meta '+g+' dispara uma única vez');}
// --- conquistas gravadas mesmo sem o sistema (tela offline global) e sem duplicar
R.earn('offlineSeen');R.earn('runnerSecret');R.earn('runner100');R.earn('runner1000');R.earn('runner180');R.earn('runner5000');for(let i=0;i<10;i++)R.earn('runnerFlyerDodge');
const ach=JSON.parse(store.get('classiquiz.v1.achievements'));for(const id of ['offline_seen','runner_secret','runner_first','runner_alert','runner_1000','runner_180','runner_5000'])ok(ach.unlocked[id],'conquista '+id);
const t0=ach.unlocked.runner_secret;R.earn('runnerSecret');ok(JSON.parse(store.get('classiquiz.v1.achievements')).unlocked.runner_secret===t0,'desbloqueio não é regravado');
store.set('classiquiz.v1.achievements',JSON.stringify({unlocked:{},stats:{},disabled:true}));R.earn('runner100');ok(!JSON.parse(store.get('classiquiz.v1.achievements')).unlocked.runner_first,'respeita conquistas desativadas pelo Terminal');
// --- legado: chave de recorde preservada
store.set('classiquiz.v1.runner',JSON.stringify({best:1234,played:7}));ok(R.record().best===1234,'recorde legado preservado');
// --- código: sem atalhos para o Runner no menu/Mais opções (agora é segredo do navegador)
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
ok(!/\['runner'/.test(rd('assets/js/wm.js'))&&!/\['runner'/.test(rd('assets/js/apps-system.js')),'sem atalho do Runner em Iniciar / Mais opções');
ok(!fs.existsSync(path.join(ROOT,'assets/js/apps-runner.js'))&&!rd('index.html').includes('apps-runner'),'app runner standalone removido');
ok(rd('assets/js/apps-browser.js').includes("data-br=\"sad\"")&&rd('assets/js/apps-browser.js').includes('startRunner'),'Runner abre pelo rostinho triste do navegador');
console.log(`Offline Runner 26nov16: ${checks} verificações OK.`);
