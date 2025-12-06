const CACHE_NAME = 'twalaba-conf-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Pass-through for now, can implement caching strategies here if needed
    // This empty handler satisfies PWA requirements
});
