// Carrega os bancos no Node com um "window" falso. Uso: const W=require('./loaddata')(rootDir)
const fs=require('fs'),path=require('path'),vm=require('vm');
module.exports=function(root,files){
  const w={};
  const ctx=vm.createContext({window:w,console,Object,Array,Math,JSON,String,Number,Set,Map,Error,RegExp,Date});
  for(const f of files||['data.js','data-b3.js','data-b2.js','data-b1.js','data-b5.js']){
    const p=path.join(root,'assets','js',f);
    if(!fs.existsSync(p))continue;
    vm.runInContext(fs.readFileSync(p,'utf8'),ctx,{filename:f});
  }
  return w;
};
