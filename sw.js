// Service Worker para funcionamiento 100% offline con actualización en segundo plano
const CACHE_NAME = "unumbral-ricra-v15";
const ASSETS = [
  "./",
  "./index.html",
  "./estilos.css",
  "./app.js",
  "./manifest.json",
  "./icon-64.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon.png",
  "./lib/dexie.min.js",
  "./lib/plataforma.js",
  "./lib/ajustes.js",
  "./lib/planificador.js",
  "./lib/notificaciones.js",
  "./lib/asistencia.js",
  "./lib/prioridad.js",
  "./lib/rendimiento.js",
  "./lib/huecos.js",
  "./lib/qrcode.min.js",
  "./lib/jsqr.min.js",
  "./lib/qr.js",
  "./lib/deeplink.js",
  "./lib/services/tareasService.js",
  "./lib/services/cursosService.js",
  "./lib/services/asistenciaService.js",
  "./lib/views/hoyView.js",
  "./lib/views/horarioView.js",
  "./lib/views/cursosView.js",
  "./lib/views/tareasView.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(e.request).then((cached) => {
        const networkFetch = fetch(e.request)
          .then((response) => {
            if (response && response.status === 200 && response.type === "basic") {
              cache.put(e.request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      });
    })
  );
});
