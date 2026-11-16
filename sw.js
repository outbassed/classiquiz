/* ClaQui OS — Service Worker do PWA 100% offline.
   • Pré-cache de TODOS os arquivos do jogo, lidos de asset-manifest.json (gerado por tools/build.js, com tamanho e SHA-256).
   • Um cache por compilação: classiquiz-cache-<compilação>. A nova versão é baixada e VALIDADA antes de ser ativada; se falhar, o cache novo
     parcial é descartado e o conjunto que já funciona permanece intacto.
   • Depois de ativada, apenas o cache ativo sobra: caches antigos do ClassiQuiz (e o cq-offline-* legado) são apagados.
   • Só mexe em CacheStorage do próprio app. Nunca toca em localStorage, IndexedDB, saves, conquistas, seeds ou preferências.
   • version.json e asset-manifest.json nunca vêm do cache (o ClaQui Update consulta a rede real). */
const BUILD = '16112026.114521'; // carimbado por tools/build.js
const PREFIX = 'classiquiz-cache-';
const CACHE = PREFIX + BUILD;
const LEGACY_PREFIXES = ['cq-offline-'];
const NETWORK_ONLY = ['version.json', 'asset-manifest.json'];
const SCOPE = self.registration.scope;

const say = async msg => { for (const c of await self.clients.matchAll({includeUncontrolled: true})) c.postMessage({source: 'cq-sw', build: BUILD, ...msg}); };
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');

async function precache() {
  const res = await fetch(new URL('asset-manifest.json', SCOPE), {cache: 'no-store'});
  if (!res.ok) throw new Error('asset-manifest.json indisponível (' + res.status + ')');
  const man = await res.json();
  if (man.build !== BUILD) throw new Error('asset-manifest.json (' + man.build + ') não corresponde a este Service Worker (' + BUILD + ')');
  await caches.delete(CACHE);                         // recomeça limpo: nunca reaproveita cache parcial de tentativa anterior
  const cache = await caches.open(CACHE), files = man.files, total = files.length; let done = 0, next = 0, failed = false;
  try {
    let firstErr = null;
    const worker = async () => {
      try {
        while (next < files.length && !failed) {          // após a 1ª falha, os demais downloads param (e não há mais progresso)
          const f = files[next++], url = new URL(f.path, SCOPE).href;
          const r = await fetch(url, {cache: 'reload'});
          if (!r.ok) throw new Error('falha ao baixar ' + f.path + ' (' + r.status + ')');
          const buf = await r.clone().arrayBuffer();
          if (buf.byteLength !== f.size) throw new Error('tamanho inesperado em ' + f.path);
          if (hex(await crypto.subtle.digest('SHA-256', buf)) !== f.sha256) throw new Error('arquivo corrompido: ' + f.path);
          await cache.put(url, r);
          if (f.path === 'index.html') await cache.put(new URL('./', SCOPE).href, new Response(buf, {headers: r.headers}));
          if (!failed) say({type: 'progress', done: ++done, total});
        }
      } catch (e) { failed = true; firstErr = firstErr || e; }
    };
    await Promise.all(Array.from({length: 6}, worker));     // espera TODOS terminarem antes de decidir (evita cache recriado por gravações em voo)
    if (firstErr) throw firstErr;
    const stored = (await cache.keys()).length;
    if (stored < total) throw new Error('pré-cache incompleto (' + stored + '/' + total + ')');
  } catch (err) { failed = true; await caches.delete(CACHE); say({type: 'error', message: String(err && err.message || err)}); throw err; }
  say({type: 'installed', total});
  // Primeira instalação moderna (nenhum cache antigo): ativa direto. Havendo versão anterior, espera a decisão do jogador (ClaQui Update).
  const others = (await caches.keys()).filter(k => k.startsWith(PREFIX) && k !== CACHE);
  if (!others.length) await self.skipWaiting();
}
self.addEventListener('install', e => e.waitUntil(precache()));
self.addEventListener('activate', e => e.waitUntil((async () => {
  await self.clients.claim();
  const own = k => (k.startsWith(PREFIX) && k !== CACHE) || LEGACY_PREFIXES.some(p => k.startsWith(p));
  await Promise.all((await caches.keys()).filter(own).map(k => caches.delete(k)));
  say({type: 'activated'});
})()));
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'SKIP_WAITING') self.skipWaiting();
  else if (d.type === 'GET_BUILD' && e.source) e.source.postMessage({source: 'cq-sw', type: 'build', build: BUILD});
});

async function respond(req) {
  const hit = await caches.match(req, {cacheName: CACHE, ignoreSearch: true});
  if (hit) return hit;
  if (req.mode === 'navigate') { const idx = await caches.match(new URL('index.html', SCOPE).href, {cacheName: CACHE}); if (idx) return idx; }
  try { return await fetch(req); }
  catch (err) {
    if (req.mode === 'navigate') { const off = await caches.match(new URL('offline.html', SCOPE).href, {cacheName: CACHE}); if (off) return off; }   // exceção: instalação incompleta
    return Response.error();
  }
}
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  const name = url.pathname.slice(url.pathname.lastIndexOf('/') + 1);
  if (name === 'sw.js') return;
  if (NETWORK_ONLY.includes(name)) { e.respondWith(fetch(req, {cache: 'no-store'})); return; }
  e.respondWith(respond(req));
});
