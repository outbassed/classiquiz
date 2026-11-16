/* ClaQui Browser 26nov16: roteador .cqo, busca do BuscaJá!, catálogo, links internos e segurança do HTML. */
'use strict';
const assert=require('node:assert/strict');
const {load}=require('./lib/load.js');
let checks=0;const ok=(c,m)=>{assert.ok(c,m);checks++};
const w=load(['web-core.js','web-sites-a.js','web-sites-b.js'],{URLSearchParams,encodeURIComponent,decodeURI,decodeURIComponent,Intl,parseInt});const W=w.CQ.web;
const pub=W.publicSites(),sec=W.sites.filter(s=>s.secret);
ok(pub.length>=8,'pelo menos 8 sites públicos');ok(sec.length>=2,'sites secretos existem');
for(const h of ['www.buscaja.cqo','www.claquimail.cqo','www.batepapo.cqo','www.jogolandia.cqo'])ok(W.byHost.has(h),'site '+h);
// --- roteador: variações aceitas
for(const v of ['www.buscaja.cqo','buscaja.cqo','http://www.buscaja.cqo','https://buscaja.cqo/','HTTP://WWW.BUSCAJA.CQO','  www.buscaja.cqo/  ','buscaja.cqo/index.html']){const r=W.resolve(v);ok(r.ok&&r.url==='www.buscaja.cqo','variação aceita: '+v+' -> '+r.url);}
ok(W.resolve('buscaja.cqo/internet').url==='www.buscaja.cqo/internet','/internet');
ok(W.resolve('www.buscaja.cqo/INTERNET/').ok,'caminho sem diferenciar caixa nem barra final');
// --- endereços inexistentes NÃO redirecionam: ok:false (a UI mostra 404)
for(const bad of ['www.naoexiste.cqo','google.com','carro','www.buscaja.cqo/nada','javascript:alert(1)','ftp://www.buscaja.cqo','www.buscaja.com','http://localhost:3000','<script>alert(1)</script>']){const r=W.resolve(bad);ok(r.ok===false,'404 para '+bad);}
ok(W.resolve('').ok===false,'vazio não abre nada');
ok(W.resolve('www.buscaja.cqo/busca?q=milho').params.get('q')==='milho','query preservada');
// --- BuscaJá!: página inicial com exatamente DOIS destaques e link "Mostrar mais" -> /internet
const home=W.resolve('www.buscaja.cqo').page.html({url:'www.buscaja.cqo',path:'/',params:new URLSearchParams()});
ok((home.match(/class="bj-result"/g)||[]).length===2,'exatamente dois destaques');
ok(/data-cqo="www\.buscaja\.cqo\/internet"[^>]*class="bj-btn"[^>]*>Mostrar mais<|class="bj-btn"[^>]*>Mostrar mais</.test(home)||home.includes('>Mostrar mais<'),'link Mostrar mais');
ok(home.indexOf('bj-result')<home.indexOf('Mostrar mais'),'Mostrar mais vem depois dos destaques');
const m=home.match(/<a href="#" data-cqo="([^"]+)" class="bj-btn">Mostrar mais/);ok(m&&m[1]==='www.buscaja.cqo/internet','Mostrar mais aponta para /internet');
// --- /internet lista TODOS os sites públicos e nenhum secreto
const dir=W.resolve('www.buscaja.cqo/internet').page.html({url:'',path:'/internet',params:new URLSearchParams()});
for(const s of pub)ok(dir.includes(`data-cqo="${s.host}"`),'diretório lista '+s.host);
for(const s of sec)ok(!dir.includes(s.host),'diretório oculta '+s.host);
// --- busca: resultados ou mensagem, nunca 404
const r1=W.search('milho');ok(r1.results.length>0,'busca "milho" acha algo');
ok(W.search('jogos').results[0].siteHost==='www.jogolandia.cqo','busca "jogos" -> Jogolândia primeiro');
ok(W.search('email').results.some(x=>x.siteHost==='www.claquimail.cqo'),'busca por palavra-chave');
ok(W.search('previsão do tempo').results[0].siteHost==='www.tempo.cqo','busca com acento');
ok(W.search('xyzzyqwerty').results.length===0,'sem resultados');
const none=W.resolve('www.buscaja.cqo/busca?q=xyzzyqwerty');ok(none.ok,'busca sem resultado NÃO é 404');
ok(none.page.html({params:none.params}).includes('Nenhum resultado'),'mensagem de nenhum resultado');
for(const s of sec)ok(!W.search(s.name+' '+s.host.split('.')[1]).results.some(x=>x.siteHost===s.host),'busca não revela '+s.host);
// --- XSS: texto digitado vira texto, nunca HTML
const evil='<img src=x onerror=alert(1)><script>alert(2)</script>"\'';
const res=W.resolve('www.buscaja.cqo/busca?q='+encodeURIComponent(evil));
const html=res.page.html({params:res.params});ok(!/<script|<img src=x/i.test(html),'busca escapa HTML malicioso');
ok(html.includes('&lt;script&gt;'),'texto escapado visível');
const f=W.resolve('www.buscaja.cqo/internet?f='+encodeURIComponent(evil)).page.html({params:new URLSearchParams('f='+encodeURIComponent(evil))});ok(!/<script|<img src=x/i.test(f),'filtro escapa HTML');
// --- todos os links internos de todas as páginas apontam para páginas que existem
const visited=new Set();let links=0;
for(const s of W.sites)for(const [p,pg] of Object.entries(s.pages)){
  let h='';try{h=pg.html({url:W.url(s.host,p),path:p,params:new URLSearchParams(),site:s,L:W.link,E:W.E});}catch(e){ok(false,'html de '+s.host+p+' falhou: '+e.message);}
  ok(!/<script|<iframe|javascript:|onerror=|onclick=/i.test(h),'sem script/iframe/handler inline em '+s.host+p);
  ok(!/href="(?!#")/i.test(h),'sem href externo em '+s.host+p);
  ok(!/(src|href)="https?:/i.test(h),'sem recurso externo em '+s.host+p);
  for(const [,u] of h.matchAll(/data-cqo="([^"]+)"/g)){links++;const r=W.resolve(u.replace(/&amp;/g,'&'));ok(r.ok,'link quebrado '+u+' em '+s.host+p);}
  for(const [,u] of h.matchAll(/data-cqo-form="([^"]+)"/g)){ok(W.resolve(u).ok,'ação de formulário quebrada '+u);}
  for(const [,u] of h.matchAll(/data-open-app="([^"]+)"/g))ok(/^(snake|mines|ttt|pong|desvio|solitaire|rewards)$/.test(u),'app aberto por link existe: '+u);
}
ok(links>40,'muitos links verificados ('+links+')');
// --- hosts únicos e no formato .cqo
ok(new Set(W.sites.map(s=>s.host)).size===W.sites.length,'hosts únicos');
console.log(`ClaQui Browser 26nov16: ${checks} verificações OK (${pub.length} sites públicos, ${sec.length} secretos, ${links} links internos).`);
