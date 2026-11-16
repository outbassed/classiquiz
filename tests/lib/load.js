// Carrega scripts de assets/js num contexto vm com um "window" falso (sem DOM). Uso em Node.
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..','..');
exports.ROOT=ROOT;
exports.load=function(files,extra){
  const w={};
  const ctx=vm.createContext(Object.assign({window:w,console,Object,Array,Math,JSON,String,Number,Set,Map,Error,RegExp,Date,Uint8Array,Symbol,globalThis:undefined},extra||{}));
  ctx.globalThis=ctx;
  for(const f of files){
    const p=path.join(ROOT,'assets','js',f);
    vm.runInContext(fs.readFileSync(p,'utf8'),ctx,{filename:f});
  }
  return w;
};
exports.LEGACY_DATA=['data.js','data-b3.js','data-b2.js','data-b1.js','data-b5.js'];
