/* ClassiQuiz 2.0.9 • Offline Runner: original pixel runner, executable without network. MIT. */
(function(){'use strict';
const KEY='classiquiz.v1.runner',AK='classiquiz.v1.achievements';
const ACH=[
  ['offline_seen','Sem internet','offlineSeen',1],
  ['runner_secret','Segredo desconectado','runnerSecret',1],
  ['runner_first','Primeiros passos','runner100',1],
  ['runner_alert','Alerta vermelho','runnerFlyerDodge',10],
  ['runner_1000','Sem sinal, sem medo','runner1000',1],
  ['runner_180','Intocável','runner180',1],
  ['runner_5000','Lenda offline','runner5000',1]
];
function read(key,def){try{return JSON.parse(localStorage.getItem(key))||def;}catch{return def;}}
function write(key,data){try{localStorage.setItem(key,JSON.stringify(data));}catch{}}
function earn(key){
  const cq=window.CQ;
  if(cq?.game?.statApp){cq.game.statApp(key);return;}
  const a=read(AK,{unlocked:{},stats:{}});a.stats ||= {};a.unlocked ||= {};
  if(a.disabled)return;
  a.stats[key]=(a.stats[key]||0)+1;
  for(const [id,,stat,n] of ACH){if(!a.unlocked[id]&&a.stats[stat]>=n){a.unlocked[id]=Date.now();}}
  write(AK,a);
}
function record(){return read(KEY,{best:0,played:0});}
function best(score){let r=record();if(score>r.best){r.best=score;write(KEY,r);}return r.best;}
function startGame(host,options={}){
  if(!host)return null;const onExit=options.onExit||(()=>{});
  host.innerHTML=`<div class="runner-box" tabindex="0" aria-label="Offline Runner">
    <div class="runner-head"><strong>ClaQui Offline Runner</strong><span class="runner-points">Pontos: 0 · Recorde: ${best(0)}</span></div>
    <canvas width="640" height="230" class="runner-canvas" aria-label="Jogo de corrida em pixel art"></canvas>
    <div class="runner-info" role="status">Espaço/↑ para pular • ↓ para abaixar</div>
    <div class="runner-controls"><button type="button" data-run="jump">↑ Pular</button><button type="button" data-run="duck">↓ Abaixar</button><button type="button" data-run="restart">↻ Reiniciar</button><button type="button" data-run="close">Fechar</button></div>
  </div>`;
  const root=host.querySelector('.runner-box'),cv=root.querySelector('canvas'),ctx=cv.getContext('2d');
  const status=root.querySelector('.runner-info'),points=root.querySelector('.runner-points');
  let st,raf=0,active=true,recordBest=record().best;const W=640,H=230,Y=184;
  const rand=(a,b)=>a+Math.random()*(b-a);
  function reset(){recordBest=best(Math.floor(st?.score||0));const rec=record();rec.played++;write(KEY,rec);st={x:66,y:0,vy:0,duck:false,score:0,clock:0,ob:[],spawn:0,live:true,last:0,alertCount:0,runner100:false,runner1000:false,runner5000:false,runner180:false};status.textContent='Desvie de arquivos e sinais quebrados. Abaixe-se dos alertas voadores!';root.focus({preventScroll:true});}
  function jump(){if(!st.live){reset();return;}if(st.y===0){st.vy=390;st.duck=false;}}
  function duck(on){st.duck=on&&st.y===0;}
  function obstacle(){const flying=st.score>260&&Math.random()<.29;
    return {x:660,w:flying?32:rand(24,43),h:flying?32:rand(29,46),type:flying?'alert':Math.random()<.5?'file':'signal',height:flying?(Math.random()<.5?25:70):0,passed:false};}
  function rect(){const h=st.duck?20:39;return {x:st.x+4,y:Y-st.y-h,w:28,h};}
  function collision(a,b){return a.x < b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;}
  function tick(dt){if(!st.live)return;
    st.clock+=dt;st.score+=dt*13;st.vy-=1120*dt;st.y=Math.max(0,st.y+st.vy*dt);
    if(st.y===0)st.vy=0;
    if(st.score>=100&&!st.runner100){st.runner100=true;earn('runner100');}
    if(st.score>=1000&&!st.runner1000){st.runner1000=true;earn('runner1000');}
    if(st.score>=5000&&!st.runner5000){st.runner5000=true;earn('runner5000');}
    if(st.clock>=180&&!st.runner180){st.runner180=true;earn('runner180');}
    const speed=Math.min(380,175+st.clock*.47);st.spawn-=dt;
    if(st.spawn<=0){st.ob.push(obstacle());st.spawn=Math.max(.66,1.28-st.clock*.0025)+Math.random()*.5;}
    const player=rect();for(const o of st.ob){o.x-=speed*dt;
      const box={x:o.x,y:Y-(o.type==='alert'?o.height+o.h:o.h),w:o.w,h:o.h};
      if(collision(player,box)){st.live=false;status.textContent=`Fim de jogo! Você marcou ${Math.floor(st.score)} pontos. Pressione Reiniciar.`;best(Math.floor(st.score));}
      if(o.x+o.w<st.x&&!o.passed){o.passed=true;if(o.type==='alert'){st.alertCount++;earn('runnerFlyerDodge');}}
    }
    st.ob=st.ob.filter(o=>o.x+o.w>-10);
    points.textContent=`Pontos: ${Math.floor(st.score)} · Recorde: ${Math.max(recordBest,Math.floor(st.score))}`;
    if(Math.floor(st.clock)%5===0 && Math.floor(st.clock)!==st.lastSave){st.lastSave=Math.floor(st.clock);recordBest=best(Math.floor(st.score));}
  }
  function draw(){ctx.fillStyle='#f2f2f2';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#d1d1d1';for(let i=0;i<13;i++)ctx.fillRect((i*91-(st.clock*16)%91+W)%W,15+(i%3)*23,32,2);
    ctx.fillStyle='#444';ctx.fillRect(0,Y,W,3);
    ctx.fillStyle='#777';for(let i=0;i<24;i++)ctx.fillRect(((i*35-(st.clock*110)%35)+W)%W,Y+12,17,2);
    const pr=rect();ctx.fillStyle='#353c43';ctx.fillRect(pr.x,pr.y,pr.w,pr.h);
    // Sad face runner: square avatar with short, pixel eyes and downturned mouth.
    ctx.fillStyle='#f0f0f0';ctx.fillRect(pr.x+7,pr.y+6,4,5);ctx.fillRect(pr.x+19,pr.y+6,4,5);
    ctx.fillStyle='#444';ctx.fillRect(pr.x+8,pr.y+9,2,2);ctx.fillRect(pr.x+20,pr.y+9,2,2);
    ctx.fillStyle='#d2d2d2';ctx.fillRect(pr.x+7,pr.y+20,5,3);ctx.fillRect(pr.x+12,pr.y+17,8,3);ctx.fillRect(pr.x+20,pr.y+20,4,3);
    if(!st.duck){ctx.fillStyle='#222';ctx.fillRect(pr.x+5,pr.y+pr.h,5,5);ctx.fillRect(pr.x+21,pr.y+pr.h,5,5);}
    for(const o of st.ob){const oy=Y-(o.type==='alert'?o.height+o.h:o.h);ctx.fillStyle='#666';
      if(o.type==='file'){ctx.fillRect(o.x,oy,o.w,o.h);ctx.fillStyle='#eee';ctx.fillRect(o.x+4,oy+4,o.w-8,o.h-8);ctx.fillStyle='#444';ctx.fillRect(o.x+8,oy+12,o.w-16,4);ctx.fillRect(o.x+8,oy+19,o.w-16,3);}
      else if(o.type==='signal'){ctx.fillRect(o.x,oy,o.w,o.h);ctx.fillStyle='#eee';ctx.fillRect(o.x+5,oy+5,o.w-10,o.h-10);ctx.strokeStyle='#555';ctx.lineWidth=3;ctx.beginPath();ctx.arc(o.x+o.w/2,oy+o.h/2,7,Math.PI*1.1,Math.PI*1.9);ctx.stroke();ctx.fillStyle='#555';ctx.fillRect(o.x+o.w/2-2,oy+o.h/2+2,5,5);}
      else {ctx.fillStyle='#555';ctx.fillRect(o.x,oy,o.w,o.h);ctx.fillStyle='#eee';ctx.fillRect(o.x+3,oy+3,o.w-6,o.h-6);ctx.fillStyle='#353535';ctx.font='bold 22px monospace';ctx.fillText('!',o.x+12,oy+25);ctx.fillRect(o.x-8,oy+8,8,3);ctx.fillRect(o.x+o.w,oy+19,7,3);}
    }
  }
  function frame(ts){if(!active)return;const dt=st.last?Math.min(.05,(ts-st.last)/1000):0;st.last=ts;tick(dt);draw();raf=requestAnimationFrame(frame);}
  function key(e){if(!active)return;if(['ArrowUp',' ','ArrowDown'].includes(e.key))e.preventDefault();if(e.key==='ArrowUp'||e.key===' ')jump();if(e.key==='ArrowDown')duck(true);}
  function up(e){if(e.key==='ArrowDown')duck(false);}
  function press(e){const b=e.target.closest('[data-run]');if(!b)return;const action=b.dataset.run;if(action==='jump')jump();else if(action==='restart')reset();else if(action==='close')close();}
  function touch(e){if(e.target.closest('button'))return;e.preventDefault();jump();}
  root.addEventListener('keydown',key);root.addEventListener('keyup',up);root.addEventListener('click',press);
  cv.addEventListener('pointerdown',touch);
  const duckBtn=root.querySelector('[data-run="duck"]');duckBtn.addEventListener('pointerdown',()=>duck(true));
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>duckBtn.addEventListener(ev,()=>duck(false)));
  function close(silent=false){if(!active)return;best(Math.floor(st?.score||0));active=false;cancelAnimationFrame(raf);root.removeEventListener('keydown',key);root.removeEventListener('keyup',up);root.removeEventListener('click',press);cv.removeEventListener('pointerdown',touch);host.innerHTML='';if(!silent)onExit();}
  reset();raf=requestAnimationFrame(frame);return {close,reset,getState:()=>({...st})};
}
window.CQ_RUNNER={startGame,earn,record};
})();
