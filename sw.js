const VER='pv-v7', FONTS='pv-fonts';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./fonts/nunito-cyrillic-400-normal.woff2','./fonts/nunito-cyrillic-600-normal.woff2','./fonts/nunito-cyrillic-800-normal.woff2','./fonts/nunito-latin-400-normal.woff2','./fonts/nunito-latin-600-normal.woff2','./fonts/nunito-latin-800-normal.woff2','./fonts/philosopher-cyrillic-400-normal.woff2','./fonts/philosopher-cyrillic-700-normal.woff2','./fonts/philosopher-latin-400-normal.woff2','./fonts/philosopher-latin-700-normal.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(FILES.map(u=>new Request(u,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;const u=new URL(req.url);if(u.origin!==location.origin)return;
  const isPage=req.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('.html');
  if(isPage){
    // свежая версия из сети, без сети — из кэша
    e.respondWith((async()=>{const c=await caches.open(VER);
      try{const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),3000);
        const r=await fetch(new Request('./index.html',{cache:'no-store',signal:ctl.signal}));clearTimeout(t);
        if(r.ok){c.put('./index.html',r.clone());return r}throw 0}
      catch(err){return (await c.match('./index.html'))||(await c.match('./'))||Response.error()}})());return}
  e.respondWith(caches.open(VER).then(async c=>{const hit=await c.match(req,{ignoreSearch:true});if(hit)return hit;
    const r=await fetch(req);if(r.ok)c.put(req,r.clone());return r}));
});
