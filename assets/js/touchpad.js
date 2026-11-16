/* ClaQui OS — touchpad virtual opcional para telas de toque. MIT. */
(() => {
'use strict';
const CQ=window.CQ, app=()=>document.getElementById('app');
const touchDevice=()=>matchMedia('(pointer:coarse)').matches || /Android|iPad|iPhone|Mobile|Tablet/i.test(navigator.userAgent);
let x=innerWidth*.48,y=innerHeight*.42, held=false, downTarget=null, lastHover=null, moved=false;
const pointers=new Map(); let baseX=0,baseY=0;
const el=document.createElement('div');el.id='cq-touchpad';el.hidden=true;el.setAttribute('aria-label','Touchpad virtual ClaQui OS');
el.innerHTML=`<div class="cq-touchpad-title"><span>▣ TOUCHPAD</span><button type="button" data-tp="fold" title="Recolher touchpad" aria-label="Recolher touchpad">−</button></div>
<div class="cq-touchpad-surface" data-tp="surface" aria-label="Mova o dedo para controlar o ponteiro"></div>
<div class="cq-touchpad-buttons"><button type="button" data-tp="left">Esquerdo</button><button type="button" data-tp="right">Direito</button><button type="button" data-tp="hold" aria-pressed="false">Segurar</button></div>`;
const dot=document.createElement('img');dot.id='cq-touch-cursor';dot.alt='';dot.setAttribute('aria-hidden','true');dot.hidden=true;
function targetAt(){const hidden=dot.hidden;dot.hidden=true;const t=document.elementFromPoint(x,y);dot.hidden=hidden;return t?.closest?.('#cq-touchpad')?null:t;}
function pointer(t,name,button=0,buttons=held?1:0){if(!t)return;const ev=new PointerEvent(name,{bubbles:true,cancelable:true,composed:true,pointerId:909,pointerType:'mouse',isPrimary:true,clientX:x,clientY:y,button,buttons});t.dispatchEvent(ev);}
function updateHover(){const t=targetAt();if(!t)return;if(lastHover!==t){if(lastHover){pointer(lastHover,'pointerout');pointer(lastHover,'pointerleave');}pointer(t,'pointerover');pointer(t,'pointerenter');lastHover=t;}pointer(t,'pointermove');}
function updateDot(){x=Math.min(innerWidth-12,Math.max(10,x));y=Math.min(innerHeight-12,Math.max(10,y));dot.style.left=x+'px';dot.style.top=y+'px';const scheme=CQ.sys.get('mouseScheme')||'classico',size=CQ.sys.get('mouseSize')||32;dot.src=`assets/cursors/${scheme}-normal-${size}.png`;dot.style.width=size+'px';updateHover();}
function pointerDown(){const t=targetAt();downTarget=t;pointer(t,'pointerdown');t?.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0,buttons:1}));}
function pointerUp(click=true){const t=targetAt();if(!t)return;pointer(t,'pointerup');t.dispatchEvent(new MouseEvent('mouseup',{bubbles:true,clientX:x,clientY:y,button:0,buttons:0}));if(click&&downTarget===t){t.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0,buttons:0,detail:1}));}downTarget=null;}
function left(){if(held){pointerUp(false);held=false;el.querySelector('[data-tp="hold"]').setAttribute('aria-pressed','false');}else{pointerDown();pointerUp(true);}}
function right(){if(held){pointerUp(false);held=false;el.querySelector('[data-tp="hold"]').setAttribute('aria-pressed','false');}const t=targetAt();if(!t)return;t.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:x,clientY:y,button:2,buttons:2}));}
function toggleHold(){held=!held;el.querySelector('[data-tp="hold"]').setAttribute('aria-pressed',String(held));if(held)pointerDown();else pointerUp(false);}
function scrollUnder(dy){let node=targetAt();for(;node&&node!==document.body;node=node.parentElement){const cs=getComputedStyle(node);if(/auto|scroll/.test(cs.overflowY)&&node.scrollHeight>node.clientHeight+2){node.scrollTop+=dy;return;}}}
function apply(){const on=touchDevice() && CQ.sys.get('touchpadEnabled')===true;el.hidden=!on;dot.hidden=!on;el.dataset.folded=CQ.sys.get('touchpadFolded')?'true':'false';el.dataset.position=CQ.sys.get('touchpadPosition')||'right';el.style.setProperty('--tp-opacity',String(CQ.sys.get('touchpadOpacity')??.88));el.style.setProperty('--tp-size',String(CQ.sys.get('touchpadSize')||'medium'));if(on)updateDot();else{held=false;downTarget=null;lastHover=null;}}
const panel=el.querySelector('[data-tp="surface"]');panel.style.touchAction='none';
panel.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'&&e.pointerType!=='pen')return;e.preventDefault();panel.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,moved:false,at:Date.now()});moved=false;});
panel.addEventListener('pointermove',e=>{const p=pointers.get(e.pointerId);if(!p)return;e.preventDefault();const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;if(Math.abs(dx)+Math.abs(dy)>3){p.moved=true;moved=true;}if(pointers.size>1){scrollUnder(-dy*2);return;}const v=Number(CQ.sys.get('touchpadSensitivity'))||1;x+=dx*v;y+=dy*v;updateDot();});
function end(e){const p=pointers.get(e.pointerId);if(!p)return;pointers.delete(e.pointerId);if(!p.moved&&!moved&&Date.now()-p.at<400&&pointers.size===0)left();}
panel.addEventListener('pointerup',end);panel.addEventListener('pointercancel',e=>pointers.delete(e.pointerId));
el.addEventListener('click',e=>{const btn=e.target.closest('[data-tp]');if(!btn||btn===panel)return;e.stopPropagation();e.preventDefault();const act=btn.dataset.tp;if(act==='left')left();if(act==='right')right();if(act==='hold')toggleHold();if(act==='fold'){CQ.sys.set({touchpadFolded:!CQ.sys.get('touchpadFolded')});apply();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&held){pointerUp(false);held=false;el.querySelector('[data-tp="hold"]').setAttribute('aria-pressed','false');}});
window.addEventListener('resize',updateDot);
app()?.append(el);document.body.append(dot);
CQ.touchpad={apply,left,right,isAvailable:touchDevice};
CQ.bus.on('sys:change',p=>{if(Object.keys(p).some(k=>k.startsWith('touchpad')||k==='mouseScheme'||k==='mouseSize'))apply();});
apply();
})();
