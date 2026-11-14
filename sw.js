/* Hazelnut Hollow — service worker (SPEC §7.2j). Caches the whole game so it plays offline.
   Same-origin GETs: cache first, refreshed in the background (a new deploy shows on the second launch).
   Google Fonts: cached the first time they load. Nothing else is touched. */
const CACHE = 'hazelnut-hollow-v1';
const FONT = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const res = await fetch('index.html', { cache: 'no-cache' });
    const html = await res.clone().text();
    await cache.put('index.html', res.clone()); await cache.put('./', res);
    const urls = new Set(['manifest.webmanifest', 'icons/icon-192.png', 'icons/apple-touch-icon.png']);
    for (const m of html.matchAll(/(?:src|href)="([^":]+\.(?:js|css))"/g)) urls.add(m[1]);
    await Promise.all([...urls].map(u => fetch(u, { cache: 'no-cache' }).then(r => r.ok && cache.put(u, r)).catch(() => { })));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url), same = url.origin === location.origin;
  if (!same && !FONT.test(req.url)) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: same });
    const fresh = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) cache.put(same ? url.pathname : req, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(fresh); return hit; }
    return (await fresh) || new Response('Offline', { status: 503 });
  })());
});
