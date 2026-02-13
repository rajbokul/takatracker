
const CACHE_NAME = 'takatracker-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './index.tsx',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://esm.sh/react@19.2.4',
  'https://esm.sh/react-dom@19.2.4',
  'https://esm.sh/react-dom@19.2.4/client',
  'https://esm.sh/@google/genai@1.41.0',
  'https://esm.sh/lucide-react@0.463.0',
  'https://esm.sh/recharts@3.7.0'
];

// Install Event - Caching all core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Local App: Caching offline assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Cleaning up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event - Offline First Strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests like Gemini API which MUST be live
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.includes('esm.sh')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // Optional: Cache new requests on the fly
        return response;
      });
    })
  );
});
