from pathlib import Path
base=Path(__file__).resolve().parent.parent
out=base/'assets/cursors';out.mkdir(exist_ok=True)
# Original vector cursors, no use of Windows cursor files.
roles={
'normal': ('Seleção normal','M 3 2 L 3 26 L 9 20 L 14 30 L 19 27 L 14 18 L 23 17 Z','1 1','default'),
'help': ('Seleção de ajuda','M 3 2 L 3 26 L 9 20 L 14 30 L 19 27 L 14 18 L 23 17 Z','1 1','help'),
'working': ('Trabalhando em segundo plano','M 2 2 L 2 23 L 8 18 L 12 28 L 17 26 L 13 16 L 21 15 Z','1 1','progress'),
'busy': ('Ocupado','M 16 3 A 13 13 0 1 1 15.99 3 Z','16 16','wait'),
'precision': ('Seleção de precisão','M 16 1 L 16 31 M 1 16 L 31 16 M 10 16 A 6 6 0 1 0 22 16 A 6 6 0 1 0 10 16','16 16','crosshair'),
'login': ('Seleção de texto','M 9 4 H 23 M 16 4 V 28 M 9 28 H 23','16 15','text'),
'handwriting': ('Escrita manual','M 6 25 L 11 15 L 25 2 L 30 7 L 16 21 Z M 6 25 L 3 31 L 10 28','6 25','crosshair'),
'unavailable': ('Indisponível','M 16 3 A 13 13 0 1 1 15.99 3 Z M 7 7 L 25 25','16 16','not-allowed'),
'ns': ('Redimensionar vertical','M 16 2 L 10 9 H 14 V 23 H 10 L 16 30 L 22 23 H 18 V 9 H 22 Z','16 16','ns-resize'),
'ew': ('Redimensionar horizontal','M 2 16 L 9 10 V 14 H 23 V 10 L 30 16 L 23 22 V 18 H 9 V 22 Z','16 16','ew-resize'),
'nwse': ('Redimensionar diagonal ↖↘','M 3 3 L 14 3 L 10 7 L 25 22 L 29 18 V 29 H 18 L 22 25 L 7 10 L 3 14 Z','16 16','nwse-resize'),
'nesw': ('Redimensionar diagonal ↗↙','M 29 3 H 18 L 22 7 L 7 22 L 3 18 V 29 H 14 L 10 25 L 25 10 L 29 14 Z','16 16','nesw-resize'),
'move': ('Mover','M 16 1 L 10 9 H 14 V 14 H 9 V 10 L 1 16 L 9 22 V 18 H 14 V 23 H 10 L 16 31 L 22 23 H 18 V 18 H 23 V 22 L 31 16 L 23 10 V 14 H 18 V 9 H 22 Z','16 16','move'),
'up': ('Seleção alternativa','M 16 2 L 3 17 L 12 17 V 29 H 20 V 17 H 29 Z','16 2','default'),
'link': ('Seleção de link','M 11 28 L 6 22 L 5 18 Q 5 15 8 15 Q 10 15 13 19 V 5 Q 13 2 16 2 Q 19 2 19 5 V 14 Q 24 11 26 16 L 26 23 L 22 29 Z','16 3','pointer')
}
colors={
'classico': ('#ffffff','#111111','#ffffff'),
'xp': ('#eaf2ff','#173c8e','#649de2'),
'aero': ('#edfaff','#225a85','#5cc9eb'),
'claqui': ('#fff5bf','#54347a','#e7b13a')
}
for theme,(fill,line,accent) in colors.items():
 for role,(_,path,hot,fb) in roles.items():
  for size in (24,32,40):
   stroke=f'{line}'
   extra=''
   if role in ('busy','working'):
    extra='<path d="M16 5 A11 11 0 0 1 26 17" stroke="'+accent+'" stroke-width="3.5" stroke-linecap="round" fill="none"/>' if role=='busy' else '<circle cx="24" cy="22" r="6" fill="'+accent+'" stroke="'+line+'" stroke-width="1.5"/>'
   elif role=='help':extra=f'<text x="20" y="17" font-size="17" font-family="Arial" font-weight="bold" fill="{accent}" stroke="{line}" stroke-width=".3">?</text>'
   elif role=='link':extra=f'<path d="M19 14 V9 Q19 6 22 7 Q25 8 25 11" stroke="{accent}" stroke-width="2" fill="none"/>'
   path_style=('fill="none" stroke-width="3"' if role in ('precision','login','handwriting') else 'fill="'+fill+'" stroke-width="1.65"')
   svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 32 32"><path d="{path}" {path_style} stroke="{stroke}" stroke-linejoin="round" stroke-linecap="round"/>{extra}</svg>'
   p=out/f'{theme}-{role}-{size}.svg';p.write_text(svg)
