/* Cursor catalogue: 15 roles x 4 themes x 3 sizes, persistent preferences. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..'),props={}, attrs={},storage={mouseScheme:'claqui',mouseSize:40,mouseRoles:{help:'aero'},mouseTrail:true};
const CQ={sys:{get:k=>storage[k],all:()=>storage,set:patch=>Object.assign(storage,patch)},os:{reducedMotion:()=>false}};
const doc={baseURI:'http://127.0.0.1:8768/',documentElement:{style:{setProperty:(name,v)=>props[name]=v},dataset:attrs},addEventListener:()=>{}};
const context={window:{CQ},document:doc,performance:{now:()=>0},URL};
vm.runInNewContext(fs.readFileSync(path.join(base,'assets/js/mouse.js'),'utf8'),context);
const mouse=context.window.CQ.mouse;let count=0;
assert.equal(mouse.roles.length,15);assert.equal(mouse.schemes.length,4);count+=2;
mouse.apply();
for(const [name,,,,] of mouse.roles){
 const value=props[`--cq-cur-${name}`]; assert(value && value.includes('-40.png'),name);count++;
}
assert(props['--cq-cur-help'].includes('aero-help-40.png'));count++;
// Regressão: caminho absoluto evita assets/css/assets/cursors/ e resolve 404.
assert(props['--cq-cur-normal'].includes('url("http://127.0.0.1:8768/assets/cursors/claqui-normal-40.png")'));count++;
assert(!props['--cq-cur-normal'].includes('assets/css/assets'));count++;
assert(props['--cq-cur-normal'].includes('claqui-normal-40.png'));count++;
assert.equal(attrs.mouseTrail,'on');count++;
for(const [scheme] of mouse.schemes)for(const [role] of mouse.roles)for(const size of [24,32,40]){
 const filepath=path.join(base,'assets/cursors',`${scheme}-${role}-${size}.svg`);
 assert(fs.existsSync(filepath),filepath);assert(fs.readFileSync(filepath,'utf8').startsWith('<svg'));count++;
 const pngpath=filepath.replace(/\.svg$/,'.png');
 assert(fs.existsSync(pngpath),pngpath);assert.equal(fs.readFileSync(pngpath).subarray(0,8).toString('hex'),'89504e470d0a1a0a');count++;
}
mouse.reset();assert.equal(storage.mouseScheme,'classico');assert.equal(storage.mouseSize,32);assert.equal(storage.mouseTrail,false);count+=3;
console.log(`Mouse: ${count} verificações OK (15 funções, 180 SVGs e 180 PNGs)`);
