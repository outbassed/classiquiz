/* Banco B7: acrescenta desafios de menu contextual sem modificar qualquer seed B1–B6. MIT. */
(() => {
'use strict';
const G = window.CQ_GEN, B6 = G.BANKS.B6;
const challenges = [
  {id:'b7-context-copy',kind:'trick',mode:'context-copy',theme:'informática',difficulty:'medium',addedMonth:'11/2026',text:'Qual comando permite copiar um texto selecionado sem remover o original?'},
  {id:'b7-context-refresh',kind:'trick',mode:'context-refresh',theme:'sistema',difficulty:'medium',addedMonth:'11/2026',text:'Qual comando atualiza a visualização sem fechar a janela?'},
  {id:'b7-context-properties',kind:'trick',mode:'context-info',theme:'sistema',difficulty:'medium',addedMonth:'11/2026',text:'Qual opção permite consultar detalhes de um item sem abri-lo?'}
];
function build(meta) {
  const g=B6.generate(meta); g.bank='B7';
  const forbidden=new Set(g.stages.filter(s=>s.kind==='memory').map(s=>s.originId).filter(Boolean));
  const from=Math.max(3,Math.floor(g.count*.12)),to=Math.min(g.count-4,Math.floor(g.count*.75));
  const entries=g.stages.map((s,i)=>({s,i}));
  const eligible=({s,i})=>i>=from&&i<=to&&!forbidden.has(s.id)&&(
    s.kind==='standard'||(s.kind==='trick'&&!['context-properties','right-click','right-click-folder','hover','touch-hold'].includes(s.mode)));
  const nearOther=({i})=>entries.some(({s},idx)=>Math.abs(idx-i)<3&&idx!==i&&['trick','mini','mission','extended','show','story'].includes(s.kind));
  const pool=entries.filter(eligible);
  const possible=pool.filter(v=>v.s.kind==='trick'||!nearOther(v));
  if(!possible.length)possible.push(...pool);
  if(!possible.length)throw Error('Trilha B7 sem posição segura para contexto.');
  const rng=G.rngFrom(meta.seed+'#context-v1');
  const a=possible[Math.floor(rng()*possible.length)];
  const ch=challenges[Math.floor(rng()*challenges.length)];
  g.stages[a.i]={...ch};
  return g;
}
G.BANKS.B7={data:B6.data,capacity:B6.capacity,generate:build};
})();
