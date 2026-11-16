/* Versões por data (comparador), relógio simulado, nome dinâmico do sistema e script de build. */
'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const {load,ROOT}=require('./lib/load.js');
let checks=0;const ok=(c,m)=>{assert.ok(c,m);checks++};const eq=(a,b,m)=>{assert.equal(a,b,m);checks++};
// ---------- comparador ----------
const w=load(['clock.js']);const V=w.CQ.ver;
const order=['1.0.0','2.0.5','2.0.9','2.0.10','2.1.0','10.0.0','26nov16','26nov16.1','26nov16.2','26nov16.10','27nov16','01dez16','31dez16','01jan17','15fev26x'];
const valid=order.slice(0,-1);
for(let i=0;i<valid.length;i++)for(let j=0;j<valid.length;j++){
  const c=V.compare(valid[i],valid[j]);eq(c,Math.sign(i-j),`compare(${valid[i]},${valid[j]})`);
}
// armadilhas da comparação lexicográfica ingênua
ok(V.compare('2.0.10','2.0.9')>0,'2.0.10 > 2.0.9 (numérico, não lexicográfico)');
ok(V.compare('26nov16.10','26nov16.2')>0,'.10 > .2');
ok(V.compare('26nov16','2.0.9')>0,'esquema por data é sempre mais novo que o legado');
ok(V.compare('26nov16.1','26nov16')>0,'26nov16.1 > 26nov16');
ok(V.compare('01jan27','31dez26')>0,'virada de ano');
ok(V.compare('v2.0.9','2.0.9')===0,'prefixo v tolerado');
ok(V.parse('32nov16')===null&&V.parse('00nov16')===null,'dia inválido');ok(V.parse('26xxx16')===null&&V.parse('abc')===null&&V.parse('')===null&&V.parse(null)===null,'inválidas');
ok(V.compare('lixo','2.0.9')<0&&V.compare('2.0.9','lixo')>0,'inválida é menor que válida');
ok(V.buildKey('16112026.135032')===20261116135032,'chave de compilação');ok(V.isBuild('16112026.135032')&&!V.isBuild('2026.11')&&!V.isBuild('16112026.13503'),'formato de compilação');
ok(V.buildKey('17112026.000001')>V.buildKey('16112026.235959'),'compilações ordenam por data');
// ---------- relógio simulado ----------
function mk(init={}){
  const w=load(['clock.js']);const CQ=w.CQ;const st=Object.assign({},init);
  CQ.sys={get:k=>st[k],set:p=>Object.assign(st,p)};CQ.bus={emit(){},on(){}};return {C:CQ.clock,st};
}
{ // nomes do sistema
  const {C}=mk();
  const cases=[[1998,'ClaQui 98'],[1999,'ClaQui 99'],[2000,'ClaQui 2000'],[2001,'ClaQui 01'],[2003,'ClaQui 03'],[2009,'ClaQui 09'],[2026,'ClaQui 26'],[2050,'ClaQui 50'],[2100,'ClaQui 00'],[1900,'ClaQui 00'],[9999,'ClaQui 99']];
  for(const [y,n] of cases)eq(C.nameForYear(y),n,'nome para '+y);
}
{ // modo dispositivo espelha Date.now
  const {C}=mk({clockMode:'device',clockTz:'-180'});const a=Date.now(),b=C.now(),c=Date.now();ok(b>=a&&b<=c,'modo dispositivo = relógio real');
}
for(const tz of ['device','-180','0','540','330','-720','720']){
  const {C,st}=mk({clockTz:tz,clock24:true});
  for(const [y,mo,d,H,M,S] of [[1999,11,31,23,59,58],[2000,0,1,0,0,0],[2003,5,15,12,30,45],[2026,10,16,13,50,32],[2050,1,28,6,7,8],[2024,1,29,23,0,1],[1601,0,1,0,0,0],[9999,11,31,23,59,59],[1970,0,1,0,0,0]]){
    const t=C.compose({y,mo,d,H,M,S});const p=C.parts(t);
    ok(p.y===y&&p.mo===mo&&p.d===d&&p.H===H&&p.M===M&&p.S===S,`compose/parts ida e volta tz=${tz} ${y}-${mo+1}-${d} ${H}:${M}:${S} -> ${JSON.stringify(p)}`);
  }
}
{ // manual: escolhe 1999 e o relógio ANDA a partir dali (não congela)
  const {C,st}=mk({clockTz:'-180',clock24:true});
  const t0=C.setManual({y:1999,mo:5,d:10,H:8,M:15,S:0});
  eq(C.parts().y,1999,'ano manual 1999');eq(C.osName(),'ClaQui 99','nome 1999');ok(C.isManual()&&!C.isFrozen(),'manual e andando');
  const a=C.now();const spin=Date.now()+60;while(Date.now()<spin);const b=C.now();ok(b-a>=50,'relógio manual avança com o tempo real');
  ok(Math.abs(C.now()-t0)<2000,'parte do valor escolhido');
  C.setManual({y:2000,mo:0,d:1,H:0,M:0,S:0});eq(C.osName(),'ClaQui 2000','ano 2000 usa nome completo');
  C.setManual({y:2003,mo:6,d:4,H:12,M:0,S:0});eq(C.osName(),'ClaQui 03','2003');
  C.setManual({y:2026,mo:10,d:16,H:12,M:0,S:0});eq(C.osName(),'ClaQui 26','2026');
  // congelar é opção explícita
  C.setFrozen(true);const f1=C.now();const sp=Date.now()+40;while(Date.now()<sp);eq(C.now(),f1,'congelado não anda');ok(C.isFrozen(),'isFrozen');
  C.setFrozen(false);const sp2=Date.now()+40;while(Date.now()<sp2);ok(C.now()>f1,'descongelado volta a andar');
  C.setDevice();ok(!C.isManual()&&Math.abs(C.now()-Date.now())<50,'voltar ao dispositivo');
  // o relógio real do aparelho (Date.now) nunca é alterado
  const real=Date.now();C.setManual({y:1980,mo:0,d:1,H:0,M:0,S:0});ok(Math.abs(Date.now()-real)<50,'Date.now real intacto');
}
{ // persistência: estado vive em CQ.sys (gravado em localStorage pelo sistema); novo "boot" com o mesmo estado reproduz a data
  const a=mk({clockTz:'-180'});a.C.setManual({y:1999,mo:11,d:31,H:23,M:59,S:50});
  const saved=JSON.parse(JSON.stringify(a.st));const b=mk(saved);
  eq(b.C.parts().y,1999,'após reiniciar continua em 1999');eq(b.C.osName(),'ClaQui 99','nome persiste');
  const sp=Date.now()+20;while(Date.now()<sp);ok(b.C.parts().d===31||b.C.parts().y===2000,'continua andando após reiniciar');
}
{ // limites e dias do mês
  const {C}=mk({clockTz:'0'});eq(C.parts(C.compose({y:2023,mo:1,d:31,H:0,M:0,S:0})).d,28,'31/fev -> 28 (ano comum)');eq(C.parts(C.compose({y:2024,mo:1,d:31,H:0,M:0,S:0})).d,29,'31/fev -> 29 (bissexto)');
  eq(C.parts(C.compose({y:1900,mo:1,d:29,H:0,M:0,S:0})).d,28,'1900 não é bissexto');eq(C.parts(C.compose({y:2000,mo:1,d:29,H:0,M:0,S:0})).d,29,'2000 é bissexto');
  eq(C.parts(C.compose({y:5,mo:0,d:1})).y,1601,'ano mínimo');eq(C.parts(C.compose({y:20000,mo:0,d:1})).y,9999,'ano máximo');
}
{ // formatação 12/24 h
  const {C,st}=mk({clockTz:'0',clock24:true});const t=C.compose({y:2026,mo:10,d:16,H:14,M:5,S:9});
  eq(C.fmtTime(t),'14:05','24 h');eq(C.fmtTime(t,true),'14:05:09','24 h com segundos');st.clock24=false;eq(C.fmtTime(t),'2:05 PM','12 h PM');
  eq(C.fmtTime(C.compose({y:2026,mo:0,d:1,H:0,M:0,S:0})),'12:00 AM','meia-noite');eq(C.fmtTime(C.compose({y:2026,mo:0,d:1,H:12,M:0,S:0})),'12:00 PM','meio-dia');
  eq(C.fmtDate(t),'16/11/2026','data');ok(/Segunda-feira, 16 de novembro de 2026/.test(C.fmtLong(t)),'data por extenso');
}
// ---------- script de build ----------
const B=require(path.join(ROOT,'tools/build.js'));
const t1={y:2026,m:11,d:16,H:13,M:50,S:32};
eq(B.dayBase(t1),'16nov26','base do dia');eq(B.buildId(t1),'16112026.135032','compilação DDMMAAAA.HHMMSS');
eq(B.nextVersion(null,t1),'16nov26','sem release anterior');eq(B.nextVersion({version:'2.0.9'},t1),'16nov26','legado -> data sem sufixo');
eq(B.nextVersion({version:'16nov26'},t1),'16nov26.1','2º lançamento no dia');eq(B.nextVersion({version:'16nov26.1'},t1),'16nov26.2','3º lançamento');eq(B.nextVersion({version:'16nov26.9'},t1),'16nov26.10','10º');
eq(B.nextVersion({version:'16nov26.2'},{...t1,d:17}),'17nov26','outro dia volta sem sufixo');eq(B.nextVersion({version:'31dez26.3'},{y:2027,m:1,d:1,H:0,M:0,S:0}),'01jan27','virada de ano');
ok(B.uniqueBuild('16112026.135032',t1)!=='16112026.135032','build repetido é desduplicado');ok(B.uniqueBuild('16112026.135032',{...t1,S:33})==='16112026.135033','build novo mantido');
eq(B.MONTHS.join(),'jan,fev,mar,abr,mai,jun,jul,ago,set,out,nov,dez','meses em português');
const sp=B.saoPaulo(new Date('2026-11-17T02:30:00Z'));eq(sp.d,16,'fuso America/Sao_Paulo (23h30 do dia anterior)');eq(sp.H,23,'hora de Brasília');
// os arquivos gerados estão coerentes com o disco (senão rode node tools/build.js)
const {spawnSync}=require('node:child_process');const r=spawnSync(process.execPath,[path.join(ROOT,'tools/build.js'),'--check'],{encoding:'utf8'});
ok(r.status===0,'version.json, build-info.js, asset-manifest.json e sw.js coerentes: '+(r.stderr||''));
const vj=JSON.parse(fs.readFileSync(path.join(ROOT,'version.json'),'utf8'));ok(V.isValid(vj.version)&&V.isBuild(vj.build),'version.json válido');
console.log(`Relógio/versões/build 26nov16: ${checks} verificações OK.`);
