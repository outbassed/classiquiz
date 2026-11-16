/* Inicializador local alternativo, sem pacotes externos. */
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {exec}=require('node:child_process');
const root=__dirname;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.gif':'image/gif','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8','.json':'application/json; charset=utf-8'};
const server=http.createServer((req,res)=>{
  const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+(p==='/'?'/index.html':p));
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.stat(file,(err,s)=>{if(err||!s.isFile()){res.writeHead(404);res.end('Arquivo nao encontrado');return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
});
server.listen(8765,'127.0.0.1',()=>{
 const url=`http://127.0.0.1:${server.address().port}/`;
 console.log('ClassiQuiz 2.0.0: '+url+'\nDeixe esta janela aberta enquanto joga. Ctrl+C para encerrar.');
 exec(`start "" "${url}"`);
});

server.on('error',err=>{console.error('Erro ao iniciar: porta 8765 indisponível.',err.message);process.exitCode=1;});
