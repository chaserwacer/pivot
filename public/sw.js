// Pivot service worker — app-shell offline cache.
// Iteration 5 swaps this for a Workbox build with route/tile caches; this
// hand-rolled version keeps the cold-open working in airplane mode.

const VERSION = "pivot-v1";
const SHELL = ["/", "/routes", "/settings", "/me", "/record", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

// Strategy: cache-first for the app shell and same-origin GETs; network-first
// for API calls (with a cached fallback for previously-viewed routes).
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(request) as Promise<Response>),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((res) => {
          if (res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match("/") as Promise<Response>);
    }),
  );
});
