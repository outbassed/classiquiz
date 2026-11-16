// Verifica que as seeds históricas B1–B5 (e Ultra B5) geram EXATAMENTE as mesmas sequências da v1.2.2.
const {load,LEGACY_DATA}=require('./lib/load');
const fx=require('./fixtures/legacy-seeds.json');
const W=load([...LEGACY_DATA,'gen.js']);const G=W.CQ_GEN;
const fnv=str=>{let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16);};
let bad=0,n=0;
for(const r of fx.rows){
  n++;let got;
  try{const g=G.generate(r.seed);got={ok:true,sig:fnv(JSON.stringify(g.stages))+':'+g.stages.length};}catch(e){got={ok:false,err:e.message};}
  if(got.ok!==r.ok||(r.ok&&got.sig!==r.sig)||(!r.ok&&got.err!==r.err)){bad++;console.log('DIFERENTE',r.seed,JSON.stringify(got),r.sig||r.err);}
}
for(const r of fx.ultra){
  n++;let got;
  try{const g=G.generateUltraB5(r.p,1,r.seed);got={ok:true,sig:fnv(JSON.stringify(g.stages))+':'+g.stages.length,count:g.count};}catch(e){got={ok:false,err:e.message};}
  if(got.ok!==r.ok||(r.ok&&(got.sig!==r.sig||got.count!==r.count))){bad++;console.log('ULTRA DIFERENTE',r.seed,JSON.stringify(got),r.sig);}
}
for(const k of Object.keys(fx.caps)){n++;const bank=k.slice(0,2),p=k.slice(2);if(G.capacity(p,bank)!==fx.caps[k]){bad++;console.log('CAPACIDADE DIFERENTE',k,G.capacity(p,bank),fx.caps[k]);}}
for(const p of ['T','M','H']){n++;if(G.ultraCountB5(p)!==fx.ultraCounts[p]){bad++;console.log('ULTRA COUNT DIFERENTE',p);}}
console.log(`legacy-seeds: ${n} verificações, ${bad} diferenças`);
process.exit(bad?1:0);
