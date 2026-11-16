/* Paciência (Klondike): distribuição, regras de movimento, desfazer e vitória. */
'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const {ROOT}=require('./lib/load.js');let checks=0;const ok=(c,m)=>{assert.ok(c,m);checks++};
const CQ={E:s=>String(s),os:{wm:{}},apps:{},store:{read:(k,f)=>f,write(){},remove(){}},bus:{on(){},emit(){}},tone(){}};
const c={window:{CQ},console,Math,JSON,Date,performance:{now:()=>0}};c.window=c.window;vm.createContext(c);c.CQ=CQ;
vm.runInContext(fs.readFileSync(path.join(ROOT,'assets/js/apps-solitaire.js'),'utf8'),Object.assign(c,{window:{CQ}}));
const S=CQ.solitaire;ok(S&&CQ.apps.solitaire,'módulo e app registrados');
const rng=seed=>{let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};};
for(let seed=1;seed<=200;seed++){
  const g=S.deal(rng(seed));const all=[...g.stock,...g.waste,...g.found.flat(),...g.tab.flat()];
  ok(all.length===52&&new Set(all.map(x=>x.s*20+x.r)).size===52,'52 cartas únicas '+seed);
  ok(g.tab.every((t,i)=>t.length===i+1&&t.slice(0,-1).every(x=>!x.up)&&t[t.length-1].up),'coluna '+seed+' com a última virada');ok(g.stock.length===24&&g.stock.every(x=>!x.up),'monte com 24');
}
// regras
const card=(s,r,up=true)=>({s,r,up});const mkg=()=>({stock:[],waste:[],found:[[],[],[],[]],tab:[[],[],[],[],[],[],[]],moves:0,won:false,undo:[]});
{const g=mkg();g.tab[0]=[card(1,5)];g.tab[1]=[card(0,4)];ok(S.canPlace(g,[card(0,4)],'t0'),'4♠ (preta) sobre 5♥ (vermelha)');ok(S.canPlace(g,[card(3,4)],'t0'),'4♣ também (preta) sobre 5♥');ok(!S.canPlace(g,[card(2,4)],'t0'),'4♦ (vermelha) não vai sobre 5♥');ok(!S.canPlace(g,[card(0,6)],'t0'),'valor errado');
 ok(S.canPlace(g,[card(0,13)],'t3')&&!S.canPlace(g,[card(0,12)],'t3'),'coluna vazia só aceita Rei');
 ok(S.canPlace(g,[card(2,1)],'f0')&&!S.canPlace(g,[card(2,2)],'f0'),'fundação começa no Ás');g.found[0]=[card(2,1)];ok(S.canPlace(g,[card(2,2)],'f0')&&!S.canPlace(g,[card(1,2)],'f0'),'mesmo naipe em sequência');ok(!S.canPlace(g,[card(2,2),card(0,1)],'f0'),'fundação só recebe uma carta por vez');
 g.tab[2]=[card(0,9,false)];ok(!S.canPlace(g,[card(1,8)],'t2'),'não se coloca sobre carta virada');}
{const g=mkg();g.tab[0]=[card(3,9,false),card(1,8),card(0,7)];g.tab[1]=[card(0,9)];ok(S.move(g,'t0',1,'t1'),'move sequência de 2 cartas');ok(g.tab[1].length===3&&g.tab[0].length===1&&g.tab[0][0].up,'a carta virada é revelada');ok(g.moves===1,'conta movimentos');
 ok(S.undo(g)&&g.tab[0].length===3&&!g.tab[0][0].up&&g.tab[1].length===1,'desfazer restaura tudo, inclusive a carta virada');ok(!S.undo(g),'sem mais o que desfazer');}
{const g=S.deal(rng(5));const n=g.stock.length;S.drawCard(g);ok(g.waste.length===1&&g.waste[0].up&&g.stock.length===n-1,'comprar vira a carta');for(let i=0;i<n;i++)S.drawCard(g);ok(g.stock.length===n&&g.waste.length===0&&g.stock.every(x=>!x.up),'monte vazio recicla o descarte');}
// vitória: coloca tudo nas fundações
{const g=mkg();for(let s=0;s<4;s++)for(let r=1;r<=12;r++)g.found[s].push(card(s,r));for(let s=0;s<4;s++)g.tab[s]=[card(s,13)];ok(S.allUp(g),'tudo virado habilita completar');for(let s=0;s<4;s++)ok(S.toFoundation(g,'t'+s,0),'Rei '+s+' para a fundação');ok(g.won,'vitória detectada');}
ok(!S.toFoundation(Object.assign(mkg(),{tab:[[card(0,5),card(0,7)],[],[],[],[],[],[]]}),'t0',0),'só a carta do topo vai para a fundação');
console.log(`Paciência 26nov16: ${checks} verificações OK.`);
