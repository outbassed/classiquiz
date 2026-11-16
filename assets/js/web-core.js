/* ClaQui Browser — núcleo da web fictícia: roteador virtual da extensão .cqo, catálogo e busca do BuscaJá!. Licença: MIT.
   Nada aqui faz requisições: endereços .cqo existem só dentro do jogo. Testável em Node (sem DOM). */
(() => {
'use strict';
const CQ = window.CQ = window.CQ || {};
const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const web = CQ.web = {HOME: 'www.buscaja.cqo', TLD: 'cqo', sites: [], byHost: new Map(), E, norm};

// ---------- persistência (localStorage via CQ.store; memória em testes) ----------
const KEY = 'classiquiz.v1.web'; let mem = null;
const rd = () => { if (CQ.store) return CQ.store.read(KEY, {}) || {}; return mem || {}; };
const wr = o => { if (CQ.store) CQ.store.write(KEY, o); else mem = o; };
web.data = () => { const d = rd(); d.fav ||= []; d.hist ||= []; d.sites ||= {}; d.visited ||= {}; return d; };
web.save = d => wr(d);
web.siteState = (id, fallback = {}) => { const d = web.data(); return d.sites[id] ||= JSON.parse(JSON.stringify(fallback)); };
web.saveSiteState = (id, st) => { const d = web.data(); d.sites[id] = st; wr(d); };

// ---------- registro de sites ----------
// def: {id, host, name, title, cat, desc, keywords[], secret?, fav (svg curto), pages:{'/path':{title, html(ctx), mount?(root,ctx)}}, route?(path,params)}
web.register = def => {
  if (!def || !/^www\.[a-z0-9-]+\.cqo$/.test(def.host)) throw Error('host inválido: ' + (def && def.host));
  if (web.byHost.has(def.host)) throw Error('host duplicado: ' + def.host);
  def.keywords ||= []; def.pages ||= {}; web.sites.push(def); web.byHost.set(def.host, def); return def;
};
web.publicSites = () => web.sites.filter(s => !s.secret);
web.categories = () => [...new Set(web.publicSites().map(s => s.cat))].sort((a, b) => a.localeCompare(b, 'pt-BR'));

// ---------- normalização e resolução de endereços ----------
// Aceita: com/sem http(s)://, com/sem www., maiúsculas, barra final, /index.html. Devolve null se não houver texto utilizável.
web.parseInput = raw => {
  let s = String(raw ?? '').trim().replace(/^["'<]+|[">']+$/g, ''); if (!s) return null;
  s = s.replace(/^https?:\/\//i, '');
  const m = s.match(/^([^\/?#\s]*)([^?#]*)(\?[^#]*)?(#.*)?$/); if (!m) return null;
  let host = m[1].toLowerCase(), path = m[2] || '/', query = (m[3] || '').slice(1);
  try { path = decodeURI(path); } catch {}
  path = ('/' + path.replace(/^\/+/, '')).replace(/\/index\.html?$/i, '/').replace(/\/+$/, '') || '/';
  return {host, path: path.toLowerCase(), query, rawPath: path};
};
web.hostFor = host => { if (web.byHost.has(host)) return host; if (!host.startsWith('www.') && web.byHost.has('www.' + host)) return 'www.' + host; return null; };
// Resolve uma entrada da barra de endereços. NÃO redireciona endereços inexistentes: devolve ok:false (o navegador mostra o 404).
web.resolve = raw => {
  const p = web.parseInput(raw); if (!p) return {ok: false, url: '', typed: String(raw ?? '').trim(), reason: 'vazio'};
  const typed = (p.host + (p.path === '/' ? '' : p.rawPath) + (p.query ? '?' + p.query : '')).slice(0, 200);
  const host = web.hostFor(p.host), site = host && web.byHost.get(host);
  if (!site) return {ok: false, url: typed, typed, reason: 'host'};
  const params = new URLSearchParams(p.query);
  let page = site.pages[p.path] || (site.route && site.route(p.path, params)) || null;
  const url = site.host + (p.path === '/' ? '' : p.path) + (p.query ? '?' + p.query : '');
  if (!page) return {ok: false, url, typed, reason: 'path', site};
  return {ok: true, url, site, page, path: p.path, params};
};
web.url = (host, path = '/', query = '') => host + (path === '/' ? '' : path) + (query ? '?' + query : '');
web.link = (url, text, cls = '', title = '') => `<a href="#" data-cqo="${E(url)}"${cls ? ` class="${E(cls)}"` : ''}${title ? ` title="${E(title)}"` : ''}>${text}</a>`;

// ---------- indexação e busca (BuscaJá!) ----------
const strip = h => String(h).replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
let index = null;
web.invalidateIndex = () => { index = null; };
web.buildIndex = () => {
  const out = [];
  for (const site of web.publicSites()) {
    for (const [path, page] of Object.entries(site.pages)) {
      if (page.index === false) continue;
      let text = ''; try { text = strip(page.html({url: web.url(site.host, path), path, params: new URLSearchParams(), site, L: web.link, E, index: true})); } catch {}
      out.push({site, path, url: web.url(site.host, path), title: page.title || site.title, text, ntext: norm(text), ntitle: norm((page.title || '') + ' ' + site.name), home: path === '/'});
    }
  }
  return out;
};
web.search = query => {
  const q = norm(query), tokens = [...new Set(q.split(' ').filter(t => t.length > 1))]; if (!tokens.length) return {q: String(query ?? '').trim(), results: []};
  index ||= web.buildIndex(); const res = [];
  for (const e of index) {
    let score = 0, hit = 0; const kw = norm(e.site.keywords.join(' ')), desc = norm(e.site.desc + ' ' + e.site.name + ' ' + e.site.cat);
    for (const t of tokens) {
      let h = 0; if (e.ntitle.includes(t)) h += 6; if (e.home && kw.includes(t)) h += 5; if (e.home && desc.includes(t)) h += 3;
      const n = e.ntext.split(t).length - 1; if (n) h += Math.min(3, n); if (h) hit++; score += h;
    }
    if (!score) continue; score += hit * 2;
    let snip = ''; const i = e.ntext.indexOf(tokens.find(t => e.ntext.includes(t)) || '\0');
    if (i >= 0) { const a = Math.max(0, i - 50); snip = (a ? '… ' : '') + e.text.slice(a, a + 150) + (a + 150 < e.text.length ? ' …' : ''); } else snip = e.home ? e.site.desc : e.text.slice(0, 150);
    res.push({url: e.url, title: e.title, site: e.site.name, siteHost: e.site.host, snippet: snip, score});
  }
  res.sort((a, b) => b.score - a.score || a.url.length - b.url.length);
  return {q: String(query).trim(), results: res.slice(0, 25)};
};
})();
