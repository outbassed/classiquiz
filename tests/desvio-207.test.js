/* Testes do arcade original Desvio CQ e da reorganização do ClaQui OS. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
let points=0, stats=[];const store=new Map();
const ctx={window:{},performance:{now:()=>1000},console,
  setInterval:()=>25,clearInterval:()=>{},setTimeout:()=>0,
  Math:Object.assign(Object.create(Math),{random:()=>.0})};
ctx.window.CQ={apps:{},game:{statApp:k=>stats.push(k)},store:{read:(k,fb)=>store.get(k)??fb,write:(k,v)=>{store.set(k,v);return true}},tone:()=>{},E:x=>String(x),os:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/apps-desvio.js'),'utf8'),ctx);
const D=ctx.window.CQ_DESVIO_TEST; assert(D && ctx.window.CQ.apps.desvio);points++;
for(const level of [1,10,25,50,100,256,1000]){
  const o=D.makeObstacle(level,240,()=>.5);
  assert(o.x>=0&&o.x+o.w<=480 && o.y<0 && o.v>0 && o.v<=250);points++;
}
D.start(); assert.equal(stats.filter(k=>k==='desvioPlayed').length,1);points++;
// Movimento para a direita dentro do tabuleiro (sem atravessar as paredes).
D.state.motion.right=true;D.tick(.08);assert(D.state.x>240);D.state.motion.right=false;points++;
// Completar 100 níveis sem existir tela de vitória ou bloqueio no 10/25/50/100.
// O temporizador é avançado deterministicamente, sem aguardar tempo real.
for(let level=1;level<=100;level++){
  D.state.levelTime=19.96;
  D.state.ob=[];D.state.items=[];D.state.spawn=0;D.state.itemClock=0;
  D.state.x=240;D.state.y=330;D.state.shield=50;D.state.invuln=0;
  D.tick(.08);
  assert.equal(D.state.level,level+1);
  assert.equal(D.state.over,false);
  points++;
}
assert(stats.includes('desvioWin') && stats.includes('desvioMaster') && stats.includes('desvio50') && stats.includes('desvio100'));points++;
assert.equal(stats.filter(k=>k==='desvioLevels').length,100);points++;
assert(stats.includes('desvioClean'));points++;
assert.equal(store.get('classiquiz.v1.desvio.bestlevel'),101);points++;
D.state.level=255;D.state.levelTime=19.96;D.state.ob=[];D.state.items=[];D.state.spawn=0;
D.tick(.08);assert.equal(D.state.level,256);assert.equal(D.state.over,false);points++;
D.state.level=999;D.state.levelTime=19.96;D.state.ob=[];D.state.items=[];D.state.spawn=0;
D.tick(.08);assert.equal(D.state.level,1000);assert.equal(D.state.over,false);points++;
// Reiniciar deve preservar o timer da janela aberta.
D.state.timer=321;D.reset();assert.equal(D.state.timer,321);assert.equal(D.state.alive,3);assert.equal(D.state.bestLevel,1000);points++;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const desktop=html.match(/<nav id="desktop-launchers"[^>]*>([\s\S]*?)<\/nav>/)[1];
const extract=[...desktop.matchAll(/data-app="([^"]+)"[^>]*class="desktop-shortcut"/g)].map(m=>m[1]);
assert.deepEqual(extract,['new','resume','library','achievements','settings','rewards','about','mais']);points++;
assert(html.includes('apps-desvio.js') && !html.includes('apps-pac.js'));points++;
const sys=fs.readFileSync(path.join(root,'assets/js/apps-system.js'),'utf8');
assert(!sys.includes('A.outros = folder('));points++;
for(const id of ['favorites','updates','notepad','paint','calc','mines','ttt','snake','desvio','pong','clock','viewer','player','trash'])assert(sys.includes(`['${id}',`));points++;
const app=fs.readFileSync(path.join(root,'assets/js/app.js'),'utf8');
assert(!app.includes("['g_pac_") && app.includes("['g_desvio_play'"));points++;
const wm=fs.readFileSync(path.join(root,'assets/js/wm.js'),'utf8');
const osCSS=fs.readFileSync(path.join(root,'assets/css/os.css'),'utf8');
for(const id of ['mines','ttt','snake','desvio','pong','notepad','paint','calc','calendar','clock','explorer','trash','favorites','updates','dev'])assert(wm.includes(`['${id}',`),id);
assert(wm.includes('start-menu-scroll') && wm.includes('start-menu-power'));points++;
assert(osCSS.includes('.start-menu-scroll{flex:1 1 auto;overflow-y:auto') && osCSS.includes('.start-menu-power{flex:0 0 auto'));points++;
console.log(`Desvio CQ / atalhos v2.0.8: ${points} verificações OK`);
