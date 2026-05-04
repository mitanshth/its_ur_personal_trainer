const CACHE_NAME = "forgefit-pwa-v7";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./posture-fix.js",
  "./manifest.webmanifest",
  "./icons/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin === self.location.origin && requestUrl.pathname.endsWith("/app.js")) {
    event.respondWith(
      Promise.all([
        caches.match("./app.js").then((cached) => cached || fetch("./app.js")),
        caches.match("./posture-fix.js").then((cached) => cached || fetch("./posture-fix.js"))
      ])
        .then(([appResponse, fixResponse]) => Promise.all([appResponse.text(), fixResponse.text()]))
        .then(([appCode, fixCode]) =>
          new Response(`${appCode}\n\n${fixCode}`, {
            headers: { "Content-Type": "text/javascript; charset=utf-8" }
          })
        )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          if (response.ok && new URL(event.request.url).origin === self.location.origin) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
