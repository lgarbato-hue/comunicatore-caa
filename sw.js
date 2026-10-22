// Service Worker: fa funzionare il comunicatore senza internet.
// Appena il tablet apre la pagina una volta online, salva tutto nella cache
// del dispositivo. Le volte successive, se non c'è rete, serve dalla cache.
const CACHE = 'comunicatore-caa-v1';
const ASSETS = [
  './',
  './index.html',
  './comunicatore_caa.html',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Strategia: prima prova la rete (per avere sempre l'ultima versione),
// se fallisce usa la cache. I pittogrammi ARASAAC e le immagini della galleria
// sono già salvati come base64 nei dati, quindi non serve metterli qui.
self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  ev.respondWith(
    fetch(req).then((resp) => {
      // aggiorna la cache in sottofondo per asset del sito
      try {
        const url = new URL(req.url);
        if (url.origin === self.location.origin) {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
      } catch(e) {}
      return resp;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match('./comunicatore_caa.html')))
  );
});
