const CACHE_NAME = 'gaka-cache-v' + new Date().toISOString().slice(0, 10).replace(/-/g, '');
const STATIC_ASSETS = [
  '/',
  '/?mode=standalone',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME && caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Assets: cache-first, update on miss
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then(res => res || fetch(e.request).then(networkRes => {
        return caches.open(CACHE_NAME).then(cache => {
          if (networkRes.ok) cache.put(e.request, networkRes.clone());
          return networkRes;
        });
      }))
    );
    return;
  }

  // HTML documents: network-first (never serve stale HTML)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Supabase: network-first
  if (url.origin.includes('supabase.co')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Default: network-first
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
