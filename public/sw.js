// Minimal service worker: cache shell for "/" and static assets
const CACHE_NAME = "bible-daily-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(["/"]);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.mode !== "navigate" && request.mode !== "same-origin") {
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (url.pathname === "/") {
    event.respondWith(
      caches.match("/").then((cached) => cached || fetch(request))
    );
    return;
  }

  if (
    /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  event.respondWith(fetch(request));
});
