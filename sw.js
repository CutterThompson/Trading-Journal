// Lets the journal open with no signal: the page itself is fetched fresh when online (so updates arrive),
// everything else comes from this device first and refreshes in the background. Trades sync through Firebase.
const CACHE = 'nqj-1';
const SHELL = ['./', 'index.html', 'nqfb.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
  if (isPage) {
    e.respondWith(Promise.race([
      fetch(req).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(k => k.put('index.html', c)); } return res; }),
      new Promise((_, no) => setTimeout(no, 4000))
    ]).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => {
    const fresh = fetch(req).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(k => k.put(req, c)); } return res; });
    return hit || fresh;
  }));
});
