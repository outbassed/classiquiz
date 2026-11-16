/* PWA online-first • somente a tela offline e o easter egg são armazenados. */
const CACHE='cq-offline-2.0.9';const ASSETS=['./offline.html','./assets/offline-sad.svg','./assets/js/offline-runner.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('cq-offline-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 if(e.request.mode!=='navigate')return;
 e.respondWith(fetch(e.request).catch(async()=> (await caches.match('./offline.html')) || Response.error()));
});
