/* ZChat Service Worker:离线缓存界面壳,聊天仍需在线(P2P) */
const CACHE='zchat-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg','https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js'];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>Promise.allSettled(ASSETS.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting())
  );
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.mode==='navigate'){
    e.respondWith(
      fetch(e.request).then(res=>{
        const copy=res.clone();
        caches.open(CACHE).then(c=>{c.put('./',copy);c.put('./index.html',copy).catch(()=>{})});
        return res;
      }).catch(()=>caches.match('./').then(h=>h||caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
      if(res.ok||res.type==='opaque'){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}
      return res;
    }).catch(()=>caches.match('./')))
  );
});