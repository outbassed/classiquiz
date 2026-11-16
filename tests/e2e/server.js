// Servidor estático mínimo para testes. Uso: const {serve}=require('./server'); const s=await serve(dir,port)
const http=require('http'),fs=require('fs'),path=require('path');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.gif':'image/gif','.png':'image/png','.json':'application/json','.txt':'text/plain; charset=utf-8','.webp':'image/webp'};
exports.serve=function(root,port=0){
  return new Promise(resolve=>{
    const srv=http.createServer((req,res)=>{
      let p=decodeURIComponent(req.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
      const f=path.join(root,p);
      if(!f.startsWith(path.resolve(root))){res.writeHead(403);return res.end();}
      fs.readFile(f,(e,buf)=>{if(e){res.writeHead(404);return res.end('404');}res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});res.end(buf);});
    });
    srv.listen(port,'127.0.0.1',()=>resolve({srv,port:srv.address().port,close:()=>srv.close()}));
  });
};

