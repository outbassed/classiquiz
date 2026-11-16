/* ClaQui OS: cursores originais inspirados em eras da informática. Nenhum arquivo do Windows é usado. */
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
 // URLs inside CSS custom properties are resolved from the consuming stylesheet.
 // A relative "assets/cursors/" pointed to assets/css/assets/cursors/ (404),
 // leaving the browser's system pointer unchanged. Resolve from the HTML URL.
 const file = `assets/cursors/${scheme}-${id}-${size}`;
 const url = ext => document.baseURI ? new URL(file+ext, document.baseURI).href : file+ext;
 const hotspot = `${Math.round(x*zoom)} ${Math.round(y*zoom)}`;
 // PNG is reliably supported by Chromium on Windows; SVG remains as a fallback.
 return `url("${url('.png')}") ${hotspot}, url("${url('.svg')}") ${hotspot}, ${fallback}`;
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
