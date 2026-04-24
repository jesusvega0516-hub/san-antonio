// This is the "Network First" Service Worker
const CACHE_NAME = "san-antonio-cache-v1";
const ASSETS_TO_CACHE = [
  "index.html",
  "special.html",
  "chicken-app.png",
  "manifest.json"
];

// Install event - caching the basic shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// The "Magic" Fetch Logic: Network First, then Cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If network works, put a copy in the cache and return it
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => {
        // If network fails (no signal), check the cache
        return caches.match(event.request);
      })
  );
});

// Activate event - clean up old caches
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
