const CACHE_NAME = 'sds30-pedia-v1';

const URLS_TO_CACHE = [
  './',
  './index.html',
  './fiche_ACR_v4.html',
  './fiche_convulsions_v3.html',
  './fiche_noyade_v3_new.html',
  './fiche_asthme_v1.html',
  './fiche_analgesie_v1.html',
  './fiche_chocs_v1.html',
  './fiche_damage_control_v2.html',
  './tronc_commun_v3.html'
];

// Installation : mise en cache de toutes les fiches
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch : cache-first, avec mise à jour en arrière-plan
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Lance toujours une requête réseau pour mettre à jour le cache
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      // Sert le cache immédiatement si dispo, sinon attend le réseau
      return cachedResponse || fetchPromise;
    })
  );
});