# script generates self-contained cursor catalogue, settings apply, optional trail
js='''/* ClaQui OS: cursores originais inspirados em eras da informática. Nenhum arquivo do Windows é usado. */
(() => {
'use strict';
const CQ = window.CQ, OS = CQ.os;
const roles = [
 ['normal','Seleção normal','default',1,1],['help','Seleção de ajuda','help',1,1],
 ['working','Trabalhando em segundo plano','progress',1,1],['busy','Ocupado','wait',16,16],
 ['precision','Seleção de precisão','crosshair',16,16],['login','Seleção de texto','text',16,15],
 ['handwriting','Escrita manual','crosshair',6,25],['unavailable','Indisponível','not-allowed',16,16],
 ['ns','Redimensionar vertical','ns-resize',16,16],['ew','Redimensionar horizontal','ew-resize',16,16],
 ['nwse','Redimensionar diagonal ↖↘','nwse-resize',16,16],['nesw','Redimensionar diagonal ↗↙','nesw-resize',16,16],
 ['move','Mover','move',16,16],['up','Seleção alternativa','default',16,2],['link','Seleção de link','pointer',16,3]
];
const schemes = [['classico','Clássico 95/98'],['xp','Estilo XP'],['aero','Estilo Aero'],['claqui','ClaQui Original']];
const role = id => roles.find(r => r[0] === id) || roles[0];
function cursorCss(r, scheme, size) {
 const [id,,fallback,x,y] = r, zoom = size / 32;
 return `url("assets/cursors/${scheme}-${id}-${size}.svg") ${Math.round(x*zoom)} ${Math.round(y*zoom)}, ${fallback}`;
}
const api = CQ.mouse = {roles,schemes,apply,preview,reset};
function preview(id, scheme, size) { return cursorCss(role(id), scheme, size); }
function apply() {
 const sys = CQ.sys.all(), r = document.documentElement;
 const scheme = schemes.some(x=>x[0]===sys.mouseScheme)?sys.mouseScheme:'classico';
 const size = [24,32,40].includes(sys.mouseSize)?sys.mouseSize:32;
 const settings = (sys.mouseRoles && typeof sys.mouseRoles === 'object') ? sys.mouseRoles : {};
 for (const typ of roles) {
  const curr = schemes.some(x=>x[0]===settings[typ[0]])?settings[typ[0]]:scheme;
  r.style.setProperty('--cq-cur-'+typ[0], cursorCss(typ,curr,size));
 }
 r.dataset.mouseTrail = sys.mouseTrail ? 'on' : 'off';
}
function reset() { CQ.sys.set({mouseScheme:'classico',mouseSize:32,mouseRoles:{},mouseTrail:false}); apply(); }
let trailAt = 0;
document.addEventListener('pointermove', e => {
 if (e.pointerType !== 'mouse' || !CQ.sys.get('mouseTrail') || OS.reducedMotion() || !document.querySelector('#app')?.contains(e.target)) return;
 const now = performance.now(); if (now - trailAt < 36) return; trailAt = now;
 const dot = document.createElement('span'); dot.className = 'cq-mouse-trail';
 const size = Math.max(4, Math.round((CQ.sys.get('mouseSize') || 32) / 5));
 dot.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:${size}px;height:${size}px`;
 document.body.append(dot); dot.addEventListener('animationend', () => dot.remove(), {once:true});
}, {passive:true});
})();
'''
(base/'assets/js/mouse.js').write_text(js)
css='''/* Ponteiros do ClaQui OS (somente na área do aplicativo). */
@media (pointer:fine){
 #app{cursor:var(--cq-cur-normal,default)}
 #app button:not(:disabled),#app [data-act],#app .desktop-shortcut,#app [role="menuitem"],#app select,#app label[for]{cursor:var(--cq-cur-link,pointer)}
 #app button:disabled{cursor:var(--cq-cur-unavailable,not-allowed)}
 #app textarea,#app input:not([type="range"]),#app .selectable,#app .np-text{cursor:var(--cq-cur-login,text)}
 #app .drag-object,#app [data-drag]{cursor:var(--cq-cur-move,move)}
 #app .win-resize.n,#app .win-resize.s{cursor:var(--cq-cur-ns,ns-resize)}
 #app .win-resize.e,#app .win-resize.w{cursor:var(--cq-cur-ew,ew-resize)}
 #app .win-resize.ne,#app .win-resize.sw{cursor:var(--cq-cur-nesw,nesw-resize)}
 #app .win-resize.nw,#app .win-resize.se{cursor:var(--cq-cur-nwse,nwse-resize)}
 #app [data-mouse-role]{cursor:var(--cq-cur-normal,default)}
}
.cq-mouse-trail{position:fixed;z-index:99999;pointer-events:none;background:#dfb94d;opacity:.7;border:1px solid #3f408e;border-radius:50%;transform:translate(-50%,-50%);animation:cq-trail-fade .45s ease-out forwards}
@keyframes cq-trail-fade{to{opacity:0;transform:translate(-50%,-50%) scale(.2)}}
@media(prefers-reduced-motion:reduce){.cq-mouse-trail{display:none}}
.mouse-role-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(225px,1fr));gap:9px;margin:10px 0 18px}
.mouse-role{display:flex;flex-direction:column;gap:5px;padding:10px;background:#f0f1f6;border:2px inset #fff;min-width:0}
.mouse-role label{font-size:12px;font-weight:800}.mouse-role-preview{background:#fff;border:1px solid #9b9ca8;min-height:56px;display:flex;align-items:center;justify-content:center;font-size:12px;letter-spacing:.02em;color:#35466d;user-select:none}
.mouse-role select{width:100%;min-width:0}.mouse-head{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.mouse-head label{flex:1;min-width:135px}
'''
(base/'assets/css/mouse.css').write_text(css)
