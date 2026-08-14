const CACHE_NAME = 'tracker-ai-v3.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './robots.txt'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Do not intercept API calls or non-http requests
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).catch((err) => {
        // Only return index.html fallback for HTML page navigation requests
        const isHtmlNavigation = event.request.mode === 'navigate' || 
          (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));
          
        if (isHtmlNavigation) {
          return caches.match('./index.html') || caches.match('/index.html');
        }
        return Promise.reject(err);
      });
    })
  );
});
