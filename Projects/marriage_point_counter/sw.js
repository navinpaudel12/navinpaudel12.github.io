const CACHE_NAME = 'marriage-score-v1';
const urlsToCache = [
    '/Projects/marriage_point_counter/',
    '/Projects/marriage_point_counter/index.html',
    '/Projects/marriage_point_counter/styles.css',
    '/Projects/marriage_point_counter/script.js',
    '/Projects/marriage_point_counter/assets/profile.jpg',
    '/Projects/marriage_point_counter/assets/favicon.png',
    '/Projects/marriage_point_counter/assets/icon-192.png',
    '/Projects/marriage_point_counter/assets/icon-512.png',
    '/Projects/marriage_point_counter/manifest.json'
];

// Install: Cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

// Activate: Clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Serve cached assets or fetch from network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    // Serve from cache and update in background
                    fetch(event.request).then(networkResponse => {
                        if (networkResponse.ok) {
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, networkResponse.clone());
                            });
                        }
                    }).catch(() => {});
                    return response;
                }
                // Fetch from network if not cached
                return fetch(event.request).then(networkResponse => {
                    if (networkResponse.ok) {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, networkResponse.clone());
                        });
                    }
                    return networkResponse;
                }).catch(() => {
                    // Offline fallback for HTML
                    if (event.request.mode === 'navigate') {
                        return caches.match('/Projects/marriage_point_counter/index.html');
                    }
                });
            })
    );
});