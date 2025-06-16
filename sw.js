// SERVICE WORKER pour cache et performance
const CACHE_NAME = 'julesfuselier-v1';
const urlsToCache = [
    '/',
    '/css/critical.css',
    '/css/style.css',
    '/script/script.js',
    '/assets/moi.webp',
    '/assets/CV_FUSELIER_JULES.pdf'
];

// Installation du SW
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Stratégie cache-first pour les ressources statiques
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                    // Retourner depuis le cache ou faire la requête réseau
                    return response || fetch(event.request);
                }
            )
    );
});