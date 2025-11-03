// sw.js - Service Worker para funcionalidad offline

const CACHE_NAME = 'volumetracker-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/db.js',
    '/manifest.json',
    '/icon.svg'
];

// Instalación: precache de assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activación: limpiar caches viejos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch: cache-first para assets, network-only para lo demás
self.addEventListener('fetch', (event) => {
    // Solo cachear GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) {
                    return cached;
                }
                return fetch(event.request).then(response => {
                    // Solo cachear respuestas OK
                    if (!response || response.status !== 200 || response.type === 'error') {
                        return response;
                    }

                    // Clonar la respuesta para guardarla
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, responseToCache));

                    return response;
                });
            })
            .catch(() => {
                // Si falla, intentar devolver index.html para SPA routing
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            })
    );
});
