/* Desvio CQ — arcade original de reflexos, obstáculos e bônus para ClaQui OS.
   Personagens, desenho e regras próprios; nenhuma dependência de franquias externas.
   Licença: MIT. */
(() => {
'use strict';
const CQ = window.CQ, A = CQ.apps, W = 480, H = 360, LEVEL_SECONDS = 20;
const DIRS = {up:[0,-1],left:[-1,0],down:[0,1],right:[1,0]};
const storeKey = 'classiquiz.v1.desvio.highscore';
const levelKey = 'classiquiz.v1.desvio.bestlevel';
const rand = (a,b) => a + Math.random() * (b-a);
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const stats = name => CQ.game?.statApp?.(name);
function init() {
  return {x:W/2,y:H-48,alive:3,level:1,elapsed:0,levelTime:0,score:0,
    best:Number(CQ.store.read(storeKey,0))||0,bestLevel:Number(CQ.store.read(levelKey,1))||1, ob:[],items:[],spawn:0,itemClock:0,
    damaged:0,invuln:0,shield:0,slow:0,motion:{up:false,left:false,down:false,right:false},
    started:false,paused:true,over:false,runMarked:false,masterMarked:false,level25Marked:false,level50Marked:false,level100Marked:false,
    timer:null,last:0};
}
let game = init();
function markScore(points) {
  game.score += points;
  if (game.score > game.best) {game.best=game.score; CQ.store.write(storeKey,game.best);}
}
function reset(){const old=game; game=init(); game.timer=old.timer; game.last=performance.now();}
function start() {
  if(game.over)reset();
  if(!game.started) {game.started=true;stats('desvioPlayed');}
  game.paused=false;
}
function makeObstacle(level, playerX = W/2, rng = Math.random) {
  const type = rng() < .62 ? 'block' : rng() < .65 ? 'wave' : 'tracker';
  const size = 18 + rng()*21;
  const fromX = type==='tracker' ? clamp(playerX + (rng()-.5)*200,12,W-12-size) : 12 + rng()*(W-size-24);
  // Dificuldade cresce até um teto jogável; sem limite artificial de níveis.
  return {x:fromX,y:-size-3,w:size,h:size,v:Math.min(215,95+Math.min(level,30)*7)+rng()*35,phase:rng()*6.28,type,t:0};
}
function circlesHit(x1,y1,r,x2,y2,w,h){const dx=x1-clamp(x1,x2,x2+w),dy=y1-clamp(y1,y2,y2+h);return dx*dx+dy*dy<r*r;}
function tick(dt){
  if(game.paused || game.over || !game.started)return;
  dt=clamp(dt,0,.08);
  game.elapsed+=dt;game.levelTime+=dt;
  if(game.invuln>0)game.invuln-=dt;
  if(game.shield>0)game.shield-=dt;
  if(game.slow>0)game.slow-=dt;
  const k=game.motion,dx=Number(k.right)-Number(k.left),dy=Number(k.down)-Number(k.up),norm=Math.hypot(dx,dy)||1;
  game.x=clamp(game.x+dx/norm*235*dt,14,W-14);
  game.y=clamp(game.y+dy/norm*235*dt,18,H-14);
  if(game.elapsed>=120 && !game.runMarked){game.runMarked=true;stats('desvio120');}
  if(game.levelTime>=LEVEL_SECONDS){
    game.levelTime-=LEVEL_SECONDS;
    stats('desvioLevels'); if(game.damaged===0)stats('desvioClean');
    game.damaged=0;
    game.level++;
    if(game.level>game.bestLevel){game.bestLevel=game.level;CQ.store.write(levelKey,game.bestLevel);}
    if(game.level>=10 && !game.masterMarked){game.masterMarked=true;stats('desvioMaster');}
    if(game.level>=25 && !game.level25Marked){game.level25Marked=true;stats('desvioWin');}
    if(game.level>=50 && !game.level50Marked){game.level50Marked=true;stats('desvio50');}
    if(game.level>=100 && !game.level100Marked){game.level100Marked=true;stats('desvio100');}
    markScore(100);CQ.tone(780,70);
  }
  game.spawn+=dt;
  const period=Math.max(.68,.98-Math.min(game.level-1,20)*.026);
  while(game.spawn>=period){game.spawn-=period;game.ob.push(makeObstacle(game.level,game.x));}
  game.itemClock+=dt;
  if(game.itemClock>=7.7){game.itemClock-=7.7;const type=Math.random()<.64?'point':Math.random()<.5?'shield':'slow';
    game.items.push({x:rand(26,W-26),y:-16,type});}
  const rate=game.slow>0?.55:1;
  for(const ob of game.ob){
    ob.t+=dt;
    ob.y+=ob.v*dt*rate;
    if(ob.type==='wave')ob.x+=Math.sin(ob.t*5.5+ob.phase)*30*dt;
    if(ob.type==='tracker')ob.x+=clamp(game.x-ob.x,-23*dt,23*dt);
    ob.x=clamp(ob.x,0,W-ob.w);
    if(ob.y>H+ob.h){ob.gone=true;markScore(5);continue;}
    // Cada bloco colide uma única vez. Há invulnerabilidade após dano.
    if(game.invuln<=0 && circlesHit(game.x,game.y,11,ob.x,ob.y,ob.w,ob.h)){
      ob.gone=true;
      if(game.shield>0){game.shield=0;markScore(20);CQ.tone(580,65);}
      else {game.alive--;game.damaged++;game.invuln=1.6;CQ.tone(185,120);
        if(game.alive<=0){game.over=true;game.paused=true;}}
    }
  }
  game.ob=game.ob.filter(o=>!o.gone);
  for(const item of game.items){item.y+=(105+Math.min(game.level,35)*3)*dt*rate;
    if(item.y>H+20){item.gone=true;continue;}
    if(Math.hypot(game.x-item.x,game.y-item.y)<23){item.gone=true;
      if(item.type==='point')markScore(75);
      else if(item.type==='shield')game.shield=6;
      else game.slow=5;
      CQ.tone(650,60);
    }
  }
  game.items=game.items.filter(x=>!x.gone);
}
function draw(w){
  const cv=w.body.querySelector('#desvio-cv'); if(!cv)return;
  const c=cv.getContext('2d'); if(!c)return;
  c.fillStyle='#071c2c';c.fillRect(0,0,W,H);
  c.strokeStyle='#164056';c.lineWidth=1;
  for(let x=0;x<=W;x+=24){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}
  for(let y=0;y<=H;y+=24){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
  // Retro scanlines in software: no texture or external assets.
  c.fillStyle='rgba(255,255,255,.035)';for(let y=0;y<H;y+=6)c.fillRect(0,y,W,1);
  game.ob.forEach(ob=>{
    c.fillStyle=ob.type==='block'?'#f06a80':ob.type==='wave'?'#fdab54':'#d885ec';
    c.fillRect(ob.x,ob.y,ob.w,ob.h);
    c.fillStyle='rgba(255,255,255,.22)';c.fillRect(ob.x+3,ob.y+3,ob.w-6,3);
  });
  game.items.forEach(item=>{
    c.save();c.translate(item.x,item.y);
    c.fillStyle=item.type==='point'?'#f4d066':item.type==='shield'?'#6ee3f4':'#a2e6af';
    c.beginPath();c.arc(0,0,9,0,Math.PI*2);c.fill();
    c.fillStyle='#183243';c.font='bold 12px monospace';c.textAlign='center';c.textBaseline='middle';
    c.fillText(item.type==='point'?'★':item.type==='shield'?'S':'◷',0,1);c.restore();
  });
  if(game.invuln<=0||Math.floor(game.invuln*8)%2===0){
    c.save();c.translate(game.x,game.y);
    if(game.shield>0){c.strokeStyle='#6ee3f4';c.lineWidth=3;c.beginPath();c.arc(0,0,18,0,Math.PI*2);c.stroke();}
    // Cursor/sonda com silhueta geométrica original; não é um personagem licenciado.
    c.fillStyle='#67d8eb';c.strokeStyle='#e8ffff';c.lineWidth=2;
    c.beginPath();c.moveTo(0,-12);c.lineTo(11,10);c.lineTo(0,6);c.lineTo(-11,10);c.closePath();c.fill();c.stroke();
    c.fillStyle='#103c58';c.fillRect(-3,-2,6,5);c.restore();
  }
  c.fillStyle='#86d3e4';c.fillRect(0,H-4,W*clamp(game.levelTime/LEVEL_SECONDS,0,1),4);
  const inf=w.body.querySelector('#desvio-stats');if(inf)inf.textContent=`Nível ${game.level} • Pontos: ${game.score} • Recorde: ${game.best} • Melhor nível: ${game.bestLevel} • Vidas: ${game.alive}`;
  const msg=w.body.querySelector('#desvio-msg');if(msg)msg.textContent=game.over?'Fim de jogo. Tente novamente.':!game.started?'Inicie a partida para desviar dos obstáculos.':game.paused?'Pausado.':'Desvie dos blocos e colete bônus: ★ pontos, S escudo, ◷ lentidão.';
}
function setDir(d,on){if(d in game.motion)game.motion[d]=on;}
function bind(w){
  if(w._bound)return; w._bound=true;
  const root=w.body;
  root.addEventListener('click',e=>{const b=e.target.closest('[data-dodge]');if(!b)return;
    if(b.dataset.dodge==='new'){reset();start();}
    else if(b.dataset.dodge==='toggle') {if(!game.started)start();else if(!game.over)game.paused=!game.paused;}
    draw(w);
  });
  root.addEventListener('keydown',e=>{
    const dir={ArrowUp:'up',w:'up',W:'up',ArrowLeft:'left',a:'left',A:'left',ArrowDown:'down',s:'down',S:'down',ArrowRight:'right',d:'right',D:'right'}[e.key];
    if(dir && !e.repeat){e.preventDefault();if(!game.started)start();setDir(dir,true);}
    else if(dir){e.preventDefault();}
    else if(e.key===' '){e.preventDefault();if(!game.started)start();else if(!game.over)game.paused=!game.paused;}
  });
  root.addEventListener('keyup',e=>{const dir={ArrowUp:'up',w:'up',W:'up',ArrowLeft:'left',a:'left',A:'left',ArrowDown:'down',s:'down',S:'down',ArrowRight:'right',d:'right',D:'right'}[e.key];if(dir){e.preventDefault();setDir(dir,false);}});
  root.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-dir]');if(!b)return;e.preventDefault();
    if(!game.started)start();const d=b.dataset.dir;setDir(d,true);b.setPointerCapture?.(e.pointerId);
    // Ação mínima para toque rápido, sem precisar arrastar.
    const v=DIRS[d];game.x=clamp(game.x+v[0]*17,14,W-14);game.y=clamp(game.y+v[1]*17,18,H-14);
  });
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])root.addEventListener(ev,e=>{const b=e.target.closest('[data-dir]');if(b)setDir(b.dataset.dir,false);});
  root.addEventListener('focusout',e=>{if(!root.contains(e.relatedTarget))Object.keys(game.motion).forEach(d=>game.motion[d]=false);});
}
A.desvio={title:'Desvio CQ',icon:'assets/icons/desvio.svg',bodyClass:'page',maxDefault:false,w:650,h:710,persistent:true,
  render(w){
    w.body.innerHTML=`<section class="desvio-game" tabindex="0" aria-label="Desvio CQ, jogo de reflexos">
      <div id="desvio-stats" class="desvio-top" role="status"></div>
      <canvas id="desvio-cv" width="${W}" height="${H}" aria-label="Arena de obstáculos vistos de cima"></canvas>
      <p id="desvio-msg" class="muted" aria-live="polite"></p>
      <div class="dpad" aria-label="Movimentação">
        <button type="button" data-dir="up" aria-label="Cima">↑</button>
        <div><button type="button" data-dir="left" aria-label="Esquerda">←</button><button type="button" data-dir="down" aria-label="Baixo">↓</button><button type="button" data-dir="right" aria-label="Direita">→</button></div>
      </div>
      <div class="actions"><button class="chrome-button primary" type="button" data-dodge="new">Nova partida</button>
        <button class="chrome-button" type="button" data-dodge="toggle">Iniciar / Pausar</button></div>
      <p class="muted">Setas ou WASD no teclado, botões no celular. Desvie dos obstáculos, pegue bônus e avance por níveis sem fim predefinido. Cada nível dura 20 segundos.</p>
    </section>`;
    w.setTitle('Desvio CQ');w.setStatus('Arcade autoral • níveis ilimitados','ClaQui OS');bind(w);
    clearInterval(game.timer);game.last=performance.now();game.timer=setInterval(()=>{
      const now=performance.now(),dt=Math.min((now-game.last)/1000,.08);game.last=now;
      if(!w.minimized&&!document.hidden)tick(dt);draw(w);
    },35);draw(w);w.body.querySelector('.desvio-game')?.focus({preventScroll:true});
  },
  onHide(){game.paused=true;Object.keys(game.motion).forEach(d=>game.motion[d]=false);},
  onClose(){clearInterval(game.timer);game.paused=true;Object.keys(game.motion).forEach(d=>game.motion[d]=false);},
  onShutdown(){game.paused=true;}
};
window.CQ_DESVIO_TEST={makeObstacle,init,tick,get state(){return game;},start,reset};
})();
