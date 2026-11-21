// Offline-Cache: App-Dateien, Presets und Samples werden beim ersten Besuch gesichert.
// Danach gilt "stale-while-revalidate": sofort aus dem Cache, im Hintergrund aktualisieren.
const CACHE = 'patternMorpher-v1';
const SHELL = ['./', 'index.html', 'manifest.json',
  'icons/favicon.svg', 'icons/favicon-32.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'samples/djembe_bass.wav', 'samples/djembe_open.wav', 'samples/djembe_slap.wav', 'presets/index.json'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.map(u => c.add(u).catch(() => {})));
    try {
      const list = await (await fetch('presets/index.json', { cache: 'no-cache' })).json();
      await Promise.all(list.map(p => c.add('presets/' + p.file).catch(() => {})));
    } catch (err) {}
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
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || (req.mode === 'navigate' ? c.match('index.html') : Response.error());
  })());
});
