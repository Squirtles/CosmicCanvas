// service-worker.js

// Version for cache busting
const CACHE_NAME = 'cosmic-canvas-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/sketch.js', // Assuming this is your game logic file
    'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.2/p5.min.js', // Cache p5.js
    'https://js.pusher.com/7.0/pusher.min.js' // Cache Pusher Channels SDK
];

// Install event: Cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event: Serve cached assets if offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached response if available, otherwise fetch from network
                return response || fetch(event.request);
            })
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Optional: Integrate Pusher Channels logic (not typical in service workers)
// This is just a placeholder; real-time WebSocket logic stays in the main app
self.addEventListener('message', (event) => {
    console.log('Service worker received message:', event.data);
});