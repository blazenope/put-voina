const VER='pv-v97', FONTS='pv-fonts';
const FILES=['./','./index.html','./manifest.webmanifest?v=3','./icon-192.png?v=3','./icon-512.png?v=3','./apple-touch-icon.png?v=3','./fonts/pt-serif-cyrillic-400-normal.woff2','./fonts/pt-serif-cyrillic-700-normal.woff2','./fonts/pt-serif-latin-400-normal.woff2','./fonts/pt-serif-latin-700-normal.woff2','./fonts/pt-sans-cyrillic-400-normal.woff2','./fonts/pt-sans-cyrillic-700-normal.woff2','./fonts/pt-sans-latin-400-normal.woff2','./fonts/pt-sans-latin-700-normal.woff2',];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(FILES.map(u=>new Request(u,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// сеть с таймаутом, без сети — последняя копия из кэша
async function fresh(key,req,ms){const c=await caches.open(VER);
  try{const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),ms);
    const r=await fetch(req,{signal:ctl.signal});clearTimeout(t);
    if(r.ok){c.put(key,r.clone());return r}throw 0}
  catch(err){return (await c.match(key))||(key==='./index.html'&&await c.match('./'))||Response.error()}}
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;const u=new URL(req.url);if(u.origin!==location.origin)return;
  const isPage=req.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('.html');
  // страница: свежая из сети (no-cache = проверка ETag, 304 вместо 700 КБ), без сети — из кэша
  if(isPage){e.respondWith(fresh('./index.html',new Request('./index.html',{cache:'no-cache'}),3000));return}
  // remote.json: начисления из чата — всегда из сети, кэш только как запасной вариант офлайн
  if(u.pathname.endsWith('/remote.json')){e.respondWith(fresh('./remote.json',new Request('./remote.json',{cache:'no-store'}),6000));return}
  e.respondWith(caches.open(VER).then(async c=>{const hit=await c.match(req,{ignoreSearch:true});if(hit)return hit;
    const r=await fetch(req);if(r.ok)c.put(req,r.clone());return r}));
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus' in c)return c.focus()}return clients.openWindow('./')}))});
