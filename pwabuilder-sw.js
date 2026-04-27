const CACHE_NAME = "san-antonio-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./special.html",
  "./chicken-app.png",
  "./barcode.png",
  "./special.png",
  "./manifest.json"
];

// Install event
self.addEventListener("install", (event) => {
  self.skipWaiting(); // Forces the new service worker to take over immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Using map to cache files individually so one failure doesn't break everything
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url))
      );
    })
  );
});

// Fetch logic
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // Fallback for the main page if everything fails
          if (event.request.mode === 'navigate') {
             return caches.match('./index.html');
          }
        });
      })
  );
});

// Activate event
self.addEventListener("activate", (event) => {
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
});
