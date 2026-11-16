/* ClassiQuiz gen.js — geradores de Trilha PUROS (sem DOM). B1–B5 extraídos verbatim da v1.2.2.
   Nenhuma regra deste arquivo pode mudar o resultado de seeds B1–B5 já existentes.
   Licença do código: MIT. */
(() => {
'use strict';
const B4=window.CLASSIQUIZ_DATA, D=window.CLASSIQUIZ_DATA_B5, OLD=window.CLASSIQUIZ_DATA_B1, B2=window.CLASSIQUIZ_DATA_B2, B3=window.CLASSIQUIZ_DATA_B3;
if(!B4||!D){throw new Error('Bancos de perguntas não carregados.');}
const BANKS={}; // registro: B1..B6 -> {data, generate(code,meta)}
  function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  function rngFrom(seed){let a=hash(seed);return function(){a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
  function shuffle(xs,rng){const arr=xs.slice();for(let i=arr.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
  const choice=(arr,rng)=>arr[Math.floor(rng()*arr.length)];
  function eligible(item,p){
    const need=item.needs||(['hover','hover-target','right-click','right-click-folder'].includes(item.mode)?'mouse':item.mode==='touch-hold'?'touch':null);
    return !need||(need==='mouse'&&p!=='T')||(need==='touch'&&p!=='M');
  }
function eligibleList(src,p){return [...src.questions,...src.extended,...src.tricks,...src.minigames].filter(q=>eligible(q,p));}
const allB5=[...D.questions,...D.extended,...D.tricks,...D.minigames];
function dataOf(bank){return bank==='B1'?OLD:bank==='B2'?B2:bank==='B3'?B3:bank==='B4'?B4:bank==='B5'?D:(BANKS[bank]&&BANKS[bank].data)||null;}
let CURRENT='B5';
function capacity(p,bank=CURRENT){
  if(BANKS[bank]&&BANKS[bank].capacity)return BANKS[bank].capacity(p);
  const source=dataOf(bank);if(!source)return 0;
  const total=eligibleList(source,p).length;
  return Math.max(0,Math.floor((total-20)/25)*25);
}
function bankAvailable(bank){return !!dataOf(bank);}
function parseSeed(s){
  const match=String(s).trim().toUpperCase().match(/^CQ1-([A-Z0-9]+)-(T|M|H)-(\d{2,4})-([A-Z0-9]{6,12})$/);
  if(!match)throw Error('Seed inválida. Exemplo: CQ1-B6-M-100-ABC123');
  const [,bank,p,countTxt,salt]=match;const count=Number(countTxt);
  if(!bankAvailable(bank))throw Error('Esta seed usa uma versão do banco de perguntas que não está disponível ('+bank+').');
  if(!Number.isInteger(count)||count<25||count%25!==0||count>capacity(p,bank))throw Error('Quantidade indisponível para o perfil desta seed.');
  return {bank,p,count,salt,seed:`CQ1-${bank}-${p}-${count}-${salt}`};
}
function newSalt(){const abc='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let result='';if(globalThis.crypto?.getRandomValues){const b=new Uint8Array(7);crypto.getRandomValues(b);for(const x of b)result+=abc[x%abc.length];}else{for(let i=0;i<7;i++)result+=abc[Math.floor(Math.random()*abc.length)];}return result;}
  function generateLegacy(code){const meta=parseSeed(code), rng=rngFrom(meta.seed), count=meta.count;
    const basic=shuffle(OLD.questions,rng);
    const specials=shuffle([...OLD.extended,...OLD.tricks,...OLD.minigames].filter(q=>eligible(q,meta.p)),rng);
    const memoryCount=Math.max(1,Math.floor(count/50));
    const specialCount=Math.min(specials.length,Math.floor(count/7)+1);
    const positions=[], memoryPositions=[];
    function free(idx){return positions.every(p=>Math.abs(p-idx)>=3);}
    for(let n=0;n<memoryCount;n++){
      const candidates=[];for(let i=24;i<count;i++)if(free(i))candidates.push(i);
      if(!candidates.length)throw Error('Não foi possível posicionar uma pergunta conectada.');
      const pos=choice(candidates,rng);positions.push(pos);memoryPositions.push(pos);
    }
    const specialPositions=[];
    for(let n=0;n<specialCount;n++){
      const candidates=[];for(let i=0;i<count;i++)if(free(i))candidates.push(i);
      if(!candidates.length)break;
      const pos=choice(candidates,rng);positions.push(pos);specialPositions.push(pos);
    }
    const stageArr=new Array(count), specialsByPos=new Map();
    specialPositions.forEach((p,i)=>specialsByPos.set(p,specials[i]));
    for(let i=0,k=0;i<count;i++){
      if(memoryPositions.includes(i)){stageArr[i]={id:'memory-'+i,kind:'memory',text:'',options:[],answer:0};continue;}
      const src=specialsByPos.get(i)||basic[k++];
      if(!src)throw Error('O banco de perguntas não é suficiente para esta Geração.');
      if(src.kind==='standard'||src.kind==='extended'){
        const opts=shuffle(src.options,rng);stageArr[i]={id:src.id,kind:src.kind,text:src.text,options:opts,answer:opts.indexOf(src.options[src.correct])};
      }else stageArr[i]={id:src.id,kind:src.kind,mode:src.mode,text:src.text,needs:src.needs||null};
    }
    for(const i of memoryPositions){
      const origins=[];for(let k=0;k<=i-10;k++)if(stageArr[k].kind==='standard'&&stageArr[k].options.length===4)origins.push(k);
      if(!origins.length)throw Error('Pergunta conectada sem origem válida.');
      const srcIdx=choice(origins,rng),origin=stageArr[srcIdx],letters=rng()<0.5;
      const options=letters?['A','B','C','D']:shuffle(origin.options,rng);
      const answer=letters?origin.answer:options.indexOf(origin.options[origin.answer]);
      stageArr[i]={id:'memory-'+i,kind:'memory',variant:letters?'letters':'texts',text:`Qual foi a resposta correta da pergunta nº ${srcIdx+1}?`,options,answer,origin:srcIdx+1,originId:origin.id,originAnswer:origin.options[origin.answer],originLetter:'ABCD'[origin.answer]};
    }
    return{seed:meta.seed,count,profile:meta.p,bank:meta.bank,createdAt:Date.now(),stages:stageArr};
  }
  // Banco B2: proporção-alvo próxima de 39% fáceis / 35% médias / 26% difíceis.
  // Nada disso é mostrado ao jogador. O sorteio por seed continua sem progressão crescente.
  function selectStandardsB2(count, specialItems, memoryCount, rng){
    const pools={easy:[],medium:[],hard:[]};
    for(const q of B2.questions)pools[q.difficulty].push(q);
    for(const level of ['easy','medium','hard'])pools[level]=shuffle(pools[level],rng);
    const selected={easy:0,medium:0,hard:memoryCount};
    for(const q of specialItems)selected[q.difficulty]++;
    const target={easy:Math.round(count*.39),medium:Math.round(count*.35)};
    target.hard=count-target.easy-target.medium;
    const out=[];
    const slots=count-memoryCount-specialItems.length;
    for(let i=0;i<slots;i++){
      const choices=['easy','medium','hard'].filter(level=>pools[level].length);
      if(!choices.length)throw Error('Não há perguntas suficientes para esta Geração.');
      // Maior déficit em relação à meta, respeitando quantidade real disponível.
      choices.sort((a,b)=>{
        const scoreA=target[a]-selected[a],scoreB=target[b]-selected[b];
        return scoreB-scoreA || ['easy','medium','hard'].indexOf(a)-['easy','medium','hard'].indexOf(b);
      });
      const level=choices[0];
      out.push(pools[level].pop());selected[level]++;
    }
    return shuffle(out,rng);
  }
  function generateB2(code){
    const meta=parseSeed(code);
    if(meta.bank==='B1')return generateLegacy(code);
    const rng=rngFrom(meta.seed),count=meta.count;
    const specialsPool=shuffle([...B2.extended,...B2.tricks,...B2.minigames].filter(q=>eligible(q,meta.p)),rng);
    const memoryCount=Math.max(1,Math.floor(count/50));
    const specialCount=Math.min(specialsPool.length,Math.floor(count/7)+1);
    const specials=specialsPool.slice(0,specialCount);
    const basic=selectStandardsB2(count,specials,memoryCount,rng);
    const positions=[],memoryPositions=[];
    function free(idx){return positions.every(p=>Math.abs(p-idx)>=3);}
    for(let n=0;n<memoryCount;n++){
      const candidates=[];
      for(let i=24;i<count;i++)if(free(i))candidates.push(i);
      if(!candidates.length)throw Error('Não foi possível posicionar uma pergunta conectada.');
      const pos=choice(candidates,rng);positions.push(pos);memoryPositions.push(pos);
    }
    const specialPositions=[];
    for(let n=0;n<specials.length;n++){
      const candidates=[];
      for(let i=0;i<count;i++)if(free(i))candidates.push(i);
      if(!candidates.length)break;
      const pos=choice(candidates,rng);positions.push(pos);specialPositions.push(pos);
    }
    const stageArr=new Array(count),specialsByPos=new Map();
    specialPositions.forEach((p,i)=>specialsByPos.set(p,specials[i]));
    for(let i=0,k=0;i<count;i++){
      if(memoryPositions.includes(i)){
        stageArr[i]={id:'memory-'+i,kind:'memory',difficulty:'hard',text:'',options:[],answer:0};
        continue;
      }
      const src=specialsByPos.get(i)||basic[k++];
      if(!src)throw Error('O banco de perguntas não é suficiente para esta Geração.');
      if(src.kind==='standard'||src.kind==='extended'){
        const opts=shuffle(src.options,rng);
        stageArr[i]={id:src.id,kind:src.kind,difficulty:src.difficulty,text:src.text,options:opts,answer:opts.indexOf(src.options[src.correct])};
      }else{
        stageArr[i]={id:src.id,kind:src.kind,difficulty:src.difficulty,mode:src.mode,text:src.text,needs:src.needs||null};
      }
    }
    for(const i of memoryPositions){
      const origins=[];
      for(let k=0;k<=i-10;k++)if(stageArr[k].kind==='standard'&&stageArr[k].options.length===4)origins.push(k);
      if(!origins.length)throw Error('Pergunta conectada sem origem válida.');
      const srcIdx=choice(origins,rng),origin=stageArr[srcIdx],letters=rng()<0.5;
      const options=letters?['A','B','C','D']:shuffle(origin.options,rng);
      const answer=letters?origin.answer:options.indexOf(origin.options[origin.answer]);
      stageArr[i]={id:'memory-'+i,kind:'memory',difficulty:'hard',variant:letters?'letters':'texts',text:`Qual foi a resposta correta da pergunta nº ${srcIdx+1}?`,options,answer,origin:srcIdx+1,originId:origin.id,originAnswer:origin.options[origin.answer],originLetter:'ABCD'[origin.answer]};
    }
    return{seed:meta.seed,count,profile:meta.p,bank:meta.bank,createdAt:Date.now(),stages:stageArr};
  }
  // Banco B3: fases especiais frequentes, mas com pelo menos três posições de distância.
  // A seed define todas as posições e estados; o jogador nunca vê a dificuldade.
  function selectStandardsB3(count,specialItems,memoryCount,rng){
    const pools={easy:[],medium:[],hard:[]};
    for(const q of B3.questions)pools[q.difficulty].push(q);
    for(const level of ['easy','medium','hard'])pools[level]=shuffle(pools[level],rng);
    const selected={easy:0,medium:0,hard:memoryCount};
    for(const q of specialItems)selected[q.difficulty]++;
    const target={easy:Math.round(count*.42),medium:Math.round(count*.35)};
    target.hard=count-target.easy-target.medium;
    const output=[], slots=count-memoryCount-specialItems.length;
    for(let i=0;i<slots;i++){
      const available=['easy','medium','hard'].filter(k=>pools[k].length);
      if(!available.length)throw Error('Não há perguntas suficientes para esta Geração.');
      available.sort((a,b)=>(target[b]-selected[b])-(target[a]-selected[a]) || ['easy','medium','hard'].indexOf(a)-['easy','medium','hard'].indexOf(b));
      const level=available[0]; output.push(pools[level].pop());selected[level]++;
    }
    return shuffle(output,rng);
  }
  function generateB3(code){
    const meta=parseSeed(code),rng=rngFrom(meta.seed),count=meta.count;
    const groups={
      trick:shuffle(B3.tricks.filter(x=>eligible(x,meta.p)),rng),
      mini:shuffle(B3.minigames.filter(x=>eligible(x,meta.p)),rng),
      extended:shuffle(B3.extended,rng)
    };
    // Posições especiais com salto aleatório de 3 a 5 fases, sem escassez no final.
    const specialSlots=[];
    let at=Math.floor(rng()*3);
    while(at<count){specialSlots.push(at);at+=3+Math.floor(rng()*3);}
    if(count===25 && specialSlots[specialSlots.length-1]!==24){
      const last=specialSlots[specialSlots.length-1];
      if(last<=21)specialSlots.push(24);
      else specialSlots[specialSlots.length-1]=24;
    }
    const memoryCount=Math.max(1,Math.floor(count/50));
    const memorySlots=[];
    const candidates=shuffle(specialSlots.filter(p=>p>=24),rng);
    for(const pos of candidates){
      if(memorySlots.every(old=>Math.abs(pos-old)>=13)){memorySlots.push(pos);if(memorySlots.length===memoryCount)break;}
    }
    if(memorySlots.length<memoryCount)throw Error('Não foi possível posicionar as perguntas conectadas.');
    const memorySet=new Set(memorySlots);
    const rest=specialSlots.filter(p=>!memorySet.has(p));
    const pattern=['trick','mini','trick','mini','extended'];
    const offset=Math.floor(rng()*pattern.length), specialsByPos=new Map(), specials=[];
    rest.forEach((pos,i)=>{
      const preferred=pattern[(i+offset)%pattern.length];
      const priority=[preferred,...['trick','mini','extended'].filter(v=>v!==preferred).sort((a,b)=>groups[b].length-groups[a].length)];
      const selected=priority.find(v=>groups[v].length);
      if(!selected)throw Error('Não há pegadinhas ou minigames suficientes para esta Geração.');
      const item=groups[selected].pop();specialsByPos.set(pos,item);specials.push(item);
    });
    const basic=selectStandardsB3(count,specials,memoryCount,rng);
    const stages=new Array(count);let k=0;
    for(let i=0;i<count;i++){
      if(memorySet.has(i)){stages[i]={id:'memory-'+i,kind:'memory',difficulty:'hard',text:'',options:[],answer:0};continue;}
      const src=specialsByPos.get(i)||basic[k++];
      if(!src)throw Error('O banco de perguntas não é suficiente para esta Geração.');
      if(src.kind==='standard'||src.kind==='extended'){
        const opts=shuffle(src.options,rng);
        stages[i]={id:src.id,kind:src.kind,difficulty:src.difficulty,text:src.text,options:opts,answer:opts.indexOf(src.options[src.correct])};
      }else stages[i]={...src}; // os parâmetros dos desafios ficam congelados na seed.
    }
    for(const i of memorySlots){
      const origins=[];
      for(let n=0;n<=i-10;n++)if(stages[n].kind==='standard'&&stages[n].options.length===4)origins.push(n);
      if(!origins.length)throw Error('Pergunta conectada sem origem válida.');
      const chosen=choice(origins,rng),src=stages[chosen],letters=rng()<.5;
      const options=letters?['A','B','C','D']:shuffle(src.options,rng);
      stages[i]={id:'memory-'+i,kind:'memory',difficulty:'hard',variant:letters?'letters':'texts',text:`Qual era a resposta correta da pergunta nº ${chosen+1}?`,options,answer:letters?src.answer:options.indexOf(src.options[src.answer]),origin:chosen+1,originId:src.id,originAnswer:src.options[src.answer],originLetter:'ABCD'[src.answer]};
    }
    return {seed:meta.seed,count,profile:meta.p,bank:meta.bank,createdAt:Date.now(),stages};
  }
  // B4: novas Trilhas. O número exibido é o índice + 1; uma posição pode estar pulada.
  function selectStandardsB4(count,specials,memoryCount,rng){
    const pools={easy:[],medium:[],hard:[]};
    for(const q of B4.questions)pools[q.difficulty].push(q);
    for(const k of ['easy','medium','hard'])pools[k]=shuffle(pools[k],rng);
    const selected={easy:0,medium:0,hard:memoryCount};
    for(const q of specials)selected[q.difficulty]=(selected[q.difficulty]||0)+1;
    const target={easy:Math.round(count*.41),medium:Math.round(count*.35)};
    target.hard=count-target.easy-target.medium;
    const output=[];
    for(let i=0;i<count-memoryCount-specials.length;i++){
      const options=['easy','medium','hard'].filter(k=>pools[k].length);
      if(!options.length)throw Error('Não há questões suficientes neste banco.');
      options.sort((a,b)=>(target[b]-selected[b])-(target[a]-selected[a])||['easy','medium','hard'].indexOf(a)-['easy','medium','hard'].indexOf(b));
      const k=options[0];output.push(pools[k].pop());selected[k]++;
    }
    return shuffle(output,rng);
  }
  function generateB4(code){
    const meta=parseSeed(code), rng=rngFrom(meta.seed), count=meta.count;
    const pools={trick:shuffle(B4.tricks.filter(q=>eligible(q,meta.p)),rng),mini:shuffle(B4.minigames.filter(q=>eligible(q,meta.p)),rng),extended:shuffle(B4.extended,rng)};
    // A posição pulada é opcional em Trilhas menores; em 50 posições, sempre há uma lacuna.
    const hasSkip=count===50 || (count===25 ? rng()<.55 : rng()<.83);
    const scale=count/50;
    const nrange=(a,b)=>[Math.max(1,Math.round(a*scale)),Math.min(count,Math.round(b*scale))];
    let skippedIndex=-1,skipMemoryIndex=-1;
    if(hasSkip){
      const [lo,hi]=nrange(7,37), [ml,mh]=nrange(40,46);
      skippedIndex=lo-1+Math.floor(rng()*(hi-lo+1));
      const possible=Array.from({length:mh-ml+1},(_,i)=>ml-1+i).filter(ix=>ix>skippedIndex+2);
      skipMemoryIndex=choice(possible,rng);
    }
    const reserved=skipMemoryIndex>=0?[skipMemoryIndex]:[];
    const specialSlots=[];
    let pos=Math.floor(rng()*3);
    while(pos<count){
      if(pos!==skippedIndex && reserved.every(r=>Math.abs(r-pos)>=3))specialSlots.push(pos);
      pos+=3+Math.floor(rng()*3);
    }
    if(skipMemoryIndex>=0)specialSlots.push(skipMemoryIndex);
    if(count===25 && !hasSkip && specialSlots.every(v=>v<24) && skippedIndex!==24){
      for(let i=specialSlots.length-1;i>=0;i--)if(Math.abs(specialSlots[i]-24)<3)specialSlots.splice(i,1);
      specialSlots.push(24);
    }
    specialSlots.sort((a,b)=>a-b);
    const memoryCount=count===25 && hasSkip?0:Math.max(1,Math.floor(count/50)), memory=[];
    const candidate=shuffle(specialSlots.filter(x=>x>=24&&x!==skipMemoryIndex),rng);
    for(const ix of (memoryCount?candidate:[])){if(memory.every(v=>Math.abs(v-ix)>=13)){memory.push(ix);if(memory.length===memoryCount)break;}}
    if(memory.length!==memoryCount)throw Error('Não foi possível organizar as questões de memória.');
    const reservedSet=new Set([...memory,skipMemoryIndex]);
    const rest=specialSlots.filter(v=>!reservedSet.has(v));
    const pattern=['trick','mini','trick','mini','extended'];
    const offset=Math.floor(rng()*pattern.length), byPos=new Map(), specialItems=[];
    rest.forEach((ix,i)=>{
      const first=pattern[(i+offset)%pattern.length];
      const order=[first,...['trick','mini','extended'].filter(v=>v!==first).sort((a,b)=>pools[b].length-pools[a].length)];
      const chosen=order.find(k=>pools[k].length);
      if(!chosen)throw Error('Banco de desafios interativos insuficiente.');
      const q=pools[chosen].pop();byPos.set(ix,q);specialItems.push(q);
    });
    // A questão ausente não consome uma pergunta do banco.
    const basics=selectStandardsB4(count-(skippedIndex>=0?1:0),specialItems,memory.length+(skipMemoryIndex>=0?1:0),rng);
    const stages=new Array(count);let k=0;
    for(let ix=0;ix<count;ix++){
      if(ix===skippedIndex){stages[ix]={id:'skipped-'+ix,kind:'skipped',difficulty:'medium',addedMonth:'11/2026'};continue;}
      if(ix===skipMemoryIndex){stages[ix]={id:'skip-memory-'+ix,kind:'skip-memory',difficulty:'hard',addedMonth:'11/2026'};continue;}
      if(memory.includes(ix)){stages[ix]={id:'memory-'+ix,kind:'memory',difficulty:'hard',text:'',options:[],answer:0,addedMonth:'11/2026'};continue;}
      const src=byPos.get(ix)||basics[k++];
      if(!src)throw Error('Não há questões suficientes para montar a Trilha.');
      if(src.kind==='standard'||src.kind==='extended'){
        const opts=shuffle(src.options,rng);
        stages[ix]={id:src.id,kind:src.kind,text:src.text,options:opts,answer:opts.indexOf(src.options[src.correct]),addedMonth:src.addedMonth,difficulty:src.difficulty};
      } else stages[ix]={...src};
    }
    for(const ix of memory){
      const origins=[];
      for(let q=0;q<=ix-10;q++)if(stages[q].kind==='standard'&&stages[q].options.length===4)origins.push(q);
      if(!origins.length)throw Error('Uma questão de memória ficou sem origem.');
      const originIx=choice(origins,rng),origin=stages[originIx],letters=rng()<.5;
      const options=letters?['A','B','C','D']:shuffle(origin.options,rng);
      stages[ix]={id:'memory-'+ix,kind:'memory',difficulty:'hard',addedMonth:'11/2026',variant:letters?'letters':'texts',text:`Qual foi a resposta correta da questão nº ${originIx+1}?`,options,answer:letters?origin.answer:options.indexOf(origin.options[origin.answer]),origin:originIx+1,originId:origin.id,originAnswer:origin.options[origin.answer],originLetter:'ABCD'[origin.answer]};
    }
    if(skipMemoryIndex>=0){
      const correct=skippedIndex+1, [lo,hi]=nrange(7,37);
      const distractors=shuffle(Array.from({length:hi-lo+1},(_,i)=>lo+i).filter(n=>n!==correct),rng).slice(0,3);
      const opts=shuffle([correct,...distractors],rng);
      stages[skipMemoryIndex]={id:'skip-memory-'+skipMemoryIndex,kind:'skip-memory',difficulty:'hard',addedMonth:'11/2026',text:rng()<.5?'Qual questão foi pulada nesta Trilha?':'Qual número de questão não apareceu nesta Trilha?',options:opts.map(String),answer:opts.indexOf(correct),skippedNumber:correct};
    }
    return {seed:meta.seed,count,profile:meta.p,bank:meta.bank,createdAt:Date.now(),stages,skippedNumber:skippedIndex>=0?skippedIndex+1:null};
  }
  // B5: categorias, sequências narrativas indivisíveis e Ultra ClassiQuiz.
  function stageFrom(src,rng){
    if(['standard','extended','story'].includes(src.kind)){
      const opts=shuffle(src.options,rng);
      return {...src,options:opts,answer:opts.indexOf(src.options[src.correct]),correct:undefined};
    }
    return {...src};
  }
  function generatedMemory(stages,index,rng){
    const origins=[];
    for(let i=0;i<=index-10;i++)if(stages[i]?.kind==='standard'&&stages[i].options?.length===4)origins.push(i);
    if(!origins.length)throw Error('Questão de memória sem pergunta anterior.');
    const originIx=choice(origins,rng),origin=stages[originIx],letters=rng()<.5;
    const options=letters?['A','B','C','D']:shuffle(origin.options,rng);
    return {id:'b5-memory-'+index,kind:'memory',theme:'memória',difficulty:'hard',addedMonth:'11/2026',variant:letters?'letters':'texts',text:`Qual era a resposta correta da questão nº ${originIx+1}?`,options,answer:letters?origin.answer:options.indexOf(origin.options[origin.answer]),origin:originIx+1,originId:origin.id,originAnswer:origin.options[origin.answer],originLetter:'ABCD'[origin.answer]};
  }
  function b5Sequence(seed,count,p,ultra=false,DS=D){
    const rng=rngFrom(seed),stages=new Array(count).fill(null);
    const eligibleNormal=shuffle(DS.questions.filter(q=>eligible(q,p)),rng);
    const allSpecial=shuffle([...DS.extended,...DS.tricks,...DS.minigames].filter(q=>eligible(q,p)),rng);
    const allStories=shuffle(DS.stories||[],rng);
    const targetStories=ultra?allStories.length:count<50?(rng()<.7?1:0):Math.min(6,Math.max(1,Math.floor(count/48)));
    const stories=allStories.slice(0,targetStories);
    // Questão pulada e posterior lembrança da lacuna. Nunca corta uma história.
    const skipEnabled=ultra||count===50||(count===25?rng()<.45:rng()<.75);
    let skipIx=-1,skipRecall=-1;
    if(skipEnabled){
      const lo=Math.max(6,Math.round(count*.14)),hi=Math.min(count-13,Math.max(lo,Math.round(count*.60)));
      skipIx=lo+Math.floor(rng()*(hi-lo+1));
      const laterLo=Math.max(skipIx+4,Math.floor(count*.78)),laterHi=count-3;
      skipRecall=laterLo+Math.floor(rng()*(Math.max(laterLo,laterHi)-laterLo+1));
      if(count===50){skipIx=6+Math.floor(rng()*31);skipRecall=39+Math.floor(rng()*7);}
      stages[skipIx]={id:'b5-skipped-'+skipIx,kind:'skipped',difficulty:'medium',theme:'memória',addedMonth:'11/2026'};
      stages[skipRecall]={id:'b5-skip-memory-'+skipRecall,kind:'skip-memory',difficulty:'hard',theme:'memória',addedMonth:'11/2026'};
    }
    const storyLimit=Math.max(7,Math.floor(count*.75));
    for(const story of stories){
      const len=story.items.length,starts=[];
      for(let start=0;start+len<=storyLimit;start++){
        let okay=true;
        for(let i=Math.max(0,start-1);i<Math.min(count,start+len+1);i++)if(stages[i]){okay=false;break;}
        if(okay)starts.push(start);
      }
      if(!starts.length){if(ultra)throw Error('Não foi possível posicionar todas as histórias.');continue;}
      const begin=choice(starts,rng);
      story.items.forEach((s,i)=>stages[begin+i]=stageFrom(s,rng));
    }
    const memoryCount=ultra?Math.max(2,Math.floor(count/75)):(count===25&&skipEnabled?0:Math.max(1,Math.floor(count/65)));
    const memories=[];
    for(let j=0;j<memoryCount;j++){
      const starts=shuffle(Array.from({length:count-24},(_,i)=>i+24),rng).filter(ix=>!stages[ix]&&(skipRecall<0||Math.abs(ix-skipRecall)>=3)&&memories.every(old=>Math.abs(ix-old)>=12));
      if(starts.length){const idx=starts[0];memories.push(idx);stages[idx]={id:'b5-pending-memory-'+idx,kind:'pending-memory',theme:'memória'};}
    }
    if(ultra&&memories.length!==memoryCount)throw Error('Faltou espaço para questões de memória.');
    const specials=ultra?allSpecial:allSpecial.slice(0,Math.min(allSpecial.length,Math.floor(count/5.1)));
    // Backtracking by several deterministic retries, enforcing >=3 positions between independent special challenges.
    let available=shuffle(Array.from({length:count},(_,i)=>i).filter(i=>!stages[i]),rng);
    const specialPositions=[];
    const tryPositions=()=>{
      specialPositions.length=0;
      for(const ix of available){
        if(specialPositions.length>=specials.length)break;
        if(specialPositions.every(v=>Math.abs(ix-v)>=3))specialPositions.push(ix);
      }
      return specialPositions.length===specials.length;
    };
    for(let attempt=0;attempt<80&&!tryPositions();attempt++)available=shuffle(available,rng);
    if(specialPositions.length<specials.length){
      // A deterministic fall-back puts special questions on every third available free position.
      throw Error('Não foi possível espaçar os minigames. Tente outra seed.');
    }
    for(let i=0;i<specials.length;i++)stages[specialPositions[i]]=stageFrom(specials[i],rng);
    const usedSpecial=new Set(specials.map(s=>s.id));
    const unfilled=stages.map((v,i)=>v===null?i:-1).filter(i=>i>=0);
    if(ultra&&unfilled.length!==eligibleNormal.length)throw Error('Ultra inconsistente com o banco de perguntas.');
    // Approximate mixture of difficulty, without increasing it toward the end.
    const selected=ultra?eligibleNormal:eligibleNormal.slice(0,unfilled.length);
    const standards=shuffle(selected,rng);
    for(const pos of unfilled){
      const lastTheme=stages[pos-1]?.theme;
      const nextTheme=stages[pos+1]?.theme;
      const choices=standards.map((q,i)=>({q,i})).filter(({q})=>q.theme!==lastTheme&&q.theme!==nextTheme);
      const pick=choices.length?choice(choices.slice(0,Math.min(18,choices.length)),rng):{q:standards[0],i:0};
      stages[pos]=stageFrom(standards.splice(pick.i,1)[0],rng);
    }
    // Fix local adjacency conflicts without breaking special positions or story blocks.
    for(let pass=0;pass<5;pass++){
      for(let i=1;i<count;i++){
        const a=stages[i-1],b=stages[i];
        if(!a||!b||a.kind==='skipped'||b.kind==='skipped'||(a.kind==='story'&&b.kind==='story'&&a.group===b.group)||a.theme!==b.theme)continue;
        if(b.kind!=='standard')continue;
        const swaps=shuffle(unfilled.filter(j=>j!==i&&j!==i-1),rng);
        for(const j of swaps){const other=stages[j];if(other?.kind!=='standard'||other.theme===a.theme)continue;
          const left=stages[j-1],right=stages[j+1];
          if((left&&left.theme===b.theme)||(right&&right.theme===b.theme)||(stages[i+1]&&stages[i+1].theme===other.theme))continue;
          stages[i]=other;stages[j]=b;break;
        }
      }
    }
    // Second pass: also resolves clashes at boundaries where the special/story is the right-hand item.
    for(let pass=0;pass<12;pass++){
      let changed=false;
      for(let i=1;i<count;i++){
        const left=stages[i-1],right=stages[i];
        if(!left||!right||left.kind==='skipped'||right.kind==='skipped'||left.theme!==right.theme||(left.kind==='story'&&right.kind==='story'&&left.group===right.group))continue;
        const targets=[i,i-1].filter(k=>stages[k]?.kind==='standard');
        for(const ix of targets){
          const candidateIndexes=shuffle(unfilled.filter(j=>j!==ix&&j!==i&&j!==i-1),rng);
          let solved=false;
          for(const j of candidateIndexes){
            const x=stages[ix],y=stages[j];if(y?.kind!=='standard'||x.theme===y.theme)continue;
            const check=(pos,theme,otherIndex,otherTheme)=>{
              const tL=pos>0?(pos-1===otherIndex?otherTheme:stages[pos-1]?.theme):null;
              const tR=pos<count-1?(pos+1===otherIndex?otherTheme:stages[pos+1]?.theme):null;
              return (!tL||tL!==theme)&&(!tR||tR!==theme);
            };
            if(!check(ix,y.theme,j,x.theme)||!check(j,x.theme,ix,y.theme))continue;
            stages[ix]=y;stages[j]=x;solved=true;changed=true;break;
          }
          if(solved)break;
        }
      }
      if(!changed)break;
    }
    // Special titles may accidentally share a theme with a story at its edge.
    // Swapping special payloads preserves the 3-position spacing and every question ID.
    for(let pass=0;pass<4;pass++){
      for(let i=1;i<count;i++){
        const a=stages[i-1],b=stages[i];
        if(!a||!b||a.kind==='skipped'||b.kind==='skipped'||a.theme!==b.theme||(a.kind==='story'&&b.kind==='story'&&a.group===b.group))continue;
        const target=['mini','trick','extended'].includes(b.kind)?i:['mini','trick','extended'].includes(a.kind)?i-1:-1;
        if(target<0)continue;
        for(const ix of shuffle(specialPositions.filter(j=>j!==target&&Math.abs(j-target)>1),rng)){
          const x=stages[target],y=stages[ix];
          const neighborOkay=(pos,theme)=>{
            const left=stages[pos-1],right=stages[pos+1];
            return (!left||left.theme!==theme)&&(!right||right.theme!==theme);
          };
          if(neighborOkay(target,y.theme)&&neighborOkay(ix,x.theme)){stages[target]=y;stages[ix]=x;break;}
        }
      }
    }
    for(const pos of memories)stages[pos]=generatedMemory(stages,pos,rng);
    if(skipRecall>=0){
      const missing=skipIx+1;
      const distractors=shuffle(Array.from({length:count},(_,i)=>i+1).filter(n=>n!==missing&&Math.abs(n-missing)<22),rng).slice(0,3);
      const options=shuffle([missing,...distractors],rng);
      stages[skipRecall]={id:'b5-skip-memory-'+skipRecall,kind:'skip-memory',theme:'memória',difficulty:'hard',addedMonth:'11/2026',text:'Qual número de questão foi pulado nesta Trilha?',options:options.map(String),answer:options.indexOf(missing),skippedNumber:missing};
    }
    // When memory must precede a standard after a long story, postpone placing it rather than making invalid origin.
    return {seed,count,profile:p,bank:'B5',mode:ultra?'ultra':'normal',initialLives:ultra?1:undefined,createdAt:Date.now(),stages,skippedNumber:skipIx>=0?skipIx+1:null};
  }
function generateB5(code){const meta=parseSeed(code);return b5Sequence(meta.seed,meta.count,meta.p,false,D);}
function ultraCountB5(p){return [...D.questions,...D.extended,...D.tricks,...D.minigames].filter(q=>eligible(q,p)).length+(D.stories||[]).reduce((n,g)=>n+g.items.length,0)+Math.max(2,Math.floor((allB5.length+100)/75))+2;}
function generateUltraB5(p,lives,seed){const count=ultraCountB5(p);const g=b5Sequence(seed,count,p,true,D);g.initialLives=lives;return g;}
function generate(code){
  const meta=parseSeed(code);
  if(BANKS[meta.bank]&&BANKS[meta.bank].generate)return BANKS[meta.bank].generate(meta);
  if(meta.bank==='B1')return generateLegacy(code);
  if(meta.bank==='B2')return generateB2(code);
  if(meta.bank==='B3')return generateB3(code);
  if(meta.bank==='B4')return generateB4(code);
  return generateB5(code);
}
window.CQ_GEN={hash,rngFrom,shuffle,choice,eligible,eligibleList,capacity,parseSeed,newSalt,generate,generateLegacy,generateB2,generateB3,generateB4,generateB5,stageFrom,generatedMemory,generateUltraB5,ultraCountB5,dataOf,bankAvailable,BANKS,
  setCurrent(b){CURRENT=b;},getCurrent(){return CURRENT;},B1:OLD,B2,B3,B4,B5:D};
})();
