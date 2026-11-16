/* ClaQui OS v2.0.4 — compatibilidade de caminhos e exclusões simuladas. */
'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '../assets/js/vfs.js'), 'utf8');
const oldNodes = [
  {path:'C:\\Meu Dispositivo\\Documentos\\anotacao-do-jogador.txt',name:'anotacao-do-jogador.txt',type:'file',kind:'text',text:'não apagar',size:10},
  {path:'C:\\ClaQui\\Imagens\\imagem-antiga.png',name:'imagem-antiga.png',type:'file',kind:'image',blobKey:'c:\\claqui\\imagens\\imagem-antiga.png',size:2},
  {path:'C:\\Windows\\System32\\extra.txt',name:'extra.txt',type:'file',kind:'text',text:'legado',size:6}
];
let saved = new Map();
saved.set('classiquiz.v1.vfs-fallback', {v:3, nodes:oldNodes, trash:[]});
const CQ = {store:{read:(key, fb)=>saved.has(key)?saved.get(key):fb, write:(key,v)=>{saved.set(key,v);return true;}},bus:{emit:()=>{}}};
const context = {window:{CQ, indexedDB:null},Blob,Date,Math,console,setTimeout,clearTimeout,Promise,Map};
vm.createContext(context); vm.runInContext(code, context);
(async () => {
  const V=CQ.vfs; await V.init();
  assert.equal(V.norm('C:\\Meu Dispositivo\\ClaQui\\System32'), 'C:\\ClaQui\\System32');
  assert.equal(V.norm('C:\\ClaQui\\Arquivos de jogo\\Casos'), 'C:\\Arquivos de jogo\\Casos');
  assert.deepEqual(Array.from(V.list(V.HOME), n=>n.name), ['Disco Local CQ:']);
  assert.ok(V.list(V.ROOT).some(n=>n.name==='ClaQui'));
  assert.equal(V.readText('C:\\Documentos\\anotacao-do-jogador.txt'), 'não apagar');
  assert.equal(V.get('C:\\Imagens\\imagem-antiga.png').blobKey, 'c:\\claqui\\imagens\\imagem-antiga.png');
  assert.equal(V.readText('C:\\ClaQui\\System32\\extra.txt'),'legado');
  assert.match(V.readText('C:\\ClaQui\\Registros\\manutencao.log'),/CQ-47/);
  assert.ok(V.get('C:\\ClaQui\\Config\\sistema.ini').hidden);
  assert.doesNotMatch(V.readText('C:\\ClaQui\\System32\\LEIAME-SISTEMA.txt'),/tela azul/i);
  for (const dir of ['Drivers','Fontes','Temas','Media','Inicialização','Temp','Programas','Registros','Config']) {
    const p='C:\\ClaQui\\'+dir;
    assert.equal(V.remove(p).systemEffect,dir);
    assert.equal(V.exists(p),false);
    V.restoreSystemFolder(dir); assert.ok(V.exists(p));
  }
  assert.equal(V.remove('C:\\ClaQui\\System32').system32,true);
  assert.equal(V.exists('C:\\ClaQui\\System32'),false);
  V.ensureSystem(); assert.equal(V.exists('C:\\ClaQui\\System32'),true);
  assert.throws(()=>V.remove('C:\\ClaQui'),/protegido/);
  console.log('vfs-204: migração, árvore, conteúdo, arquivos ocultos, efeitos e recuperação OK');
})().catch(e=>{console.error(e);process.exitCode=1;});
